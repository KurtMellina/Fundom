const users = ["Sangco", "John Kenneth", "Kinit"]; // Example users
const userStatus = { Sangco: "online", JohnKenneth: "offline", Kinit: "online" }; // Example statuses

const usersList = document.getElementById("users");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message");
const selectedUserHeading = document.getElementById("selected-user");

let selectedUser = null;

// Populate user list with statuses
function populateUserList() {
  usersList.innerHTML = "";
  users.forEach((user) => {
    const userItem = document.createElement("li");
    userItem.textContent = `${user} (${userStatus[user] || "offline"})`;
    userItem.classList.add(userStatus[user] || "offline");
    userItem.onclick = () => selectUser(user, userItem);
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

// Add a message
function addMessage(content, type = "sent") {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", type);

  const messageText = document.createElement("span");
  messageText.textContent = content;

  const timestamp = document.createElement("small");
  timestamp.classList.add("timestamp");
  const now = new Date();
  timestamp.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  messageDiv.appendChild(messageText);
  messageDiv.appendChild(timestamp);

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send a message
function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || !selectedUser) return;
  addMessage(message, "sent");
  saveChat();
  messageInput.value = "";
  setTimeout(() => {
    addMessage(`Reply to: ${message}`, "received");
    saveChat();
  }, 1000); // Simulate a reply
}

// Save chat history in localStorage
function saveChat() {
  if (selectedUser) {
    const chatData = chatBox.innerHTML;
    localStorage.setItem(selectedUser, chatData);
  }
}

// Load chat history from localStorage
function loadChat() {
  if (selectedUser) {
    const chatData = localStorage.getItem(selectedUser);
    chatBox.innerHTML = chatData || "";
  }
}

// Initialize chat
document.addEventListener("DOMContentLoaded", populateUserList);

setTimeout(() => {
    userStatus["Sangco"] = "online"; // Change sangco's status
    populateUserList(); // Re-render user list to reflect changes
  }, 5000);

  let typingTimeout;

  function showTypingIndicator() {
    document.getElementById("typing-indicator").style.display = "block";
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      document.getElementById("typing-indicator").style.display = "none";
    }, 3000); // Hide indicator after 3 seconds
  }
  
  // Simulate user typing
  messageInput.addEventListener("input", () => {
    if (selectedUser) {
      showTypingIndicator();
    }
  });

  document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
  });

  function updateOnlineCount() {
    const onlineUsers = Object.values(userStatus).filter(status => status === "online").length;
    document.getElementById("online-count").textContent = onlineUsers;
  }
  
  setInterval(updateOnlineCount, 1000);

  document.getElementById("search").addEventListener("input", (e) => {
    const searchQuery = e.target.value.toLowerCase();
    const filteredUsers = users.filter(user => user.toLowerCase().includes(searchQuery));
    usersList.innerHTML = "";
    filteredUsers.forEach((user) => {
      const userItem = document.createElement("li");
      userItem.textContent = `${user} (${userStatus[user] || "offline"})`;
      userItem.classList.add(userStatus[user] || "offline");
      userItem.onclick = () => selectUser(user, userItem);
      usersList.appendChild(userItem);
    });
  });
  