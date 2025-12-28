const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    // This part is VERY important for mobile phones
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e7 // 10MB image limit
});
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'messages.json');

// Ensure the JSON file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    // Send history
    try {
        const history = JSON.parse(fs.readFileSync(DATA_FILE));
        socket.emit('load history', history);
    } catch (e) {
        socket.emit('load history', []);
    }

    socket.on('chat message', (data) => {
        try {
            const messages = JSON.parse(fs.readFileSync(DATA_FILE));
            data.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            messages.push(data);
            fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
            
            // Broadcast to EVERYONE (including the sender)
            io.emit('chat message', data);
        } catch (err) {
            console.error("Save error:", err);
        }
    });

    socket.on('clear chat', () => {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
        io.emit('clear chat');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log('Server is running on port ' + PORT);
});
