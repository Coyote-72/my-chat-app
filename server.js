const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
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
    // Send history to user
    try {
        const history = JSON.parse(fs.readFileSync(DATA_FILE));
        socket.emit('load history', history);
    } catch (e) {
        socket.emit('load history', []);
    }

    socket.on('chat message', (data) => {
        const messages = JSON.parse(fs.readFileSync(DATA_FILE));
        messages.push(data);
        fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
        io.emit('chat message', data);
    });

    socket.on('clear chat', () => {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
        io.emit('clear chat');
    });
});

const PORT = process.env.PORT || 3000; // Use the internet port or 3000
http.listen(PORT, '0.0.0.0', () => {
    console.log('Server is running on port ' + PORT);
});
