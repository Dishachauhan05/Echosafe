const {Router} = require("express");
const router = Router();
const path = require("path");
const multer = require("multer");

const Report = require("../models/report");
const User = require("../models/user");

const storage = multer.diskStorage({
    destination:function(req,res,cb){
       cb(null,path.resolve(`./public/uploads`));
    },
    filename:function(req,res,cb){
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null,fileName);
    }
})

const upload = multer({storage: storage});


router.get("/",(req,res)=>{
    return res.send("Hello From report!");
});

router.post("/data",async(req,res)=>{
    const {description,ImageURL,voice,location} = req.body;
   await Report.create({
         description,
         ImageURL,
         voice,
         location,
   })
   return res.status(201).json({ message: "Report submitted successfully!" });
});


router.get("/login",(req,res)=>{
    return res.send("Hello From Login!");
})

router.get("/create-user",(req,res)=>{
    return res.send("Hello From User!");
})

router.post("/create-user",async(req,res)=>{
    const {username,email,password} = req.body;
    await User.create({
        username,
        email,
        password,
    })
    return res.status(201).json({ message: "User created successfully!" });
})

router.post("/login",async(req,res)=>{
    const {email,password} = req.body;
  
        const token = await User.matchPasswordAndGenerateToken(email, password);

    if(!token) {
      return res.render("signin", { error: "Incorrect Email or Password!" });

    }
    
    res.cookie("token", token);
    return res.redirect("/create-user");


});

module.exports = router;