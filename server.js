const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Armazenamento em memória (pode ser substituído por banco de dados)
let images = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1920&q=80'
];

let activeUsers = 0;

io.on('connection', (socket) => {
  activeUsers++;
  io.emit('userCountUpdate', activeUsers);
  socket.emit('loadImages', images);

  socket.on('addImage', (url) => {
    images.push(url);
    io.emit('loadImages', images);
  });

  socket.on('removeImage', (index) => {
    images.splice(index, 1);
    io.emit('loadImages', images);
  });

  socket.on('disconnect', () => {
    activeUsers--;
    io.emit('userCountUpdate', activeUsers);
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
