// const express = require("express");
// const {
//   generateRandomKey,
//   encrypt,
//   decrypt,
//   convertBytesToReadable,
//   dev_details_1,
//   dev_details_2,
  
// } = require("./functions");
// const { MongoClient, GridFSBucket, ReturnDocument } = require("mongodb");
// const dotenv = require("dotenv");
// const multer = require("multer");
// const app = express();
// const { Readable } = require("stream");
// const helmet = require("helmet");
// const session = require("express-session");
// const cookieParser = require("cookie-parser");
// app.set("view engine", "ejs");
// app.use(express.urlencoded({ extended: false }));
// app.use(express.static("public"));
// app.use(express.static("images"));
// app.use(helmet());

// dotenv.config();
// app.use(cookieParser());
// app.use(
//   session({
//     secret: process.env.sessionKey,
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false },
//   })
// );

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: [
//         "'self'",
//         "'unsafe-inline'",
//         "https://cdn.jsdelivr.net",
//         "https://unpkg.com",
//         "https://kit.fontawesome.com",
//       ],
//       connectSrc: [
//         "'self'",
//         "https://lottie.host",
//         "https://fontawesome.com",
//         "https://ka-f.fontawesome.com",
//       ],
//     },
//   })
// );

// //----------------------------------------variable diclaration---------------------------------------//

// var textId = "";
// var fileId = "";
// const data = {
//   content: "",
//   showPopup: false,
//   lockButton: true,
//   error: "",
//   File: false,
//   fileName: "",
//   Filekey: "",
// };
// const client = new MongoClient(process.env.URI);
// let gfs;
// const encyptKey = process.env.encyptKey;

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// //------------------------------------------- connection -------------------------------------------//
// client
//   .connect()
//   .then(() => {
//     console.log("Connected to Database");
//     gfs = new GridFSBucket(client.db("Share-Note"), {
//       bucketName: "uploads",
//     });
//     console.log("GridFSBucket initialized");
//   })
//   .catch((err) => console.error(err));

// //---------------------------------------------routes-----------------------------------------//
// app.get("/", (req, res) => {
//   res.render("index");
// });

// app.get("/get-started", (req, res) => {
//   res.render("get-started");
// });

// app.get("/about-devs", (req, res) => {
//   res.render("about-devs", {
//     dev_details_1,
//     dev_details_2,
   
//   });
// });

// app.get("/how-to-use", (req, res) => {
//   res.render("how-to-use");
// });

// // ----------------------------------------Text sharing ----------------------------------- //

// app.post("/Text/save", async (req, res) => {
//   var encryptData = encrypt(req.body.content, encyptKey);

//   await client
//     .db("Share-Note")
//     .collection("Data")
//     .updateOne(
//       { _id: textId },
//       { $set: { content: encryptData } },
//       { upsert: true }
//     );

//   return res.redirect("/Text/" + textId);
// });

// app.post("/Text/lock", async (req, res) => {
//   var encryptPaskey = encrypt(req.body.passkey, encyptKey);

//   await client
//     .db("Share-Note")
//     .collection("Lock")
//     .updateOne(
//       { _id: textId },
//       { $set: { Pass: encryptPaskey } },
//       { upsert: true }
//     );

//   req.session.PageUnlocked = textId;
//   req.session.cookie.expires = new Date(Date.now() + 2 * 60 * 1000);
//   req.session.cookie.maxAge = 2 * 60 * 1000;

//   return res.redirect("/Text/" + textId);
// });

// app.get("/Text/:textId?", async (req, res) => {
//   textId = req.params.textId;

//   if (!textId) {
//     var randomkey = generateRandomKey(5);
//     return res.redirect("/Text/" + randomkey);
//   }

//   try {
//     const containsData = await client
//       .db("Share-Note")
//       .collection("Data")
//       .findOne({ _id: textId });
//     const isLocked = await client
//       .db("Share-Note")
//       .collection("Lock")
//       .findOne({ _id: textId });

//     data["content"] = containsData
//       ? decrypt(containsData.content, encyptKey)
//       : "";

//     if (isLocked) {
//       data["lockButton"] = false;
//       if (!req.session.PageUnlocked || textId !== req.session.PageUnlocked) {
//         return res.render("unLock", data);
//       }
//     } else {
//       data["lockButton"] = true;
//     }

//     return res.render("text-share", data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.post("/Text/unlock", async (req, res) => {
//   const pass = req.body.passkey;
//   const DBdata = await client
//     .db("Share-Note")
//     .collection("Lock")
//     .findOne({ _id: textId });

//   if (pass === decrypt(DBdata.Pass, encyptKey)) {
//     req.session.PageUnlocked = textId;
//     req.session.cookie.expires = new Date(Date.now() + 2 * 60 * 1000);
//     req.session.cookie.maxAge = 60 * 1000;
//     data["error"] = "";
//     return res.redirect("/Text/" + textId);
//   } else {
//     data["error"] = "Incorrect password";

//     return res.redirect("/Text/" + textId);
//   }
// });

// //------------------------------------------- File Sharing --------------------------------------------//

// app.get("/File/:fileId?", async (req, res) => {
//   fileId = req.params.fileId;
//   if (!fileId) {
//     var randomkey = generateRandomKey(5);
//     return res.redirect("/File/" + randomkey);
//   }
//   const containsFile = await client
//     .db("Share-Note")
//     .collection("FileDetails")
//     .findOne({ _id: fileId });
//   if (containsFile) {
//     data["File"] = true;
//     data["fileName"] =
//       containsFile.Filename + " " + "(" + containsFile.size + ")";
//   } else {
//     data["File"] = false;
//   }
//   return res.render("file-share", data);
// });

// app.post("/File/upload", upload.single("file"), (req, res) => {
//   if (!req.file) {
//     console.log("no file found");
//   } else {
//     const fileData = req.file.buffer;
//     const originalFilename = req.file.originalname;
//     console.log(originalFilename);

//     const readableStream = new Readable();
//     readableStream.push(fileData);
//     readableStream.push(null);

//     const uploadStream = gfs.openUploadStream(originalFilename);

//     const id = uploadStream.id;

//     readableStream
//       .pipe(uploadStream)
//       .on("error", (err) => {
//         console.error("Error uploading file to GridFS:", err);
//         res.status(500).send("Internal Server Error");
//       })
//       .on("finish", async () => {
//         console.log("File uploaded successfully");

//         const size = req.file.size;
//         const fileSizeHumanReadable = convertBytesToReadable(size);
//         await client.db("Share-Note").collection("FileDetails").insertOne({
//           _id: fileId,
//           fileId: id,
//           Filename: originalFilename,
//           size: fileSizeHumanReadable,
//         });

//         //data["Filekey"] = fileId;
//         data["Filestatus"] = "File uploaded successfully";

//         res.redirect("/File/" + fileId);
//       });
//   }
// });

// app.post("/File/download", async (req, res) => {
//   try {
//     const fileRecord = await client
//       .db("Share-Note")
//       .collection("FileDetails")
//       .findOne({ _id: fileId });

//     if (!fileRecord) {
//       return res.status(404).send("File not found");
//     }

//     const Filename = fileRecord.Filename;
//     const fileid = fileRecord.fileId;
//     const downloadStream = gfs.openDownloadStream(fileid);
//     res.set("Content-Disposition", `attachment; filename=${Filename}`);
//     downloadStream.pipe(res);
//     ~``;
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.post("/File/clear", async (req, res) => {
//   try {
//     const db = client.db("Share-Note");

//     const fileRecord = await db
//       .collection("FileDetails")
//       .findOne({ _id: fileId });

//     if (!fileRecord) {
//       throw new Error("File record not found");
//     }

//     await Promise.all([
//       db.collection("uploads.files").deleteOne({ _id: fileId }),
//       db.collection("uploads.chunks").deleteOne({ files_id: fileId }),
//       db.collection("FileDetails").deleteOne({ _id: fileId }),
//     ]);

//     res.redirect("/File/" + fileId);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// //--------------------------------------------- 404 ----------------------------------------------//
// app.use((req, res) => {
//   res.render("404-page-not-found");
// });
// //--------------------------------------------------------------------------------------------------//

// app.listen(3000, () => console.log("Running on port http://localhost:3000"));

const express = require("express");
const {
  generateRandomKey,
  encrypt,
  decrypt,
  convertBytesToReadable,
  dev_details_1,
  dev_details_2,
} = require("./functions");
const { MongoClient, GridFSBucket } = require("mongodb");
const dotenv = require("dotenv");
const multer = require("multer");
const app = express();
const { Readable } = require("stream");
const helmet = require("helmet");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");

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
    },
  })
);

