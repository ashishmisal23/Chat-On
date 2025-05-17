import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import { MongoClient } from 'mongodb';
import Redis from 'ioredis';

const { PORT, JWT_SECRET, MONGO_URI, REDIS_URL } = process.env;


const mongo = new MongoClient(MONGO_URI);
await mongo.connect();
const db = mongo.db();
const messagesCol = db.collection('messages');


const pub = new Redis(REDIS_URL);
const sub = new Redis(REDIS_URL);
sub.subscribe('chat');


/* ---------- express ---------- */
const app = express();
const server = http.createServer(app);


/* ---------- websocket ---------- */
const wss = new WebSocketServer({ server });


/** helper: broadcast within process */
function broadcastLocal(room, payload) {
    wss.clients.forEach(c => {
        if (c.readyState === c.OPEN && c.room === room) {
            c.send(JSON.stringify(payload));
        }
    });
}

/** helper: publish to all nodes */
function publish(room, payload) {
    pub.publish('chat', JSON.stringify({ room, payload }));
}

sub.on('message', (_channel, raw) => {
    const { room, payload } = JSON.parse(raw);
    broadcastLocal(room, payload);
});

wss.on('connection', async (socket, req) => {
    /* ---- 1. Auth ---- */
    try {
        const token = req.headers['sec-websocket-protocol']; // Expo sets this easily
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.user = { id: decoded.id, name: decoded.name };
    } catch {
        socket.close(4001, 'unauthorized');
        return;
    }

    /* ---- 2. join default room ---- */
    socket.room = 'lobby';

    /* ---- 3. send last 100 msgs ---- */
    const history = await messagesCol
        .find({ room: socket.room })
        .sort({ ts: -1 })
        .limit(100)
        .toArray();
    history.reverse().forEach(m => socket.send(JSON.stringify({ type: 'history', ...m })));

    console.log(`user ${socket.user.name} connected`);

    socket.on('message', async raw => {
        let data;
        try {
            data = JSON.parse(raw);
        } catch {
            return;
        }

        /* payload shape: {type:'chat'|'join', room?, msg?} */
        if (data.type === 'join' && data.room) {
            socket.room = data.room;
            return;
        }

        if (data.type === 'chat' && data.msg) {
            const payload = {
                type: 'chat',
                room: socket.room,
                user: socket.user.name,
                msg: data.msg,
                ts: Date.now(),
            };

            /* 3a. persist */
            await messagesCol.insertOne(payload);

            /* 3b. broadcast cluster-wide */
            publish(socket.room, payload);
        }
    });

    socket.on('close', () => console.log(`user ${socket.user.name} disconnected`));
});

server.listen(PORT, () => console.log(`WS chat running on :${PORT}`));
