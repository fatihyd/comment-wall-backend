const {
  generateJWT,
  hashPassword,
  comparePasswords,
} = require("../utils/authUtils");
const User = require("../models/User");

exports.signup = async (req, res) => {
  try {
    // Check if the username already exists in the database
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      // Return an error response if the username is already taken
      return res.status(400).json({ message: "Username already exists!" });
    }

    // Hash the user's password
    const hashedPassword = await hashPassword(req.body.password);

    // Create a new user object with the provided username and hashed password
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });

    // Save the new user to the database
    await user.save();

    // Return a success response with the username and membership status
    res.status(201).json({
      message: "User created successfully!",
      username: user.username,
      membershipStatus: user.membershipStatus,
    });
  } catch (error) {
    // Handle any server errors
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.login = async (req, res) => {
  try {
    // Find the user by username in the database
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      // Return an error response if the username is not found
      return res.status(401).json({ message: "Invalid username!" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await comparePasswords(
      req.body.password,
      user.password
    );
    if (!passwordMatch) {
      // Return an error response if the password is incorrect
      return res.status(401).json({ message: "Invalid password!" });
    }

    // Generate a signed JWT for the authenticated user using their unique ID
    const token = generateJWT(user._id);

    // Return the token and username in the response
    // The token should be stored by the client (e.g., in localStorage) and sent with subsequent API requests
    res.status(200).json({ token, username: user.username });
  } catch (error) {
    // Handle any server errors
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.promoteUser = async (req, res) => {
  try {
    // Get the authenticated user from the authentication middleware
    const user = req.user;

    const passcode = req.body.passcode.toLowerCase();

    // Get the current user status using the authentication middleware
    const currentStatus = user.membershipStatus;

    // Check if the user is trying to promote to the same status they already have
    if (req.params.status === currentStatus) {
      return res
        .status(400)
        .json({ message: `You are already a ${currentStatus}.` });
    }

    // Handle promotion to 'member' status
    if (req.params.status === "member") {
      // Prevent demotion if the user is already an admin
      if (currentStatus === "admin") {
        return res.status(400).json({ message: "You cannot get demoted." });
      }
      // Validate the provided passcode for member promotion
      if (passcode !== process.env.MEMBER_PASSCODE) {
        return res
          .status(401)
          .json({ message: "Invalid passcode for member promotion." });
      }

      user.membershipStatus = "member"; // Update the user's status to 'member'
    }
    // Handle promotion to 'admin' status
    else if (req.params.status === "admin") {
      // Validate the provided passcode for admin promotion
      if (passcode !== process.env.ADMIN_PASSCODE) {
        return res
          .status(401)
          .json({ message: "Invalid passcode for admin promotion." });
      }

      user.membershipStatus = "admin"; // Update the user's status to 'admin'
    }
    // Handle invalid promotion status requests
    else {
      return res
        .status(400)
        .json({ message: "Invalid promotion status requested." });
    }

    // Save the updated user information to the database
    await user.save();
    // Return a success response with the updated membership status
    res.status(200).json({
      message: "Membership status updated successfully.",
      membershipStatus: user.membershipStatus,
    });
  } catch (error) {
    // Handle any server errors
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