//----------------------------------------variable declaration---------------------------------------//

var textId = "";
var fileId = "";

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
    
    // Initialize cleanup task
    initializeCleanupTask();
  })
  .catch((err) => console.error(err));

//------------------------------------------- Cleanup Function -------------------------------------------//
/**
 * Cleanup function to remove files and data older than 30 days
 * Only deletes records that have a createdAt field (new records will have this)
 */
async function cleanupOldFiles() {
  try {
    const db = client.db("Share-Note");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log(`Starting cleanup task at ${new Date().toISOString()}`);
    console.log(`Removing records older than ${thirtyDaysAgo.toISOString()}`);

    // Find and delete old text data (only records with createdAt field)
    const oldTextData = await db
      .collection("Data")
      .find({ 
        createdAt: { 
          $exists: true, 
          $lt: thirtyDaysAgo 
        } 
      })
      .toArray();
    
    const textIdsToDelete = oldTextData.map((doc) => doc._id);
    
    if (textIdsToDelete.length > 0) {
      await db.collection("Data").deleteMany({
        _id: { $in: textIdsToDelete },
      });
      console.log(`Deleted ${textIdsToDelete.length} old text records`);
    }

    // Find and delete old lock records (only records with createdAt field)
    const oldLockData = await db
      .collection("Lock")
      .find({ 
        createdAt: { 
          $exists: true, 
          $lt: thirtyDaysAgo 
        } 
      })
      .toArray();
    
    const lockIdsToDelete = oldLockData.map((doc) => doc._id);
    
    if (lockIdsToDelete.length > 0) {
      await db.collection("Lock").deleteMany({
        _id: { $in: lockIdsToDelete },
      });
      console.log(`Deleted ${lockIdsToDelete.length} old lock records`);
    }

    // Find and delete old file records and their GridFS files (only records with createdAt field)
    const oldFileDetails = await db
      .collection("FileDetails")
      .find({ 
        createdAt: { 
          $exists: true, 
          $lt: thirtyDaysAgo 
        } 
      })
      .toArray();

    if (oldFileDetails.length > 0) {
      const fileIdsToDelete = oldFileDetails.map((doc) => doc._id);
      const gridFSFileIds = oldFileDetails.map((doc) => doc.fileId);

      // Delete GridFS files and chunks
      for (const gridFSFileId of gridFSFileIds) {
        try {
          await db.collection("uploads.files").deleteOne({ _id: gridFSFileId });
          await db.collection("uploads.chunks").deleteMany({ files_id: gridFSFileId });
        } catch (error) {
          console.error(`Error deleting GridFS file ${gridFSFileId}:`, error);
        }
      }

      // Delete file details
      await db.collection("FileDetails").deleteMany({
        _id: { $in: fileIdsToDelete },
      });
      console.log(`Deleted ${oldFileDetails.length} old file records and their GridFS files`);
    }

    const totalDeleted = textIdsToDelete.length + lockIdsToDelete.length + oldFileDetails.length;
    console.log(`Cleanup completed. Total records deleted: ${totalDeleted}`);
  } catch (error) {
    console.error("Error during cleanup task:", error);
  }
}

