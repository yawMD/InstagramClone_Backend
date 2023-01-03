const User = require("../models/users");
const Stories = require("../models/stories");
const timeline = require("../models/timeline");
const Messages = require("../models/MessageModel")
const bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');
const { sendMail } = require("../controllers/general");

exports.register = (req, res) => {
  const { name, email, phone, password,username} = req.body;
  const _j = { name, email, phone, password, username };
  User.find({
    $or: [{ email: req.body.email }, { phone: req.body.phone }],
  }).exec((err, result) => {
    if (err) {
      console.log(err);
      return res.status(409).json({
        error: true,
        message: "Registration Failed. Please try again",
        err,
      });
    }
    if (result.length > 0) {
      // console.log(result);
      return res.status(409).json({
        error: true,
        message:
          "Registration Failed. Account with same credentials already exists",
      });
    }
    // return;
    bcrypt.hash(password, 10, (_err, hash) => {
      if (_err) {
        return res.status(409).json({
          error: true,
          message: "Registration Failed. Hash Error",
          err: _err,
        });
      } else {
        _j.password = hash;
        const _v = new User(_j);
        _v.save((error, user) => {
          if (error || user.length === 0) {
            console.log({ error, user });
            return res.status(409).json({
              error: true,
              message: "Registration Failed",
              err: error,
            });
          }
          let link = `https://instagram.com/activate/${jwt.sign(
            email,
            user.password + user.email
          )}`;
          sendMail(email, `Registration Successful: Activate your account`, {
            name,
            title: "Congratulations!!!",
            content:
              "Welcome to Instagram. Your account has been successfully created.\b\n Click on the following link to verify your email",
            label: "Verify Email Account",
            link,
          });
          console.log(link);
          let ret = user;
          ret.password = null;
          ret.registeredOn = null;
          return res.status(201).json({
            message: "Registration Successful",
            user: ret,
          });
        });
      }
    });
  });
};

exports.activate = (req, res, next) => {
  const { email, code } = req.body;

  User.findOne({
    email,
  }).exec((err, user) => {
    // console.log({ ...req.body });
    // console.log(user);
    // console.log("err", { err, user });
    if (err || !user || user.length < 1) {
      return res.status(409).json({
        error: true,
        message: "Verification Failed.",
        err,
      });
    }
    try {
      // console.log(code);
      data = jwt.verify(code, user.password + email);
      if (data === email) {
        console.log("success");
        User.findOneAndUpdate(
          { email },
          { verified: true },
          { new: true },
          function (err, doc) {
            if (err) {
              console.error("err", err);
              return res.status(500).json({
                error: true,
                err,
                message: "Account Verification failed",
              });
            } else {
              console.log(doc);
              return res.status(201).json({
                message: "Account Verified Successfully",
              });
            }
          }
        );
      } else {
        console.log("error");
      }
    } catch (error) {
      return res.status(403).json({
        message: "Verification Failed",
        error,
      });
    }
  });
};

exports.updatePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  User.find({
    _id: req.headers.user,
  }).exec((err, user) => {
    if (err || !user) {
      return res.status(300).json({
        error: true,
        message: "Password Update Failed.",
        err,
      });
    }

    if (user.length < 1) {
      return res.status(404).json({
        error: true,
        message: "Password Update Failed",
        err,
      });
    }

    if(user[0].lastPasswordChange > 0 && user[0].passwordUpdates > 3) {
      if((Date.now() - user[0].lastPasswordChange) < 1000 * 60 * 60 * 24 * 14) {
        return res.status(422).json({
          error: true,
          message: "Password Update Failed. You can attempt changing again after two weeks",
          err,
        });
      }
    }
    console.log({newPassword, oldPassword})
    bcrypt.compare(oldPassword, user[0].password, function (err, result) {
      if (err || !result) {
        console.log("bcrypt", { err, result });
        return res.status(404).json({
          error: true,
          message: "Password Update Failed",
          err: err,
        });
      }
      bcrypt.hash(newPassword, 10, (_err, hash) => {
        if (_err) {
          return res.status(422).json({
            error: true,
            message: "Password Update Failed. Hash Error",
            err: _err,
          });
        } else {
          User.findOneAndUpdate(
            { _id: req.headers.user },
            { password: hash },
            function (err, doc) {
              if (err) {
                return res.status(409).json({
                  error: true,
                  message: "Password Update Failed. Hash Error",
                  err: _err,
                });
              }
              return res.status(201).json({
                error: false,
                message: "Password Update Successful",
              });
            }
          );
        }
      });
    });
  });
};

exports.stories =(req, res)=>{
    const  {user}= req.headers;
    const {media}= req.body
    const _j = {user,media}
    const story = new Stories(_j)

    story.save((error, msg) => {
        if (error || msg.length === 0) {
          return res.status(409).json({
            error: true,
            message: "Sending story Failed",
            err: error,
          });
        }
    
        return res.status(201).json({
          message: "story sent Successfully",
          msg,
        });
      });
}


//get stories route
exports.getStories = async(req, res)=>{
  const stories = await Stories.find({user: req.params.user})
  if(!stories){
      res.status(404).send("No data for users stories")
  }
  try{
      res.status(200).send(stories)
  }catch (e) {
      res.status(500).send(e) 
  }
};

exports.getAllStories = async(req, res)=>{
  const stories = await Stories.find({})
  if(!stories){
      res.status(404).send("No data for users stories")
  }
  try{
      res.status(200).send(stories)
  }catch (e) {
      res.status(500).send(e) 
  }
};


