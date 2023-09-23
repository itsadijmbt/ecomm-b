const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const auth = async (req, res, next) => {
  try {
    // bearer_ _represents space that why this has been eliminated
    const token = req.header("Authorization").replace("Bearer ", "");

    //console.log(token);

    const decode = jwt.verify(token, "userCreated");

    //console.log(decode)

    const user = await User.findOne({ _id: decode._id, "tokens.token": token });

    //console.log(user);

    if (!user) throw new Error("passes but autentication failed");

    //thsi step stores req.token as found user and tohen respectively
    req.token = token;
    req.user = user;

    //when auth passes then only next
    next();
  } catch (e) {
    res.status(401).send({ error: "Please Authenticate" });
  }
};

module.exports = auth;


/*Extracts the token from the Authorization header and removes the "Bearer " prefix.
Verifies the token using the jwt.verify method with the secret "userCreated".
Decodes the token to get the user ID and then queries the database to find a user with the matching ID and token.
If a user is found, it adds the user object and the token to the req object so that they can be accessed in subsequent middleware or route handlers.
If the authentication is successful, it calls next() to pass control to the next middleware or route handler.*/