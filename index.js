const express = require('express');
require('./src/db/mongoose')

const app=express();

const userRoute=require('./src/routers/UserRoutes');
const productRoute=require('./src/routers/ProductRoute')
app.use(express.json());
const port= process.env.PORT || 4000;

app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();


})
app.use(userRoute);
app.use(productRoute)

app.listen(port, ()=>{
  console.log(`Server is running on ${port}`);
})