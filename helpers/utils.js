const path = require("path");

const getProjectDirectory = () => path.dirname(require.main.filename);

const getCombinedPath = (file, ...paths) =>
  path.join(getProjectDirectory(), ...paths, file);

exports.getProjectDirectory = getProjectDirectory;
exports.getCombinedPath = getCombinedPath;
