const mongoose = require('mongoose')

const storiesSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    name:{ 
        type:String,
        ref:"User"
    },
    media:{
        type: String,
    }
},{
    timestamp:true,
})

const Stories = mongoose.model('Stories',storiesSchema)

module.exports = Stories