/**
 * Initialize the cleanup task to run daily at 2 AM
 */
function initializeCleanupTask() {
  // Run cleanup daily at 2:00 AM
  // Cron format: minute hour day month dayOfWeek
  cron.schedule("0 2 * * *", async () => {
    console.log("Running scheduled cleanup task...");
    await cleanupOldFiles();
  });

  console.log("Cleanup task scheduled to run daily at 2:00 AM");
  
  // Optionally run cleanup immediately on startup (for testing)
  // Uncomment the line below if you want to test the cleanup function on server start
  // cleanupOldFiles();
}

//---------------------------------------------routes-----------------------------------------//
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/get-started", (req, res) => {
  res.render("get-started");
});

app.get("/about-devs", (req, res) => {
  res.render("about-devs", {
    dev_details_1,
    dev_details_2,
  });
});

app.get("/how-to-use", (req, res) => {
  res.render("how-to-use");
});

// ----------------------------------------Text sharing ----------------------------------- //

app.post("/Text/save", async (req, res) => {
  try {
    var encryptData = encrypt(req.body.content, encyptKey);

    await client
      .db("Share-Note")
      .collection("Data")
      .updateOne(
        { _id: textId },
        { 
          $set: { 
            content: encryptData
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

    return res.redirect("/Text/" + textId);
  } catch (error) {
    console.error("Error saving text:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/Text/lock", async (req, res) => {
  try {
    var encryptPaskey = encrypt(req.body.passkey, encyptKey);

    await client
      .db("Share-Note")
      .collection("Lock")
      .updateOne(
        { _id: textId },
        { 
          $set: { 
            Pass: encryptPaskey
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

    req.session.PageUnlocked = textId;
    req.session.cookie.maxAge = 2 * 60 * 1000; // 2 minutes

    return res.redirect("/Text/" + textId);
  } catch (error) {
    console.error("Error locking page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/Text/:textId?", async (req, res) => {
  textId = req.params.textId;

  // Create fresh data object for each request
  const pageData = {
    content: "",
    showPopup: false,
    lockButton: true,
    error: "",
    File: false,
    fileName: "",
    Filekey: "",
  };

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

    pageData.content = containsData
      ? decrypt(containsData.content, encyptKey)
      : "";

    if (isLocked) {
      pageData.lockButton = false;
      if (!req.session.PageUnlocked || textId !== req.session.PageUnlocked) {
        return res.render("unLock", pageData);
      }
    } else {
      pageData.lockButton = true;
    }

    return res.render("text-share", pageData);
  } catch (error) {
    console.error("Error loading text page:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/Text/unlock", async (req, res) => {
  // Create fresh data object for each request
  const pageData = {
    content: "",
    showPopup: false,
    lockButton: false,
    error: "",
    File: false,
    fileName: "",
    Filekey: "",
  };

  try {
    const pass = req.body.passkey;
    const DBdata = await client
      .db("Share-Note")
      .collection("Lock")
      .findOne({ _id: textId });

    // Check if page is actually locked
    if (!DBdata) {
      pageData.error = "Page is not locked";
      return res.render("unLock", pageData);
    }

    // Verify password
    if (pass === decrypt(DBdata.Pass, encyptKey)) {
      req.session.PageUnlocked = textId;
      req.session.cookie.maxAge = 2 * 60 * 1000; // 2 minutes (consistent with lock route)
      return res.redirect("/Text/" + textId);
    } else {
      pageData.error = "Incorrect password";
      return res.render("unLock", pageData);
    }
  } catch (error) {
    console.error("Error unlocking page:", error);
    pageData.error = "An error occurred. Please try again.";
    return res.render("unLock", pageData);
  }
});

//------------------------------------------- File Sharing --------------------------------------------//

app.get("/File/:fileId?", async (req, res) => {
  fileId = req.params.fileId;

  // Create fresh data object for each request
  const pageData = {
    content: "",
    showPopup: false,
    lockButton: true,
    error: "",
    File: false,
    fileName: "",
    Filekey: "",
  };

  if (!fileId) {
    var randomkey = generateRandomKey(5);
    return res.redirect("/File/" + randomkey);
  }

  try {
    const containsFile = await client
      .db("Share-Note")
      .collection("FileDetails")
      .findOne({ _id: fileId });

    if (containsFile) {
      pageData.File = true;
      pageData.fileName =
        containsFile.Filename + " (" + containsFile.size + ")";
    } else {
      pageData.File = false;
    }

    return res.render("file-share", pageData);
  } catch (error) {
    console.error("Error loading file page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/File/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    console.log("No file found");
    return res.redirect("/File/" + fileId);
  }

  const fileData = req.file.buffer;
  const originalFilename = req.file.originalname;
  console.log("Uploading file:", originalFilename);

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

      try {
        const size = req.file.size;
        const fileSizeHumanReadable = convertBytesToReadable(size);

        await client.db("Share-Note").collection("FileDetails").insertOne({
          _id: fileId,
          fileId: id,
          Filename: originalFilename,
          size: fileSizeHumanReadable,
          createdAt: new Date(),
        });

        res.redirect("/File/" + fileId);
      } catch (error) {
        console.error("Error saving file details:", error);
        res.status(500).send("Internal Server Error");
      }
    });
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

    res.set("Content-Disposition", `attachment; filename="${Filename}"`);
    
    downloadStream
      .on("error", (error) => {
        console.error("Error downloading file:", error);
        res.status(500).send("Error downloading file");
      })
      .pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/File/clear", async (req, res) => {
  try {
    const db = client.db("Share-Note");

    const fileRecord = await db
      .collection("FileDetails")
      .findOne({ _id: fileId });

    if (!fileRecord) {
      return res.status(404).send("File not found");
    }

    // Delete from GridFS using the actual GridFS file ID, not the custom fileId
    await Promise.all([
      db.collection("uploads.files").deleteOne({ _id: fileRecord.fileId }),
      db.collection("uploads.chunks").deleteMany({ files_id: fileRecord.fileId }),
      db.collection("FileDetails").deleteOne({ _id: fileId }),
    ]);

    console.log("File cleared successfully");
    res.redirect("/File/" + fileId);
  } catch (error) {
    console.error("Error clearing file:", error);
    res.status(500).send("Internal Server Error");
  }
});

//--------------------------------------------- 404 ----------------------------------------------//
app.use((req, res) => {
  res.status(404).render("404-page-not-found");
});

//--------------------------------------------------------------------------------------------------//

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await client.close();
  process.exit(0);
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));