const express = require("express");
const { generateRandomKey, encrypt, decrypt } = require("./functions");
const { MongoClient, GridFSBucket } = require("mongodb");
const app = express();
const helmet = require("helmet");
const encyptKey = "Mithrajeeth18";
app.set("view engine", "ejs");
var textId = "";
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(helmet());

const uri =
  "mongodb+srv://Mithra707:*Mithrajeeth*@cluster0.2gpt44h.mongodb.net";
const client = new MongoClient(uri);

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

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
        // Add other directives as needed
      },
    })
  );
  

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/index", (req, res) => {
  res.render("index");
});

app.get("/get-started", (req, res) => {
  res.render("get-started");
});

app.get("/Text/homePage" || "/homePage", (req, res) => {
  res.redirect("/");
});

app.post("/Text/save", async (req, res) => {
  var encryptData = encrypt(req.body.content, encyptKey);
  console.log(req.body.content);
});

app.get("/Text/:textId?", (req, res) => {
  textId = req.params.textId;
  if (!textId) {
    var randomkey = generateRandomKey(5);
    return res.redirect("/Text/" + randomkey);
  }
  res.render("text-share");
});

app.listen(3000, () => console.log("Running on port 3000"));
