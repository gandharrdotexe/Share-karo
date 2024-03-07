const express = require("express");
const { generateRandomKey, encrypt, decrypt } = require("./functions");

const app = express();

const encyptKey = "Mithrajeeth18";
app.set("view engine", "ejs");
var textId = "";
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

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


app.post("/Text/save", (req, res) => {
  var encryptData = encrypt(req.body.content, encyptKey);
  



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
