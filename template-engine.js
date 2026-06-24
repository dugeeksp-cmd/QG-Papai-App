/**
 * ==========================================================================
 * TEMPLATE-ENGINE.JS - Motor de Renderização de Perfil Único Dinâmico
 * ==========================================================================
 * QG do Papai • Versão: 4.0
 */

// 1. MAPEAMENTO DE PERFIS E VARIÁVEIS DE TEMA
const PROFILE_REGISTRY = {
  papai: {
    id: "papai",
    name: "Papai",
    role: "👑 ADMIN",
    defaultAvatar: "bull_portrait.png",
    hasLockscreen: false,
    correctPin: "",
    theme: {
      primary: "#FFE800",
      secondary: "#C55301",
      dark: "#121212",
      border: "#FFD700",
      bg: "linear-gradient(135deg, #242424 0%, #121212 100%)",
      glow: "0 0 15px rgba(255, 215, 0, 0.4)"
    },
    pins: [
      { img: "imagens/emoj_papai/ts_alien_pin.png", alt: "Alien" },
      { img: "imagens/emoj_papai/pin_toy_story_zurg.png", alt: "Zurg" }
    ],
    tag: "#PAPAI-QG"
  },
  miguel: {
    id: "miguel",
    name: "Miguel",
    role: "⚡ GUERREIRO",
    defaultAvatar: "fang_portrait.png",
    hasLockscreen: true,
    correctPin: "123456",
    theme: {
      primary: "#0076FF",
      secondary: "#FF8500",
      dark: "#0a1b2d",
      border: "#00b0ff",
      bg: "linear-gradient(135deg, #0f3d79 0%, #061122 100%)",
      glow: "0 0 15px rgba(0, 176, 255, 0.4)"
    },
    pins: [
      { img: "imagens/emoj_miguel/fang_happy_pin.png", alt: "Fang Feliz" },
      { img: "imagens/emoj_miguel/fang_sad_pin.png", alt: "Fang Triste" }
    ],
    tag: "#MIGUEL-QG"
  },
  sophia: {
    id: "sophia",
    name: "Sophia",
    role: "🦄 PRINCESA",
    defaultAvatar: "penny_portrait.png",
    hasLockscreen: true,
    correctPin: "654321",
    theme: {
      primary: "#FF2E93",
      secondary: "#B12EFF",
      dark: "#220930",
      border: "#ff76be",
      bg: "linear-gradient(135deg, #4f1165 0%, #1e052c 100%)",
      glow: "0 0 15px rgba(255, 118, 190, 0.4)"
    },
    pins: [
      { img: "imagens/emoj_sophia/emoji_penny_happy.png", alt: "Penny Feliz" },
      { img: "imagens/emoj_sophia/emoji_penny_sad.png", alt: "Penny Triste" }
    ],
    tag: "#SOPHIA-QG"
  }
};

const DEFAULT_PORTRAITS = [
  'fang_portrait.png',
  'penny_portrait.png',
  'leon_portrait.png',
  'colt_portrait.png',
  'shelly_portrait.png',
  'spike_portrait.png',
  'crow_portrait.png',
  'mortis_portrait.png',
  'bull_portrait.png',
  'el_primo_portrait.png'
];

// Estado global do perfil ativo
let activeProfile = PROFILE_REGISTRY.papai;
let typedPin = "";
let playerProfileState = null;

// Inicializa sons
const clickSound = document.getElementById('audio-click');
const msgSound = document.getElementById('audio-msg');
const unlockSound = document.getElementById('audio-unlock');

function playClick() {
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play().catch(err => console.log('Sons click bloqueado:', err));
  }
}

function playMsg() {
  if (msgSound) {
    msgSound.currentTime = 0;
    msgSound.play().catch(err => console.log('Sons msg bloqueado:', err));
  }
}

function playUnlock() {
  if (unlockSound) {
    unlockSound.currentTime = 0;
    unlockSound.play().catch(err => console.log('Sons unlock bloqueado:', err));
  }
}

// 2. BOOTSTRAP DINÂMICO
window.addEventListener('load', () => {
  // Lógica de Redirecionamento de URL / Parâmetro
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get('id') || 'papai';
  
  if (PROFILE_REGISTRY[profileId]) {
    activeProfile = PROFILE_REGISTRY[profileId];
  } else {
    activeProfile = PROFILE_REGISTRY.papai;
  }
  
  console.log(`🛠️ [QG-ENGINE] Renderizando perfil unificado para: "${activeProfile.name}"`);

  // Aplica cores dinâmicas no :root
  applyThemeStyles(activeProfile.theme);

  // Define canal de chat padrão de início
  window.currentChannel = 'Familia';

  // Configuração inicial de interface
  configureInterface(activeProfile);

  // Carrega rodapé modular
  loadModularFooter();
});

