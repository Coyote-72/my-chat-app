const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    // This allows larger files (like high-quality photos) to be sent
    maxHttpBufferSize: 1e7 // 10MB limit
});
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'messages.json');

// Ensure the JSON file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Load history from the JSON file
    try {
        const history = JSON.parse(fs.readFileSync(DATA_FILE));
        socket.emit('load history', history);
    } catch (e) {
        socket.emit('load history', []);
    }

    // When a message (text or image) is received
    socket.on('chat message', (data) => {
        const messages = JSON.parse(fs.readFileSync(DATA_FILE));
        
        // Add a timestamp so we know when it was sent
        data.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messages.push(data);
        
        // Save to JSON file
        fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
        
        // Send to everyone
        io.emit('chat message', data);
    });

    socket.on('clear chat', () => {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
        io.emit('clear chat');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Important for Render: Listen on 0.0.0.0
const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log('Server is live on port ' + PORT);
});
