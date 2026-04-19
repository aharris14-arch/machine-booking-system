const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: {type:String, unique:true},
  password: String,
  location: {type:String, enum:["Units","Blocks"]}
});

module.exports = mongoose.model("User", UserSchema);