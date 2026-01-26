const _ = require("lodash");
const crypto = require("crypto");

function generateRandomKey(n) {
  const characters = "abcdefghijklmnopqrstuvwxyz@#";
  return _.times(n, () => _.sample(characters)).join("");
}

function encrypt(text, key) {
  // Derive a 32-byte key from the input key using SHA-256
  const derivedKey = crypto.createHash("sha256").update(key).digest();
  
  // Generate a random 16-byte IV for AES-256-CBC
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv("aes-256-cbc", derivedKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  // Prepend IV to the encrypted data (IV is not secret, just needs to be unique)
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encryptedText, key) {
  // Derive the same 32-byte key from the input key
  const derivedKey = crypto.createHash("sha256").update(key).digest();
  
  // Extract IV and encrypted data
  const parts = encryptedText.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted text format");
  }
  
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv("aes-256-cbc", derivedKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
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
  detail: "BackEnd Developer",
  image: "./mj_abt_dev.jpeg",
  mail: "mithra86753@gmail.com",
  X: "https://x.com/Mithra_707?t=s6RXzWdnalAJ73DGBGr0JA&s=09",
  insta: "https://www.instagram.com/mithra_707/",
  github: "https://github.com/mithrajeeth18",
  linkdin: "www.linkedin.com/in/mithrajeeth-yadavar-m86753m",
};

const dev_details_2 = {
  name: "Gandhar Bagde",
  detail: "Full Stack Developer",
  // image: "./gb-about-devs.png",
  image: "./2N8A1118.JPG",
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
