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
// This version uses the secret variable OR your direct link if the variable is missing
const mongoURI = process.env.MONGO_URL || "mongodb+srv://admin:kido jnr@cluster0.ulx80ly.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ SUCCESS: Connected to MongoDB Atlas"))
    .catch(err => {
        console.error("❌ DATABASE ERROR: Could not connect.");
        console.error(err);
    });

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

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    // LOGIN / REGISTER LOGIC
    socket.on('authenticate', async (data) => {
        try {
            let user = await User.findOne({ username: data.username });
            if (!user) {
                // Register new user
                const hashed = await bcrypt.hash(data.password, 10);
                user = new User({ username: data.username, password: hashed });
                await user.save();
                socket.emit('auth-success', user.username);
            } else {
                // Login existing user
                const match = await bcrypt.compare(data.password, user.password);
                if (match) socket.emit('auth-success', user.username);
                else socket.emit('error-msg', 'Incorrect password');
            }
        } catch (e) {
            console.error("Auth Error:", e);
            socket.emit('error-msg', 'Auth Error: ' + e.message);
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
        try {
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
        } catch (err) {
            console.error("Message send error:", err);
        }
    });

    // ADMIN ACTION
    socket.on('admin-action', async (data) => {
        const secret = process.env.ADMIN_SECRET || "mypassword123";
        if (data.adminKey !== secret) { 
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

