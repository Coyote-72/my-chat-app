const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e7 
});
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// 1. CONNECT TO MONGODB
// This now looks for the 'MONGO_URL' you typed into the Render box
const mongoURI = process.env.MONGO_URL;

if (!mongoURI) {
    console.error("ERROR: MONGO_URL is not set in Render Environment Variables!");
}

mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("Could not connect to MongoDB", err));

// 2. DATA SCHEMAS
const User = mongoose.model('User', { 
    username: { type: String, unique: true }, 
    password: { type: String },
    badge: { type: String, default: "" } 
});

const Message = mongoose.model('Message', { 
    room: String, 
    sender: String, 
    text: String, 
    badge: String,
    time: String 
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

io.on('connection', (socket) => {
    // LOGIN / REGISTER LOGIC
    socket.on('authenticate', async (data) => {
        try {
            let user = await User.findOne({ username: data.username });
            if (!user) {
                const hashed = await bcrypt.hash(data.password, 10);
                user = new User({ username: data.username, password: hashed });
                await user.save();
                socket.emit('auth-success', user.username);
            } else {
                const match = await bcrypt.compare(data.password, user.password);
                if (match) socket.emit('auth-success', user.username);
                else socket.emit('error-msg', 'Incorrect password');
            }
        } catch (e) {
            socket.emit('error-msg', 'Auth Error');
        }
    });

    // START PRIVATE CHAT & LOAD HISTORY
    socket.on('join-private', async (data) => {
        const roomID = [data.me, data.other].sort().join('_');
        socket.join(roomID);
        const history = await Message.find({ room: roomID }).sort({ _id: 1 });
        socket.emit('load-history', history);
    });

    // SEND PRIVATE MESSAGE
    socket.on('send-private-msg', async (data) => {
        const roomID = [data.sender, data.receiver].sort().join('_');
        const user = await User.findOne({ username: data.sender });
        
        const msgData = {
            room: roomID,
            sender: data.sender,
            text: data.text,
            badge: user ? user.badge : "", 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const savedMsg = new Message(msgData);
        await savedMsg.save();
        io.to(roomID).emit('new-msg', msgData);
    });

    // ADMIN ACTION (VERIFY USERS)
    socket.on('admin-action', async (data) => {
        // This looks for the 'ADMIN_SECRET' you typed into the Render box
        if (data.adminKey !== process.env.ADMIN_SECRET) { 
            return socket.emit('error-msg', 'Wrong Admin Key');
        }
        await User.findOneAndUpdate({ username: data.targetUser }, { badge: data.badge });
        socket.emit('admin-success', `Badge ${data.badge} given to ${data.targetUser}`);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log('Server is live on port ' + PORT);
});
