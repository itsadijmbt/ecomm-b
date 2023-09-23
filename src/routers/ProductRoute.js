const express = require("express");
const mongoose = require("mongoose");
const router = new express.Router();
const Products = require("../models/Products ");
const Admin = require("../models/admin");
const adminAuth = require("../middleware/adminAuth");
//admin logout
//admin to access products
//admin to access to user


//upodate admin
//search
//delete


router.post('/admin/logout', adminAuth, async(req,res)=>{

 console.log(req.admin)
  try{

    req.admin.tokens=req.admin.tokens.filter((token)=>{
      return token.token !==  req.token
    })
    await req.admin.save()
    res.send(req.admin)
  }
  catch (e){
    
 res.status(403).send({error:"failed operation"})
  }


})
//add admin  auth to it
router.post("/admin/register",adminAuth,  async (req, res) => {
  // a admin can be registered only by a preexisting admin
  const admin = await new Admin(req.body);
  
  try {
    await admin.save();
    const token = await admin.authAdminToken();
    res.status(201).send({ success: "Admin added" });
  } catch (e) {
    res.status(403).send(e);
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const admin = await Admin.authAdminByCredentials(
      req.body.adminEmail,
      req.body.adminPassword
    );
     
    console.log(admin)
    const token = await admin.authAdminToken();
    res.send({ admin, token });
  } catch (error) {
    res.status(500).send({ error: "admin login failed" });
  }
});

router.post("/admin/addproduct", adminAuth, async (req, res) => {
  const product = await new Products(req.body);

  console.log(product);
  try {
    await product.save();
    res.send(product);
  } catch (e) {
    res.status(500).send({ error: "Failed to save element" });
  }
});

router.get("/admin/product", adminAuth, async (req, res) => {
  try {
    const product = await Products.find({});
    res.send(product);
  } catch (e) {
    res.send({ error: "failed to fetch products" });
  }
});

router.patch("/admin/product/:id", adminAuth, async (req, res) => {


  const updates = Object.keys(req.body);
  const allowedUpdates = ["product_name,", "price", "description"];

  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) res.status(403).send({ error: "Invalid operation" });

  try {
    // console.log(product);
    // updates.forEach((update)=>{
    //  product[update]=req.body[update];
    // })

    const product_update = await Products.findByIdAndUpdate(
      req.params.id,
      req.body,
      { runValidators: true }
    );

    await product_update.save();
    // await product.save();
    res.send(product_update);
  } catch (e) {
    res.status(500).send({ error: "failed to update" });
  }
});

router.get('/admin/search/:id', adminAuth, async (req,res)=>{


  console.log(req.body)
  const searchFeilds=Object.keys(req.body);
 
  const allowedSearchFeilds=['_id'];
 
  const validSearch=searchFeilds.every((search)=>{
   return allowedSearchFeilds.includes(search);
  })
 
  if(!validSearch) res.status(403).send({error:"invalid search feild search only by _id"});
 
  try{
 
   const product= await Products.findById(req.body._id);
 
   res.send(product);
 
  }catch(e)
  {
   res.send({error:"operation failed"})
   }
 
 });
module.exports = router;
