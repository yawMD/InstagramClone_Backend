const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    followers:{type:  mongoose.Schema.Types.ObjectId,ref:"User",unique:true},
    following:{type:  mongoose.Schema.Types.ObjectId,ref:"User",unique:true}
})

const Follow = mongoose.model('Follow',followSchema)

module.exports = Follow;