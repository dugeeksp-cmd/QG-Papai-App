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
// CONFIGURAÇÃO DO FIREBASE (Credenciais Reais)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAO3qqELF_jHslv-anqm61eAWNQweVS344",
  authDomain: "qg-do-papai.firebaseapp.com",
  projectId: "qg-do-papai",
  storageBucket: "qg-do-papai.firebasestorage.app",
  messagingSenderId: "609985408753",
  appId: "1:609985408753:web:651ddf39b97b9a2be30350",
  measurementId: "G-PF4RMS3SSF"
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
    console.error("Falha ao inicializar o Firebase:", e);
  }
} else {
  console.log("ℹ️ Firebase operando com Fallback Local.");
}

// Estágio e canal ativo nas páginas
const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'papai';

// Mapeador de Remetentes do Clã para as bolhas de chat estilizadas
const mapSender = (senderName) => {
  const nameLower = (senderName || "").toLowerCase();
  if (nameLower.includes('papai')) {
    return {
      sender: "Papai (Admin)",
      senderRole: "👑 ADMIN",
      avatarFile: "bull_portrait.png"
    };
  } else if (nameLower.includes('miguel')) {
    return {
      sender: "Miguel",
      senderRole: "⚡ JOGADOR",
      avatarFile: "fang_portrait.png"
    };
  } else if (nameLower.includes('sophia')) {
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

// Obter canal ativo com segurança absoluta (prevenindo undefined)
function getActiveChannel() {
  const ch = window.currentChannel || 'Familia';
  return ch === 'Familia' ? 'geral' : ch.toLowerCase();
}

// Exposição do estado de ativação do Firebase para as páginas locais
window.firebaseService = {
  isFirebaseEnabled: isFirebaseEnabled,
  db: db,
  pageName: pageName
};

// ==========================================
// LOCAL STORAGE FALLBACK ENGINE
// ==========================================
const localSandbox = {
  getMessages: (canal) => {
    return JSON.parse(localStorage.getItem(`qg_local_${canal}`)) || [];
  },
  saveMessage: (canal, remetente, tipo, conteudo) => {
    const list = localSandbox.getMessages(canal);
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
    list.push(newMsg);
    localStorage.setItem(`qg_local_${canal}`, JSON.stringify(list));
    return newMsg;
  },
  clear: (canal) => {
    localStorage.removeItem(`qg_local_${canal}`);
  }
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
    // Modo de fallback local
    const offlineMsgs = localSandbox.getMessages(canalName);
    offlineMsgs.forEach(msg => {
      if (typeof appendMessageUI === 'function') appendMessageUI(msg);
    });
    if (typeof scrollToBottom === 'function') scrollToBottom();
    return;
  }

  try {
    const q = query(
      collection(db, "mensagens"),
      where("canal", "==", canalName),
      orderBy("timestamp", "asc")
    );

    let isInitial = true;

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
        // Chama a função global presente na página local correspondente
        if (typeof appendMessageUI === 'function') {
          appendMessageUI(msgModel);
        }
      });
      if (typeof scrollToBottom === 'function') {
        scrollToBottom();
      }

      // Dispara o som 'sons/new_msg.ogg' sempre que uma nova mensagem de outro usuário aparecer em tempo real (incremental)
      if (!isInitial) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            const remetenteName = pageName === 'papai' ? 'Papai' : (pageName === 'miguel' ? 'Miguel' : 'Sophia');
            if (data.remetente && data.remetente.toLowerCase() !== remetenteName.toLowerCase()) {
              try {
                const audio = new Audio('sons/new_msg.ogg');
                audio.play().catch(e => console.log("Sound autoplay blocked:", e));
              } catch (audioErr) {
                console.warn("Erro ao tocar sons/new_msg.ogg:", audioErr);
              }
            }
          }
        });
      }
      isInitial = false;
    }, (error) => {
      console.warn("Erro de conexão ou privilégio no Firestore:", error);
    });
  } catch (err) {
    console.error("Falha ao escutar canal de chat no Firebase:", err);
  }
}

// ==========================================
// EXPOSIÇÃO DE MÉTODOS DE GRAVAÇÃO (Firebase)
// ==========================================

// Enviar Mensagem de Texto
window.firebaseSendMessage = async function(text) {
  const canalName = getActiveChannel();
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
      console.error("Erro ao enviar mensagem no Firebase:", e);
    }
  } else {
    const newLocalMsg = localSandbox.saveMessage(canalName, remetenteName, 'texto', text);
    if (typeof appendMessageUI === 'function') appendMessageUI(newLocalMsg);
    if (typeof scrollToBottom === 'function') scrollToBottom();
    if (typeof playMsg === 'function') playMsg();
  }
};

// Enviar Pin / Emoji animado
window.firebaseSendPin = async function(pinPath) {
  const canalName = getActiveChannel();
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
      console.error("Erro ao enviar pin no Firebase:", e);
    }
  } else {
    const newLocalMsg = localSandbox.saveMessage(canalName, remetenteName, 'pin', pinPath);
    if (typeof appendMessageUI === 'function') appendMessageUI(newLocalMsg);
    if (typeof scrollToBottom === 'function') scrollToBottom();
    if (typeof playMsg === 'function') playMsg();
  }
};

// Limpar Histórico do Canal Ativo
window.firebaseClearChatHistory = async function() {
  const canalName = getActiveChannel();
  
  if (isFirebaseEnabled) {
    if (confirm("Quer mesmo limpar o histórico desse canal no Firestore em tempo real?")) {
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
    }
  } else {
    if (confirm("Quer mesmo limpar o histórico desse canal local?")) {
      localSandbox.clear(canalName);
      const feed = document.getElementById('chat-feed');
      if (feed) feed.innerHTML = '';
      if (typeof playMsg === 'function') playMsg();
    }
  }
};

// ==========================================
// BOOTSTRAP E ASSINATURA DE EVENTOS
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  // Inicialização pós carregar DOM para ler variáveis do window
  setTimeout(() => {
    const startChannelName = getActiveChannel();
    listenToChannel(startChannelName);
    
    // Sobrescrever manipulador de alteração de canais na tela do Papai
    if (typeof window.switchTab === 'function') {
      const originalSwitchTab = window.switchTab;
      window.switchTab = function(channelId) {
        originalSwitchTab(channelId);
        listenToChannel(getActiveChannel());
      };
    }

    // Sobrescrever manipulador de alteração de canais na tela do Miguel e da Sophia
    if (typeof window.switchChannel === 'function') {
      const originalSwitchChannel = window.switchChannel;
      window.switchChannel = function(channelId) {
        originalSwitchChannel(channelId);
        listenToChannel(getActiveChannel());
      };
    }
  }, 150);
});
