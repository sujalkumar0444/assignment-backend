const express = require('express');
const multer = require('multer');
const admin = require("../../modules/firebase");
const Car = require('../../models/cars');
const Users = require('../../models/users');
const bucket = admin.storage().bucket();

const router = express.Router();

// Configure Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});

// Endpoint to test the route
router.get("/", async (req, res) => {
  res.send("Add car page");
});

// Route to handle car creation
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const userId = req.username;
    const user = await Users.findOne({ username: userId });
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }
    const ref = user._id;
    const files = req.files;
    // console.log(title);
    // console.log(files);

    if (!title || !description || !files || files.length === 0) {
      return res.status(400).json({ message: 'All fields are required, including at least one image.' });
    }

    // Upload images to Firebase Storage under the "cars" folder
    const imageUrls = [];
    for (const file of files) {
      const blob = bucket.file(`car/${userId}/${Date.now()}-${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: { contentType: file.mimetype }
      });

      blobStream.end(file.buffer);

      // Wait for the upload to complete and get the direct URL from Firebase Storage
      await new Promise((resolve, reject) => {
        blobStream.on('finish', async () => {
          try {
            // Direct URL for the file
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
            imageUrls.push(publicUrl);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
        blobStream.on('error', reject);
      });
    }

    // Save car details to MongoDB
    const car = new Car({
      title,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      images: imageUrls,
      user: ref,
    });

    await car.save();
    res.status(201).json({ message: 'Car created successfully', car });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
