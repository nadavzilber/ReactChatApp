const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);

io.on("connection", socket => {
    socket.emit("your-id", socket.id);

    socket.on("client-message", data => {
        console.log('new client message',data)
        io.emit("server-message", data);
    });
});

server.listen(8000, () => console.log('server is running on port 8000'));