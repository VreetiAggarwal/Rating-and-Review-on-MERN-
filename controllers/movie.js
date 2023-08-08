const { isValidObjectId } = require("mongoose");
const Movie = require("../models/movie");
const User = require("../models/user");
const cloudinary = require("cloudinary").v2;
const asyncHandler = require("express-async-handler");

exports.uploadTrailer = async (req, res) => {
  const { file } = req;
  if (!file) {
    return res.status(400).json({ msg: "Video file is missing!" });
  }

  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      resource_type: "video",
    }
  );

  res.status(200).json({ url, public_id });
};

exports.createMovie = async (req, res) => {
  const { file, body } = req;

  const {
    title,
    storyLine,
    director,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    trailer,
    language,
    ratings,
    rating,
  } = body;

  const newMovie = new Movie({
    title,
    storyLine,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    trailer,
    language,
    ratings,
    rating,
  });

  if (director) {
    if (isValidObjectId(director))
      return res.status(400).json({ msg: "There is no director" });
    newMovie.director = director;
  }

  const {
    secure_url: url,
    public_id,
    responsive_breakpoints,
  } = await cloudinary.uploader.upload(file.path, {
    responsive_breakpoints: {
      create_derived: true,
      max_width: 640,
      max_images: 3,
    },
  });

  const finalPoster = { url, public_id, responsive: [] };

  const { breakpoints } = responsive_breakpoints[0];
  if (breakpoints.length) {
    for (let imgObj of breakpoints) {
      const { secure_url } = imgObj;
      finalPoster.responsive.push(secure_url);
    }
  }

  newMovie.poster = finalPoster;

  await newMovie.save();

  res.status(200).json({
    id: newMovie.id,
    title,
    rating,
  });
};

exports.updateMovieNo = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId))
    return res.status(400).json({ msg: "Invalid Movie Id" });

  const movie = await Movie.findById(movieId);
  if (!movie) return res.status(400).json({ msg: "Movie not found!" });

  const {
    title,
    storyLine,
    director,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    trailer,
    language,
    ratings,
    rating,
  } = req.body;

  movie.title = title;
  movie.storyLine = storyLine;
  movie.tags = tags;
  movie.releaseDate = releaseDate;
  movie.status = status;
  movie.type = type;
  movie.genres = genres;
  movie.cast = cast;
  movie.trailer = trailer;
  movie.language = language;
  movie.ratings = ratings;
  movie.rating = rating;

  if (director) {
    if (isValidObjectId(director))
      return res.status(400).json({ msg: "There is no director" });
    movie.director = director;
  }

  await movie.save();
  res.json({ msg: "Movie is updated!" });
};

exports.updateMovieWith = async (req, res) => {
  const { movieId } = req.params;
  const { file } = req;

  if (!isValidObjectId(movieId))
    return res.status(400).json({ msg: "Invalid Movie Id" });

  if (!req.file)
    return res.status(400).json({ msg: "Movie poster is missing!" });

  const movie = await Movie.findById(movieId);
  if (!movie) return res.status(400).json({ msg: "Movie not found!" });

  const public_id = movie.poster?.public_id;

  if (public_id && file) {
    console.log(public_id);
    const { result } = await cloudinary.uploader.destroy(public_id);

    if (result !== "ok") {
      return res.status(400).json({ msg: "Could not delete poster!" });
    }
  }

  if (file) {
    const {
      secure_url: url,
      public_id,
      responsive_breakpoints,
    } = await cloudinary.uploader.upload(req.file.path, {
      transformation: {
        width: 1280,
        height: 720,
      },
      responsive_breakpoints: {
        create_derived: true,
        max_width: 640,
        max_images: 3,
      },
    });

    const finalPoster = { url, public_id, responsive: [] };

    const { breakpoints } = responsive_breakpoints[0];
    if (breakpoints.length) {
      for (let imgObj of breakpoints) {
        const { secure_url } = imgObj;
        finalPoster.responsive.push(secure_url);
      }
    }

    movie.poster = finalPoster;
  }

  const {
    title,
    storyLine,
    director,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    trailer,
    language,
    rating,
  } = req.body;

  movie.title = title;
  movie.storyLine = storyLine;
  movie.tags = tags;
  movie.releaseDate = releaseDate;
  movie.status = status;
  movie.type = type;
  movie.genres = genres;
  movie.cast = cast;
  movie.trailer = trailer;
  movie.language = language;
  movie.rating = rating;

  if (director) {
    if (isValidObjectId(director))
      return res.status(400).json({ msg: "There is no director" });
    movie.director = director;
  }

  await movie.save();
  res.json({ msg: "Movie is updated!" });
};

exports.removeMovie = async (req, res) => {
  const { movieId } = req.params;
  const { file } = req;

  if (!isValidObjectId(movieId))
    return res.status(400).json({ msg: "Invalid Movie Id" });

  const movie = await Movie.findById(movieId);
  if (!movie) return res.status(400).json({ msg: "Movie not found!" });

  const public_id = movie.poster?.public_id;

  if (public_id) {
    const { result } = cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      return res.status(400).json({ msg: "Could not delete poster!" });
    }
  }

  const trailerId = movie.trailer?.public_id;

  if (!trailerId)
    return res.status(400).json({ msg: "Could not find trailer!" });

  const { result } = cloudinary.uploader.destroy(trailerId, {
    resource_type: "video",
  });

  if (result !== "ok") {
    return res.status(400).json({ msg: "Could not delete trailer!" });
  }

  await Movie.findByIdAndDelete(movieId);
  res.json({ msg: "Movie remove successfully!" });
};

exports.rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, movieId } = req.body;

  try {
    const movie = await Movie.findById(movieId);
    let rated = movie.ratings?.find((userId) => userId.postedBy?.equals(_id));

    if (rated) {
      const update = await Movie.updateOne(
        {
          ratings: { $elemMatch: rated },
        },
        {
          $set: { "ratings.$.star": star },
        },
        {
          new: true,
        }
      );
    } else {
      const rateMovie = await Movie.findByIdAndUpdate(
        movieId,
        {
          $push: {
            ratings: {
              star: star,
              postedBy: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getallratings = await Movie.findById(movieId);
    let totalRatings = getallratings.ratings.length;

    let sumOfStars = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);

    let actualRating = (sumOfStars / parseFloat(totalRatings)).toFixed(2);
    let finalproduct = await Movie.findByIdAndUpdate(
      movieId,
      { rating: actualRating },
      { new: true }
    );
    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
});

exports.getMovies = async (req, res) => {
  try {
    const allMovies = await Movie.find({});
    res.send({ status: "ok", data: allMovies });
  } catch (err) {
    return Error(err);
  }
};

exports.getDetailsMovies = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);
    res.send({ status: "ok", data: movie });
  } catch (err) {
    return Error(err);
  }
};
