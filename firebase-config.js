import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==========================================
// CONFIGURAÇÃO DO FIREBASE (Placeholders)
// ==========================================
// Substitua os placeholders abaixo pelas credenciais que você copiou do Console do Firebase.
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "QG_PAPAI_PROJETO.firebaseapp.com",
  projectId: "QG_PAPAI_PROJETO_ID",
  storageBucket: "QG_PAPAI_PROJETO.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Detecção dinâmica de suporte ativação real do Firebase
const isFirebaseEnabled = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "SUA_API_KEY_AQUI" && 
  !firebaseConfig.apiKey.startsWith("SUA_");

let app, db;
if (isFirebaseEnabled) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🔥 Firebase inicializado com sucesso e conectado em tempo real!");
  } catch (e) {
    console.error("Falha ao inicializar o Firebase. Verifique suas credenciais:", e);
  }
} else {
  console.log("ℹ️ Firebase operando com Fallback Local. Preencha as chaves no arquivo 'firebase-config.js' para conectar o banco de dados.");
}

// Estágio e canal ativo nas páginas
const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'papai';

// Mapeador de Remetentes do Clã para as bolhas de chat estilizadas
const mapSender = (senderName) => {
  const nameLower = senderName.toLowerCase();
  if (nameLower === 'papai') {
    return {
      sender: "Papai (Admin)",
      senderRole: "👑 ADMIN",
      avatarFile: "bull_portrait.png"
    };
  } else if (nameLower === 'miguel') {
    return {
      sender: "Miguel",
      senderRole: "⚡ JOGADOR",
      avatarFile: "fang_portrait.png"
    };
  } else if (nameLower === 'sophia') {
    return {
      sender: "Sophia",
      senderRole: "✨ REALEZA",
      avatarFile: "penny_portrait.png"
    };
  }
  return {
    sender: senderName,
    senderRole: "CONVIDADO",
    avatarFile: "penny_portrait.png"
  };
};

// Formatação amigável de horário
const formatTimeString = (timestamp) => {
  if (!timestamp) {
    const now = new Date();
    return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  }
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
};

// ==========================================
// LOCAL STORAGE FALLBACK ENGINE
// ==========================================
const getLocalStorageKey = (canal) => `qg_chat_offline_${canal}`;

const loadLocalStorageMessages = (channelId) => {
  const canalName = channelId === 'Familia' ? 'geral' : channelId.toLowerCase();
  const key = getLocalStorageKey(canalName);
  const saved = JSON.parse(localStorage.getItem(key)) || getDefaultOfflineMessages(canalName);
  
  const feed = document.getElementById('chat-feed');
  if (feed) feed.innerHTML = '';
  
  saved.forEach(msg => {
    appendMessageUI(msg);
  });
  scrollToBottom();
};

const saveLocalStorageMessage = (canalName, remetente, tipo, conteudo) => {
  const key = getLocalStorageKey(canalName);
  const saved = JSON.parse(localStorage.getItem(key)) || getDefaultOfflineMessages(canalName);
  
  const now = new Date();
  const timestampStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  
  const mapped = mapSender(remetente);
  const newMsg = {
    id: Date.now(),
    sender: mapped.sender,
    senderRole: mapped.senderRole,
    avatarFile: mapped.avatarFile,
    text: conteudo,
    timestamp: timestampStr,
    isPin: tipo === 'pin'
  };
  
  saved.push(newMsg);
  localStorage.setItem(key, JSON.stringify(saved));
  
  // Se for o canal visualizado, redesenha
  const activeCanal = window.currentChannel === 'Familia' ? 'geral' : window.currentChannel.toLowerCase();
  if (activeCanal === canalName) {
    appendMessageUI(newMsg);
    scrollToBottom();
  }
};

const clearLocalStorageMessages = (canalName) => {
  localStorage.removeItem(getLocalStorageKey(canalName));
  const feed = document.getElementById('chat-feed');
  if (feed) feed.innerHTML = '';
};

const getDefaultOfflineMessages = (canalName) => {
  if (canalName === 'geral') {
    return [
      {
        id: 1,
        sender: "Papai (Admin)",
        senderRole: "👑 ADMIN",
        avatarFile: "bull_portrait.png",
        text: "Bem-vindos ao QG do Papai! Conecte seu Firebase para tempo real total!",
        timestamp: "12:00",
        isPin: false
      }
    ];
  }
  return [];
};

// ==========================================
// REALTIME SUBSCRIBER ENGINE (Firestore)
// ==========================================
let chatUnsubscribe = null;

