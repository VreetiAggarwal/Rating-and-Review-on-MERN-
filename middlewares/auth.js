// const jwt = require("jsonwebtoken");
// const User = require("../models/user");
// const config = require("config");

// exports.isAuth = async (req, res, next) => {
//   try {
//     const token = req.headers?.authorization;

//     if (!token) {
//       return res.status(401).json({ msg: "No token, authorization failed" });
//     }

//     const decoded = jwt.verify(token, config.get("jwtSecret"));
//     req.user = decoded.user;

//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(401).json({ msg: "User not found!" });

//     next();
//   } catch (err) {
//     res.status(401).json({ msg: "Token is not valid" });
//   }
// };
