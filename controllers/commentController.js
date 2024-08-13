const authMiddleware = require("../middleware/authMiddleware");
const Comment = require("../models/Comment");
const User = require("../models/User");

exports.getAllComments = async (req, res) => {
  try {
    // Get the authenticated user from the authentication middleware
    const user = req.user;

    // Get the current user status using the authentication middleware
    const currentStatus = user.membershipStatus;

    // Return different data based on the user's membership status
    let comments;
    if (currentStatus === "regular") {
      comments = await Comment.find()
        .select({ text: 1, dateCreated: 1 })
        .sort({ dateCreated: -1 });
    } else if (currentStatus === "member" || currentStatus === "admin") {
      comments = await Comment.find()
        .populate("author", "username") // Only include the "username" field from the author
        .sort({ dateCreated: -1 });
    }

    // Return the list of comments as a JSON response
    res.json(comments);
  } catch (error) {
    // Handle any server errors
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.createComment = async (req, res) => {
  try {
    // Get the authenticated user from the authentication middleware
    const user = req.user;

    // Create a new Comment object with the text from the request body and the authenticated user as the author
    const comment = new Comment({
      text: req.body.text,
      author: user,
      dateCreated: new Date(),
    });

    // Save the new comment to the database
    const newComment = await comment.save();

    // Push the new comment's ID to the user's comments array and save the user
    user.comments.push(newComment._id);
    await user.save();

    // Return a success response with the newly created comment
    res.status(200).json({
      message: "Comment created successfully",
      comment: newComment,
    });
  } catch (error) {
    // Handle any server errors
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    // Get the authenticated user from the authentication middleware
    const user = req.user;

    // Get the current user status using the authentication middleware
    const currentStatus = user.membershipStatus;

    if (currentStatus !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can delete comments." });
    }

    // Find and delete the comment by ID from the Comments collection
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);

    // Remove the deleted comment's ID from the user's comments array
    await User.findByIdAndUpdate(deletedComment.author, {
      $pull: { comments: req.params.id },
    });

    // Return a success response with the deleted comment
    res.status(200).json({
      message: "Comment deleted successfully",
      comment: deletedComment,
    });
  } catch (error) {
    // Handle any server errors
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
