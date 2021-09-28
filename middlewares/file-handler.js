const { deleteImage } = require("../helpers/utils");

module.exports = (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated!");
    error.statusCode = 401;
    throw error;
  }

  if (!req.file) {
    return res.status(200).json({ message: "No file provided!", filePath: "" });
  }

  if (req.body.oldPath) {
    deleteImage(req.body.oldPath);
  }

  return res
    .status(201)
    .json({ message: "File stored!", filePath: req.file.path });
};
