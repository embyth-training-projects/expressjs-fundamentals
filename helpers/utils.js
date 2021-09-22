const fs = require("fs");
const path = require("path");

exports.deleteImage = (filePath) => {
  const imagePath = path.join(__dirname, "..", filePath);
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error(`Image deletion error: ${err}`);
    }
  });
};
