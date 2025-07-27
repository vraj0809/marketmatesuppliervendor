const multer = require('multer');

// TODO: Configure storage, file filter, limits, etc.
const uploadImages = multer({
  // Configuration goes here
});

module.exports = { uploadImages }; 