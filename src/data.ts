import { Profile, Message } from './types';

// Pins/Emojis reais de cada usuário na pasta do servidor
export const USER_PINS = {
  papai: [
    'imagens/emoj_papai/ts_alien_pin.png',
    'imagens/emoj_papai/pin_toy_story_zurg.png'
  ],
  miguel: [
    'imagens/emoj_miguel/fang_happy_pin.png',
    'imagens/emoj_miguel/fang_sad_pin.png'
  ],
  sophia: [
    'imagens/emoj_sophia/emoji_penny_happy.png',
    'imagens/emoj_sophia/emoji_penny_sad.png'
  ],
  convidado: [
    'imagens/emoj_miguel/fang_happy_pin.png',
    'imagens/emoj_sophia/emoji_penny_happy.png'
  ]
};

// Perfis estáticos baseados no QG do Papai e do design de Brawl Stars
export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'papai',
    name: 'Papai (Admin)',
    role: 'Dono do QG 👑',
    themeClass: 'theme-papai',
    avatarIcon: '🔥',
    avatarFile: 'bull_portrait.png',
    bgCardFile: 'battle_card_gold.png',
    color: 'from-amber-600 via-yellow-500 to-amber-700',
    trophies: 28540,
    level: 150,
    status: 'Online'
  },
  {
    id: 'miguel',
    name: 'Miguel',
    role: 'Guerreiro Azul ⚡',
    themeClass: 'theme-miguel',
    avatarIcon: '🦈',
    avatarFile: 'fang_portrait.png',
    bgCardFile: 'battle_card_blue.png',
    color: 'from-blue-600 via-cyan-500 to-blue-800',
    passcode: '123456',
    trophies: 19420,
    level: 88,
    status: 'Online'
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Princesa Unicórnio 🦄',
    themeClass: 'theme-sophia',
    avatarIcon: '🌸',
    avatarFile: 'penny_portrait.png',
    bgCardFile: 'battle_card_pink.png',
    color: 'from-pink-600 via-fuchsia-400 to-purple-800',
    passcode: '654321',
    trophies: 16290,
    level: 72,
    status: 'Online'
  },
  {
    id: 'convidado',
    name: 'Convidado',
    role: 'Aliado Temporário 🎮',
    themeClass: 'theme-convidado',
    avatarIcon: '👾',
    avatarFile: 'colt_portrait.png',
    bgCardFile: 'battle_card_silver.png',
    color: 'from-slate-600 via-emerald-400 to-slate-800',
    trophies: 1200,
    level: 12,
    status: 'Offline'
  }
];

// Mensagens iniciais do chat divididos em abas/canais de comunicação
export const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Olá QG! Sejam muito bem-vindos ao sistema oficial do QG do Papai! Aqui nós mandamos no jogo! 🚀",
    sender: "Papai (Admin)",
    senderRole: "👑 ADMIN",
    avatarFile: 'imagens/perfil/bull_portrait.png',
    channel: "Família",
    timestamp: "10:15"
  },
  {
    id: 2,
    text: "E aí galera! Miguel na área. Brawl Stars liberado hoje mais tarde?",
    sender: "Miguel",
    senderRole: "⚡ JOGADOR",
    avatarFile: 'imagens/perfil/fang_portrait.png',
    channel: "Família",
    timestamp: "10:18"
  },
  {
    id: 3,
    text: "Oi gente! Amei o nosso chat. Papai, comprei roupas novas no jogo!",
    sender: "Sophia",
    senderRole: "🦄 JOGADORA",
    avatarFile: 'imagens/perfil/penny_portrait.png',
    channel: "Família",
    timestamp: "10:20"
  },
  {
    id: 4,
    text: "Miguel, você já arrumou os seus brinquedos no quarto antes de pedir recompensa?",
    sender: "Papai (Admin)",
    senderRole: "👑 ADMIN",
    avatarFile: 'imagens/perfil/bull_portrait.png',
    channel: "Miguel",
    timestamp: "10:35"
  },
  {
    id: 5,
    text: "Praticamente limpo, pai! Só falta guardar os brawlers que tavam no carpete.",
    sender: "Miguel",
    senderRole: "⚡ JOGADOR",
    avatarFile: 'imagens/perfil/fang_portrait.png',
    channel: "Miguel",
    timestamp: "10:38"
  },
  {
    id: 6,
    text: "Soso, tudo pronto por aí no paraíso dos doces?",
    sender: "Papai (Admin)",
    senderRole: "👑 ADMIN",
    avatarFile: 'imagens/perfil/bull_portrait.png',
    channel: "Sophia",
    timestamp: "10:41"
  },
  {
    id: 7,
    text: "Oi papai! Sim, terminei de ler a história todinha! 🎉",
    sender: "Sophia",
    senderRole: "🦄 JOGADORA",
    avatarFile: 'imagens/perfil/penny_portrait.png',
    channel: "Sophia",
    timestamp: "10:45"
  }
];
