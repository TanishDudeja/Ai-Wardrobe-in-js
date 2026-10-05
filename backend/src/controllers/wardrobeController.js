const Item = require('../models/Item');

// @desc    Get all wardrobe items
// @route   GET /api/wardrobe
// @access  Public (for now)
const getItems = async (req, res) => {
  try {
    const items = await Item.find({});
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add a new clothing item
// @route   POST /api/wardrobe
// @access  Public (for now)
const addItem = async (req, res) => {
  try {
    const { name, category, color } = req.body;
    
    // The image URL comes from Cloudinary via multer
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;

    if (!name || !category || !color || !imageUrl) {
      return res.status(400).json({ message: 'Please provide all required fields, including an image.' });
    }

    const item = new Item({
      name,
      category,
      color,
      imageUrl,
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getItems,
  addItem,
  deleteItem,
};
