const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  text: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  dateCreated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", CommentSchema);
