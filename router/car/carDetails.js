const express = require('express');
const Car = require('../../models/cars');
const router = express.Router();

router.get('/:carId', async (req, res) => {
    try {
      const { carId } = req.params;
  
      const car = await Car.findOne(carId);
  
      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }
  
      res.status(200).json(car);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

module.exports = router;
  