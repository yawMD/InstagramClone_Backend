const {sendMsg, getMessage} = require("../controllers/messages");
const router = require("express").Router();
const auth = require("../middleware/auth")

router.post("/message",auth, sendMsg);
router.post("/chats",auth, getMessage);

module.exports = router;