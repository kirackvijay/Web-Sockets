import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 4010;

app.set("views", path.join(__dirname, "public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

const server = app.listen(port, () =>
  console.log(`👻 Server is Running http://localhost:${port}`)
);
import { Server as socketIoServer } from "socket.io";
const io: socketIoServer = new socketIoServer(server);
let socketConnected: any = new Set();

const onConnected = (socket: { [x: string]: any; id: any }) => {
  console.log(socket.id);
  socketConnected.add(socket.id);
  io.emit("clients-total", socketConnected.size);

  socket.on("disconnect", () => {
    console.log(`socket Disconnected`, socket.id);
    socketConnected.delete(socket.id);
    io.emit("clients-total", socketConnected.size);
  });
  socket.on("message", (data: any) => {
    // console.log(data)
    socket.broadcast.emit("chat-message", data);
  });

  socket.on("feedback", (data: any) => {
    socket.broadcast.emit("feedback", data);
  });
};
io.on("connection", onConnected);
app.use(express.static(path.join(__dirname, "public")));
