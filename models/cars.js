const mongoose = require("mongoose");
const carSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }],
    tags: [{ type: String }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  });
const Cars = mongoose.model("Cars", carSchema);
module.exports = Cars;

  