const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req,res)=>{
  try{
    const { name, email, password, location } = req.body;

    if(!name || !email || !password || !location){
      return res.json({ msg: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if(existing){
      return res.json({ msg: "User already exists" });
    }

    // 🔐 HASH PASSWORD (THIS WAS MISSING)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      location
    });

    await user.save();

    res.json({ msg: "Registered" });

  } catch(err){
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
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

  res.json({
  token,
  role: user.role,
  location: user.location
  });
});

module.exports = router;