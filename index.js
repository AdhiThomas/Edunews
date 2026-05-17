import {
  db,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from './firebase.js';



/* =========================================
   ELEMENTS
========================================= */

const homePage =
  document.getElementById('homePage');

const chatPage =
  document.getElementById('chatPage');

const searchBtn =
  document.getElementById('searchBtn');

const searchInput =
  document.getElementById('searchInput');

const roomTitle =
  document.getElementById('roomTitle');

const backBtn =
  document.getElementById('backBtn');

const messagesContainer =
  document.getElementById('messages');

const sendBtn =
  document.getElementById('sendBtn');

const messageInput =
  document.getElementById('messageInput');

const userButtons =
  document.querySelectorAll('.user-btn');

const quizOptions =
  document.querySelectorAll('.quiz-option');

const quizResult =
  document.getElementById('quizResult');

const modal =
  document.getElementById('contentModal');

const modalTitle =
  document.getElementById('modalTitle');

const modalText =
  document.getElementById('modalText');

const closeModal =
  document.getElementById('closeModal');



/* =========================================
   VARIABLES
========================================= */

let currentRoom = '';

let currentUser = 'Adhi';

let unsubscribeMessages = null;



/* =========================================
   SEARCH SYSTEM
========================================= */

searchBtn.addEventListener('click', () => {

  const value =
    searchInput.value
      .trim()
      .toLowerCase();



  // =========================================
  // ADHI ROOM
  // =========================================

  if (
    value.includes('adhi') ||
    value.includes('vishnu')
  ) {

    openChatRoom('adhi-room');

  }



  // =========================================
  // VISVA ROOM
  // =========================================

  else if (
    value.includes('visva') ||
    value.includes('nidharshana')
  ) {

    openChatRoom('visva-room');

  }

});



/* =========================================
   OPEN CHAT ROOM
========================================= */

function openChatRoom(roomName) {

  currentRoom = roomName;



  // PAGE SWITCH

  homePage.classList.remove('active');

  chatPage.classList.add('active');



  // CLEAR SEARCH

  searchInput.value = '';



  // RESET BUTTONS

  userButtons.forEach(btn => {

    btn.classList.remove('active-user');

    btn.style.display = 'none';

  });



  // =========================================
  // ADHI ROOM
  // =========================================

  if (roomName === 'adhi-room') {

    roomTitle.innerText =
      'ADHI CHAT ROOM';

    currentUser = 'Adhi';



    userButtons.forEach(btn => {

      if (
        btn.dataset.user === 'Adhi' ||
        btn.dataset.user === 'Vishnu'
      ) {

        btn.style.display = 'inline-block';

      }

    });

  }



  // =========================================
  // VISVA ROOM
  // =========================================

  else if (roomName === 'visva-room') {

    roomTitle.innerText =
      'VISVA CHAT ROOM';

    currentUser = 'Visva';



    userButtons.forEach(btn => {

      if (
        btn.dataset.user === 'Visva' ||
        btn.dataset.user === 'Nidharshana'
      ) {

        btn.style.display = 'inline-block';

      }

    });

  }



  // ACTIVE USER

  userButtons.forEach(btn => {

    if (
      btn.dataset.user === currentUser
    ) {

      btn.classList.add('active-user');

    }

  });



  // LOAD MESSAGES

  loadMessages();

}



/* =========================================
   BACK BUTTON
========================================= */

backBtn.addEventListener('click', () => {

  chatPage.classList.remove('active');

  homePage.classList.add('active');

  searchInput.value = '';

});



/* =========================================
   USER SWITCHING
========================================= */

userButtons.forEach(button => {

  button.addEventListener('click', () => {

    const selectedUser =
      button.dataset.user;



    // =========================================
    // ADHI ROOM USERS
    // =========================================

    if (
      currentRoom === 'adhi-room' &&
      (
        selectedUser === 'Adhi' ||
        selectedUser === 'Vishnu'
      )
    ) {

      userButtons.forEach(btn => {
        btn.classList.remove('active-user');
      });

      button.classList.add('active-user');

      currentUser = selectedUser;

    }



    // =========================================
    // VISVA ROOM USERS
    // =========================================

    else if (
      currentRoom === 'visva-room' &&
      (
        selectedUser === 'Visva' ||
        selectedUser === 'Nidharshana'
      )
    ) {

      userButtons.forEach(btn => {
        btn.classList.remove('active-user');
      });

      button.classList.add('active-user');

      currentUser = selectedUser;

    }

  });

});



/* =========================================
   SEND MESSAGE
========================================= */

sendBtn.addEventListener(
  'click',
  sendMessage
);


messageInput.addEventListener(
  'keypress',
  (e) => {

    if (e.key === 'Enter') {
      sendMessage();
    }

  }
);



async function sendMessage() {

  const text =
    messageInput.value.trim();

  if (!text || !currentRoom) return;



  await addDoc(

    collection(
      db,
      'chatrooms',
      currentRoom,
      'messages'
    ),

    {
      sender: currentUser,
      text: text,
      timestamp: serverTimestamp()
    }

  );



  messageInput.value = '';

}



/* =========================================
   LOAD REALTIME MESSAGES
========================================= */

function loadMessages() {



  // REMOVE OLD LISTENER

  if (unsubscribeMessages) {

    unsubscribeMessages();

  }



  const q = query(

    collection(
      db,
      'chatrooms',
      currentRoom,
      'messages'
    ),

    orderBy('timestamp', 'asc')

  );



  unsubscribeMessages =
    onSnapshot(q, (snapshot) => {

      messagesContainer.innerHTML = '';



      snapshot.forEach((doc) => {

        const data = doc.data();

        const div =
          document.createElement('div');



        div.classList.add('message');



        if (
          data.sender === currentUser
        ) {

          div.classList.add('self');

        }

        else {

          div.classList.add('other');

        }



        const time =
          data.timestamp?.toDate?.()

            ? data.timestamp
                .toDate()
                .toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })

            : 'Sending...';



        div.innerHTML = `
          <div class="sender">
            ${data.sender}
          </div>

          <div>
            ${data.text}
          </div>

          <div class="time">
            ${time}
          </div>
        `;



        messagesContainer.appendChild(div);

      });



      messagesContainer.scrollTop =
        messagesContainer.scrollHeight;

    });

}



