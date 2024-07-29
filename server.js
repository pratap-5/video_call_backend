import { Server, Socket } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const io = new Server(8000, { cors: true });

const emailToSocketid = new Map();
const socketidToEmail = new Map();

io.on("connection", (socket) => {
  console.log("connected a user ", socket.id);

  socket.on("room-join", (data) => {
    const { Email, RoomId } = data;
    emailToSocketid.set(Email, socket.id);
    socketidToEmail.set(socket.id, Email);

    io.to(socket.id).emit("room-joined", data);
    io.to(RoomId).emit("new-user-joined", Email);
    socket.join(RoomId);
  });

  socket.on("calling", (data) => {
    const { to, offer } = data;

    const from = socketidToEmail.get(socket.id);
    const socketId = emailToSocketid.get(to);
    io.to(socketId).emit("incomming_call", { from: from, offer });
  });

  socket.on("call-accepted", (data) => {
    const { to, answerOffer } = data;
    const socketId = emailToSocketid.get(to);
    io.to(socketId).emit("call-accepted", { answerOffer });
  });

  socket.on("peer-nego-needed", (data) => {
    const { to, offer } = data;
    const from = socketidToEmail.get(socket.id);
    const socketId = emailToSocketid.get(to);
    io.to(socketId).emit("peer-nego-needed", { from: from, offer });
  });

  socket.on("negotiation-done", (data) => {
    const { to, ans } = data;
    const socketId = emailToSocketid.get(to);
    io.to(socketId).emit("negotiation-final", { ans });
  });

  socket.on("send-streams", (data) => {
    const { to } = data;
    const socketId = emailToSocketid.get(to);
    io.to(socketId).emit("send-streams", { send: true });
  });
});
