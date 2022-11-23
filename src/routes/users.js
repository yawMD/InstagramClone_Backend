const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const {
  register,
  activate,
  login,
  stories,
  getStories,
  timeline,
  getTimeline,
  updatePassword,
  getUsers,
  followUser,
  getPostsOfFollowing,
  getAllUsers,
  getAllTimeline,
  getAllStories
} = require("../controllers/users");

router.post("/users", register);
router.post("/activate", activate);
router.post("/login", login);
router.post("/stories", auth, stories);
router.post("/timeline", auth, timeline);

router.get("/users",auth, getUsers);
router.get("/alltimelines", auth, getAllTimeline)

router.get("/userAll",auth, getAllUsers);

router.get("/follow/:id",auth,followUser);
router.get("/post/:user",auth, getPostsOfFollowing)

router.get("/mytimeline/:id",auth, getTimeline);
router.get("/mystories",auth, getStories);
router.get("/stories",auth,getAllStories)

router.patch("/passwordUpdates", updatePassword);

module.exports = router;
