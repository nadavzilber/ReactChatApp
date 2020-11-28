const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);

io.on("connection", socket => {
    socket.emit("your-id", socket.id);

    socket.on("client-message", data => {
        console.log('new client message', data)
        io.in(data.room).emit("server-message", { id: data.message, name: data.name, body: data.body, time: new Date().toLocaleString() });
    });

    socket.on("client-action", data => {
        console.log('new client action', data);
        socket.join(data.room);
        let msg = { id: "System", name: "System", body: `${data.nickname} has joined the ${data.room} chat room.`, time: new Date().toLocaleString() };
        io.emit("login", true);
        io.in(data.room).emit("server-message", msg);
    });

});

server.listen(8000, () => console.log('server is running on port 8000'));