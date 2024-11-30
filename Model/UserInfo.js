import mongoose from "mongoose";

const Schema=mongoose.Schema;
const UserInfo=new Schema({
    FirstName:{type:String,require:true},
    LastName:{type:String, require:true},
    Email:{type:String,require:true},
    Password:{type:String,require:true},
})

module.exports=mongoose.model('UserInfo',UserInfo);