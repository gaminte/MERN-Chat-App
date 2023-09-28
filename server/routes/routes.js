const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Message = require("../models/messageModel");

require("dotenv").config();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck) {
      return res
        .status(401)
        .json({ message: "Username already exits", result: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
    });
    jwt.sign(
      {
        id: newUser._id,
        username: newUser.username,
        isAvatarImageSet: newUser.isAvatarImageSet,
      },
      process.env.JWT_SECRET,
      {},
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token, {sameSite: "none", secure: true}).status(201).json({
          id: newUser._id,
          username: newUser.username,
          isAvatarImageSet: newUser.isAvatarImageSet,
          result: true,
        });
      }
    );
  } catch (error) {
    console.log(error);
  }
});

router.get("/profile", async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) throw err;
      res.status(200).json(userData);
    });
  } else {
    res.status(401).json("no token");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ message: "username not found", result: false });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      jwt.sign(
        {
          id: user._id,
          username: user.username,
          isAvatarImageSet: user.isAvatarImageSet,
        },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token, {sameSite: "none", secure: true}).status(200).json({
            id: user._id,
            username: user.username,
            isAvatarImageSet: user.isAvatarImageSet,
            result: true,
          });
        }
      );
    } else {
      return res.status(401).json({
        message: "username and password does not match",
        result: false,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/avatar/:id", async (req, res) => {
  try {
    const image = req.body.image;
    // console.log(image);
    const id = req.params.id;
    const user = await User.findByIdAndUpdate(id, {
      isAvatarImageSet: true,
      avatarImage: image,
    });
    jwt.sign(
      {
        id: user._id,
        username: user.username,
        isAvatarImageSet: true,
      },
      process.env.JWT_SECRET,
      {},
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token, {sameSite: "none", secure: true}).status(200).json({
          token: token,
          isAvatarImageSet: true,
          result: true,
        });
      }
    );
  } catch (error) {
    console.log(error);
  }
});

router.get("/allAvatars", async (req, res) => {
  try {
    const allAvatars = await User.find({}).select("avatarImage");
    res.status(200).json({ allAvatars });
  } catch (error) {
    console.log(error);
  }
});

router.get("/allMessages/:id", async (req, res) => {
  try {
    const selectedId = req.params.id;
    const token = req.headers.cookie.split("=")[1];
    const userData = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {},
      (err, userData) => {
        if (err) throw err;
        return userData;
      }
    );
    const allMessages = await Message.find({
      from: { $in: [selectedId, userData.id] },
      to: { $in: [selectedId, userData.id] },
    }).sort({ createdAt: 1 });
    res.status(200).json(allMessages);
  } catch (error) {
    console.log(error);
  }
});

router.get("/allPeople", async (req, res) => {
  const people = await User.find({}).select({ username: 1 });
  res.status(200).json(people);
});

router.get("/userAvatar/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (id !== undefined) {
      const userAvatar = await User.findById(id).select({ avatarImage: 1 });
      res.status(200).json(userAvatar);
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

module.exports = router;
