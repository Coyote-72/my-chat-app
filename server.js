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

// 1. DATABASE CONNECTION
const mongoURI = process.env.MONGO_URL || "mongodb+srv://admin:Nigeria@1@cluster0.ulx80ly.mongodb.net/?appName=Cluster0";
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// 2. SCHEMAS
const User = mongoose.model('User', { 
    username: { type: String, unique: true, required: true }, 
    password: { type: String, required: true },
    appPhone: { type: String, unique: true },
    contacts: [{ type: String }],
    badge: { type: String, default: "" },
    bio: { type: String, default: "Hey! I am using CloudChat." },
    avatar: { type: String, default: "" },
    isOnline: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', { 
    room: String, 
    sender: String, 
    text: String, 
    time: String,
    timestamp: { type: Date, default: Date.now }
});

// Helper: Random Phone Number (Telegram Style)
function generateAppNumber() {
    const rand = Math.floor(10000000 + Math.random() * 90000000);
    return `+1 888 ${rand.toString().substring(0,4)} ${rand.toString().substring(4,8)}`;
}

app.use(express.static(__dirname));

// 3. ROUTES
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// 4. SOCKET LOGIC
io.on('connection', (socket) => {
    let currentConnectedUser = "";

    // LOGIN / REGISTER LOGIC
    socket.on('authenticate', async (data) => {
        try {
            if (!data.username || !data.password) return socket.emit('error-msg', 'Missing credentials');
            
            let user = await User.findOne({ username: data.username });
            let isNew = false;

            if (!user) {
                // REGISTRATION
                const hashed = await bcrypt.hash(data.password, 10);
                const phone = generateAppNumber();
                user = new User({ 
                    username: data.username, 
                    password: hashed, 
                    appPhone: phone,
                    isOnline: true 
                });
                await user.save();
                isNew = true;
                console.log(`👤 New User: ${data.username}`);
            } else {
                // LOGIN
                const match = await bcrypt.compare(data.password, user.password);
                if (!match) return socket.emit('error-msg', 'Incorrect password');
                
                user.isOnline = true;
                await user.save();
            }

            currentConnectedUser = user.username;
            
            socket.emit('auth-success', { 
                username: user.username, 
                phone: user.appPhone,
                contacts: user.contacts,
                bio: user.bio,
                badge: user.badge
            });

            // WELCOME BOT MESSAGE
            if (isNew) {
                const botRoom = [user.username, "CloudChat_Bot"].sort().join('_');
                const welcomeMsg = new Message({
                    room: botRoom,
                    sender: "CloudChat_Bot",
                    text: `Welcome ${user.username}! 🎉 Your unique Cloud ID is ${user.appPhone}. Search for friends by their @username or phone number to start chatting.`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
                await welcomeMsg.save();
            }
        } catch (e) {
            console.error(e);
            socket.emit('error-msg', 'Authentication failed');
        }
    });

    // SEARCH LOGIC
    socket.on('find-user', async (query) => {
        const target = await User.findOne({
            $or: [{ username: query }, { appPhone: query }]
        });
        if (target) {
            socket.emit('user-found', { 
                username: target.username, 
                phone: target.appPhone, 
                bio: target.bio,
                isOnline: target.isOnline 
            });
        } else {
            socket.emit('error-msg', 'User not found');
        }
    });

    // JOIN & HISTORY
    socket.on('join-private', async (data) => {
        const roomID = [data.me, data.other].sort().join('_');
        socket.join(roomID);
        
        // Add to contacts if not already there
        if(data.other !== "CloudChat_Bot") {
            await User.findOneAndUpdate(
                { username: data.me }, 
                { $addToSet: { contacts: data.other } }
            );
        }

        const history = await Message.find({ room: roomID }).sort({ timestamp: 1 }).limit(50);
        socket.emit('load-history', history);
    });

    // SENDING MESSAGES
    socket.on('send-private-msg', async (data) => {
        if (!data.text.trim()) return;

        const roomID = [data.sender, data.receiver].sort().join('_');
        const msgData = {
            room: roomID, 
            sender: data.sender, 
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        await new Message(msgData).save();
        io.to(roomID).emit('new-msg', msgData);
    });

    // PROFILE UPDATE
    socket.on('update-profile', async (data) => {
        try {
            await User.findOneAndUpdate(
                { username: data.username },
                { bio: data.bio }
            );
            socket.emit('profile-updated', "Success!");
        } catch (e) {
            socket.emit('error-msg', 'Update failed');
        }
    });

    // DISCONNECT LOGIC
    socket.on('disconnect', async () => {
        if (currentConnectedUser) {
            await User.findOneAndUpdate({ username: currentConnectedUser }, { isOnline: false });
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => console.log('🚀 Server live on port ' + PORT));
