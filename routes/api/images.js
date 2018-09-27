const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, "./uploads");
  },
  filename: function(req, file, callback) {
    callback(null, file.originalname);
  }
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    callback(null, true);
  }
  callback(null, false);
};
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter
});

// Get The model of image
const Image = require("../../models/Images");

// Get The model of User
const User = require("../../models/Users");

//Validation
const validateImageInput = require("../../validation/image");

//@route    GET api/image/test
//@desc     Tests image route
//@access   public
router.get("/test", (req, res) => res.json({ msg: "Image route are Working" }));

//@route    GET api/images
//@desc     Get images
//@access   public
router.get("/", (req, res) => {
  Image.find()
    .sort({ date: -1 })
    .then(images => res.json(images))
    .catch(err => res.status(404).json({ noimagefound: "No images found" }));
});

//@route    GET api/image/:id
//@desc     Get images by id
//@access   public
router.get("/:id", (req, res) => {
  Image.findById(req.params.id)
    .then(image => res.json(image))
    .catch(err =>
      res.status(404).json({ noimagefound: "No image found with this Id." })
    );
});

//@route    Post api/images
//@desc     Create image
//@access   private
router.post(
  "/addimage",
  upload.single("image"),
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateImageInput(req.body);
    //check validation
    if (!isValid) {
      //If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }
    let imageP = req.file.path.replace(/\\/g, "/");
    const imagePath = req.protocol + "://" + req.get("host") + "/" + imageP;
    const newImage = new Image({
      title: req.body.title,
      description: req.body.description,
      image: imagePath,
      user: req.user.id
    });
    newImage.save().then(image => res.json(image));
  }
);

//@route    Delete api/images/:id
//@desc     Delete images
//@access   private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findOne({ user: req.user.id }).then(user => {
      Image.findById(req.params.id)
        .then(image => {
          //check for image owner
          if (image.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }

          //Delete
          image
            .remove()
            .then(() =>
              res.json({
                success: true,
                msg: "Oops image deleted with the requested id"
              })
            );
        })
        .catch(err =>
          res.status(404).json({ imagenotfound: "No Image found" })
        );
    });
  }
);

module.exports = router;