// Aplica as variáveis CSS
function applyThemeStyles(theme) {
  const root = document.documentElement;
  root.style.setProperty('--user-theme-primary', theme.primary);
  root.style.setProperty('--user-theme-secondary', theme.secondary);
  root.style.setProperty('--user-theme-dark', theme.dark);
  root.style.setProperty('--user-theme-border', theme.border);
  root.style.setProperty('--user-theme-bg', theme.bg);
  root.style.setProperty('--user-theme-glow', theme.glow);
}

// Configura elementos visuais do DOM conforme o perfil
function configureInterface(profile) {
  // Configura a tela de bloqueio (se possuir)
  const lockscreen = document.getElementById('lockscreen');
  const mainContent = document.getElementById('main-content');
  
  if (profile.hasLockscreen) {
    lockscreen.classList.remove('hidden');
    lockscreen.classList.add('flex');
    mainContent.classList.add('hidden');
    
    // Configura infos da tela de bloqueio
    document.getElementById('lock-profile-avatar').src = "imagens/perfil/" + profile.defaultAvatar;
    document.getElementById('lock-title-name').innerText = "Entrada do " + profile.name;
    document.getElementById('lock-hint-text').innerText = "Dica Familiar: " + profile.correctPin;
    clearLockPin();
  } else {
    lockscreen.classList.add('hidden');
    lockscreen.classList.remove('flex');
    mainContent.classList.remove('hidden');
  }

  // Define títulos e textos da Barra Superior
  document.getElementById('header-emoji-indicator').innerText = profile.id === 'papai' ? "👑" : (profile.id === 'miguel' ? "🦈⚡" : "🦄✨");
  document.getElementById('header-title-text').innerText = profile.id === 'papai' ? "Painel Administrador" : "Sala da " + profile.name;
  
  if (profile.id === 'papai') {
    document.getElementById('admin-section').classList.remove('hidden');
    document.getElementById('child-section').classList.add('hidden');
    
    // Configura o link do meet do papai
    const savedLink = localStorage.getItem('qg_meet_link') || "https://meet.google.com/abc-defg-hij";
    document.getElementById('meet-input').value = savedLink;
    
    const savedMeetActive = localStorage.getItem('qg_meet_active') === 'true';
    const meetBtn = document.getElementById('meet-btn');
    if (savedMeetActive) {
      meetBtn.innerText = "🔴 DESATIVAR MEET NO QG";
      meetBtn.className = "brawl-btn-red w-full font-brawl py-2.5 text-xs text-center uppercase tracking-wider";
    }
  } else {
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('child-section').classList.remove('hidden');
    
    // Configura perfil do guerreiro
    loadAndApplyChildProfile(profile);
  }

  // Configura os pins de chat temáticos do perfil
  renderProfilePins(profile);

  // Configura a visibilidade do botão de limpar chat (apenas Admin/Papai)
  const clearChatBtn = document.getElementById('clear-chat-btn');
  if (clearChatBtn) {
    if (profile.id === 'papai') {
      clearChatBtn.classList.remove('hidden');
    } else {
      clearChatBtn.classList.add('hidden');
    }
  }

  // Verifica ativação inicial do Meet Familiar para as crianças
  checkMeetIndicator();
}

// 3. TELA DE BLOQUEIO (PIN VIRTUAL)
window.pressLockNum = function(num) {
  playClick();
  if (typedPin.length < 6) {
    typedPin += num;
    updatePinSlots();
  }
  
  if (typedPin.length === 6) {
    // Validação automática ao atingir 6 dígitos para conforto
    setTimeout(confirmLockPin, 150);
  }
};

window.clearLockPin = function() {
  playClick();
  typedPin = "";
  updatePinSlots();
  document.getElementById('lock-error-text').innerText = "Dica Familiar: " + activeProfile.correctPin;
  document.getElementById('lock-error-text').className = "text-center text-[10px] text-blue-400 font-mono tracking-wider bg-black/40 py-1.5 rounded-lg border border-blue-900/40 mb-4 uppercase";
};

