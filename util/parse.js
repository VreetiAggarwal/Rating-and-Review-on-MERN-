exports.parseData = (req, res, next) => {
  const { trailerInfo, cast, genres, tags } = req.body;

  if (trailerInfo) req.body.trailerInfo = JSON.parse(trailerInfo);
  if (cast) req.body.cast = JSON.parse(cast);
  if (genres) req.body.genres = JSON.parse(genres);
  if (tags) req.body.tags = JSON.parse(tags);

  next();
};
