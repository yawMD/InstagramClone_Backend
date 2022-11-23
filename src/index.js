const express = require('express');
const user = require("./routes/users");
const admin = require("./routes/admin");
const chats = require("./routes/chat");
require('./db/mongoose')
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const port = process.env.PORT || 4000

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/user", user);
app.use("/admin",admin)
app.use("/chat",chats)

app.listen(port,()=>{
  console.log('listening on port '+port)
});
