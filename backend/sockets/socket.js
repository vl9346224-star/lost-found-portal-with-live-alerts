const jwt = require("jsonwebtoken");

// Client connects with:  io("http://localhost:5000", { auth: { token } })
// Guests (no token) still receive public broadcasts (newItem, itemRecovered...).
module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next();
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    if (socket.user) {
      socket.join(`user:${socket.user.id}`); // personal notifications
      if (socket.user.role === "admin") socket.join("admins"); // admin alerts
    }
    socket.emit("connected", { authenticated: !!socket.user });
  });
};
