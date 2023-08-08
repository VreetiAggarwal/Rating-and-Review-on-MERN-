const express = require("express");
const { CreateUser, sign, displayUser } = require("../controllers/user");
const {
  userValidator,
  validate,
  signValidator,
  auth,
} = require("../middlewares/validator");

const router = express.Router();

router.post("/create", userValidator, validate, CreateUser);
router.post("/sign", signValidator, validate, sign);
router.get("/is-auth", auth, displayUser);

module.exports = router;