exports.login = (req, res) => {

  console.log('here', req)
  
    const { email, password } = req.body;
    console.log(req.body)
    User.find({
      email,
    }).exec((err, user) => {
      // console.log("err", { err, user });
      if (err || !user) {
        return res.status(409).json({
          error: true,
          message: "Login Failed.",
          err,
          user,
        });
      }
  
      if (user.length < 1) {
        // console.log("no users", { user });
        return res.status(404).json({
          error: true,
          message: "Login Failed",
          err,
        });
      }
      bcrypt.compare(password, user[0].password, function (err, result) {
        if (err || !result) {
          console.log("bcrypt", { err, result });
          return res.status(422).json({
            error: true,
            message: "Login Failed",
            err: err,
          });
        }
        let ret = user[0]._doc;
        ret.type = "user";
        ret.password = null;
        ret.registeredOn = null;
        let _ret = {
          ...ret,
          type: "user",
          password: null,
          registeredOn: null,
        };
        // console.log(_ret);
        return res.status(201).json({
          message: "Login Successful",
          data: {
            token: jwt.sign({ user: ret }, "Instagram App.", {
              expiresIn: "1000d",
            }),
          },
        });
      });
    });
  };

  // user profile

  exports.getProfile = (req, res, next) => {
    // console.log(req.headers.admin)
    User.findOne({ _id: req.headers.user }).exec((err, profile) => {
      if (err || !profile) {
        return res.status(409).json({
          error: true,
          message: "No Profile Found",
          err,
        });
      }
  
      if (profile.length < 1) {
        console.log(profile);
        return res.status(404).json({
          error: true,
          message: "No Profile Found",
          err,
        });
      }
      delete profile.password;
      delete profile._id;
      return res.status(201).json({
        message: "Your Profile",
        profile,
      });
    });
  };

  //create post route
  exports.timeline =  async(req,res) => {
    const { user } = req.headers
    const {
       name,
       media,
       caption,
      } = req.body;
      const _j = {
        user,
        name,
       media,
       caption,
      }
      console.log(_j)
    const Timeline = new timeline(_j)

    try{
        if(!Timeline){
            res.status(404).send(err)
        }
        await Timeline.save()
        //access token if auth is added 
        res.status(200).send(Timeline)
    }catch(err){
        res.status(500).send(err)
    }
}

//get Users 

exports.getUsers = async(req,res)=>{
  const { user } = req.headers
  const users = await User.findById(user)
  console.log(users)
  try{
  if(!users){
    res.status(404).send("users not found")
  }
  res.send(users);
}catch(err){
  res.status(500).send(err)
}
}


//get post route
exports.getTimeline = async(req, res) => {
  timeline.find({ user: req.params.id }).exec((err, myposts) => {
    if (err || !myposts) {
      return res.status(409).json({
        error: true,
        message: "Server error: Error fetching user's sent quotes",
        err,
      });
    }

    return res.status(201).json({
      message: "my post Info",
      myposts,
    });
  });
}


exports.getAllTimeline= async(req,res)=>{
  console.log("working")
  timeline.find({}).then((post)=> {
      res.status(200).send(post)
  }).catch((e)=>{
              res.status(500).send(e)
  })
}


//follow user endpoint
exports.followUser = async(req,res,next) =>{
  const { user } = req.headers
  const userToFollow = await User.findById(req.params.id)
  const loggedInUser = await User.findById(user)

  if(!userToFollow){
    return next(new ErrorHandler("User Not Found", 404));
  }

  if(loggedInUser.following.includes(userToFollow._id)){
    const followingIndex = loggedInUser.following.indexOf(userToFollow._id);
    const followerIndex = userToFollow.followers.indexOf(loggedInUser._id);

    loggedInUser.following.splice(followingIndex, 1);
    userToFollow.followers.splice(followerIndex, 1);

    await loggedInUser.save();
    await userToFollow.save();

    return res.status(200).json({
        success: true,
        message: "User Unfollowed"
    });
} else {
    loggedInUser.following.push(userToFollow._id);
    userToFollow.followers.push(loggedInUser._id);
    await loggedInUser.save();
    await userToFollow.save();

    res.status(200).json({
        success: true,
        message: "User Followed",
    });
  }
}

// exports.getAllUsers = async (req, res, next) => {

//   const users = await User.find({});

//   const suggestedUsers = users.filter((u) => u.followers.includes(req.headers.user) && u._id.toString() !== req.headers.user.toString()).slice(-5)


//   res.status(200).json({
//       success: true,
//       users: suggestedUsers,
//   });
// };

exports.getAllUsers = async (req, res, next) => {

  User.find({}).then((users)=> {
    res.status(200).send(users)
}).catch((e)=>{
            res.status(500).send(e)
})
};


exports.getPostsOfFollowing = async (req, res, next) => {

  // const { user } = req.headers

  const users = await User.findById(req.params.user)

 console.log(users)
  const currentPage = Number(req.query.page) || 1;

  const skipPosts = 4 * (currentPage - 1);

  const totalPosts = await timeline.find({
      postedBy: {
          $in: users.following
      }
     
  }).countDocuments();

  const posts = await timeline.find({
    postedBy: {
      $in: users.following
  }
  }).populate("postedBy likes").populate({
      path: 'comments',
      populate: {
          path: 'user'
      }
  }).sort({ createdAt: -1 }).limit(4).skip(skipPosts)

  return res.status(200).json({
      success: true,
      posts: posts,
      totalPosts
  });
};