/* =========================================
   QUIZ SYSTEM
========================================= */

quizOptions.forEach(option => {

  option.addEventListener('click', () => {

    const correct =
      option.dataset.correct;



    if (correct === 'true') {

      quizResult.innerText =
        'Correct Answer';

      quizResult.style.color =
        '#22c55e';

    }

    else {

      quizResult.innerText =
        'Wrong Answer';

      quizResult.style.color =
        '#ef4444';

    }

  });

});



/* =========================================
   CONTENT MODAL
========================================= */

const contentCards =
  document.querySelectorAll(
    '.news-card, .lesson-card'
  );



contentCards.forEach(card => {

  card.addEventListener('click', () => {

    modal.classList.add('active');

    modalTitle.innerText =
      card.dataset.title;

    modalText.innerText =
      card.dataset.content;

  });

});



/* =========================================
   CLOSE MODAL
========================================= */

closeModal.addEventListener('click', () => {

  modal.classList.remove('active');

});



window.addEventListener('click', (e) => {

  if (e.target === modal) {

    modal.classList.remove('active');

  }

});const messageInput =
  document.getElementById('messageInput');

const userButtons =
  document.querySelectorAll('.user-btn');

const quizOptions =
  document.querySelectorAll('.quiz-option');

const quizResult =
  document.getElementById('quizResult');

const modal =
  document.getElementById('contentModal');

const modalTitle =
  document.getElementById('modalTitle');

const modalText =
  document.getElementById('modalText');

const closeModal =
  document.getElementById('closeModal');



let currentRoom = '';
let currentUser = 'Adhi';

let unsubscribeMessages = null;



/* SEARCH */

searchBtn.addEventListener('click', () => {

  const value =
    searchInput.value
      .trim()
      .toLowerCase();


  // ADHI ROOM

  if (
    value.includes('adhi') ||
    value.includes('vishnu')
  ) {

    openChatRoom('adhi-room');

  }


  // VISVA ROOM

  else if (
    value.includes('visva') ||
    value.includes('nidharshana')
  ) {

    openChatRoom('visva-room');

  }

});



/* OPEN ROOM */

