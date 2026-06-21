// Tipos compartilhados do sistema QG do Papai
export interface Profile {
  id: string;
  name: string;
  role: string;
  themeClass: string;
  avatarIcon: string;
  avatarFile: string; // Nome do arquivo em imagens/perfil/ (Ex: bull_portrait.png)
  bgCardFile: string;  // Nome do arquivo em imagens/bg-perfil/ (Ex: battle_card_gold.png)
  color: string;
  passcode?: string;
  trophies: number;
  level: number;
  status: 'Online' | 'Offline';
}

export interface Message {
  id: number;
  text: string;
  sender: string;
  senderRole: string;
  avatarFile: string; // Caminho para renderizar no balão
  channel: 'Família' | 'Miguel' | 'Sophia';
  timestamp: string;
  isPin?: boolean; // Se a mensagem é um Pin/Emoji enviado
}
