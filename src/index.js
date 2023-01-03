const express = require('express');
const user = require("./routes/users");
const admin = require("./routes/admin");
const chats = require("./routes/chat");
require('./db/mongoose')
const cors = require("cors");
const morgan = require("morgan");
const socket = require("socket.io")

const app = express();
const port = process.env.PORT || 4000


app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/user", user);
app.use("/admin",admin)
app.use("/chat",chats)

const server = app.listen(port,()=>{
  console.log('listening on port '+ port)
});

const io = socket(server,{
  cors:{
    origin:"http://localhost:3000",
    credentials:true
  }
})

global.onlineUsers = new Map()

io.on("connection", (socket)=>{
  global.chatSocket = socket
  socket.on("add-user",(userId)=>{
    onlineUsers.set(userId, socket.id);
  })

  socket.on("send-msg",(data)=>{
    const sendUserSocket = onlineUsers.get(data.id)
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("msg-recieve", data.message);
    }
  })
})