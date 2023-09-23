const express = require("express");
const User = require("../models/Users");
const auth = require("../middleware/auth");
const router = new express.Router();
const Products = require("../models/Products ");

router.post("/users/register", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.getAuthToken();
    res.send({ user });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.getAuthToken();
    //done to provide new auth token for every repeated login
    res.send({token});
  } catch (error) {
    res.status(500).send({ error: "login failed" });
  }
});

// we have to filter the data
router.get("/users/me", auth, async (req, res) => {
  const data = {
    name: req.user.name,
    email: req.user.email,
  };
  console.log(data);
  res.send(data);
});

router.patch("/users/update/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  //gets keys from req body
  //later update mobile, address, card details , email subscrition
  const allowedUpdates = ["name", "email", "password"];

  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(402).send({ error: "Invalid operation" });
  }

  //here we use req.user as it is authenticated and the req properties have been changed inauth as req.user=user that user has alreqady been found and no need to do operation again

  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();
    console.log(req.user);
    //saving the user
    // if (!req.user) res.status(403).send({ error: "USER NOT FOUND" });
    res.send(req.user);
  } catch (e) {
    res.status(500).send("ERROR");
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    // const user =await  User.findById(req.params.id)
    // if(!user) res.status(402).send({error:"Error while logging out!"})
    // usinf this is useless as it is not authenvticated avtion..i.e we dint know whether the action is autneticated or done by an active user
    // thats why we created an auth middle ware that stores the authencticated user and its token not array
    req.user.tokens = req.user.tokens.filter((token) => {
      // it filter all token into a new array which are not equal to token that passed thr auth i.e req.auth
      // token is a object and .token acces it
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(201).send("logged out");
  } catch (e) {
    res.status(500).send({ error: " logout route failed" });
  }
});

router.post("/users/logout/all", auth, async (req, res) => {
  console.log(req.user);

  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(201).send({ message: "USER LOOGED OUT FROM ALL SESSIONS" });
  } catch (e) {
    res.status(403).send(e);
  }
});

//temporary get resquest
router.get("/users", async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/users/products", auth, async (req, res) => {

  console.log('route reached')

  try {
    const productlist = await Products.find({});
    res.send(productlist);
    
  } catch (err) {
    res.status(403).send({ error: "cannot get products" });
  }
});
//to get a single product

router.get("/products/:id", auth, async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    res.send(product);
  } catch (err) {
    res.status(403).send({ error: "cannot get product" });
  }
});

// routes to access wishlist
router.get("/users/me/wishlist", auth, async (req, res) => {
  try {
  const list = await Products.find({});
const wishIds = req.user.wishlist.map(item => item.product_id.toString());

console.log('Wish Ids:', wishIds);
console.log('Product Ids:', list.map(product => product._id.toString()));

const finalWishlist = list.filter(product => wishIds.includes(product._id.toString()));

console.log('Final Wishlist:', finalWishlist);

res.send(finalWishlist);

  } catch (e) {
    res.status(500).send({ error: "failed in catch block" });
  }
});

//routes to delete wishlist
//you can do with the product_id
router.patch('/users/me/wishlist/delete/:id', auth , async(req,res)=>{

  // it takes the id insisde the obj on  wishlist not the product id
  // 
   try{

    // const wishlist = req.user.wishlist.map(item=> item.product_id.toString());

    req.user.wishlist = req.user.wishlist.filter((item)=>{
      
      return (item.product_id).toString() !== req.params.id;       
    })
   
    

   await req.user.save();
   res.send(req.user.wishlist);  
   }
   catch(e)
   {
    res.status(403).send({error:"deletion in wish list failed"})
   }


})
//route to add to wishlist(patch)
//you can do with the product_id
router.patch('/users/me/addtowishlist/:id', auth , async(req,res)=>{
  
  try
  {   
      req.user.wishlist.push({product_id:req.params.id});
      await   req.user.save();
      res.send(req.user.wishlist)
  }
  catch(e)
  {

      res.status(500).send({error:"addition failed", e});
  }
})

// routes to access orders
// routes to access cart
//

module.exports = router;
