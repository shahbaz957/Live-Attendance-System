import mongoose from "mongoose"

const ClassSchema = new mongoose.Schema({
    className : String ,
    teacherId : {
        type : mongoose.Types.ObjectId,
        ref : "User"
    },
    studentIds : [{
        type : mongoose.Types.ObjectId,
        ref : "User"
    }]
})

export const Class = mongoose.model('Class' , ClassSchema)