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
// CONFIGURAÇÃO DO FIREBASE (Credenciais Oficiais)
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

console.log("🚀 [QG-FIREBASE] Carregando módulo firebase-config.js...");

// Inicialização exaustiva e direta
let app = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("🔥 [QG-FIREBASE] Inicializado com sucesso! Referência do Firestore (db) criada:", db);
} catch (e) {
  console.error("❌ [QG-FIREBASE] Erro ao inicializar o SDK do Firebase:", e);
}

// Estágio e canal ativo nas páginas
const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'papai';
console.log(`📱 [QG-FIREBASE] Identificado no contexto da página: "${pageName}"`);

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
    sender: senderName || "Visitante",
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

// Obter canal ativo com segurança absoluta
function getActiveChannel() {
  const ch = window.currentChannel || 'Familia';
  return ch === 'Familia' ? 'geral' : ch.toLowerCase();
}

// Exposição do estado de ativação do Firebase para uso das páginas locais
window.firebaseService = {
  isFirebaseEnabled: true, // Forçando estritamente ativo para remover fallbacks
  db: db,
  pageName: pageName
};

// ==========================================
// REALTIME SUBSCRIBER ENGINE (Firestore)
// ==========================================
let chatUnsubscribe = null;

function listenToChannel(canalName) {
  console.log(`📡 [QG-FIREBASE] Tentando assinar escuta em tempo real para o canal: "${canalName}"`);
  
  if (chatUnsubscribe) {
    console.log("🔄 [QG-FIREBASE] Removendo listener de canal antigo...");
    chatUnsubscribe();
    chatUnsubscribe = null;
  }

  const feed = document.getElementById('chat-feed');
  if (feed) {
    feed.innerHTML = '';
  }

  if (!db) {
    console.error("❌ [QG-FIREBASE] Não é possível assinar o canal: Objeto Firestore 'db' não está definido!");
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
      console.log(`📥 [QG-FIREBASE] Snapshot recebido! Ativos encontrados: ${snapshot.size} mensagens de chat no canal "${canalName}"`);
      
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
        
        // Chama a função global presente na página local correspondente para carregar a mensagem no chat-flow
        if (typeof appendMessageUI === 'function') {
          appendMessageUI(msgModel);
        }
      });
      
      if (typeof scrollToBottom === 'function') {
        scrollToBottom();
      }

      // Som para novas mensagens de outros remetentes
      if (!isInitial) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            const remetenteName = pageName === 'papai' ? 'Papai' : (pageName === 'miguel' ? 'Miguel' : 'Sophia');
            if (data.remetente && data.remetente.toLowerCase() !== remetenteName.toLowerCase()) {
              try {
                console.log(`🎵 [QG-FIREBASE] Nova mensagem de "${data.remetente}". Disparando som de notificação!`);
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
      console.error(`❌ [QG-FIREBASE - ERROR] Erro crítico na assinatura de snapshot para canal "${canalName}":`, error);
      alert(`Erro do Firebase Firestore: ${error.message}\nVerifique as regras de segurança e privilégios da coleção "mensagens" no Console do Firebase.`);
    });
  } catch (err) {
    console.error(`❌ [QG-FIREBASE - EXCEPTION] Erro geral ao registrar onSnapshot para "${canalName}":`, err);
  }
}

// ==========================================
// EXPOSIÇÃO DE MÉTODOS DE GRAVAÇÃO DIRETA NO FIRESTORE
// ==========================================

// Enviar Mensagem de Texto
window.firebaseSendMessage = async function(text) {
  const canalName = getActiveChannel();
  const remetenteName = pageName === 'papai' ? 'Papai' : (pageName === 'miguel' ? 'Miguel' : 'Sophia');

  console.log(`📤 [QG-FIREBASE] Enviando mensagem de texto para o canal "${canalName}"...`);
  console.log(`   - Conteúdo: "${text}" | Remetente: "${remetenteName}"`);

  if (!db) {
    console.error("❌ [QG-FIREBASE] Abortando envio: Firestore 'db' não inicializado.");
    alert("Firebase Firestore está offline ou desativado. Verifique os logs do console.");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "mensagens"), {
      canal: canalName,
      remetente: remetenteName,
      tipo: 'texto',
      conteúdo: text,
      conteudo: text, // duplicado para compatibilidade total de leitura
      timestamp: serverTimestamp()
    });
    console.log(`🎉 [QG-FIREBASE] Mensagem gravada com sucesso no Firestore! Documento ID:`, docRef.id);
    if (typeof playMsg === 'function') playMsg();
  } catch (e) {
    console.error("❌ [QG-FIREBASE - ERROR] Erro ao gravar mensagem no Firestore:", e);
    alert(`Falha ao salvar no Firestore: ${e.message}\nCertifique-se de que a coleção "mensagens" está criada no Console do Firebase.`);
  }
};