function updatePinSlots() {
  for (let i = 0; i < 6; i++) {
    const slot = document.getElementById(`slot-${i}`);
    if (slot) {
      if (i < typedPin.length) {
        slot.innerText = typedPin[i];
        slot.classList.add('filled');
      } else {
        slot.innerText = "•";
        slot.classList.remove('filled');
      }
    }
  }
}

window.confirmLockPin = function() {
  if (typedPin === activeProfile.correctPin) {
    playUnlock();
    
    // Animação de sucesso
    const lockBox = document.querySelector('#lockscreen .brawl-card');
    if (lockBox) {
      lockBox.classList.add('scale-95', 'opacity-0', 'transition-all', 'duration-300');
    }
    
    setTimeout(() => {
      document.getElementById('lockscreen').classList.add('hidden');
      document.getElementById('lockscreen').classList.remove('flex');
      document.getElementById('main-content').classList.remove('hidden');
    }, 250);
  } else {
    // Som e mensagem de erro
    playClick();
    const errorText = document.getElementById('lock-error-text');
    errorText.innerText = "🚨 PIN INCORRETO! TENTE DE NOVO!";
    errorText.className = "text-center text-[10px] text-red-500 font-mono tracking-wider bg-red-950/40 py-1.5 rounded-lg border border-red-500/40 mb-4 uppercase animate-pulse";
    
    // Limpa teclado virtual
    typedPin = "";
    setTimeout(updatePinSlots, 600);
  }
};

// 4. LÓGICA DE BATTLE CARD E CUSTOMIZAÇÃO DAS CRIANÇAS
function loadAndApplyChildProfile(profile) {
  const storageKey = `qg_${profile.id}_profile`;
  const saved = localStorage.getItem(storageKey);
  
  if (saved) {
    playerProfileState = JSON.parse(saved);
  } else {
    playerProfileState = {
      nickname: profile.name,
      avatar: profile.defaultAvatar,
      bgRank: profile.id === 'miguel' ? 'diamond' : 'mythic',
      trophies: profile.id === 'miguel' ? 19420 : 15230,
      level: profile.id === 'miguel' ? 78 : 65
    };
  }

  applyProfileChangesToUI();
  renderAvatarSelectors();
}

function applyProfileChangesToUI() {
  if (!playerProfileState) return;
  
  // 1. Nickname e Tags
  document.getElementById('card-name-val').innerText = playerProfileState.nickname;
  document.getElementById('input-nickname').value = playerProfileState.nickname;
  document.getElementById('card-tag-val').innerText = "TAG: #" + activeProfile.id.toUpperCase() + "-QG";
  
  // 2. Avatar
  document.getElementById('card-avatar-img').src = "imagens/perfil/" + playerProfileState.avatar;
  
  // 3. Troféus e Barra de Progresso
  document.getElementById('card-trophies-val').innerText = "🏆 " + Number(playerProfileState.trophies).toLocaleString('pt-BR');
  document.getElementById('status-trophies-text').innerText = (playerProfileState.trophies / 1000).toFixed(1) + "k";
  
  const progressPercent = Math.min(100, Math.max(10, (playerProfileState.trophies % 10000) / 100));
  document.getElementById('trophy-progress').style.width = progressPercent + "%";
  
  // 4. Nível
  document.getElementById('card-level-val').innerText = playerProfileState.level;
  const modalLevel = document.getElementById('card-level-val-modal');
  if (modalLevel) {
    modalLevel.innerText = playerProfileState.level;
  }
  
  // 5. Título de Aliança
  const titleVal = document.getElementById('card-alliance-title');
  if (titleVal) {
    titleVal.innerText = activeProfile.id === 'miguel' ? "GUERREIRO LENDA" : "PRINCESA UNI";
  }

  // 6. Background do Battle Card
  const displayCard = document.getElementById('battle-card-display');
  if (displayCard) {
    displayCard.className = `brawl-battle-card p-5 flex flex-col justify-between h-72 relative z-10 w-full bg-rank-${playerProfileState.bgRank}`;
  }

  // 7. Opção de Fundo Ativo no Modal
  document.querySelectorAll('.brawl-bg-option').forEach(btn => btn.classList.remove('active'));
  const activeBgBtn = document.getElementById('bg-' + playerProfileState.bgRank);
  if (activeBgBtn) {
    activeBgBtn.classList.add('active');
  }
}

