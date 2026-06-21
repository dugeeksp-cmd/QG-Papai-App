import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Volume2, MessageSquare, Key, Sparkles } from 'lucide-react';
import { Message } from '../types';
import { USER_PINS } from '../data';

interface BrawlChatComponentProps {
  activeUser: string;
  chatMessages: Message[];
  activeChatTab: 'Família' | 'Miguel' | 'Sophia';
  setActiveChatTab: (tab: 'Família' | 'Miguel' | 'Sophia') => void;
  messageInputText: string;
  setMessageInputText: (text: string) => void;
  onSendMessage: (text: string, isPin?: boolean) => void;
  themeSelector: string;
}

export default function BrawlChatComponent({
  activeUser,
  chatMessages,
  activeChatTab,
  setActiveChatTab,
  messageInputText,
  setMessageInputText,
  onSendMessage,
  themeSelector
}: BrawlChatComponentProps) {
  const [showEmojiDrawer, setShowEmojiDrawer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  // Referências para arquivos de som reais do seu servidor
  const audioNewMsgRef = useRef<HTMLAudioElement | null>(null);
  const audioClickRef = useRef<HTMLAudioElement | null>(null);

  // Rolagem automática
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChatTab]);

  // Função para tocar som real de nova mensagem
  const playNewMsgSound = () => {
    if (audioNewMsgRef.current) {
      audioNewMsgRef.current.currentTime = 0;
      audioNewMsgRef.current.play().catch(() => {});
    }
  };

  // Função para tocar som real de clique
  const playClickSound = () => {
    if (audioClickRef.current) {
      audioClickRef.current.currentTime = 0;
      audioClickRef.current.play().catch(() => {});
    }
  };

  // Mudar aba tocando som correspondente
  const handleTabChange = (tab: 'Família' | 'Miguel' | 'Sophia') => {
    playClickSound();
    playNewMsgSound();
    setActiveChatTab(tab);
  };

  const handleSendFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInputText.trim()) return;
    onSendMessage(messageInputText.trim(), false);
    playNewMsgSound();
    setMessageInputText('');
    setShowEmojiDrawer(false);
  };

  const handleSendPin = (pinUrl: string) => {
    playClickSound();
    onSendMessage(pinUrl, true);
    playNewMsgSound();
    setShowEmojiDrawer(false);
  };

  const currentPins = USER_PINS[activeUser as 'papai' | 'miguel' | 'sophia' | 'convidado'] || USER_PINS.convidado;

  // Filtra mensagens pelo canal correto
  const filteredMessages = chatMessages.filter(msg => msg.channel === activeChatTab);

  return (
    <div className="brawl-chat-box bg-black/60 p-4 border-4 border-black rounded-3xl flex flex-col h-[500px] relative overflow-visible mt-6">
      
      {/* Elementos HTML de Áudio Reais (sons do servidor) */}
      <audio ref={audioNewMsgRef} src="sons/new_msg.ogg" preload="auto" />
      <audio ref={audioClickRef} src="sons/menu_click_01.ogg" preload="auto" />

      {/* Título / Cabeçalho do Chat */}
      <div className="flex items-center justify-between border-b-2 border-black/40 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-yellow-400" />
          <h4 className="text-lg font-brawl text-yellow-400 uppercase tracking-wide drop-shadow-[1px_1px_0px_#000]">
            Rádio Familiar de Elite
          </h4>
        </div>
        <div className="flex items-center gap-1.5 bg-black/40 border border-black px-2.5 py-1 rounded-full text-xs font-bold text-white/80">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span>Canal: {activeChatTab}</span>
        </div>
      </div>

      {/* ABAS DO CHAT (Estilo Abas Recompensas do Brawl) */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => handleTabChange('Família')}
          className={`flex-grow py-2 text-xs sm:text-sm font-brawl rounded-t-xl uppercase border-x-2 border-t-2 border-black tracking-wide text-center duration-100 ${
            activeChatTab === 'Família' 
              ? 'bg-[#FF9C00] text-black border-bottom-none translate-y-[2px] z-10' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          🌐 Geral Família
        </button>
        <button 
          onClick={() => handleTabChange('Miguel')}
          className={`flex-grow py-2 text-xs sm:text-sm font-brawl rounded-t-xl uppercase border-x-2 border-t-2 border-black tracking-wide text-center duration-100 ${
            activeChatTab === 'Miguel' 
              ? 'bg-blue-500 text-white border-bottom-none translate-y-[2px] z-10' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          🦈 Miguel
        </button>
        <button 
          onClick={() => handleTabChange('Sophia')}
          className={`flex-grow py-2 text-xs sm:text-sm font-brawl rounded-t-xl uppercase border-x-2 border-t-2 border-black tracking-wide text-center duration-100 ${
            activeChatTab === 'Sophia' 
              ? 'bg-pink-500 text-white border-bottom-none translate-y-[2px] z-10' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          🦄 Sophia
        </button>
      </div>

      {/* ÁREA DE CONVERSA (Scroll) */}
      <div className="flex-grow overflow-y-auto bg-black/30 border-2 border-black p-3 rounded-b-2xl rounded-tr-2xl mb-3 flex flex-col gap-3.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
            <span className="text-4xl mb-2">💬</span>
            <p className="font-brawl uppercase text-sm">Nenhuma mensagem neste canal!</p>
            <p className="text-xs">Seja o primeiro a mandar um Alô para o QG!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.sender.toLowerCase().startsWith(activeUser.toLowerCase());
            return (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {/* Imagem do Perfil correspondente usando o avatarFile correto do servidor */}
                <div className="w-10 h-10 rounded-xl border-2 border-black bg-slate-800 flex-shrink-0 shadow-[1px_1px_0px_#000] overflow-hidden flex items-center justify-center">
                  <img 
                    src={msg.avatarFile} 
                    alt={msg.sender} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback visual com as iniciais se o servidor estiver carregando a pasta offline
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Fallback de texto caso a imagem ainda não exista */}
                  <span className="text-xs font-brawl uppercase">{msg.sender.substring(0,2)}</span>
                </div>

                <div className="flex flex-col">
                  {/* Nome e Badge */}
                  <div className={`flex items-center gap-1.5 text-[10px] mb-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="font-brawl text-white tracking-wider lowercase text-shadow">@{msg.sender}</span>
                    <span className="text-yellow-400 bg-black/60 px-1 rounded-md font-mono text-[8px] border border-black/50">{msg.senderRole}</span>
                  </div>

                  {/* Corpo da Mensagem */}
                  <div className={`p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.3)] relative ${
                    isMe 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-tr-none' 
                      : 'bg-slate-800 text-white rounded-tl-none'
                  }`}>
                    {msg.isPin ? (
                      <div className="p-1 max-w-[120px] mx-auto animate-bounce duration-500">
                        {/* Imagem real do pin contido na pasta específica */}
                        <img 
                          src={msg.text} 
                          alt="Brawl Stars Pin" 
                          className="w-full h-auto object-contain filter drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[9px] block text-center font-bold text-black/60 uppercase mt-1 font-sans-alt">BRAWL PIN</span>
                      </div>
                    ) : (
                      <p className="text-sm font-sans-alt font-semibold break-words leading-snug">{msg.text}</p>
                    )}
                    <span className="text-[9px] opacity-60 block text-right mt-1.5 font-mono">{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* BARRA DE ENVIAR MENSAGENS COM GAVETA DE EMOJIS */}
      <form onSubmit={handleSendFormSubmit} className="relative z-30">
        <div className="flex gap-2 items-center">
          
          {/* Botão de Emojis/Pins Brawl Stars */}
          <button 
            type="button"
            onClick={() => { playClickSound(); setShowEmojiDrawer(!showEmojiDrawer); }}
            className={`w-12 h-12 rounded-xl border-4 border-black flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 ${
              showEmojiDrawer ? 'bg-yellow-400 text-black' : 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
            }`}
            title="Escolha seus Pins Oficiais"
          >
            <Smile className="w-6 h-6 stroke-[2.5px]" />
          </button>

          {/* Input de texto do usuário */}
          <input 
            type="text"
            value={messageInputText}
            onChange={(e) => setMessageInputText(e.target.value)}
            placeholder={`Enviar para o canal ${activeChatTab}...`}
            className="flex-grow bg-slate-900 border-4 border-black rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 text-sm font-sans-alt font-semibold"
          />

          {/* Botão enviar */}
          <button 
            type="submit"
            className="w-12 h-12 bg-green-500 hover:bg-green-400 active:translate-y-0.5 duration-75 text-white rounded-xl border-4 border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
          >
            <Send className="w-5 h-5 stroke-[2.5px]" />
          </button>
        </div>

        {/* GAVETA DE PINS/EMOJIS REAL DOS USUÁRIOS */}
        {showEmojiDrawer && (
          <div className="brawl-emoji-drawer absolute bottom-16 left-0 right-0 p-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3 border-b border-black/30 pb-2">
              <span className="font-brawl text-sm text-[#FFD700] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" /> Seus Pins de Recompensa
              </span>
              <button 
                type="button" 
                onClick={() => { playClickSound(); setShowEmojiDrawer(false); }}
                className="text-xs text-red-400 font-extrabold uppercase bg-black/40 px-2.5 py-1 rounded-md border border-black hover:bg-red-950/40"
              >
                Fechar ×
              </button>
            </div>
            
            {/* Grid contendo as imagens reais dos Pins que estão no servidor do usuário */}
            <div className="grid grid-cols-4 gap-3 bg-black/35 rounded-xl p-3 border-2 border-black/50">
              {currentPins.map((pinUrl, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSendPin(pinUrl)}
                  className="cursor-pointer bg-[#3a3a4f] hover:bg-yellow-400/90 border-2 border-black rounded-lg p-2 flex items-center justify-center transition-all hover:scale-105 shadow-[2px_2px_0px_#000] group"
                >
                  <img 
                    src={pinUrl} 
                    alt={`Pin ${idx}`} 
                    className="w-14 h-14 object-contain filter drop-shadow-[1px_1px_0px_rgba(0,0,0,0.3)] group-hover:scale-110 duration-150"
                    onError={(e) => {
                      // Fallback se as imagens locais ainda estão em deploy
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Fallback de emoji estético */}
                  <span className="text-2xl font-brawl text-[#FF9C00]">👾</span>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-slate-400/80 font-mono mt-2 text-center">
              Puxando pins dedicados da pasta: <span className="text-yellow-400">imagens/emoj_{activeUser}/</span>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
