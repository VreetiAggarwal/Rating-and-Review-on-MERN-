const express = require("express");
const {
  createActor,
  updateActor,
  removeActor,
  searchActor,
  getLatestActors,
  getSingleActor,
} = require("../controllers/actor");
const { uploadImage } = require("../middlewares/multer");
const {
  actorInfoValidator,
  validate,
  isAdmin,
  auth,
} = require("../middlewares/validator");
const router = express.Router();

router.post(
  "/create",
  auth,
  isAdmin,
  uploadImage.single("avatar"),
  actorInfoValidator,
  validate,
  createActor
);

router.post(
  "/update/:actorId",
  auth,
  isAdmin,
  uploadImage.single("avatar"),
  actorInfoValidator,
  validate,
  updateActor
);

router.delete("/:actorId", auth, isAdmin, removeActor);
router.get("/search", auth, isAdmin, searchActor);
router.get("/latest-uploads", auth, isAdmin, getLatestActors);
router.get("/single/:id", getSingleActor);

module.exports = router;
