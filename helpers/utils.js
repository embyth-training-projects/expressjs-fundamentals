const fs = require("fs");
const path = require("path");

const getProjectDirectory = () => path.dirname(require.main.filename);

const getCombinedPath = (file, ...paths) =>
  path.join(getProjectDirectory(), ...paths, file);

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
};

exports.getProjectDirectory = getProjectDirectory;
exports.getCombinedPath = getCombinedPath;
exports.deleteFile = deleteFile;
