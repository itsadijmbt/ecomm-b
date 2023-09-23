const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminSchema = mongoose.Schema({
  adminName: {
    type: String,
    required: [true, "Please enter the name"],
  },
  adminEmail: {
    type: String,
    required: [true, "please provide an email"],
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  adminPassword: {
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
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});
//later also add a security key

adminSchema.methods.authAdminToken = async function () {
  const admin = this;
  const token = jwt.sign({ _id: admin._id.toString() }, "AdminCreated", {
    expiresIn: "1 day",
  });
  admin.tokens = admin.tokens.concat({ token });
  await admin.save();
  return token;
};

adminSchema.statics.authAdminByCredentials = async (email, password) => {
  const admin = await Admin.findOne({ adminEmail: email });

  const isMatch = await bcrypt.compare(password, admin.adminPassword);

  if (!isMatch) {
    console.log("Invalid email or password");
   throw new Error("Invalid email or password");
  }
  return admin;
};

adminSchema.pre("save", async function save(next) {
  const admin = this;

  if (admin.isModified("adminPassword")) {
    admin.adminPassword = await bcrypt.hash(admin.adminPassword, 10);
  }

  console.log(admin.password);
  next();
});

const Admin = mongoose.model("Admin_Data", adminSchema);

module.exports = Admin;
