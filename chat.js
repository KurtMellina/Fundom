const usersList = document.getElementById("users");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message");
const selectedUserHeading = document.getElementById("selected-user");

let selectedUser = null;
let typingTimeout;

// Initialize socket connection
const socket = io(); // Connect to server using socket.io

// Fetch online users from the server
function getOnlineUsers() {
  fetch('/api/online-users')  // Fetch online users from the backend
    .then(response => response.json())
    .then(users => {
      populateUserList(users); // Populate the list with the received users
    })
    .catch(error => {
      console.error('Error fetching online users:', error);
    });
}

// Populate the user list with online users and their statuses
function populateUserList(users) {
  usersList.innerHTML = ""; // Clear existing list
  users.forEach((user) => {
    const userItem = document.createElement("li");
    userItem.textContent = `${user.username} (${user.status})`;
    userItem.onclick = () => selectUser(user.username, userItem);
    usersList.appendChild(userItem);
  });
}

// Select a user and load chat history
function selectUser(user, userItem) {
  selectedUser = user;
  selectedUserHeading.textContent = user;
  document.querySelectorAll("#users li").forEach((li) => li.classList.remove("selected-user"));
  userItem.classList.add("selected-user");
  loadChat();
}

// Handle sending message
function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || !selectedUser) return;

  const sender = 'YourUsername'; // Replace with actual logged-in user

  // Send message to the server
  socket.emit('sendMessage', {
    sender: sender,
    recipient: selectedUser,
    message: message
  });

  // Show user's message
  addMessage(message, 'sent');
  messageInput.value = '';
}

// Listen for new messages from other users
socket.on('newMessage', (data) => {
  const { sender, message } = data;

  if (selectedUser === sender) {
    addMessage(message, 'received');
  }
});

// Add message to chat
function addMessage(content, type = 'sent') {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', type);

  const messageText = document.createElement('span');
  messageText.textContent = content;

  const timestamp = document.createElement('small');
  timestamp.classList.add('timestamp');
  const now = new Date();
  timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  messageDiv.appendChild(messageText);
  messageDiv.appendChild(timestamp);

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Save chat history in MongoDB (or localStorage for now)
function saveChat() {
  if (selectedUser) {
    const chatData = chatBox.innerHTML;
    // Call backend to save chat data (e.g., using fetch API)
    fetch('/api/save-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: selectedUser, chat: chatData })
    });
  }
}

// Load chat history from MongoDB (or from localStorage for now)
function loadChat() {
  if (selectedUser) {
    fetch(`/api/load-chat/${selectedUser}`)
      .then(response => response.json())
      .then(data => {
        chatBox.innerHTML = data.chat || "";
      });
  }
}

// Update online user list every 3 seconds
setInterval(getOnlineUsers, 3000);

// Show typing indicator when the user is typing
messageInput.addEventListener('input', () => {
  if (selectedUser) {
    socket.emit('typing', { sender: 'YourUsername', recipient: selectedUser });
  }
});

// Listen for typing indicators from other users
socket.on('typing', (data) => {
  const { sender } = data;
  if (sender !== 'YourUsername' && selectedUser === sender) {
    showTypingIndicator();
  }
});

// Show typing indicator
function showTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator");
  typingIndicator.style.display = "block";
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typingIndicator.style.display = "none";
  }, 2000); // Hide typing indicator after 2 seconds
}

// Search functionality for user list
document.getElementById("search").addEventListener("input", (e) => {
  const searchQuery = e.target.value.toLowerCase();

  // Fetch the online users again (assuming the list is updated with every search)
  fetch('/api/online-users')
    .then(response => response.json())
    .then(users => {
      const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchQuery));
      populateUserList(filteredUsers); // Populate the filtered list
    });
});

// Initialize chat
document.addEventListener("DOMContentLoaded", getOnlineUsers);
