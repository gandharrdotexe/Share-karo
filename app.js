const express = require("express");
const { generateRandomKey, encrypt, decrypt } = require("./functions");

const app = express();

const encyptKey = "Mithrajeeth18";
app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/homePage", (req, res) => {
  res.render("index");
});

app.get("/index", (req, res) => {
  res.render("index");
});

app.get("/get-started", (req, res) => {
  res.render("get-started");
});

app.get("/text/homePage", (req,res)=>{
  res.redirect("/homepage");
  res.render("index");
});

app.get("/text/:textId?", (req, res) => {
  var textId = req.params.textId;
  if (!textId) {
    var randomkey = generateRandomKey(5);
    return res.redirect("/text/" + randomkey);
  }
  res.render("text-share");
});




app.listen(3000, () => console.log("Running on port 3000"));


