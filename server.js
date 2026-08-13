const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve os arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rota explícita para o painel de administração
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Armazenamento em memória para as imagens
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