function saveProfileToStorage() {
  if (playerProfileState) {
    const storageKey = `qg_${activeProfile.id}_profile`;
    localStorage.setItem(storageKey, JSON.stringify(playerProfileState));
  }
}

// Funções de ajuste do Modal de Customização
window.tuneTrophies = function(amount) {
  playClick();
  playerProfileState.trophies = Math.max(0, playerProfileState.trophies + amount);
  saveProfileToStorage();
  applyProfileChangesToUI();
};

window.tuneLevel = function(amount) {
  playClick();
  playerProfileState.level = Math.max(1, playerProfileState.level + amount);
  saveProfileToStorage();
  applyProfileChangesToUI();
};

window.updateNickname = function(value) {
  playerProfileState.nickname = value.trim() || activeProfile.name;
  saveProfileToStorage();
  applyProfileChangesToUI();
};

window.selectBattleCardBg = function(rankKey, bgPath) {
  playClick();
  playerProfileState.bgRank = rankKey;
  saveProfileToStorage();
  applyProfileChangesToUI();
};

// Renderizadores de avatares do modal
function renderAvatarSelectors() {
  const grid = document.getElementById('avatar-selector-grid');
  if (!grid) return;
  grid.innerHTML = '';
  
  DEFAULT_PORTRAITS.forEach(portrait => {
    const optionBtn = document.createElement('button');
    optionBtn.className = "brawl-avatar-option " + (playerProfileState.avatar === portrait ? "active" : "");
    optionBtn.style.position = "relative";
    
    optionBtn.innerHTML = `
      <img src="imagens/perfil/${portrait}" alt="${portrait}" class="w-full h-full object-cover">
    `;
    
    optionBtn.onclick = () => {
      playClick();
      document.querySelectorAll('.brawl-avatar-option').forEach(b => b.classList.remove('active'));
      optionBtn.classList.add('active');
      
      playerProfileState.avatar = portrait;
      saveProfileToStorage();
      applyProfileChangesToUI();
    };
    
    grid.appendChild(optionBtn);
  });
}

// 5. SEÇÃO DO PAPAI (GOOGLE MEET & GERENCIAMENTO)
window.saveMeetLink = function() {
  playClick();
  const link = document.getElementById('meet-input').value;
  localStorage.setItem('qg_meet_link', link);
  
  playMsg();
  alert('Link do Meet Familiar salvo com sucesso! 🛡️🏆');
};

window.toggleActiveMeet = function() {
  playClick();
  const meetBtn = document.getElementById('meet-btn');
  const isCurrentlyActive = localStorage.getItem('qg_meet_active') === 'true';
  
  if (isCurrentlyActive) {
    localStorage.setItem('qg_meet_active', 'false');
    meetBtn.innerText = "🎮 ATIVAR MEET NO QG";
    meetBtn.className = "brawl-btn-green w-full font-brawl py-2.5 text-xs text-center uppercase tracking-wider";
  } else {
    localStorage.setItem('qg_meet_active', 'true');
    meetBtn.innerText = "🔴 DESATIVAR MEET NO QG";
    meetBtn.className = "brawl-btn-red w-full font-brawl py-2.5 text-xs text-center uppercase tracking-wider";
    
    // Notifica no chat feed de forma automatizada
    if (typeof addSystemMessage === 'function') {
      addSystemMessage("Papai (Admin) ativou o Google Meet Familiar! Clique no botão superior das suas telas para entrar na transmissão! 🎥✨");
    }
  }
};

// 6. CHAT COM ABAS MODULAR E PERSISTENTE
window.switchTab = function(channelId) {
  playClick();
  window.currentChannel = channelId;

  const tabs = ['Familia', 'Miguel', 'Sophia'];
  tabs.forEach(tab => {
    const btn = document.getElementById('tab-' + tab);
    if (btn) {
      btn.className = "brawl-tab";
      if (tab === channelId) {
        if (tab === 'Familia') btn.className = "brawl-tab active-familia";
        else if (tab === 'Miguel') btn.className = "brawl-tab active-miguel";
        else btn.className = "brawl-tab active-sophia";
      }
    }
  });

  // Atualiza título do canal ativo do chat box
  const channelTitle = document.getElementById('channel-name-title');
  if (channelTitle) {
    if (channelId === 'Familia') {
      channelTitle.innerText = "👪 FAMÍLIA (Todas as frentes integradas)";
    } else if (channelId === 'Miguel') {
      channelTitle.innerText = "🦈 CANAL DO MIGUEL (Foco em táticas)";
    } else {
      channelTitle.innerText = "🦄 CANAL DA SOPHIA (Brilho e Missões)";
    }
  }

  const feed = document.getElementById('chat-feed');
  if (feed) feed.innerHTML = '';
};

