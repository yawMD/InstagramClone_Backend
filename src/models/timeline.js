const mongoose = require('mongoose');

const TimeLineSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    name:{
        type: String,
        trim: true
    },
    media:{
        type: String,
        required: true,
    },
    caption:{
        type: String,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            comment: {
                type: String,
                required: true,
                trim: true,
            }
        }
    ],
    postedBy:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"User"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
},{
    timestamp:true
});

const TimeLine = mongoose.model('TimeLine',TimeLineSchema)

module.exports = TimeLine;