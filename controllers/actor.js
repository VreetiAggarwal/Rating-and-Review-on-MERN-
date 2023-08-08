const { isValidObjectId } = require("mongoose");
const Actor = require("../models/actor");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dqqca3ipc",
  api_key: "373727164356777",
  api_secret: "imOfKFx-0QfXvkSUJxdWDkPnGnM",
  // secure: true
});

exports.createActor = async (req, res) => {
  const { name, about, gender } = req.body;
  const { file } = req;

  const newActor = new Actor({ name, about, gender });

  if (file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { gravity: "face", height: 500, widh: 500, crop: "thumb" }
    );

    newActor.avatar = { url: secure_url, public_id };
  }

  await newActor.save();
  res.status(201).json({
    id: newActor._id,
    name,
    about,
    gender,
    avatar: newActor.avatar?.url,
  });
};

exports.updateActor = async (req, res) => {
  const { name, about, gender } = req.body;
  const { file } = req;

  const { actorId } = req.params;

  if (!isValidObjectId(actorId))
    return res.status(500), json({ msg: "Invalid request!" });

  const actor = await Actor.findById(actorId);
  if (!actor) return res.status(400).json({ mag: "Actor is not present!" });

  const public_id = actor.avatar?.public_id;

  if (public_id && file) {
    const { result } = await cloudinary.uploader.destroy(public_id);

    if (result !== "ok") {
      return res.status(400).json({ msg: "Could not delete image!" });
    }
  }

  if (file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { gravity: "face", height: 500, widh: 500, crop: "thumb" }
    );

    actor.avatar = { url: secure_url, public_id };
  }

  actor.name = name;
  actor.about = about;
  actor.gender = gender;

  await actor.save();

  res.status(201).json({
    id: actor._id,
    name,
    about,
    gender,
    avatar: actor.avatar?.url,
  });
};

exports.removeActor = async (req, res) => {
  const { actorId } = req.params;
  const { file } = req;

  if (!isValidObjectId(actorId))
    return res.status(500), json({ msg: "Invalid request!" });

  const actor = await Actor.findById(actorId);
  if (!actor) return res.status(400).json({ msg: "Actor is not present!" });

  const public_id = actor.avatar?.public_id;

  if (public_id && file) {
    const { result } = await cloudinary.uploader.destroy(public_id);

    if (result !== "ok") {
      return res.status(400).json({ msg: "Could not delete image!" });
    }
  }

  await Actor.findByIdAndDelete(actorId);
  res.json({ message: "Actor deleted successfully" });
};

exports.searchActor = async (req, res) => {
  const { query } = req;

  query.name;
  const result = await Actor.find({ $text: { $search: `"${query.name}"` } });
  res.json(result);
};

exports.getLatestActors = async (req, res) => {
  const result = await Actor.find().sort({ createdAt: "-1" }).limit(10);
  res.json(result);
};

exports.getSingleActor = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id))
    return res.status(500), json({ msg: "Invalid request!" });

  const actor = await Actor.findById(id);
  if (!actor) return res.status(400).json({ mag: "Actor is not present!" });

  res.json(actor);
};