// Vincula switchChannel como alias de switchTab para compatibilidade com o interceptador de Firebase
window.switchChannel = window.switchTab;

// Renderiza a gaveta de pins temáticos
function renderProfilePins(profile) {
  const container = document.getElementById('profile-specific-pins');
  if (!container) return;
  container.innerHTML = '';

  profile.pins.forEach(pin => {
    const btn = document.createElement('button');
    btn.className = "hover:scale-110 active:scale-95 transition-transform p-1.5 bg-black/40 rounded border border-amber-500/30 flex items-center justify-center";
    btn.onclick = () => sendPin(pin.img);
    btn.innerHTML = `<img src="${pin.img}" alt="${pin.alt}" class="w-10 h-10 object-contain mx-auto" onerror="this.src='', this.className='hidden'">`;
    container.appendChild(btn);
  });
}

// 7. ENVIAR PIN, EMOJI OU MENSAGEM
window.toggleEmojiDrawer = function() {
  playClick();
  const drawer = document.getElementById('emoji-drawer');
  if (drawer) drawer.classList.toggle('hidden');
};

window.insertEmoji = function(emoj) {
  playClick();
  const input = document.getElementById('chat-input');
  if (input) {
    input.value += emoj;
    input.focus();
  }
  const drawer = document.getElementById('emoji-drawer');
  if (drawer) drawer.classList.add('hidden');
};

window.sendPin = function(pinPath) {
  playClick();
  const drawer = document.getElementById('emoji-drawer');
  if (drawer) drawer.classList.add('hidden');

  if (typeof window.firebaseSendPin === 'function') {
    window.firebaseSendPin(pinPath);
  } else {
    console.error("❌ [CHAT] FirebaseSendPin não carregada.");
    alert("O chat em tempo real ainda está carregando. Por favor, aguarde alguns instantes!");
  }
};

window.sendMessage = function() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  if (typeof window.firebaseSendMessage === 'function') {
    window.firebaseSendMessage(text);
    input.value = '';
    input.focus();
  } else {
    console.error("❌ [CHAT] FirebaseSendMessage não carregada.");
    alert("O chat em tempo real ainda está carregando. Por favor, aguarde alguns instantes!");
  }
};

window.handleKeyDown = function(event) {
  if (event.key === 'Enter' || event.keyCode === 13) {
    sendMessage();
  }
};

window.scrollToBottom = function() {
  const feed = document.getElementById('chat-feed');
  if (feed) {
    feed.scrollTop = feed.scrollHeight;
  }
};

window.appendMessageUI = function(msg) {
  const feed = document.getElementById('chat-feed');
  if (!feed) return;
  
  const bubble = document.createElement('div');
  
  // Identifica se a mensagem é minha de forma robusta
  const myName = activeProfile.id === 'papai' ? 'Papai' : (activeProfile.id === 'miguel' ? 'Miguel' : 'Sophia');
  const isMe = msg.sender.toLowerCase().includes(myName.toLowerCase()) || msg.sender.toLowerCase().includes("você");
  
  bubble.className = "msg-bubble " + (isMe ? "sent-by-user" : "received");

  const headerColorClass = isMe ? "text-slate-800" : (msg.sender.includes("Papai") ? "text-yellow-400" : (msg.sender.includes("Miguel") ? "text-cyan-400" : "text-pink-400"));
  const avatarSrc = msg.avatarFile ? (msg.avatarFile.startsWith("imagens/") ? msg.avatarFile : "imagens/perfil/" + msg.avatarFile) : "imagens/perfil/bull_portrait.png";

  let bodyHtml = `
    <div class="msg-wrapper">
      <div class="msg-avatar-container">
        <img src="${avatarSrc}" class="msg-avatar" onerror="this.src='imagens/perfil/bull_portrait.png'">
      </div>
      <div class="msg-content-container">
        <p class="msg-header ${headerColorClass}">
          <span class="msg-sender">${msg.sender} <span class="msg-role">(${msg.senderRole})</span></span>
          <span class="msg-time">${msg.timestamp}</span>
        </p>
  `;

  if (msg.isPin) {
    const fallbackPin = activeProfile.id === 'papai' ? 'imagens/emoj_papai/ts_alien_pin.png' : (activeProfile.id === 'miguel' ? 'imagens/emoj_miguel/fang_happy_pin.png' : 'imagens/emoj_sophia/emoji_penny_happy.png');
    bodyHtml += `
        <div class="msg-body msg-pin">
          <img src="${msg.text}" alt="pin" class="pin-img animate-bounce" onerror="this.src='${fallbackPin}'">
        </div>
      </div>
    </div>
    `;
  } else {
    bodyHtml += `
        <div class="msg-body text-content">
          <span>${msg.text}</span>
        </div>
      </div>
    </div>
    `;
  }

  bubble.innerHTML = bodyHtml;
  feed.appendChild(bubble);
};

