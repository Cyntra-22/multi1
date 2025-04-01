const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let players = {};

// ✅ Handle new player spawn request
io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on("spawnPlayer", (data) => {
        players[socket.id] = { id: socket.id, x: 0, y: 0, z: 0, color: data.color };
        io.emit("playerJoined", players[socket.id]);
    });

    // ✅ Handle movement
    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id] = { ...players[socket.id], ...data };
            io.emit("playerMoved", players[socket.id]);
        }
    });

    // ✅ Handle disconnection
    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit("playerLeft", socket.id);
    });

    console.log(`Total players: ${Object.keys(players).length}`);

});

app.use(express.static("public"));

const PORT = process.env.PORT || 4000; // Change 3000 to 4000

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

