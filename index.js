const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Obsługa plików statycznych (frontend)
app.use(express.static("public"));

// Start serwera
server.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});

// Multiplayer logic
let players = {};

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    players[socket.id] = { x: Math.random() * 400, y: Math.random() * 400, id: socket.id };

    // Wysłanie danych o obecnych graczach do nowego gracza
    socket.emit("currentPlayers", players);

    // Powiadomienie innych o nowym graczu
    socket.broadcast.emit("newPlayer", players[socket.id]);

    // Obsługa ruchu gracza
    socket.on("playerMove", (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            io.emit("playerMoved", players[socket.id]);
        }
    });

    // Obsługa rozłączenia
    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit("playerDisconnected", socket.id);
    });
});
