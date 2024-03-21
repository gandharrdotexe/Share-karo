const express = require("express");
const {
  generateRandomKey,
  encrypt,
  decrypt,
  convertBytesToReadable,
  dev_details_1,
  dev_details_2,
} = require("./functions");
const { MongoClient, GridFSBucket, ReturnDocument } = require("mongodb");
const dotenv = require("dotenv");
const multer = require("multer");
const app = express();
const { Readable } = require("stream");
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
        "https://kit.fontawesome.com",
      ],
      connectSrc: [
        "'self'",
        "https://lottie.host",
        "https://fontawesome.com",
        "https://ka-f.fontawesome.com",
      ],

      // Add other directives as needed
    },
  })
);

//----------------------------------------variable diclaration---------------------------------------//

var textId = "";
var fileId = "";
const data = {
  content: "",
  showPopup: false,
  lockButton: true,
  error: "",
  File: false,
  fileName: "",
  Filekey: "",
};
const client = new MongoClient(process.env.URI);
let gfs;
const encyptKey = process.env.encyptKey;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//------------------------------------------- connection -------------------------------------------//
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

//---------------------------------------------routes-----------------------------------------//
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/get-started", (req, res) => {
  res.render("get-started");
});

app.get("/about-devs", (req, res) => {
  res.render("about-devs", { dev_details_1, dev_details_2 });
});

// ----------------------------------------Text sharing ----------------------------------- //

app.post("/Text/save", async (req, res) => {
  var encryptData = encrypt(req.body.content, encyptKey);

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

//------------------------------------------- File Sharing --------------------------------------------//

app.get("/File/:fileId?", async (req, res) => {
  fileId = req.params.fileId;
  if (!fileId) {
    var randomkey = generateRandomKey(5);
    return res.redirect("/File/" + randomkey);
  }
  const containsFile = await client
    .db("Share-Note")
    .collection("FileDetails")
    .findOne({ _id: fileId });
  if (containsFile) {
    data["File"] = true;
    data["fileName"] =
      containsFile.Filename + " " + "(" + containsFile.size + ")";
    // console.log(containsFile);
  } else {
    data["File"] = false;
    //console.log(containsFile);
  }
  return res.render("file-share", data);
});

app.post("/File/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    console.log("no file found");
  } else {
    const fileData = req.file.buffer;
    const originalFilename = req.file.originalname;
    console.log(originalFilename);

    const readableStream = new Readable();
    readableStream.push(fileData);
    readableStream.push(null);

    const uploadStream = gfs.openUploadStream(originalFilename);

    const id = uploadStream.id;

    readableStream
      .pipe(uploadStream)
      .on("error", (err) => {
        console.error("Error uploading file to GridFS:", err);
        res.status(500).send("Internal Server Error");
      })
      .on("finish", async () => {
        console.log("File uploaded successfully");

        const size = req.file.size;
        const fileSizeHumanReadable = convertBytesToReadable(size);
        await client.db("Share-Note").collection("FileDetails").insertOne({
          _id: fileId,
          fileId: id,
          Filename: originalFilename,
          size: fileSizeHumanReadable,
        });

        //data["Filekey"] = fileId;
        data["Filestatus"] = "File uploaded successfully";

        res.redirect("/File/" + fileId);
      });
  }
});

app.post("/File/download", async (req, res) => {
  try {
    const fileRecord = await client
      .db("Share-Note")
      .collection("FileDetails")
      .findOne({ _id: fileId });

    if (!fileRecord) {
      return res.status(404).send("File not found");
    }

    const Filename = fileRecord.Filename;
    const fileid = fileRecord.fileId;
    const downloadStream = gfs.openDownloadStream(fileid);
    res.set("Content-Disposition", `attachment; filename=${Filename}`);
    downloadStream.pipe(res);
    ~``;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/File/Clear", async(req, res) =>
{
  fileId;
});
//--------------------------------------------- 404 ----------------------------------------------//
app.use((req, res) => {
  res.render("404-page-not-found");
});
//--------------------------------------------------------------------------------------------------//

app.listen(3000, () => console.log("Running on port http://localhost:3000"));
