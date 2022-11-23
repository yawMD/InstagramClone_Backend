const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth")
const { register,getUsers,login} =  require("../controllers/admin")

router.post("/register", auth, register);
router.get("/users", auth, getUsers);
router.post("/login", auth, login);

module.exports = router;