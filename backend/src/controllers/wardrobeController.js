const Item = require('../models/Item');
const { supabase, isSupabaseConfigured } = require('../config/supabase');

// @desc    Get wardrobe items (strictly scoped to authenticated user)
// @route   GET /api/wardrobe
// @access  Public / User-scoped
const getItems = async (req, res) => {
  try {
    const { userId } = req.query;

    // If user is not logged in / signed out, return an empty closet!
    if (!userId) {
      return res.json([]);
    }

    // 1. If Supabase is configured and has user_id, check Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const normalized = data.map(item => ({
            _id: item.id,
            id: item.id,
            userId: item.user_id,
            name: item.name,
            category: item.category,
            color: item.color,
            imageUrl: item.image_url || item.imageUrl,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }));
          return res.json(normalized);
        }
      } catch (sbErr) {
        console.warn('Supabase query notice:', sbErr.message);
      }
    }

    // 2. Query MongoDB Atlas by userId
    const items = await Item.find({ userId: userId }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (error) {
    console.error('Error fetching wardrobe items:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add a new clothing item (must be associated with logged in user)
// @route   POST /api/wardrobe
// @access  Public
const addItem = async (req, res) => {
  try {
    const { name, category, color, userId } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;

    if (!name || !category || !color || !imageUrl) {
      return res.status(400).json({ message: 'Please provide all required fields, including an image.' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Please sign in to add garments to your personal wardrobe.' });
    }

    // 1. Save into MongoDB Atlas
    const mongoItem = new Item({
      name,
      category: category.toLowerCase(),
      color,
      imageUrl,
      userId,
    });
    const savedMongoItem = await mongoItem.save();

    // 2. Also try inserting into Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('items')
          .insert([{
            name,
            category: category.toLowerCase(),
            color,
            image_url: imageUrl,
            user_id: userId,
          }]);
      } catch (sbErr) {
        console.warn('Supabase dual-insert notice:', sbErr.message);
      }
    }

    return res.status(201).json(savedMongoItem);
  } catch (error) {
    console.error('Error adding wardrobe item:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a wardrobe item
// @route   DELETE /api/wardrobe/:id
// @access  Public
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    // 1. Delete from MongoDB Atlas
    const deleteQuery = { _id: id };
    if (userId) {
      deleteQuery.userId = userId;
    }
    try {
      await Item.findOneAndDelete(deleteQuery);
    } catch (mErr) {
      // id might be Supabase UUID
    }

    // 2. Delete from Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        let sbQuery = supabase.from('items').delete().eq('id', id);
        if (userId) {
          sbQuery = sbQuery.eq('user_id', userId);
        }
        await sbQuery;
      } catch (sbErr) {
        // ignore
      }
    }

    return res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting wardrobe item:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getItems,
  addItem,
  deleteItem,
};
