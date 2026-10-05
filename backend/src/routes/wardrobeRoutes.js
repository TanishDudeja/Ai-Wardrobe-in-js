const express = require('express');
const router = express.Router();
const { getItems, addItem, deleteItem } = require('../controllers/wardrobeController');
const { upload } = require('../config/cloudinary');

router.route('/')
  .get(getItems)
  .post(upload.single('image'), addItem);

router.route('/:id').delete(deleteItem);

module.exports = router;
