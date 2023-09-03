const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");


// from here
const {uploadFile, getImage} = require("../controllers/imageControllers");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);

// from here
router.route("/file/upload").post(upload.single("file"), uploadFile);  //protect
router.route("/file/:filename").get(getImage);
// to here

module.exports = router;