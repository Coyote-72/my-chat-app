const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    maxHttpBufferSize: 1e7 
});
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// 1. CONNECT TO MONGODB
const mongoURI = process.env.MONGO_URL || "mongodb+srv://admin:Nigeria@1@cluster0.ulx80ly.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ SUCCESS: Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ DATABASE ERROR:", err));

// 2. DATA SCHEMAS (Updated for Telegram features)
const User = mongoose.model('User', { 
    username: { type: String, unique: true }, 
    password: { type: String },
    appPhone: { type: String, unique: true }, // Unique App ID
    contacts: [{ type: String }],            // Saved Friends list
    badge: { type: String, default: "" },
    bio: { type: String, default: "Hey! I am using CloudChat." }
});

const Message = mongoose.model('Message', { 
    room: String, 
    sender: String, 
    text: String, 
    time: String 
});

// Helper: Generate a unique Telegram-style number
function generateAppNumber() {
    const rand = Math.floor(10000000 + Math.random() * 90000000);
    return `+1 888 ${rand.toString().substring(0,4)} ${rand.toString().substring(4,8)}`;
}

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    // LOGIN / REGISTER
    socket.on('authenticate', async (data) => {
        try {
            let user = await User.findOne({ username: data.username });
            if (!user) {
                const hashed = await bcrypt.hash(data.password, 10);
                const phone = generateAppNumber();
                user = new User({ username: data.username, password: hashed, appPhone: phone });
                await user.save();
            } else {
                const match = await bcrypt.compare(data.password, user.password);
                if (!match) return socket.emit('error-msg', 'Incorrect password');
            }
            // Send back username, phone, and saved contacts
            socket.emit('auth-success', { 
                username: user.username, 
                phone: user.appPhone,
                contacts: user.contacts 
            });
        } catch (e) {
            socket.emit('error-msg', 'Auth Error');
        }
    });

    // SEARCH FOR USERS BY NAME OR PHONE
    socket.on('find-user', async (query) => {
        const target = await User.findOne({
            $or: [{ username: query }, { appPhone: query }]
        });
        if (target) {
            socket.emit('user-found', {
                username: target.username,
                phone: target.appPhone,
                bio: target.bio
            });
        } else {
            socket.emit('error-msg', 'User not found');
        }
    });

    // START CHAT & SAVE TO CONTACTS
    socket.on('join-private', async (data) => {
        const roomID = [data.me, data.other].sort().join('_');
        socket.join(roomID);

        // Permanently save this person to your contact list
        await User.findOneAndUpdate(
            { username: data.me },
            { $addToSet: { contacts: data.other } }
        );

        const history = await Message.find({ room: roomID }).sort({ _id: 1 });
        socket.emit('load-history', history);
    });

    // SEND MESSAGE
    socket.on('send-private-msg', async (data) => {
        const roomID = [data.sender, data.receiver].sort().join('_');
        const msgData = {
            room: roomID,
            sender: data.sender,
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const savedMsg = new Message(msgData);
        await savedMsg.save();
        io.to(roomID).emit('new-msg', msgData);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => console.log('Server live on port ' + PORT));
