const jwt = require("jsonwebtoken");
const Admin=require("../models/admin");

//rsatgher than askingh the cresd aagain again it verifies a jwt 

const adminAuth = async(req,res,next)=>{

  try{
      //get the token
      //dont have tosearch via email as done in auth crendential checker
      const token = req.header("Authorization").replace("Bearer ", "");

      const decode=jwt.verify(token, "AdminCreated");
  //decode returns an object
      const admin= await Admin.findOne({_id:decode._id, "tokens.token":token});

     

      if(!admin) throw new Error("passes but authentication failed");

       req.admin=admin;
       req.token=token;

     
       next();
     }  
    catch(e)
    {
      res.status(500).send({error:"failed to authenticate the admin"});
    }
}

module.exports=adminAuth;



