const express = require('express');
const Car = require('../../models/cars');
const router = express.Router();
const admin = require("../../modules/firebase");
const bucket = admin.storage().bucket();
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  });

router.put('/:carId', upload.array('newImages', 10), async (req, res) => {
    try {
      const { carId } = req.params;
      const { title, description, tags, removeImages } = req.body; // `removeImages` will be a list of URLs to remove
      const files = req.files;
  
      // Find the car in the database
      const car = await Car.findById(carId);
      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }
  
      // Update fields if provided
      if (title) car.title = title;
      if (description) car.description = description;
      if (tags) car.tags = tags.split(',').map(tag => tag.trim());
  
      // Remove images if `removeImages` is provided
      if (removeImages) {
        const imagesToRemove = JSON.parse(removeImages); // Parse as it's passed as a JSON string
        car.images = car.images.filter(img => !imagesToRemove.includes(img));
  
        // Optionally delete the files from Firebase Storage
        for (const img of imagesToRemove) {
          const filePath = decodeURIComponent(img.split('/o/')[1].split('?')[0]);
          await bucket.file(filePath).delete().catch(err => console.error(`Failed to delete ${filePath}: ${err.message}`));
        }
      }
  
      // Add new images if provided
      if (files && files.length > 0) {
        if (car.images.length + files.length > 10) {
          return res.status(400).json({ message: 'Cannot exceed 10 images.' });
        }
  
        for (const file of files) {
          const blob = bucket.file(`car/${car.user}/${Date.now()}-${file.originalname}`);
          const blobStream = blob.createWriteStream({
            metadata: { contentType: file.mimetype }
          });
  
          blobStream.end(file.buffer);
  
          // Wait for the upload to complete and get the direct URL from Firebase
          await new Promise((resolve, reject) => {
            blobStream.on('finish', async () => {
              try {
                const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
                car.images.push(publicUrl);
                resolve();
              } catch (error) {
                reject(error);
              }
            });
            blobStream.on('error', reject);
          });
        }
      }
  
      // Check for minimum image count
      if (car.images.length === 0) {
        return res.status(400).json({ message: 'A car must have at least one image.' });
      }
  
      // Save updated car details
      await car.save();
      res.status(200).json({ message: 'Car updated successfully', car });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

module.exports = router;

  