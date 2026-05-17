import {
  db,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from './firebase.js';


const homePage = document.getElementById('homePage');
const chatPage = document.getElementById('chatPage');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const roomTitle = document.getElementById('roomTitle');
const backBtn = document.getElementById('backBtn');
const messagesContainer = document.getElementById('messages');
const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('messageInput');
const userButtons = document.querySelectorAll('.user-btn');
const quizOptions = document.querySelectorAll('.quiz-option');
const quizResult = document.getElementById('quizResult');
const modal = document.getElementById('contentModal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const closeModal = document.getElementById('closeModal');

let currentRoom = '';
let currentUser = 'Adhi';


searchBtn.addEventListener('click', () => {

  const value = searchInput.value.trim().toLowerCase();

  if (
  value === 'adhi' ||
  value === 'vishnu'
) {

  openChatRoom('adhi-room');

}


else if (
  value === 'visva'
) {

  openChatRoom('visva-room');

}

});


function openChatRoom(roomName) {

  currentRoom = roomName;

  chatPage.classList.remove('active');
homePage.classList.add('active');

searchInput.value = '';

  if (roomName === 'adhi-room') {

  roomTitle.innerText = 'ADHI CHAT ROOM';

  currentUser = 'Adhi';

}


if (roomName === 'visva-room') {

  roomTitle.innerText = 'VISVA CHAT ROOM';

  currentUser = 'Visva';

}
  loadMessages();

}


backBtn.addEventListener('click', () => {

  chatPage.classList.remove('active');
  homePage.classList.add('active');

});


userButtons.forEach(button => {

  button.addEventListener('click', () => {

    const selectedUser = button.dataset.user;

    if (
      currentRoom === 'adhi-room' &&
      (selectedUser === 'Adhi' || selectedUser === 'Vishnu')
    ) {

      userButtons.forEach(btn =>
        btn.classList.remove('active-user')
      );

      button.classList.add('active-user');

      currentUser = selectedUser;

    }


    else if (
      currentRoom === 'visva-room' &&
      (selectedUser === 'Visva' || selectedUser === 'Nidharshana')
    ) {

      userButtons.forEach(btn =>
        btn.classList.remove('active-user')
      );

      button.classList.add('active-user');

      currentUser = selectedUser;

    }

  });

});


sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {

  if (e.key === 'Enter') {
    sendMessage();
  }

});


async function sendMessage() {

  const text = messageInput.value.trim();

  if (!text || !currentRoom) return;

  await addDoc(
    collection(db, 'chatrooms', currentRoom, 'messages'),
    {
      sender: currentUser,
      text: text,
      timestamp: serverTimestamp()
    }
  );

  messageInput.value = '';

}


function loadMessages() {

  const q = query(
    collection(db, 'chatrooms', currentRoom, 'messages'),
    orderBy('timestamp', 'asc')
  );

  onSnapshot(q, (snapshot) => {

    messagesContainer.innerHTML = '';

    snapshot.forEach((doc) => {

      const data = doc.data();

      const div = document.createElement('div');

      div.classList.add('message');

      if (data.sender === currentUser) {
        div.classList.add('self');
      } else {
        div.classList.add('other');
      }

      const time = data.timestamp?.toDate?.()
        ? data.timestamp.toDate().toLocaleTimeString()
        : 'Sending...';

      div.innerHTML = `
        <div class="sender">${data.sender}</div>
        <div>${data.text}</div>
        <div class="time">${time}</div>
      `;

      messagesContainer.appendChild(div);

    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

  });

}


quizOptions.forEach(option => {

  option.addEventListener('click', () => {

    const correct = option.dataset.correct;

    if (correct === 'true') {
      quizResult.innerText = 'Correct Answer';
      quizResult.style.color = '#22c55e';
    } else {
      quizResult.innerText = 'Wrong Answer';
      quizResult.style.color = '#ef4444';
    }

  });

});


const contentCards = document.querySelectorAll('.news-card, .lesson-card');

contentCards.forEach(card => {

  card.addEventListener('click', () => {

    modal.classList.add('active');

    modalTitle.innerText = card.dataset.title;
    modalText.innerText = card.dataset.content;

  });

});


closeModal.addEventListener('click', () => {

  modal.classList.remove('active');

});
