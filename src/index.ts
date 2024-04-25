import express from "express";
import { Server as socketIoServer } from "socket.io";
import path from "path";

const app = express();
const port = process.env.PORT || 4000;
app.use(express.static(path.resolve(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

const server = app.listen(port, () => {
  console.log(`👻 Server is running at http://localhost:${port}`);
});

const io = new socketIoServer(server);
const socketConnected = new Set();

io.on("connection", (socket) => {
  const onConnected = () => {
    console.log(`Socket connected: ${socket.id}`);
    socketConnected.add(socket.id);
    io.emit("clients-total", socketConnected.size);
  };
  const onDisconnected = () => {
    console.log(`Socket disconnected: ${socket.id}`);
    socketConnected.delete(socket.id);
    io.emit("clients-total", socketConnected.size);
  };
  socket.on("disconnect", onDisconnected);
  socket.on("message", (data) => {
    socket.broadcast.emit("chat-message", data);
  });
  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });

  onConnected();
  socket.on("disconnect", () => {
    onDisconnected();
    socket.removeAllListeners();
  });
});
