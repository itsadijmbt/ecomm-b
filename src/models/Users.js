const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Please enter a valid Email");
      }
    },
  },
  password: {
    type: String,
    required: true, // And here
    trim: true,
    minLength: 7,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("wrong password choice");
      }
    },
  },
  // mobile: {
  //   type: String,
  //  // Only if you want the mobile field to be unique
  //   required:false,
  //   sparse: true, // This will allow multiple documents to have null or missing values in the mobile field
  // },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  wishlist: [{
     product_id:{
      type : String,
      required:true
     }
  }],
  cart:[{
    product_id:{
      type : String,
      required:true
     },
     quantity:{
      type:Number,
      required:true,
      default:1
     }
  }]
   
  //mobile
  //  orders history
  //  address
  // wishlist
  // favourites
  //save payment details
  // email services
});

UserSchema.methods.getAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "userCreated", {
    expiresIn: "2 day",
  });
  user.tokens = user.tokens.concat({ token });

  await user.save();
  return token;
};

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email });

  // console.log(email)
  // console.log(password)
  // console.log(user.password)
  //if(!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);

  // console.log(isMatch)

  if (!isMatch) throw new Error("Invalid email or password");

  return user;
};

UserSchema.pre("save", async function save(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  console.log(user.password);
  next();
});
const User = mongoose.model("User", UserSchema);
module.exports = User;
