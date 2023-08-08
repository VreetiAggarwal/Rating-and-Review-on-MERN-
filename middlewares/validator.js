const config = require("config");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { check, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");

exports.userValidator = [
  check("name").trim().not().isEmpty().withMessage("Name is Missing"),
  check("email").normalizeEmail().isEmail().withMessage("Email is invalid!"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing!")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be at least 6 letters long."),
];

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.json({ error: error[0].msg });
  }

  next();
};

exports.signValidator = [
  check("email").normalizeEmail().isEmail().withMessage("Email is invalid!"),
  check("password").trim().not().isEmpty().withMessage("Password is missing!"),
];

exports.auth = async (req, res, next) => {
  try {
    const token = req.headers?.authorization;
    const jwtToken = token.split("Bearer ")[1];

    if (!jwtToken) {
      return res.status(401).json({ msg: "No token, authorization failed" });
    }

    const decoded = jwt.verify(jwtToken, config.get("jwtSecret"));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

exports.actorInfoValidator = [
  check("name").trim().not().isEmpty().withMessage("Actor name is Missing!"),
  check("about").trim().not().isEmpty().withMessage("About is required!"),
  check("gender").trim().not().isEmpty().withMessage("Gender is required!"),
];

exports.isAdmin = async (req, res, next) => {
  const userRole = await User.findById(req.user.id);

  if (userRole.role !== "admin")
    return res.status(400).json({ msg: "Unauthorized Access!" });
  next();
};

exports.ValidateMovie = [
  check("title").trim().not().isEmpty().withMessage("Movie title is missing!"),
  check("storyLine")
    .trim()
    .not()
    .isEmpty()
    .withMessage("StoryLine is missing!"),
  check("language").trim().not().isEmpty().withMessage("Language is missing!"),
  check("releaseDate")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Release Date is missing!"),
  check("status")
    .isIn(["public", "private"])
    .withMessage("Movie status must be public or private!"),
  check("type").trim().not().isEmpty().withMessage("Type is missing!"),
  check("genres")
    .isIn([
      "Action",
      "Romance",
      "Comedy",
      "Thriller",
      "Horror",
      "Fantasy",
      "Fiction",
    ])
    .withMessage("Genre must be in the given list!"),

  check("tags")
    .isArray({ min: 1 })
    .withMessage("Tags must be an array of array or strings!")
    .custom((tags) => {
      for (let tag of tags) {
        if (typeof tag !== "string")
          throw Error("Tags must be an array of Strings!");
        return true;
      }
    }),
  check("cast")
    .isArray()
    .withMessage("Cast must be an array of array of objects!")
    .custom((cast) => {
      for (let c of cast) {
        if (!isValidObjectId(c.id)) throw Error("Invalid cast id inside cast!");
        if (!c.roleAs?.trim()) throw Error("Role as missing inside cast!");
        if (typeof c.leadActor !== "boolean")
          throw Error("Only accepted boolean value inside cast!");

        return true;
      }
    }),
  // check("trailerInfo")
  //   .isObject()
  //   .withMessage("trailer Info must be an object with url and public_id")
  //   .custom(({ url, public_id }) => {
  //     try {
  //       const result = new URL(url);
  //       if (!result.protocol.includes("http"))
  //         throw Error("Trailer url is invalid!");

  //       const arr = url.split("/");
  //       const publicId = arr[arr.length - 1].split(".")[0];

  //       if (public_id !== publicId)
  //         throw Error("Trailer public_id is invalid!");

  //       return true;
  //     } catch (err) {
  //       throw Error("Trailer url is invalid!");
  //     }
  //   }),

  // check("poster").custom((_, { req }) => {
  //   if (!req.file) throw Error("Poster file is missing!");

  //   return true;
  // }),
];