// Enviar Pin / Emoji animado
window.firebaseSendPin = async function(pinPath) {
  const canalName = getActiveChannel();
  const remetenteName = pageName === 'papai' ? 'Papai' : (pageName === 'miguel' ? 'Miguel' : 'Sophia');

  console.log(`📤 [QG-FIREBASE] Enviando PIN/Emoji para o canal "${canalName}"...`);
  console.log(`   - Caminho: "${pinPath}" | Remetente: "${remetenteName}"`);

  if (!db) {
    console.error("❌ [QG-FIREBASE] Abortando envio de PIN: Firestore 'db' não inicializado.");
    alert("Firebase Firestore está offline ou desativado. Verifique os logs.");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "mensagens"), {
      canal: canalName,
      remetente: remetenteName,
      tipo: 'pin',
      conteúdo: pinPath,
      conteudo: pinPath, // duplicado para compatibilidade total de leitura
      timestamp: serverTimestamp()
    });
    console.log(`🎉 [QG-FIREBASE] PIN gravado com sucesso no Firestore! Documento ID:`, docRef.id);
    if (typeof playMsg === 'function') playMsg();
  } catch (e) {
    console.error("❌ [QG-FIREBASE - ERROR] Erro ao gravar PIN no Firestore:", e);
    alert(`Falha ao salvar PIN no Firestore: ${e.message}`);
  }
};

// Limpar Histórico do Canal Ativo
window.firebaseClearChatHistory = async function() {
  const canalName = getActiveChannel();
  console.log(`🧹 [QG-FIREBASE] Solicitada limpeza de histórico no Firestore para o canal: "${canalName}"`);

  if (!db) {
    console.error("❌ [QG-FIREBASE] Abortando limpeza: Firestore 'db' não inicializado.");
    return;
  }

  if (confirm(`Tem certeza absoluta que deseja limpar TODAS as mensagens do canal "${canalName.toUpperCase()}" no Firestore em tempo real?`)) {
    try {
      const q = query(collection(db, "mensagens"), where("canal", "==", canalName));
      const querySnapshot = await getDocs(q);
      
      console.log(`🧹 [QG-FIREBASE] Encontradas ${querySnapshot.size} mensagens para remover.`);
      const deletePromises = [];
      querySnapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(docSnapshot.ref));
      });
      
      await Promise.all(deletePromises);
      console.log(`🎉 [QG-FIREBASE] Histórico do canal "${canalName}" limpo com sucesso!`);
      if (typeof playMsg === 'function') playMsg();
    } catch (err) {
      console.error("❌ [QG-FIREBASE - ERROR] Falha ao excluir documentos do Firestore:", err);
      alert(`Não foi possível limpar o histórico: ${err.message}`);
    }
  }
};

// ==========================================
// BOOTSTRAP E ASSINATURA DE EVENTOS
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  console.log("⏰ [QG-FIREBASE] DOMContentLoaded engatilhado. Aguardando inicialização dos scripts de canal local...");
  
  setTimeout(() => {
    const startChannelName = getActiveChannel();
    console.log(`🧩 [QG-FIREBASE] Iniciando primeira escuta com canal "${startChannelName}"`);
    listenToChannel(startChannelName);
    
    // Sobrescrever manipulador de alteração de canais na tela do Papai
    if (typeof window.switchTab === 'function') {
      const originalSwitchTab = window.switchTab;
      window.switchTab = function(channelId) {
        originalSwitchTab(channelId);
        listenToChannel(getActiveChannel());
      };
      console.log("✅ [QG-FIREBASE] Interceptador de 'switchTab' (Papai) registrado com sucesso.");
    }

    // Sobrescrever manipulador de alteração de canais na tela do Miguel
    if (typeof window.switchChannel === 'function') {
      const originalSwitchChannel = window.switchChannel;
      window.switchChannel = function(channelId) {
        originalSwitchChannel(channelId);
        listenToChannel(getActiveChannel());
      };
      console.log("✅ [QG-FIREBASE] Interceptador de 'switchChannel' (Miguel/Sophia) registrado com sucesso.");
    }
  }, 100);
});
