const express = require('express');
const Car = require('../../models/cars');
const router = express.Router();
const admin = require("../../modules/firebase");
const bucket = admin.storage().bucket();

router.delete('/:carId', async (req, res) => {
    try {
      const { carId } = req.params;
      const userId = req.username;
  
      // Find the car in the database
      const car = await Car.findById(carId);
      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }

  
      // Delete images from Firebase Storage
      for (const imageUrl of car.images) {
        const filePath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]); // Extract file path from the URL
        await bucket.file(filePath).delete().catch(err => {
          console.error(`Failed to delete image ${filePath}: ${err.message}`);
        });
      }
  
      // Delete the car from the database
      await Car.findByIdAndDelete(carId);
  
      res.status(200).json({ message: 'Car deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

module.exports = router;
  