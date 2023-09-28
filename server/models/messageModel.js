const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("message", messageSchema);
