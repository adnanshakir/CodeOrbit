import { Router } from "express";
import User from "../models/user.model.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import { sendAuthNotification } from "../config/mq.js";

const router = Router();

router.get("/google", passport.authenticate("google", { session: false, scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), async (req, res) => {
  try {
    const { id, displayName, emails, photos } = req.user;
    const email = emails[0]?.value;
    const avatar = photos[0]?.value;

    // Check if user already exists
    let user = await User.findOne({
      googleId: id,
    });

    // Send a message to the RabbitMQ queue about the authentication event
    await sendAuthNotification({
      userId: user._id,
      email: email,
      action: user ? "login" : "signup",
      timestamp: new Date(),
    });

    if (!user) {
      // Create a new user
      user = new User({
        googleId: id,
        email: email,
        name: displayName,
        avatar: avatar,
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Send the token as a cookie or in the response
    res.cookie("token", token, { httpOnly: true });
    res.redirect("http://localhost:5173"); // Redirect to a protected route after successful login
  } catch (err) {
    console.error("Error during Google OAuth callback:", err);
    res.redirect("/login");
  }
});

export default router;
