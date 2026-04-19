const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async(req,res)=>{
  const {name,email,password,location} = req.body;

  const exists = await User.findOne({email});
  if(exists) return res.status(400).json({msg:"User exists"});

  const hashed = await bcrypt.hash(password,10);

  const user = new User({name,email,password:hashed,location});
  await user.save();

  res.json({msg:"Registered"});
});

router.post("/login", async(req,res)=>{
  const {email,password} = req.body;

  const user = await User.findOne({email});
  if(!user) return res.status(400).json({msg:"No user"});

  const valid = await bcrypt.compare(password,user.password);
  if(!valid) return res.status(400).json({msg:"Wrong password"});

  const token = jwt.sign(
    {id:user._id,location:user.location,role:user.role},
    process.env.JWT_SECRET,
    {expiresIn:"2h"}
  );

  res.json({token,role:user.role});
});

module.exports = router;