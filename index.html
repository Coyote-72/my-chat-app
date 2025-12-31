<!DOCTYPE html>
<html lang="en">
<head>
    <title>CloudChat | Messaging</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <style>
        :root { --tg-blue: #24A1DE; --bg-dark: #0f172a; --sidebar-bg: #1e293b; }
        body { font-family: 'Segoe UI', sans-serif; background: var(--bg-dark); color: white; margin: 0; overflow: hidden; }
        
        .app-container { display: flex; height: 100vh; position: relative; width: 100%; overflow: hidden; }
        
        /* Sidebar */
        .sidebar { width: 350px; background: var(--sidebar-bg); border-right: 1px solid #334155; display: flex; flex-direction: column; transition: 0.3s ease; z-index: 10; }
        .chat-area { flex: 1; display: flex; flex-direction: column; background: #0b1120; transition: 0.3s ease; z-index: 5; }

        @media (max-width: 768px) {
            .sidebar { width: 100%; position: absolute; height: 100%; }
            .chat-area { width: 100%; position: absolute; height: 100%; transform: translateX(100%); }
            .mobile-chat-active .sidebar { transform: translateX(-100%); }
            .mobile-chat-active .chat-area { transform: translateX(0); z-index: 20; }
        }

        /* Sidebar Elements */
        .search-container { padding: 20px; }
        .search-input { width: 100%; padding: 12px; border-radius: 12px; border: none; background: #0f172a; color: white; box-sizing: border-box; outline: none; }
        .contact-list { flex: 1; overflow-y: auto; }
        .contact-item { padding: 15px 20px; cursor: pointer; border-bottom: 1px solid #334155; transition: 0.2s; }
        .contact-item:hover { background: #334155; }
        .contact-item.active { background: var(--tg-blue); }
        .group-item { border-left: 4px solid #f59e0b !important; }

        /* Floating Plus Button */
        .group-btn { 
            width: 55px; height: 55px; border-radius: 50%; background: var(--tg-blue); 
            position: fixed; bottom: 80px; left: 20px; color: white; border: none; 
            font-size: 24px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.4); 
            display: flex; align-items: center; justify-content: center; z-index: 100;
        }

        /* Chat Window */
        #chat-header { padding: 15px 20px; background: var(--sidebar-bg); border-bottom: 1px solid #334155; font-weight: bold; display: flex; align-items: center; }
        .back-btn { display: none; margin-right: 15px; cursor: pointer; font-size: 1.5rem; color: var(--tg-blue); }
        @media (max-width: 768px) { .back-btn { display: block; } }

        #messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .msg { padding: 12px 16px; border-radius: 18px; max-width: 75%; font-size: 0.95rem; line-height: 1.4; position: relative; }
        .sender-label { font-size: 0.7rem; font-weight: bold; margin-bottom: 4px; color: #f59e0b; display: block; }
        .my-msg { background: var(--tg-blue); align-self: flex-end; border-bottom-right-radius: 4px; }
        .other-msg { background: #334155; align-self: flex-start; border-bottom-left-radius: 4px; }
        .bot-msg { background: #475569; align-self: center; text-align: center; max-width: 90%; font-size: 0.8rem; border-radius: 10px; }

        .input-area { padding: 15px; display: flex; gap: 10px; background: var(--sidebar-bg); }
        #m-input { flex: 1; padding: 12px 20px; border-radius: 25px; border: none; background: #0f172a; color: white; outline: none; }

        /* Modals */
        .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; align-items: center; justify-content: center; }
        .modal-content { background: #1e293b; padding: 30px; border-radius: 20px; width: 90%; max-width: 320px; text-align: center; border: 1px solid #475569; }
        
        .contact-select-item { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #334155; text-align: left; }
        .contact-select-item input { margin-right: 15px; transform: scale(1.2); }
    </style>
</head>
<body>

    <div id="group-modal" class="modal">
        <div class="modal-content">
            <h3 style="margin-top:0">New Group</h3>
            <input id="group-name-input" placeholder="Group Name" style="width:100%; padding:12px; border-radius:10px; border:none; background:#0f172a; color:white; margin-bottom:15px; box-sizing: border-box; outline:none;">
            <label style="font-size: 0.8rem; color: #94a3b8; display:block; text-align:left; margin-bottom:5px;">Invite Contacts:</label>
            <div id="group-contact-selection" style="max-height: 150px; overflow-y: auto; background: #0f172a; border-radius: 10px; margin-bottom: 15px;"></div>
            <div style="display:flex; gap:10px;">
                <button onclick="closeModal('group-modal')" style="flex:1; padding:10px; background:#475569; color:white; border:none; border-radius:10px; cursor:pointer;">Cancel</button>
                <button onclick="submitCreateGroup()" style="flex:2; padding:10px; background:var(--tg-blue); color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">Create</button>
            </div>
        </div>
    </div>

    <div id="profile-modal" class="modal">
        <div class="modal-content">
            <h3 style="margin-top:0">My Profile</h3>
            <p id="my-assigned-number" style="color: var(--tg-blue); font-size: 1.2rem; font-weight: bold;"></p>
            <textarea id="bio-input" style="width:100%; height:80px; background:#0f172a; color:white; border:1px solid #334155; border-radius:10px; padding:10px; margin: 10px 0; box-sizing: border-box; outline:none;"></textarea>
            <button onclick="saveProfile()" style="width:100%; padding:12px; background:var(--tg-blue); color:white; border:none; border-radius:10px; cursor:pointer; font-weight:bold;">Save & Close</button>
        </div>
    </div>

    <button class="group-btn" onclick="openGroupModal()">＋</button>

    <div class="app-container" id="main-wrapper">
        <div class="sidebar">
            <div class="search-container">
                <input class="search-input" id="search-query" placeholder="Search name or number..." onkeyup="if(event.key==='Enter') searchUser()">
            </div>
            <div class="contact-list" id="contacts">
                <div class="contact-item" onclick="startChat('CloudChat_Bot')">
                    <strong>🤖 CloudChat Bot</strong><br><small>Support System</small>
                </div>
            </div>
            <button onclick="document.getElementById('profile-modal').style.display='flex'" style="padding:15px; background:#334155; color:white; border:none; cursor:pointer; font-weight:bold;">Account Settings</button>
        </div>

        <div class="chat-area" id="chat-window" style="display:none;">
            <div id="chat-header">
                <div class="back-btn" onclick="goBack()">⬅</div>
                <div>Talking to: <span id="chat-target-name" style="color: var(--tg-blue);">...</span></div>
            </div>
            <div id="messages"></div>
            <div class="input-area">
                <input id="m-input" placeholder="Type a message..." autocomplete="off">
                <button onclick="sendMsg()" style="background:var(--tg-blue); border:none; color:white; padding:10px 20px; border-radius:25px; cursor:pointer; font-weight:bold;">Send</button>
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        let myName = "";
        let currentChat = "";
        let myContacts = [];

        window.onload = () => {
            const u = localStorage.getItem('pendingUser');
            const p = localStorage.getItem('pendingPass');
            if (u && p) {
                socket.emit('authenticate', { username: u, password: p });
            } else {
                window.location.href = "/login";
            }
        };

        socket.on('auth-success', (data) => {
            myName = data.username;
            myContacts = data.contacts || [];
            document.getElementById('my-assigned-number').innerText = data.phone;
            document.getElementById('bio-input').value = data.bio || "";
            
            myContacts.forEach(c => addContactToUI(c));
            if(data.groups) {
                data.groups.forEach(g => addGroupToUI(g));
            }
        });

        // GROUP MODAL LOGIC
        function openGroupModal() {
            const container = document.getElementById('group-contact-selection');
            container.innerHTML = "";
            myContacts.forEach(contact => {
                const div = document.createElement('div');
                div.className = 'contact-select-item';
                div.innerHTML = `<input type="checkbox" value="${contact}" class="gm-cb"><span>${contact}</span>`;
                container.appendChild(div);
            });
            document.getElementById('group-modal').style.display = 'flex';
        }

        function submitCreateGroup() {
            const name = document.getElementById('group-name-input').value;
            const selected = Array.from(document.querySelectorAll('.gm-cb:checked')).map(cb => cb.value);
            if(!name) return alert("Enter a group name");
            socket.emit('create-group', { groupName: name, me: myName, initialMembers: selected });
            closeModal('group-modal');
        }

        socket.on('group-created', (group) => {
            addGroupToUI(group);
            startGroupChat(group._id, group.name);
        });

        function addGroupToUI(group) {
            if(document.getElementById(`group-${group._id}`)) return;
            const list = document.getElementById('contacts');
            const div = document.createElement('div');
            div.className = 'contact-item group-item';
            div.id = `group-${group._id}`;
            div.innerHTML = `<strong>👥 ${group.name}</strong><br><small>${group.members.length} members</small>`;
            div.onclick = () => startGroupChat(group._id, group.name);
            list.prepend(div);
        }

        function startGroupChat(id, name) {
            currentChat = id;
            document.getElementById('main-wrapper').classList.add('mobile-chat-active');
            document.getElementById('chat-window').style.display = 'flex';
            document.getElementById('chat-target-name').innerText = name;
            socket.emit('join-group', id);
        }

        // PRIVATE CHAT LOGIC
        function searchUser() {
            const query = document.getElementById('search-query').value;
            if(query) socket.emit('find-user', query);
        }

        socket.on('user-found', (user) => {
            addContactToUI(user.username, user.phone);
            startChat(user.username);
        });

        function addContactToUI(username, phone = "Contact") {
            if(document.getElementById(`contact-${username}`)) return;
            const list = document.getElementById('contacts');
            const div = document.createElement('div');
            div.className = 'contact-item';
            div.id = `contact-${username}`;
            div.innerHTML = `<strong>${username}</strong><br><small>${phone}</small>`;
            div.onclick = () => startChat(username);
            list.appendChild(div);
        }

        function startChat(target) {
            currentChat = target;
            document.getElementById('main-wrapper').classList.add('mobile-chat-active');
            document.getElementById('chat-window').style.display = 'flex';
            document.getElementById('chat-target-name').innerText = target;
            socket.emit('join-private', { me: myName, other: target });
        }

        function sendMsg() {
            const txt = document.getElementById('m-input').value;
            if(!txt || !currentChat) return;
            
            const isGroup = currentChat.length > 20; // Mongo IDs are 24 chars
            if(isGroup) {
                socket.emit('send-group-msg', { groupId: currentChat, sender: myName, text: txt });
            } else {
                socket.emit('send-private-msg', { sender: myName, receiver: currentChat, text: txt });
            }
            document.getElementById('m-input').value = "";
        }

        socket.on('new-msg', (data) => displayMessage(data));

        socket.on('load-history', (history) => {
            const container = document.getElementById('messages');
            container.innerHTML = "";
            history.forEach(msg => displayMessage(msg));
        });

        function displayMessage(data) {
            const div = document.createElement('div');
            div.className = `msg ${data.sender === myName ? 'my-msg' : (data.sender === 'CloudChat_Bot' ? 'bot-msg' : 'other-msg')}`;
            
            let nameTag = (data.isGroup && data.sender !== myName) ? `<span class="sender-label">${data.sender}</span>` : "";
            div.innerHTML = `${nameTag}<div>${data.text}</div><small style="opacity:0.6; font-size:0.7rem">${data.time || ''}</small>`;
            
            document.getElementById('messages').appendChild(div);
            document.getElementById('messages').scrollTop = 99999;
        }

        function closeModal(id) { document.getElementById(id).style.display = 'none'; }
        function goBack() { document.getElementById('main-wrapper').classList.remove('mobile-chat-active'); }
        function saveProfile() {
            const bio = document.getElementById('bio-input').value;
            socket.emit('update-profile', { username: myName, bio: bio });
            closeModal('profile-modal');
        }

        socket.on('error-msg', (msg) => alert(msg));
    </script>
</body>
</html>
