const express = require("express");
const { generateRandomKey, encrypt, decrypt } = require("./functions");
const { MongoClient, GridFSBucket, ReturnDocument } = require("mongodb");
const dotenv = require("dotenv");
const app = express();
const helmet = require("helmet");
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.static("images"));
app.use(helmet());

dotenv.config();
app.use(cookieParser());
app.use(
  session({
    secret: process.env.sessionKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
      ],
      connectSrc: ["'self'", "https://lottie.host"],
      // Add other directives as needed
    },
  })
);

// variable diclaration

var textId = "";
const data = {
  content: "",
  showPopup: false,
  lockButton: true,
  error: "",
  Filestatus: "",
  Filekey: "",
};
const client = new MongoClient(process.env.URI);
let gfs;
const encyptKey = process.env.encyptKey;

// connection chalu
client
  .connect()
  .then(() => {
    console.log("Connected to Database");
    gfs = new GridFSBucket(client.db("Share-Note"), {
      bucketName: "uploads",
    });
    console.log("GridFSBucket initialized");
  })
  .catch((err) => console.error(err));

// routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/get-started", (req, res) => {
  res.render("get-started");
});

app.get(["/Text/homePage", "/homePage", "/File/homePage"], (req, res) => {
  res.redirect("/");
});

app.post("/Text/save", async (req, res) => {
  var encryptData = encrypt(req.body.content, encyptKey);
  //console.log(req.body.content);
  await client
    .db("Share-Note")
    .collection("Data")
    .updateOne(
      { _id: textId },
      { $set: { content: encryptData } },
      { upsert: true }
    );

  return res.redirect("/Text/" + textId);
});

app.post("/Text/lock", async (req, res) => {
  var encryptPaskey = encrypt(req.body.passkey, encyptKey);
  //console.log(encryptPaskey);
  await client
    .db("Share-Note")
    .collection("Lock")
    .updateOne(
      { _id: textId },
      { $set: { Pass: encryptPaskey } },
      { upsert: true }
    );

  req.session.PageUnlocked = textId;
  req.session.cookie.expires = new Date(Date.now() + 2 * 60 * 1000);
  req.session.cookie.maxAge = 2 * 60 * 1000;

  return res.redirect("/Text/" + textId);
});

app.get("/Text/:textId?", async (req, res) => {
  textId = req.params.textId;

  if (!textId) {
    var randomkey = generateRandomKey(5);
    return res.redirect("/Text/" + randomkey);
  }

  try {
    const containsData = await client
      .db("Share-Note")
      .collection("Data")
      .findOne({ _id: textId });
    const isLocked = await client
      .db("Share-Note")
      .collection("Lock")
      .findOne({ _id: textId });

    data["content"] = containsData
      ? decrypt(containsData.content, encyptKey)
      : "";

    if (isLocked) {
      data["lockButton"] = false;
      if (!req.session.PageUnlocked || textId !== req.session.PageUnlocked) {
        return res.render("unLock", data);
      }
    } else {
      data["lockButton"] = true;
    }

    return res.render("text-share", data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/Text/unlock", async (req, res) => {
  const pass = req.body.passkey;
  const DBdata = await client
    .db("Share-Note")
    .collection("Lock")
    .findOne({ _id: textId });
  // console.log(DBdata);
  //passkey = "556de47abc663f343b01f76a06c46c05";
  if (pass === decrypt(DBdata.Pass, encyptKey)) {
    req.session.PageUnlocked = textId;
    req.session.cookie.expires = new Date(Date.now() + 2 * 60 * 1000);
    req.session.cookie.maxAge = 60 * 1000;
    data["error"] = "";
    return res.redirect("/Text/" + textId);
  } else {
    data["error"] = "Incorrect password";

    return res.redirect("/Text/" + textId);
  }
});

app.get("/File/:fileId?", (req, res) => {
  fileId = req.params.fileId;
  if (!fileId) {
    var randomkey = generateRandomKey(5);
    return res.redirect("/File/" + randomkey);
  }
  res.render("file-share");
});

app.get("/about-devs", (req, res) => {
  res.render("about-devs");
});

// to test 404 page
app.use((req, res) => {
  res.render("404-page-not-found");
});

app.listen(3000, () => console.log("Running on port 3000"));
