const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

require("dotenv").config();
require("./auth/googleAuth"); // Google OAuth setup
const Task = require("./models/Task"); // MongoDB Task model

const app = express();

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// CORS - allow React app to connect with backend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// JSON parser
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Passport middlewares
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;

// ✅ Root
app.get("/", (req, res) => {
  res.send("API is working! 🚀");
});

// ✅ Auth Success
app.get("/auth/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        name: req.user.displayName,
        email: req.user.emails[0].value,
        photo: req.user.photos[0].value,
      },
    });
  } else {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
});

// ✅ Google OAuth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/dashboard",
    failureRedirect: "/auth/failure",
  })
);

app.get("/auth/failure", (req, res) => {
  res.send("❌ Login failed");
});

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// ✅ TASK ROUTES

// Get all tasks for the user (owned or shared)
app.get("/api/tasks", async (req, res) => {
  const user = req.user?.emails[0].value;
  if (!user) return res.status(401).json({ message: "Not authenticated" });

  const tasks = await Task.find({
    $or: [{ owner: user }, { sharedWith: user }],
  }).sort({ createdAt: -1 });

  res.json(tasks);
});

// Add task
app.post("/api/tasks", async (req, res) => {
  const user = req.user?.emails[0].value;
  if (!user) return res.status(401).json({ message: "Not authenticated" });

  const task = new Task({
    title: req.body.title,
    status: "incomplete",
    owner: user,
    sharedWith: [],
  });

  await task.save();
  res.status(201).json({ message: "Task added", task });
});

// Delete task
app.delete("/api/tasks/:id", async (req, res) => {
  const user = req.user?.emails[0].value;
  const task = await Task.findById(req.params.id);

  console.log("User trying to delete:", user);
  console.log("Task owner:", task?.owner);

  if (!task || task.owner !== user) {
    return res.status(403).json({ message: "Permission denied" });
  }

  await task.deleteOne();
  res.json({ message: "Task deleted" });
});

// Share task
app.post("/api/tasks/:id/share", async (req, res) => {
  const user = req.user?.emails[0].value;
  const task = await Task.findById(req.params.id);
  const shareEmail = req.body.email;

  if (!task || task.owner !== user) {
    return res.status(403).json({ message: "Task not found or permission denied" });
  }

  if (!task.sharedWith.includes(shareEmail)) {
    task.sharedWith.push(shareEmail);
    await task.save();
  }

  res.json({ message: `Task shared with ${shareEmail}`, task });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
