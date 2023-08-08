const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("config");

exports.displayUser = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(401).json({ msg: "User not found!" });

  res.json({ user: user });
};

exports.CreateUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(401).json({ error: "Email already in use." });

    user = new User({ name, email, password });

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

    res.json({ user: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.sign = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    const { _id, name, role } = user;

    const payload = {
      user: {
        id: user.id,
      },
    };

    //sign the payload
    const jwtToken = jwt.sign(
      payload,
      config.get("jwtSecret"), //passing secret
      { expiresIn: 360000 }
    );

    res.json({ user: { id: _id, name, email, role, token: jwtToken } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
