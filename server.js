const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rotas explícitas para navegação
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Banco de dados em memória
let images = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1920&q=80'
];

let activeUsers = 0;

// Gerenciamento de conexões em tempo real via Socket.io
io.on('connection', (socket) => {
  activeUsers++;
  io.emit('userCountUpdate', activeUsers);
  socket.emit('loadImages', images);

  socket.on('addImage', (url) => {
    if (url && url.trim() !== '') {
      images.push(url.trim());
      io.emit('loadImages', images);
    }
  });

  socket.on('removeImage', (index) => {
    if (index >= 0 && index < images.length) {
      images.splice(index, 1);
      io.emit('loadImages', images);
    }
  });

  socket.on('disconnect', () => {
    activeUsers = Math.max(0, activeUsers - 1);
    io.emit('userCountUpdate', activeUsers);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Auto-ping interno: Mantém o servidor ativo 24/7 na nuvem sem entrar em modo "sleep"
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_URL) {
  setInterval(() => {
    http.get(RENDER_URL, (res) => {
      console.log(`Auto-ping executado com status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('Erro no auto-ping:', err.message);
    });
  }, 5 * 60 * 1000); // Executa a cada 5 minutos
}
