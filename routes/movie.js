const express = require("express");
const {
  auth,
  isAdmin,
  ValidateMovie,
  validate,
} = require("../middlewares/validator");
const { uploadVideo, uploadImage } = require("../middlewares/multer");
const {
  uploadTrailer,
  createMovie,
  updateMovieNo,
  updateMovieWith,
  removeMovie,
  rating,
  getMovies,
  getDetailsMovies,
  leaveRating,
} = require("../controllers/movie");
const { parseData } = require("../util/parse");
const router = express.Router();

router.post(
  "/upload-trailer",
  auth,
  isAdmin,
  uploadVideo.single("video"),
  uploadTrailer
);

router.post(
  "/create",
  auth,
  isAdmin,
  uploadImage.single("poster"),
  parseData,
  ValidateMovie,
  validate,
  createMovie
);

router.put("/rating", auth, rating);

router.patch(
  "/update-movie-no-poster/:movieId",
  auth,
  isAdmin,
  parseData,
  ValidateMovie,
  validate,
  updateMovieNo
);

router.patch(
  "/update-movie-with-poster/:movieId",
  auth,
  isAdmin,
  uploadImage.single("poster"),
  parseData,
  ValidateMovie,
  validate,
  updateMovieWith
);

router.delete("/:movieId", auth, isAdmin, removeMovie);
router.get("/movies", getMovies);
router.get("/movies/:movieId", getDetailsMovies);

module.exports = router;
