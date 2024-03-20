const _ = require("lodash");
const crypto = require("crypto");

function generateRandomKey(n) {
  const characters = "abcdefghijklmnopqrstuvwxyz@#";
  return _.times(n, () => _.sample(characters)).join("");
}

function encrypt(text, key) {
  const cipher = crypto.createCipher("aes-256-cbc", key);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(encryptedText, key) {
  const decipher = crypto.createDecipher("aes-256-cbc", key);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function convertBytesToReadable(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  if (bytes === 0) {
    return "0 Byte";
  }

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

const dev_details_1 = {
  name: "Mithrajeeth Yadavar",
  detail: "BackEnd developer",
  image: "./mj_abt_dev.jpeg",
  mail: "mithra86753@gmail.com",
  X: "https://x.com/Mithra_707?t=s6RXzWdnalAJ73DGBGr0JA&s=09",
  insta: "https://www.instagram.com/mithra_707/",
  github: "https://github.com/mithrajeeth18",
  linkdin:
    "https://www.linkedin.com/in/mithrajeeth-yadavar-a3381727b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
};

const dev_details_2 = {
  name: "Gandhar Bagde",
  detail: "FrontEnd developer",
  image: "./gb-about-devs.png",
  mail: "gandharbagde@gmail.com",
  X: "https://twitter.com/gandharbagde_",
  insta: "https://www.instagram.com/iamgandharrr._/",
  github: "https://github.com/gandharrdotexe",
  linkdin:
    "https://www.linkedin.com/in/gandhar-bagde-4406032a9?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
};

module.exports = {
  generateRandomKey,
  encrypt,
  decrypt,
  convertBytesToReadable,
  dev_details_1,
  dev_details_2,
};
