import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', socket => {
    console.log('client connected');

    socket.on('message', data => {
        // broadcast to everyone else
        wss.clients.forEach(client => {
            if (client !== socket && client.readyState === client.OPEN) {
                client.send(data);
            }
        });
    });

    socket.on('close', () => console.error('client disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server up on http://localhost:${PORT}`));
