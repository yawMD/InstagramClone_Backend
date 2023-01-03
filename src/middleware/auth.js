const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let token = req.headers.authorization;
   console.log(token);
  if (token === undefined) {
    return res.status(403).json({
      message: "Access Denied. Invalid Validation token",
      error: true,
    });
  }
  token = token.replace("Bearer ", "");
  console.log(token)
  try {
    let data = jwt.verify(token, "Instagram App.");
    if (req.baseUrl === "/admin") {
      req.body = { ...req.body, admin: data.user._id };
      req.headers.userType = "admin";
      req.headers.admin = data.user._id;
    } else if (req.baseUrl === "/user") {
      req.body = { ...req.body, user: data.user._id };
      req.headers.userType = "user";
      req.headers.user = data.user._id;
      req.headers.following = data.user.following;
      console.log(req.headers.following)
    }
     else if (req.baseUrl === "/chat") {
      req.body = { ...req.body, user: data.user._id };
      req.headers.userType = "user";
      req.headers.user = data.user._id;
    }
    if (req.headers.userType !== data.user.type) {
      return res.status(422).json({
        message: "Access Denied",
        error: true,
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      err: err,
      message: "Access Denied",
      error: true,
    });
  }
};
