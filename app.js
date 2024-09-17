const express = require("express");
const app = express();
const http = require("http");
const socketio = require("socket.io");
const path = require("path"); // Import path module

const server = http.createServer(app);
const io = socketio(server);

// Set the view engine to EJS
app.set("view engine", "ejs");

// Set the static files directory
app.use(express.static(path.join(__dirname, "public"))); // Use path.join for correct path resolution

// Define the root route
app.get("/", function (req, res) {
  res.render("index"); // Render the index.ejs file
});

// Set up Socket.io connection
io.on("connection", (socket) => {
  socket.on("send-location", function (data) {
    io.emit("reciever-location", { id: socket.id, ...data });
  });
  console.log("A user connected");

  // You can handle socket events here

  socket.on("disconnect", () => {
    io.emit("user-dissconnected", socket.id);
    console.log("A user disconnected");
  });
});

// Start the server
server.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
