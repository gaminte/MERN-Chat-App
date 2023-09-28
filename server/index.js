const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/routes");
const cors = require("cors");
const ws = require("ws");
const jwt = require("jsonwebtoken");
const Message = require("./models/messageModel");
const cookieParser = require("cookie-parser");

const app = express();
require("dotenv").config();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

mongoose
  .connect(`${process.env.MONGODB_URL}/MERN-Chat-App`)
  .then(() => console.log("DB connection successful"))
  .catch((err) => console.log(err.message));

const port = process.env.PORT || 3000;

app.use("/", userRoutes);

const server = app.listen(port, () => {
  console.log(`Server started listening on port ${port}`);
});

const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection, req) => {
  function statusUpdate() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((item) => ({
            userId: item.userId,
            username: item.username,
          })),
        })
      );
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      // statusUpdate();
    }, 1000);
  }, 5000);

  const cookies = req.headers.cookie;
  if (cookies) {
    const token = cookies.split("=")[1];
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
        if (err) throw err;
        const { id, username } = user;
        connection.userId = id;
        connection.username = username;
      });
    }
  }

  statusUpdate();

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { to, text } = messageData;
    if (to && text) {
      const messageDoc = await Message.create({
        from: connection.userId,
        to,
        text,
      });
      [...wss.clients]
        .filter((client) => client.userId === to)
        .forEach((client) =>
          client.send(
            JSON.stringify({
              text,
              from: connection.userId,
              to,
              _id: messageDoc._id,
            })
          )
        );
    }
  });
});