function openChatRoom(roomName) {

  currentRoom = roomName;


  // SWITCH PAGE

  homePage.classList.remove('active');

  chatPage.classList.add('active');


  // CLEAR SEARCH

  searchInput.value = '';


  // ROOM TITLE

  if (roomName === 'adhi-room') {

    roomTitle.innerText =
      'ADHI CHAT ROOM';

    currentUser = 'Adhi';

  }


  else if (roomName === 'visva-room') {

    roomTitle.innerText =
      'VISVA CHAT ROOM';

    currentUser = 'Visva';

  }


  // ACTIVE BUTTON

  userButtons.forEach(btn => {
    btn.classList.remove('active-user');
  });


  userButtons.forEach(btn => {

    if (
      btn.dataset.user === currentUser
    ) {

      btn.classList.add('active-user');

    }

  });


  loadMessages();

}



/* BACK */

backBtn.addEventListener('click', () => {

  chatPage.classList.remove('active');

  homePage.classList.add('active');

  searchInput.value = '';

});



/* USER SWITCH */

userButtons.forEach(button => {

  button.addEventListener('click', () => {

    const selectedUser =
      button.dataset.user;


    // ADHI ROOM USERS

    if (
      currentRoom === 'adhi-room' &&
      (
        selectedUser === 'Adhi' ||
        selectedUser === 'Vishnu'
      )
    ) {

      userButtons.forEach(btn => {
        btn.classList.remove('active-user');
      });

      button.classList.add('active-user');

      currentUser = selectedUser;

    }


    // VISVA ROOM USERS

    else if (
      currentRoom === 'visva-room' &&
      (
        selectedUser === 'Visva' ||
        selectedUser === 'Nidharshana'
      )
    ) {

      userButtons.forEach(btn => {
        btn.classList.remove('active-user');
      });

      button.classList.add('active-user');

      currentUser = selectedUser;

    }

  });

});



/* SEND MESSAGE */

sendBtn.addEventListener(
  'click',
  sendMessage
);


messageInput.addEventListener(
  'keypress',
  (e) => {

    if (e.key === 'Enter') {
      sendMessage();
    }

  }
);



async function sendMessage() {

  const text =
    messageInput.value.trim();

  if (!text || !currentRoom) return;


  await addDoc(

    collection(
      db,
      'chatrooms',
      currentRoom,
      'messages'
    ),

    {
      sender: currentUser,
      text: text,
      timestamp: serverTimestamp()
    }

  );


  messageInput.value = '';

}



/* LOAD MESSAGES */

function loadMessages() {


  if (unsubscribeMessages) {
    unsubscribeMessages();
  }


  const q = query(

    collection(
      db,
      'chatrooms',
      currentRoom,
      'messages'
    ),

    orderBy('timestamp', 'asc')

  );


  unsubscribeMessages =
    onSnapshot(q, (snapshot) => {

      messagesContainer.innerHTML = '';


      snapshot.forEach((doc) => {

        const data = doc.data();

        const div =
          document.createElement('div');

        div.classList.add('message');


        if (
          data.sender === currentUser
        ) {

          div.classList.add('self');

        }

        else {

          div.classList.add('other');

        }


        const time =
          data.timestamp?.toDate?.()

            ? data.timestamp
                .toDate()
                .toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })

            : 'Sending...';


        div.innerHTML = `
          <div class="sender">
            ${data.sender}
          </div>

          <div>
            ${data.text}
          </div>

          <div class="time">
            ${time}
          </div>
        `;


        messagesContainer.appendChild(div);

      });


      messagesContainer.scrollTop =
        messagesContainer.scrollHeight;

    });

}



/* QUIZ */

quizOptions.forEach(option => {

  option.addEventListener('click', () => {

    const correct =
      option.dataset.correct;


    if (correct === 'true') {

      quizResult.innerText =
        'Correct Answer';

      quizResult.style.color =
        '#22c55e';

    }

    else {

      quizResult.innerText =
        'Wrong Answer';

      quizResult.style.color =
        '#ef4444';

    }

  });

});



/* CONTENT MODAL */

const contentCards =
  document.querySelectorAll(
    '.news-card, .lesson-card'
  );


contentCards.forEach(card => {

  card.addEventListener('click', () => {

    modal.classList.add('active');

    modalTitle.innerText =
      card.dataset.title;

    modalText.innerText =
      card.dataset.content;

  });

});



/* CLOSE MODAL */

closeModal.addEventListener('click', () => {

  modal.classList.remove('active');

});


window.addEventListener('click', (e) => {

  if (e.target === modal) {

    modal.classList.remove('active');

  }

});
