const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({

 product_name:{
  required:true,
  type:String
 },
 price:{
  type:Number,
 },
 description:{
  type: String,
 }
})



const Prouduct=mongoose.model
("Products", productsSchema)

module.exports=Prouduct;
