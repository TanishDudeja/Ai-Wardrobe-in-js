const express = require('express');
const router = express.Router();
const { generateOutfit, generateTryOn } = require('../controllers/aiController');
const { upload } = require('../config/cloudinary');

router.route('/generate').post(generateOutfit);
router.route('/try-on').post(upload.single('human_image'), generateTryOn);

module.exports = router;
