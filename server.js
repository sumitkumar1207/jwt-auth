const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./routes/api/users");
const images = require("./routes/api/images");
const app = express();

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Db config
const db = require("./config/keys").mongoURI;

//passport middleware
app.use(passport.initialize());
//Passport config
require("./config/passport")(passport);

// Connect to mongodb
mongoose
  .connect(db || process.env.mongoURI)
  .then(() => console.log("MongoDb Connected"))
  .catch(err => console.log(err));

app.use("/uploads", express.static("uploads"));
// Use Routes
app.use("/api/users", users);
app.use("/api/images", images);

const port = process.env.PORT || 5500;
app.listen(port, () => console.log(`Server is runnig on the port ${port}`));
