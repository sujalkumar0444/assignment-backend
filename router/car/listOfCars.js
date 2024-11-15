const express = require('express');
const Car = require('../../models/cars');
const Users = require('../../models/users');
const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const  username  = req.username; 
    let cars;

    if (username) {
      const user = await Users.findOne({ username: username });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      cars = await Car.find({ user: user._id });
    }

    if (cars.length === 0) {
      return res.status(404).json({ message: 'No cars found' });
    }

    res.status(200).json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
