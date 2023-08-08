const mongoose = require("mongoose");

const movieSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },

    storyLine: {
      type: String,
      trim: true,
      required: true,
    },

    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Actor",
    },

    releaseDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["public", "private"],
    },

    type: {
      type: String,
      required: true,
    },

    genres: {
      type: [String],
      required: true,
      enum: [
        "Action",
        "Romance",
        "Comedy",
        "Thriller",
        "Horror",
        "Fantasy",
        "Fiction",
      ],
    },

    tags: {
      type: [String],
      required: true,
    },

    cast: [
      {
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "Actor" },
        roleAs: String,
        leadActor: Boolean,
      },
    ],

    poster: {
      type: Object,
      url: { type: String, required: true },
      public_id: { type: String, required: true },
      required: true,
    },

    trailor: {
      type: Object,
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },

    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    language: {
      type: String,
      required: true,
    },

    ratings: [
      {
        star: Number,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],

    rating: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = Movie = mongoose.model("movie", movieSchema);
