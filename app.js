const express = require("express");
const { generateRandomKey, encrypt, decrypt } = require("./functions");
const { MongoClient, GridFSBucket } = require("mongodb");

const app = express();
const helmet = require("helmet");
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(helmet());

app.use(cookieParser());
app.use(
  session({
    secret: "your_secret_key",
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
const uri =
  "mongodb+srv://Mithra707:*Mithrajeeth*@cluster0.2gpt44h.mongodb.net";
const encyptKey = "Mithrajeeth18";
var textId = "";
const data = {
  content: "",
  error: "",
  Filestatus: "",
  Filekey: "",
};
const client = new MongoClient(uri);
let gfs;

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
  const encryptPassKey = encrypt(req.body.passkey, encyptKey);
  await client
    .db("Share-Note")
    .collection("Lock")
    .updateOne(
      { _id: textId },
      { $set: { Pass: encryptPassKey } },
      { upsert: true }
    );
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

    return res.render("text-share", data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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

app.listen(3000, () => console.log("Running on port 3000"));
