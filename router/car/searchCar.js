const express = require('express');
const Car = require('../../models/cars');
const Users = require('../../models/users');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const { keyword } = req.query; 
      const userId = req.username;
  
      if (!keyword || !userId) {
        return res.status(400).json({ message: 'Keyword and userId are required' });
      }
  
      // Find the user
      const user = await Users.findOne({ username: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Perform a case-insensitive search in title, description, and tags
      const regex = new RegExp(keyword, 'i');
      const cars = await Car.find({
        user: user._id,
        $or: [
          { title: regex },
          { description: regex },
          { tags: { $in: [regex] } },
        ],
      });
  
      if (cars.length === 0) {
        return res.status(404).json({ message: 'No cars matched the search criteria' });
      }
  
      res.status(200).json(cars);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  
  module.exports = router;
  