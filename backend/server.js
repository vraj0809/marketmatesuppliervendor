const http = require('http');
const app = require('./index');
const { initSocket } = require('./utils/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = initSocket(server);

// Export server for listen and io for routes
module.exports = { server, io };

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
