const express = require("express");
const userRouter = require("./routes/user");
const actorRouter = require("./routes/actor");
const movieRouter = require("./routes/movie");
const connectDB = require("./config/db-config");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

const PORT = 8000;

connectDB();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/user", userRouter);
app.use("/api/actor", actorRouter);
app.use("/api/movie", movieRouter);

app.listen(PORT, () => {
  console.log(`The port is listening on ${PORT}`);
});
