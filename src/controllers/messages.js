const Messages = require("../models/MessageModel")

exports.sendMsg = async(req, res, next)=>{
  try{
    const {from, to, message }= req.body;
    console.log(req.body)
    const data = await Messages.create({
        message: {text: message},
        users:[from, to],
        sender: from,
    })
    if(data) return res.json({ msg: "Message added successfully"});
    return res.json({ msg: "Failed to add message to database"})
  }catch(e){
    next(e);
  }
}

module.exports.getMessage = async(req, res, next)=>{
  try{
    const {from,to} = req.body
    console.log(req.body)
    const messages = await Messages.find({
        users:{
            $all: [from, to],
        },
    }).sort({ updatedAt: 1 });
    const projectMessages = messages.map((msg)=>{
        return{
            fromSelf:msg.sender.toString() === from, 
            message: msg.message.text,
        }
    })
    res.json(projectMessages);
  }catch(ex){
    next(ex);
  }
}