window.addSystemMessage = function(text) {
  const now = new Date();
  const timestampStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  const newMsg = {
    id: Date.now(),
    sender: activeProfile.id === 'papai' ? "Papai (Admin)" : activeProfile.name,
    senderRole: activeProfile.role,
    avatarFile: playerProfileState ? playerProfileState.avatar : activeProfile.defaultAvatar,
    text: text,
    timestamp: timestampStr,
    isPin: false
  };

  if (typeof window.appendMessageUI === 'function') {
    window.appendMessageUI(newMsg);
  }
  window.scrollToBottom();
  playMsg();
};

window.clearChatHistory = function() {
  playClick();
  if (typeof window.firebaseClearChatHistory === 'function') {
    window.firebaseClearChatHistory();
  } else {
    console.error("❌ [CHAT] FirebaseClearChatHistory não carregada.");
  }
};

// 8. ALERTAS E CHAMADOS RÁPIDOS (BOTÃO CHAMAR PAPAI)
window.chamarPapai = function() {
  playClick();
  const alertaTxt = `🚨 [ALERTA] ${activeProfile.name} está precisando do Papai na Arena de Combate! Compareça imediatamente! 🚨`;
  
  if (typeof window.firebaseSendMessage === 'function') {
    window.firebaseSendMessage(alertaTxt);
  } else {
    addSystemMessage(alertaTxt);
  }
};

// 9. REUNIÕES EM TEMPO REAL (MEET FAMILIAR)
function checkMeetIndicator() {
  const isMeetActive = localStorage.getItem('qg_meet_active') === 'true';
  const savedLink = localStorage.getItem('qg_meet_link') || "https://meet.google.com/abc-defg-hij";
  
  const indicatorBtn = document.getElementById('meet-indicator-btn');
  const chatMeetBtn = document.getElementById('chat-meet-btn');
  
  if (indicatorBtn) {
    if (isMeetActive && activeProfile.id !== 'papai') {
      indicatorBtn.href = savedLink;
      indicatorBtn.classList.remove('hidden');
    } else {
      indicatorBtn.classList.add('hidden');
    }
  }

  if (chatMeetBtn) {
    if (isMeetActive) {
      chatMeetBtn.href = savedLink;
      chatMeetBtn.style.display = "flex";
    } else {
      chatMeetBtn.style.display = "none";
    }
  }
}

// Sincronizador periódico de ativação de meet para os brawlers
setInterval(checkMeetIndicator, 3000);

// Sair do perfil e deslogar
window.logoutProfile = function() {
  playClick();
  window.location.href = "index.html";
};

// Interface do Modal de Opções
window.openOptionsModal = function() {
  playClick();
  const modal = document.getElementById('options-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.closeOptionsModal = function() {
  playClick();
  const modal = document.getElementById('options-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

// 10. CARGA DO RODAPÉ MODULAR (CONSERVAÇÃO DO PORTFÓLIO)
function loadModularFooter() {
  const footerContainer = document.getElementById('modular-footer-container');
  if (!footerContainer) return;

  fetch('rodape.html')
    .then(response => {
      if (response.ok) return response.text();
      throw new Error("Erro de fetch no rodape.html");
    })
    .then(html => {
      footerContainer.innerHTML = html;
    })
    .catch(err => {
      console.warn("⚠️ [QG-ENGINE] Falha ao carregar rodape.html dinamicamente, exibindo fallback local.", err);
      footerContainer.innerHTML = `
        <div class="mt-8 py-4 text-center text-xs text-white/40">
          👑 QG DO PAPAI • Brawl Stars Theme © 2026 • Versão: 4.0
        </div>
      `;
    });
}
