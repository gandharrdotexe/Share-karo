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

module.exports = {
  generateRandomKey,
  encrypt,
  decrypt,
};
