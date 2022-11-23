const Admin = require("../models/Admin")
const User = require("../models/users")

exports.register = (req, res, next) => {
    //   console.log(req.body);
    Admin.find({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    }).exec((err, result) => {
      if (err || result.length > 0) {
        console.log(result);
        return res.status(409).json({
          error: true,
          message:
            "Registration Failed. Account with same credentials already exists",
          err,
        });
      }
      const { name, email, password, phone } = req.body;
      bcrypt.hash(password, 10, (_err, hash) => {
        if (_err) {
          return res.status(409).json({
            error: true,
            message: "Registration Failed. Hash Error",
            err: _err,
          });
        } else {
          const _v = new Admin({
            name,
            email,
            password: hash,
            phone,
          });
          _v.save((error, user) => {
            if (error || user.length > 0) {
              return res.status(409).json({
                error: true,
                message: "Registration Failed",
                err: error,
              });
            }
            let ret = user;
            ret.password = null;
            ret.registeredOn = null;
            ret.userType = "user";
            return res.status(201).json({
              message: "Registration Successful",
              user: ret,
            });
          });
        }
      });
    });
  };

  exports.getUsers = async(req,res)=>{
    const users = await User.find({})
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
  
  exports.login = (req, res, next) => {
    // const { name, email, password, business, type, phone } = req.body
    // console.log({ name, email, password, business, type, phone })
    // console.log(req.body);
    // return
    const { email, password } = req.body;
    Admin.find({
      email,
    }).exec((err, user) => {
      if (err || !user) {
        console.log("err", { err, user });
        return res.status(409).json({
          error: true,
          message: "Login Failed.",
          err,
          user,
        });
      }
  
      if (user.length < 1) {
        console.log("no users", { user });
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
        ret.type = "admin";
        ret.password = null;
        ret.registeredOn = null;
        let _ret = {
          ...ret,
          type: "admin",
          password: null,
          registeredOn: null,
        };
        console.log(_ret);
        return res.status(201).json({
          message: "Login Successful",
          data: {
            token: jwt.sign({ user: ret }, "Instagram App.", {
              expiresIn: "1d",
            }),
          },
        });
      });
    });
  };
  