function listenToChannel(canalName) {
  if (chatUnsubscribe) {
    chatUnsubscribe();
    chatUnsubscribe = null;
  }

  const feed = document.getElementById('chat-feed');
  if (feed) {
    feed.innerHTML = '';
  }

  if (!isFirebaseEnabled) {
    loadLocalStorageMessages(window.currentChannel);
    return;
  }

  try {
    const q = query(
      collection(db, "mensagens"),
      where("canal", "==", canalName),
      orderBy("timestamp", "asc")
    );

    chatUnsubscribe = onSnapshot(q, (snapshot) => {
      if (feed) {
        feed.innerHTML = '';
      }
      snapshot.forEach((doc) => {
        const data = doc.data();
        const mapped = mapSender(data.remetente);
        const msgModel = {
          id: doc.id,
          sender: mapped.sender,
          senderRole: mapped.senderRole,
          avatarFile: mapped.avatarFile,
          text: data.conteúdo || data.conteudo,
          timestamp: formatTimeString(data.timestamp),
          isPin: data.tipo === 'pin'
        };
        appendMessageUI(msgModel);
      });
      scrollToBottom();
    }, (error) => {
      console.warn("Permissão de leitura ou erro de conexão no Firestore:", error);
    });
  } catch (err) {
    console.error("Falha ao criar escuta no canal:", err);
  }
}

// ==========================================
// HOOKS E OVERRIDES UNIVERSAIS
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  // Esperar o script da página inicial declarar as variáveis de canal
  setTimeout(() => {
    const currentCanal = window.currentChannel === 'Familia' ? 'geral' : window.currentChannel.toLowerCase();
    listenToChannel(currentCanal);
    
    // Sobrescreve botões de navegação/abas da página do Papai
    if (typeof window.switchTab === 'function') {
      const originalSwitchTab = window.switchTab;
      window.switchTab = function(channelId) {
        originalSwitchTab(channelId);
        listenToChannel(channelId === 'Familia' ? 'geral' : channelId.toLowerCase());
      };
    }

    // Sobrescreve botões de abas das páginas do Miguel e da Sophia
    if (typeof window.switchChannel === 'function') {
      const originalSwitchChannel = window.switchChannel;
      window.switchChannel = function(channelId) {
        originalSwitchChannel(channelId);
        listenToChannel(channelId === 'Familia' ? 'geral' : channelId.toLowerCase());
      };
    }
  }, 100);
});

// Sobrescreve envio de mensagem de texto
window.sendMessage = async function() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  if (typeof playClick === 'function') playClick();

  input.value = '';
  input.focus();

  const canalName = window.currentChannel === 'Familia' ? 'geral' : window.currentChannel.toLowerCase();
  const remetenteName = pageName === 'papai' ? 'Papai' : (pageName === 'miguel' ? 'Miguel' : 'Sophia');

  if (isFirebaseEnabled) {
    try {
      await addDoc(collection(db, "mensagens"), {
        canal: canalName,
        remetente: remetenteName,
        tipo: 'texto',
        conteúdo: text,
        timestamp: serverTimestamp()
      });
      if (typeof playMsg === 'function') playMsg();
    } catch (e) {
      console.error("Erro de persistência no Firebase:", e);
    }
  } else {
    saveLocalStorageMessage(canalName, remetenteName, 'texto', text);
    if (typeof playMsg === 'function') playMsg();
  }
};

// Sobrescreve envio de Pins
window.sendPin = async function(pinPath) {
  if (typeof playClick === 'function') playClick();
  const drawer = document.getElementById('emoji-drawer');
  if (drawer) {
    drawer.classList.add('hidden');
  }

  const canalName = window.currentChannel === 'Familia' ? 'geral' : window.currentChannel.toLowerCase();
  const remetenteName = pageName === 'papai' ? 'Papai' : (pageName === 'miguel' ? 'Miguel' : 'Sophia');

  if (isFirebaseEnabled) {
    try {
      await addDoc(collection(db, "mensagens"), {
        canal: canalName,
        remetente: remetenteName,
        tipo: 'pin',
        conteúdo: pinPath,
        timestamp: serverTimestamp()
      });
      if (typeof playMsg === 'function') playMsg();
    } catch (e) {
      console.error("Erro ao persistir pin no Firebase:", e);
    }
  } else {
    saveLocalStorageMessage(canalName, remetenteName, 'pin', pinPath);
    if (typeof playMsg === 'function') playMsg();
  }
};

// Sobrescreve limpeza do histórico
window.clearChatHistory = async function() {
  if (typeof playClick === 'function') playClick();
  if (confirm("Quer mesmo limpar o histórico desse canal?")) {
    const canalName = window.currentChannel === 'Familia' ? 'geral' : window.currentChannel.toLowerCase();
    
    if (isFirebaseEnabled) {
      try {
        const q = query(collection(db, "mensagens"), where("canal", "==", canalName));
        const querySnapshot = await getDocs(q);
        const deletePromises = [];
        querySnapshot.forEach((docSnapshot) => {
          deletePromises.push(deleteDoc(docSnapshot.ref));
        });
        await Promise.all(deletePromises);
        if (typeof playMsg === 'function') playMsg();
      } catch (err) {
        console.error("Erro ao limpar histórico no Firebase:", err);
      }
    } else {
      clearLocalStorageMessages(canalName);
      if (typeof playMsg === 'function') playMsg();
    }
  }
};
