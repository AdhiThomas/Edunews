import {
  db,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from './firebase.js';

/* ─── DOM REFS ─────────────────────────────────── */
const homePage        = document.getElementById('homePage');
const chatPage        = document.getElementById('chatPage');
const searchBtn       = document.getElementById('searchBtn');
const searchInput     = document.getElementById('searchInput');
const roomTitle       = document.getElementById('roomTitle');
const backBtn         = document.getElementById('backBtn');
const messagesContainer = document.getElementById('messages');
const sendBtn         = document.getElementById('sendBtn');
const messageInput    = document.getElementById('messageInput');
const userSwitchEl    = document.getElementById('userSwitch');
const modal           = document.getElementById('contentModal');
const modalTitle      = document.getElementById('modalTitle');
const modalText       = document.getElementById('modalText');
const closeModal      = document.getElementById('closeModal');

/* ─── ROOM CONFIGS ──────────────────────────────── */
const ROOMS = {
  adhi:    { label: 'ADHI CHAT ROOM',   users: ['Adhi', 'Vishnu'] },
  vishnu:  { label: 'VISHNU CHAT ROOM', users: ['Adhi', 'Vishnu'] },
  visva:   { label: 'VISVA CHAT ROOM',  users: ['Visva', 'Nidharshana'] }
};

let currentRoom = '';
let currentUser = '';
let unsubscribeMessages = null;

/* ─── SEARCH ────────────────────────────────────── */
function handleSearch() {
  const val = searchInput.value.trim().toLowerCase();
  if (ROOMS[val]) {
    openChatRoom(val);
  }
}

searchBtn.addEventListener('click', handleSearch);

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});

/* ─── OPEN CHAT ROOM ────────────────────────────── */
function openChatRoom(roomKey) {
  const room = ROOMS[roomKey];
  currentRoom = roomKey;
  currentUser = room.users[0];

  // Build user switch buttons
  userSwitchEl.innerHTML = '';
  room.users.forEach((user, idx) => {
    const btn = document.createElement('button');
    btn.className = 'user-btn' + (idx === 0 ? ' active-user' : '');
    btn.dataset.user = user;
    btn.textContent = user;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.user-btn').forEach(b => b.classList.remove('active-user'));
      btn.classList.add('active-user');
      currentUser = user;
      // Re-render messages so bubble alignment updates
      renderMessages(lastSnapshot);
    });
    userSwitchEl.appendChild(btn);
  });

  roomTitle.textContent = room.label;

  homePage.classList.remove('active');
  chatPage.classList.add('active');

  loadMessages();
}

/* ─── BACK BUTTON ───────────────────────────────── */
backBtn.addEventListener('click', () => {
  chatPage.classList.remove('active');
  homePage.classList.add('active');

  // Clear search input
  searchInput.value = '';

  // Unsubscribe live listener to avoid memory leaks
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }

  currentRoom = '';
  messagesContainer.innerHTML = '';
});

/* ─── SEND MESSAGE ──────────────────────────────── */
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentRoom) return;

  try {
    await addDoc(
      collection(db, 'chatrooms', currentRoom, 'messages'),
      {
        sender: currentUser,
        text,
        timestamp: serverTimestamp()
      }
    );
    messageInput.value = '';
  } catch (err) {
    console.error('Send failed:', err);
  }
}

/* ─── LOAD & RENDER MESSAGES ────────────────────── */
let lastSnapshot = null;

function loadMessages() {
  if (unsubscribeMessages) unsubscribeMessages();

  const q = query(
    collection(db, 'chatrooms', currentRoom, 'messages'),
    orderBy('timestamp', 'asc')
  );

  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    lastSnapshot = snapshot;
    renderMessages(snapshot);
  });
}

function renderMessages(snapshot) {
  if (!snapshot) return;

  messagesContainer.innerHTML = '';

  snapshot.forEach((doc) => {
    const data = doc.data();
    const isSelf = data.sender === currentUser;

    const div = document.createElement('div');
    div.classList.add('message', isSelf ? 'self' : 'other');

    const time = data.timestamp?.toDate?.()
      ? data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Sending…';

    div.innerHTML = `
      <div class="sender">${data.sender}</div>
      <div class="msg-text">${escapeHTML(data.text)}</div>
      <div class="time">${time}</div>
    `;

    messagesContainer.appendChild(div);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── QUIZZES ────────────────────────────────────── */
document.querySelectorAll('.quiz-box').forEach(box => {
  const options = box.querySelectorAll('.quiz-option');
  const resultEl = box.querySelector('.quiz-result');
  let answered = false;

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      if (answered) return;
      answered = true;

      const correct = opt.dataset.correct === 'true';

      options.forEach(o => {
        o.disabled = true;
        if (o.dataset.correct === 'true') {
          o.classList.add('correct');
        } else if (o === opt && !correct) {
          o.classList.add('wrong');
        }
      });

      if (correct) {
        resultEl.textContent = '✅ Correct! Well done.';
        resultEl.style.color = '#4ade80';
      } else {
        resultEl.textContent = '❌ Wrong answer. Try again next time!';
        resultEl.style.color = '#f87171';
      }
    });
  });
});

/* ─── CONTENT MODAL ──────────────────────────────── */
document.querySelectorAll('.news-card, .lesson-card').forEach(card => {
  card.addEventListener('click', () => {
    modalTitle.textContent = card.dataset.title;
    modalText.textContent  = card.dataset.content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

closeModal.addEventListener('click', closeContentModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeContentModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeContentModal();
});

function closeContentModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  }  if (value === 'adhi' || value === 'vishnu') {
    openChatRoom(value);
  }

});


function openChatRoom(roomName) {

  currentRoom = roomName;

  homePage.classList.remove('active');
  chatPage.classList.add('active');

  roomTitle.innerText = roomName.toUpperCase() + ' CHAT ROOM';

  loadMessages();

}


backBtn.addEventListener('click', () => {

  chatPage.classList.remove('active');
  homePage.classList.add('active');

});


userButtons.forEach(button => {

  button.addEventListener('click', () => {

    userButtons.forEach(btn => btn.classList.remove('active-user'));

    button.classList.add('active-user');

    currentUser = button.dataset.user;

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
