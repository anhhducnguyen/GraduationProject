const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const activeConnections = [];

wss.on('connection', (ws) => {
    activeConnections.push(ws);

    ws.on('close', () => {
        const index = activeConnections.indexOf(ws);
        if (index !== -1) {
            activeConnections.splice(index, 1);
        }
    });
});

// Export ra để file khác dùng
module.exports = { activeConnections };
