import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  User, 
  Tv, 
  Lock, 
  Check, 
  Volume2, 
  X, 
  Send, 
  Award, 
  Video, 
  Link2, 
  Plus, 
  MessageSquare, 
  Users, 
  Star, 
  Sparkles,
  Zap,
  Power,
  RefreshCw,
  Sliders,
  Laptop
} from 'lucide-react';

import { Profile, Message } from './types';
import { INITIAL_PROFILES, INITIAL_MESSAGES, USER_PINS } from './data';
import BrawlChatComponent from './components/BrawlChatComponent';

export default function App() {
  // ==========================================
  // ESTADOS GLOBAIS DA APLICAÇÃO
  // ==========================================
  
  // Página ativa: 'perfil' (lobby de seleção) | 'papai' | 'miguel' | 'sophia' | 'convidado'
  const [activeScreen, setActiveScreen] = useState<'perfil' | 'papai' | 'miguel' | 'sophia' | 'convidado'>('perfil');
  
  // Controle de segurança para simular desbloqueio
  const [unlockedProfiles, setUnlockedProfiles] = useState({
    miguel: false,
    sophia: false
  });
  
  // Alvo atual da senha de PIN
  const [pinTarget, setPinTarget] = useState<'miguel' | 'sophia' | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // Fluxo de carregamento simulado (com play do som sons/load_login.ogg)
  const [loadingScreen, setLoadingScreen] = useState<boolean>(false);
  const [loadingPercent, setLoadingPercent] = useState<number>(0);
  const [loadingTargetScreen, setLoadingTargetScreen] = useState<'perfil' | 'papai' | 'miguel' | 'sophia' | 'convidado' | null>(null);

  // Link do Google Meet controlado pelo Papai (Admin)
  const [savedLink, setSavedLink] = useState<string>('https://meet.google.com/abc-defg-hij');
  const [isMeetActive, setIsMeetActive] = useState<boolean>(false);
  const [meetLinkInput, setMeetLinkInput] = useState<string>('https://meet.google.com/abc-defg-hij');

  // Perfis dinâmicos de Brawl Stars
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);

  // Histórico de mensagens do chat estruturado com abas
  const [chatMessages, setChatMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [activeChatTab, setActiveChatTab] = useState<'Família' | 'Miguel' | 'Sophia'>('Família');
  const [messageInputText, setMessageInputText] = useState('');

  // Referências sonoras do servidor real
  const audioClickRef = useRef<HTMLAudioElement | null>(null);
  const audioLoadLoginRef = useRef<HTMLAudioElement | null>(null);
  const audioNewMsgRef = useRef<HTMLAudioElement | null>(null);

  // ==========================================
  // EFEITOS E AUXILIARES
  // ==========================================

  // Simulação de Progresso do Carregamento
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loadingScreen) {
      setLoadingPercent(0);
      
      // Tocar som de login real
      if (audioLoadLoginRef.current) {
        audioLoadLoginRef.current.currentTime = 0;
        audioLoadLoginRef.current.play().catch(() => {});
      }

      interval = setInterval(() => {
        setLoadingPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (loadingTargetScreen) {
                setActiveScreen(loadingTargetScreen);
              }
              setLoadingScreen(false);
              setLoadingPercent(0);
            }, 500); // Aguarda meio segundo ao bater 100%
            return 100;
          }
          const increment = Math.floor(Math.random() * 15) + 10;
          return Math.min(100, prev + increment);
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [loadingScreen, loadingTargetScreen]);

  // ==========================================
  // FUNÇÕES DE AÇÃO COM SONS ATRELADOS
  // ==========================================

  // Executa som clássico de clique
  const playClickSound = () => {
    if (audioClickRef.current) {
      audioClickRef.current.currentTime = 0;
      audioClickRef.current.play().catch(() => {});
    }
  };

  const playNewMsgSound = () => {
    if (audioNewMsgRef.current) {
      audioNewMsgRef.current.currentTime = 0;
      audioNewMsgRef.current.play().catch(() => {});
    }
  };

  // Retornar ao menu inicial (Lobby)
  const handleGoBackToLobby = () => {
    playClickSound();
    // Simula carregamento ao deslogar para dar fidelidade ao tema de entrada do jogo
    triggerLoadingTransition('perfil');
    // Reinicia estados de senha
    setPinInput('');
    setPinError(false);
  };

  // Redireciona com tela de carregamento empolgante
  const triggerLoadingTransition = (target: 'perfil' | 'papai' | 'miguel' | 'sophia' | 'convidado') => {
    setLoadingTargetScreen(target);
    setLoadingScreen(true);
  };

  // Clicar em um perfil para login
  const handleSelectProfileClick = (profile: Profile) => {
    playClickSound();
    
    if (profile.id === 'papai') {
      // Papai entra direto com carregamento
      triggerLoadingTransition('papai');
    } else if (profile.id === 'convidado') {
      // Convidado entra direto
      triggerLoadingTransition('convidado');
    } else {
      // Requer desbloqueio via PIN para as crianças
      const id = profile.id as 'miguel' | 'sophia';
      if (unlockedProfiles[id]) {
        triggerLoadingTransition(id);
      } else {
        setPinTarget(id);
        setPinInput('');
        setPinError(false);
      }
    }
  };

  // Teclado Numérico Customizado do PIN
  const handlePinKeyPress = (num: string) => {
    playClickSound();
    if (pinInput.length < 6) {
      setPinInput(prev => prev + num);
      setPinError(false);
    }
  };

  const handlePinDelete = () => {
    playClickSound();
    setPinInput(prev => prev.slice(0, -1));
  };

  const handlePinClear = () => {
    playClickSound();
    setPinInput('');
  };

  // Confirmar PIN digitado
  const handlePinConfirm = () => {
    if (!pinTarget) return;
    
    const targetProf = profiles.find(p => p.id === pinTarget);
    if (targetProf && pinInput === targetProf.passcode) {
      // Sucesso!
      setUnlockedProfiles(prev => ({ ...prev, [pinTarget]: true }));
      setPinTarget(null);
      setPinInput('');
      
      // Entra no painel com animação de carregamento e som do load_login.ogg
      triggerLoadingTransition(pinTarget);
    } else {
      // Erro!
      setPinError(true);
      setPinInput('');
    }
  };

  // Enviar Mensagem no Chat
  const handleSendMessage = (text: string, isPin: boolean = false) => {
    const now = new Date();
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const activeProf = profiles.find(p => p.id === activeScreen) || profiles[0];
    const avatarFile = `imagens/perfil/${activeProf.avatarFile}`;

    const newMsg: Message = {
      id: chatMessages.length + 1,
      text: text,
      sender: activeProf.name,
      senderRole: activeProf.id === 'papai' ? '👑 ADMIN' : activeProf.id === 'miguel' ? '⚡ JOGADOR' : activeProf.id === 'sophia' ? '🦄 JOGADORA' : '👾 CONVIDADO',
      avatarFile: avatarFile,
      channel: activeChatTab,
      timestamp: formattedTime,
      isPin: isPin
    };

    setChatMessages(prev => [...prev, newMsg]);
    playNewMsgSound();

    // Simulação interativa: Recebimento de mensagens automáticas de outros Brawlers com som "sons/new_msg.ogg"
    setTimeout(() => {
      const respNow = new Date();
      const respTime = `${String(respNow.getHours()).padStart(2, '0')}:${String(respNow.getMinutes()).padStart(2, '0')}`;
      
      let responder = "Papai (Admin)";
      let role = "👑 ADMIN";
      let respAvatar = "imagens/perfil/bull_portrait.png";
      let txt = "Isso aí! Todo mundo jogando em equipe no QG do Papai! 🛡️🏆";
      let isRespPin = false;

      // Cria resposta personalizada dependendo de quem enviou e em qual aba
      if (activeScreen === 'papai') {
        if (activeChatTab === 'Miguel') {
          responder = "Miguel";
          role = "⚡ JOGADOR";
          respAvatar = "imagens/perfil/fang_portrait.png";
          txt = "Entendido Papai! Estou de olho nas missões! 👀⚡";
        } else if (activeChatTab === 'Sophia') {
          responder = "Sophia";
          role = "🦄 JOGADORA";
          respAvatar = "imagens/perfil/penny_portrait.png";
          txt = "Sim papai! Vou fazer tudo direitinho e com carinho! 🦄🍬";
        } else {
          responder = "Miguel";
          role = "⚡ JOGADOR";
          respAvatar = "imagens/perfil/fang_portrait.png";
          txt = "imagens/emoj_miguel/fang_happy_pin.png"; // Envia um PIN de volta!
          isRespPin = true;
        }
      } else if (activeScreen === 'miguel') {
        responder = "Papai (Admin)";
        role = "👑 ADMIN";
        respAvatar = "imagens/perfil/bull_portrait.png";
        txt = "Mandou muito bem, Miguel! Continue focado nas tarefas para as recompensas! ⚔️💎";
      } else if (activeScreen === 'sophia') {
        responder = "Papai (Admin)";
        role = "👑 ADMIN";
        respAvatar = "imagens/perfil/bull_portrait.png";
        txt = "Princesa Sophia! Você está brilhando hoje no QG! 🌸✨";
      } else {
        responder = "Papai (Admin)";
        role = "👑 ADMIN";
        respAvatar = "imagens/perfil/bull_portrait.png";
        txt = "Seja bem-vindo ao clã como aliado no QG! 👾🎮";
      }

      const incomingMsg: Message = {
        id: Date.now(), // ID único baseado em timestamp
        text: txt,
        sender: responder,
        senderRole: role,
        avatarFile: respAvatar,
        channel: activeChatTab,
        timestamp: respTime,
        isPin: isRespPin
      };

      setChatMessages(prev => [...prev, incomingMsg]);
      
      // DISPARA O SOM DO LADO DO SERVIDOR REAL NO RECEBIMENTO
      playNewMsgSound();
    }, 3000);
  };

  // Toggle de status Online/Offline do perfil
  const toggleUserStatus = (profileId: string) => {
    playClickSound();
    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        return {
          ...p,
          status: p.status === 'Online' ? 'Offline' : 'Online'
        };
      }
      return p;
    }));
  };

  // Aumentar troféus do brawler (gamificação do placar familiar)
  const handleAddTrophies = (profileId: string, amount: number) => {
    playClickSound();
    playNewMsgSound();
    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        return {
          ...p,
          trophies: Math.max(0, p.trophies + amount)
        };
      }
      return p;
    }));
  };

  // Salvar configurações do Meet do Papai
  const handleSaveMeetSettings = () => {
    playClickSound();
    setSavedLink(meetLinkInput);
    alert(`Sucesso! Google Meet do QG configurado para:\n${meetLinkInput}`);
  };

  const handleToggleMeet = () => {
    playClickSound();
    setIsMeetActive(!isMeetActive);
  };

  // Obter classe do tema selecionado
  const getThemeClass = () => {
    switch(activeScreen) {
      case 'papai': return 'theme-papai';
      case 'miguel': return 'theme-miguel';
      case 'sophia': return 'theme-sophia';
      case 'convidado': return 'theme-convidado';
      default: return 'theme-papai'; 
    }
  };

  return (
    <div className={`min-h-screen text-white font-sans-alt flex flex-col brawl-stripe-bg antialiased relative selection:bg-yellow-400 selection:text-black`}>
      
      {/* TAGS DE ÁUDIO REAIS COM ARQUIVOS DO SEU SERVIDOR */}
      <audio ref={audioClickRef} src="sons/menu_click_01.ogg" preload="auto" />
      <audio ref={audioLoadLoginRef} src="sons/load_login.ogg" preload="auto" />
      <audio ref={audioNewMsgRef} src="sons/new_msg.ogg" preload="auto" />

      {/* HEADER GERAL */}
      <header className="py-4 px-4 bg-gradient-to-b from-black to-transparent relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo do QG com identidade Brawl Stars */}
          <div className="text-center sm:text-left relative group">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              {/* Box Ilustrada de Placeholder para seu logo-qg.png */}
              <div className="w-12 h-12 bg-yellow-400 rounded-xl border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] rotate-[-4deg] group-hover:rotate-0 transition-all">
                <span className="text-2xl filter drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">⭐</span>
              </div>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-brawl tracking-wider text-yellow-400 uppercase drop-shadow-[0_4px_0_#000] brawl-text-stroke">
                  QG do Papai
                </h1>
                <p className="text-[10px] font-mono tracking-tight text-white/70">
                  ⚡ Comunicação Familiar do Brawl
                </p>
              </div>
            </div>
          </div>

          {/* Chamada para o Meet se o Papai ativou */}
          {isMeetActive && activeScreen !== 'perfil' && (
            <div className="bg-green-600 px-3 py-1.5 rounded-2xl border-4 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2.5 text-xs font-brawl brawl-pulse">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-ping"></span>
              <span className="text-white drop-shadow-[1px_1px_0px_#000]">MEET ATIVO NO PAINEL!</span>
              <a 
                href={savedLink} 
                target="_blank" 
                rel="noreferrer" 
                className="bg-yellow-400 text-black px-2 py-0.5 rounded border-2 border-black font-sans-alt font-extrabold hover:bg-yellow-300 text-[10px] shadow-[1px_1px_0px_#000]"
              >
                ENTRAR
              </a>
            </div>
          )}

          {/* Logout e Navegação de retorno */}
          {activeScreen !== 'perfil' && (
            <button 
              onClick={handleGoBackToLobby}
              className="brawl-btn-red text-xs sm:text-sm font-brawl px-4 py-2 uppercase flex items-center gap-1.5"
            >
              <X className="w-4 h-4 stroke-[3px]" /> Sair do Painel
            </button>
          )}

        </div>
      </header>

      {/* TELA DE CARREGAMENTO OFICIAL BRAWL STARS (com sons/load_login.ogg de fundo) */}
      {loadingScreen && (
        <div className="fixed inset-0 bg-[#0c0d14] z-50 flex flex-col justify-between p-8 brawl-stripe-bg">
          <div className="flex-grow flex flex-col items-center justify-center">
            
            {/* Ícone de Estrela Rotativa */}
            <div className="w-24 h-24 bg-yellow-400 rounded-3xl border-8 border-black flex items-center justify-center shadow-[0_10px_0_rgba(0,0,0,0.5)] animate-spin-slow rotate-[8deg] mb-8">
              <span className="text-5xl filter drop-shadow-[2px_4px_0_rgba(0,0,0,0.3)]">⭐</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-brawl text-yellow-400 uppercase tracking-widest text-center drop-shadow-[0_5px_0_#000] brawl-text-stroke mb-2">
              CONECTANDO AO QG...
            </h2>
            <p className="text-xs text-slate-300 tracking-wider font-mono select-none">
              Carregando dados da Família... {loadingPercent}%
            </p>
          </div>

          {/* Barra de Progresso Clássica do Brawl Stars */}
          <div className="max-w-2xl w-full mx-auto mb-12">
            <div className="w-full h-8 bg-black rounded-full border-4 border-black overflow-hidden relative p-1">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-300 border-2 border-yellow-200 transition-all duration-150 flex items-center justify-end pr-2.5"
                style={{ width: `${loadingPercent}%` }}
              >
                <span className="text-[10px] font-brawl text-black pr-1 font-bold">CARREGANDO</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 text-center uppercase tracking-wide font-mono mt-2">
              Dica de Brawler: Obedeça o Papai para ganhar gemas grátis! 👑
            </div>
          </div>
        </div>
      )}

      {/* TELA 1: SELETOR DE PERFIL (Equivalente ao index.html inicial) */}
      {activeScreen === 'perfil' && !pinTarget && (
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-4 flex flex-col justify-between">
          
          <div className="text-center my-4">
            <span className="bg-black/60 text-yellow-400 uppercase font-brawl text-xs px-4 py-1.5 rounded-full border-2 border-black tracking-widest inline-block shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
              ⚔️ Central de Comando Brawler ⚔️
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-brawl text-white uppercase mt-4 tracking-tight drop-shadow-[0_4px_0_#000] brawl-text-stroke">
              Quem está no QG hoje?
            </h2>
          </div>

          {/* Lista de Cartões (Grid responsivo Mobile-First) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
            {profiles.map((profile) => (
              <div 
                key={profile.id}
                onClick={() => handleSelectProfileClick(profile)}
                className="group cursor-pointer"
              >
                <div className={`h-full brawl-card bg-gradient-to-b ${profile.color} p-1 text-center relative overflow-hidden flex flex-col justify-between min-h-[300px]`}>
                  
                  {/* Badge de Troféus */}
                  <div className="absolute top-2.5 right-2.5 bg-black/70 border-2 border-black rounded-full px-2.5 py-0.5 flex items-center gap-1 z-10">
                    <span className="text-yellow-400 text-xs">🏆</span>
                    <span className="font-brawl text-xs text-yellow-300">{profile.trophies}</span>
                  </div>

                  {/* Nível do Brawler */}
                  <div className="absolute top-2.5 left-2.5 bg-black/80 border-2 border-black rounded-full w-7 h-7 flex items-center justify-center font-brawl text-[10px] text-cyan-300 z-10">
                    {profile.level}
                  </div>

                  {/* Imagem ou Ícone de Brawler */}
                  <div className="pt-10 pb-4">
                    <div className="w-24 h-24 bg-white/10 rounded-full mx-auto flex items-center justify-center border-4 border-white/5 relative group-hover:scale-105 transition-all overflow-hidden shadow-inner">
                      {/* Tenta renderizar o retrato real, senão usa emoji de fallback */}
                      <img 
                        src={`imagens/perfil/${profile.avatarFile}`} 
                        alt={profile.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-5xl select-none absolute filter drop-shadow-[2px_3px_0_rgba(0,0,0,0.3)]">{profile.avatarIcon}</span>
                    </div>
                  </div>

                  {/* Rodapé do Cartão com as classes dos Temas do Servidor */}
                  <div className="bg-black/55 border-t-2 border-black/30 p-4 rounded-b-xl flex flex-col gap-1.5 mt-auto relative">
                    <span className="font-brawl text-xl tracking-wide uppercase text-white drop-shadow-[0_2px_0_#000] group-hover:text-yellow-300 transition-colors">
                      {profile.name}
                    </span>
                    <span className="text-[10px] bg-black/65 border border-black/40 text-yellow-400 py-1 px-2 rounded-lg font-mono tracking-tight">
                      {profile.role}
                    </span>
                    
                    {/* Exibe se exige senha */}
                    {(profile.id === 'miguel' || profile.id === 'sophia') && (
                      <div className="mt-1 flex items-center justify-center gap-1 text-[10px]">
                        {unlockedProfiles[profile.id as 'miguel' | 'sophia'] ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3 stroke-[3px]" /> Desbloqueado
                          </span>
                        ) : (
                          <span className="text-amber-400 uppercase font-brawl flex items-center gap-1 tracking-wider text-[10px]">
                            <Lock className="w-3 h-3 text-amber-500" /> Requer Senha
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CARD DO PLACAR DE COMUNICAÇÃO DEITADO / VERTICAL EM MOBILE */}
          <section className="bg-slate-900/95 border-4 border-black rounded-3xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] mt-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000] flex-shrink-0">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <h3 className="text-lg font-brawl text-yellow-400 uppercase drop-shadow-[0_2px_0_#000]">
                    Status do Placar do QG
                  </h3>
                  <p className="text-xs text-slate-300">
                    Toque nos brawlers para mudar seu status para deitado ou online!
                  </p>
                </div>
              </div>

              {/* Roster de Jogadores Rápidos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
                {profiles.map((p) => {
                  const isOnline = p.status === 'Online';
                  return (
                    <div 
                      key={p.id}
                      onClick={() => toggleUserStatus(p.id)}
                      className={`cursor-pointer p-2 rounded-xl border-2 border-black flex flex-col justify-between gap-1 transition-all hover:scale-105 ${
                        isOnline ? 'bg-slate-800' : 'bg-slate-950/70 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-lg">{p.avatarIcon}</span>
                        <span className={`w-2.5 h-2.5 rounded-full border border-black ${isOnline ? 'bg-green-400' : 'bg-red-500'}`}></span>
                      </div>
                      <span className="font-brawl text-[10px] block text-left">{p.name.split(' ')[0]}</span>
                      <div className="flex items-center justify-between text-[10px] text-yellow-400 font-brawl">
                        <span>🏆 {p.trophies}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAddTrophies(p.id, 50); }}
                          className="bg-green-500 text-white rounded w-3.5 h-3.5 flex items-center justify-center border border-black font-bold font-mono text-[9px] hover:bg-green-400"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </section>

        </main>
      )}

      {/* TELA DE BLOQUEIO / TECLADO PIN BRAWL STARS PARA OS FILHOS */}
      {pinTarget && (
        <main className="flex-grow max-w-sm w-full mx-auto px-4 py-8 flex flex-col justify-center">
          <div className="brawl-card bg-[#222831] border-4 border-black p-5 relative">
            
            <button 
              onClick={() => { playClickSound(); setPinTarget(null); setPinInput(''); }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 border-4 border-black rounded-full flex items-center justify-center font-bold text-white shadow-[2px_2px_0px_#000] hover:bg-red-500 text-sm"
            >
              ×
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl mx-auto flex items-center justify-center border-4 border-black shadow-[2px_2px_0px_#000] mb-2 text-2xl">
                🔒
              </div>
              <h3 className="text-xl font-brawl text-white uppercase drop-shadow-[0_2px_0_#000]">
                Painel Bloqueado
              </h3>
              <p className="text-[11px] text-slate-300">
                Olá <span className="font-bold text-yellow-400 uppercase font-brawl">{profiles.find(p => p.id === pinTarget)?.name}</span>! Digite o PIN familiar para jogar.
              </p>
            </div>

            {/* Display do PIN */}
            <div className={`w-full py-3 px-2 bg-black/80 rounded-xl border-4 ${pinError ? 'border-red-500 bg-red-950/40' : 'border-black'} text-center mb-4`}>
              <div className="flex items-center justify-center gap-2">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3.5 h-3.5 rounded-full border border-black transition-all ${
                      i < pinInput.length ? 'bg-yellow-400 scale-110' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[9px] text-white/50 mt-1 font-mono">
                {pinError ? (
                  <span className="text-red-400 font-bold">PIN INCORRETO! TENTE DE NOVO</span>
                ) : (
                  <span>Senha de 6 dígitos</span>
                )}
              </div>
            </div>

            {/* Teclado do Brawl Stars requisitado */}
            <div className="brawl-pin-grid mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinKeyPress(String(num))}
                  className="brawl-pin-btn text-xl py-1.5"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handlePinClear}
                className="brawl-pin-btn bg-red-800 text-xs py-1.5 font-brawl"
              >
                C
              </button>
              <button
                onClick={() => handlePinKeyPress('0')}
                className="brawl-pin-btn text-xl py-1.5"
              >
                0
              </button>
              <button
                onClick={handlePinDelete}
                className="brawl-pin-btn bg-slate-700 text-xs py-1.5 font-brawl"
              >
                ⌫
              </button>
            </div>

            <button
              onClick={handlePinConfirm}
              disabled={pinInput.length !== 6}
              className={`w-full py-2.5 font-brawl uppercase text-sm ${
                pinInput.length === 6 ? 'brawl-btn-green' : 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 rounded-xl border-2'
              }`}
            >
              Confirmar Entrada 🔑
            </button>

          </div>
        </main>
      )}

      {/* TELA 2: PAINEL DO ADMINISTRADOR PAPAI */}
      {activeScreen === 'papai' && (
        <main className={`flex-grow max-w-6xl w-full mx-auto px-4 py-4 ${getThemeClass()}`}>
          <div className="bg-gradient-to-b from-[#1c1c1c] to-[#111] border-4 border-amber-500 rounded-3xl p-5 shadow-[0_10px_0_rgba(0,0,0,0.5)]">
            
            {/* Header com os retratos */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b-4 border-black pb-4 mb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl border-2 border-black bg-slate-800 overflow-hidden shadow-md">
                  <img src="imagens/perfil/bull_portrait.png" alt="bull portrait" className="w-full h-full object-cover" onError={(e)=>(e.target as HTMLElement).style.display='none'} />
                  <span className="text-2xl pt-1">🔥</span>
                </div>
                <div>
                  <h2 className="text-2xl font-brawl text-[#FFD700] uppercase tracking-wide drop-shadow-[1px_1px_0px_#000] brawl-text-stroke">
                    PAINEL ADMINISTRADOR
                  </h2>
                  <p className="text-[10px] text-amber-300 uppercase tracking-widest font-mono">
                    PROJETO QG DO PAPAI • SINC AUTOMÁTICA
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { playClickSound(); setUnlockedProfiles({ miguel: false, sophia: false }); alert('Painéis fechados!'); }}
                  className="brawl-btn-red text-[11px] font-brawl px-3 py-1.5"
                >
                  Fechar Salas 🔒
                </button>
              </div>
            </div>

            {/* Configuração de Comunicação */}
            <section className="bg-black/50 border-4 border-black rounded-2xl p-4 mb-4">
              <h3 className="text-xs sm:text-sm font-brawl text-yellow-400 uppercase mb-3 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-yellow-400 animate-pulse" /> CONFIGURAR REUNIÃO DE FAMÍLIA (MEET)
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-grow w-full flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-300">Link da Batalha (Google Meet, etc):</label>
                  <input 
                    type="url" 
                    value={meetLinkInput}
                    onChange={(e) => setMeetLinkInput(e.target.value)}
                    placeholder="Cole o Link"
                    className="bg-slate-900 border-2 border-black rounded-lg p-2 text-white font-mono text-xs w-full focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={handleSaveMeetSettings}
                    className="brawl-btn-yellow text-xs py-2 px-3 tracking-wide"
                  >
                    Mudar Link
                  </button>
                  <button 
                    onClick={handleToggleMeet}
                    className={`text-xs py-2 px-4 uppercase font-brawl flex-grow ${
                      isMeetActive ? 'brawl-btn-green' : 'brawl-btn-purple'
                    }`}
                  >
                    {isMeetActive ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </div>
              </div>
            </section>

            {/* Layout em Landscape dos cards do painel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Controle Miguel */}
              <div className="bg-slate-950/80 border-2 border-blue-500/40 rounded-xl p-3 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-brawl text-sm text-blue-400">⚡ PERFIL DO MIGUEL</span>
                  <span className="text-[10px] bg-blue-600/30 px-1.5 py-0.5 rounded text-blue-300">Tema Ativo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded border border-black bg-slate-800 overflow-hidden">
                    <img src="imagens/perfil/fang_portrait.png" className="w-full h-full object-cover" onError={(e)=>(e.target as HTMLElement).style.display='none'} />
                    <span className="text-xl">🦈</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">Prêmio: Room de Batalha</span>
                    <span className="text-[10px] text-slate-400">PIN Familiar: {profiles.find(p => p.id === 'miguel')?.passcode}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAddTrophies('miguel', 100)} className="brawl-btn-blue text-[10px] py-1.5 flex-grow font-brawl">+100 🏆</button>
                  <button onClick={() => setUnlockedProfiles(p => ({ ...p, miguel: !p.miguel }))} className="brawl-btn-yellow text-[10px] py-1.5 px-3 font-brawl">Ignorar PIN</button>
                </div>
              </div>

              {/* Controle Sophia */}
              <div className="bg-slate-950/80 border-2 border-pink-500/40 rounded-xl p-3 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-brawl text-sm text-pink-400">🌸 PERFIL DA SOPHIA</span>
                  <span className="text-[10px] bg-pink-600/30 px-1.5 py-0.5 rounded text-pink-300">Tema Ativo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded border border-black bg-slate-800 overflow-hidden">
                    <img src="imagens/perfil/penny_portrait.png" className="w-full h-full object-cover" onError={(e)=>(e.target as HTMLElement).style.display='none'} />
                    <span className="text-xl">🌸</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">Prêmio: Recompensa Doce</span>
                    <span className="text-[10px] text-slate-400">PIN Familiar: {profiles.find(p => p.id === 'sophia')?.passcode}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAddTrophies('sophia', 100)} className="brawl-btn-blue text-[10px] py-1.5 flex-grow font-brawl">+100 🏆</button>
                  <button onClick={() => setUnlockedProfiles(p => ({ ...p, sophia: !p.sophia }))} className="brawl-btn-yellow text-[10px] py-1.5 px-3 font-brawl">Ignorar PIN</button>
                </div>
              </div>

            </div>

            {/* Chat embutido */}
            <BrawlChatComponent 
              activeUser="papai"
              chatMessages={chatMessages}
              activeChatTab={activeChatTab}
              setActiveChatTab={setActiveChatTab}
              messageInputText={messageInputText}
              setMessageInputText={setMessageInputText}
              onSendMessage={handleSendMessage}
              themeSelector="theme-papai"
            />

          </div>
        </main>
      )}

      {/* TELA 3: PAINEL DO MIGUEL (Guerreiro Azul e Laranja) */}
      {activeScreen === 'miguel' && (
        <main className={`flex-grow max-w-6xl w-full mx-auto px-4 py-4 ${getThemeClass()}`}>
          <div className="bg-gradient-to-b from-[#103260] to-[#081226] border-4 border-blue-400 rounded-3xl p-5 shadow-[0_10px_0_rgba(0,0,0,0.5)]">
            
            {/* Header Miguel */}
            <div className="flex items-center justify-between border-b-4 border-black pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl border-4 border-black bg-slate-800 overflow-hidden shadow-lg">
                  <img src="imagens/perfil/fang_portrait.png" alt="fang portrait" className="w-full h-full object-cover" onError={(e)=>(e.target as HTMLElement).style.display='none'} />
                  <span className="text-3xl p-1.5">🦈</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-brawl text-blue-300 uppercase drop-shadow-[1px_1px_0px_#000] brawl-text-stroke">
                    SALA DO MIGUEL
                  </h2>
                  <p className="text-[9px] text-orange-400 uppercase tracking-widest font-mono font-bold">
                    ⚔️ Guerreiro de Elite do QG 🛡️
                  </p>
                </div>
              </div>

              {/* Troféus e nível */}
              <div className="flex items-center gap-1.5 bg-black/60 border-2 border-black rounded-lg px-2.5 py-1">
                <span className="text-yellow-400 text-xs">🏆</span>
                <span className="font-brawl text-sm text-yellow-300">
                  {profiles.find(p => p.id === 'miguel')?.trophies}
                </span>
              </div>
            </div>

            {/* Meet Banner Se Ativo */}
            {isMeetActive && (
              <div className="bg-gradient-to-r from-orange-600 to-yellow-500 border-4 border-black rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3.5 shadow-md brawl-pulse">
                <div>
                  <h4 className="font-brawl text-white uppercase text-base text-shadow">CONVOCAÇÃO DO PAPAI!</h4>
                  <p className="text-xs text-white/95 font-sans-alt">Você foi convidado para o Meet Família. Toque no botão para se juntar ao clã!</p>
                </div>
                <a 
                  href={savedLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="brawl-btn-yellow py-2 px-6 font-brawl uppercase text-sm block tracking-widest text-center whitespace-nowrap"
                >
                  Entrar no Jogo 🎬
                </a>
              </div>
            )}

            {/* Chat especializado do Miguel */}
            <BrawlChatComponent 
              activeUser="miguel"
              chatMessages={chatMessages}
              activeChatTab={activeChatTab}
              setActiveChatTab={setActiveChatTab}
              messageInputText={messageInputText}
              setMessageInputText={setMessageInputText}
              onSendMessage={handleSendMessage}
              themeSelector="theme-miguel"
            />

          </div>
        </main>
      )}

      {/* TELA 4: PAINEL DA SOPHIA (Tema Rosa e Lilás) */}
      {activeScreen === 'sophia' && (
        <main className={`flex-grow max-w-6xl w-full mx-auto px-4 py-4 ${getThemeClass()}`}>
          <div className="bg-gradient-to-b from-[#451b5c] to-[#1e052c] border-4 border-pink-400 rounded-3xl p-5 shadow-[0_10px_0_rgba(0,0,0,0.5)]">
            
            {/* Header Sophia */}
            <div className="flex items-center justify-between border-b-4 border-black pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl border-4 border-black bg-slate-800 overflow-hidden shadow-lg">
                  <img src="imagens/perfil/penny_portrait.png" alt="penny portrait" className="w-full h-full object-cover" onError={(e)=>(e.target as HTMLElement).style.display='none'} />
                  <span className="text-3xl p-1.5">🌸</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-brawl text-pink-300 uppercase drop-shadow-[1px_1px_0px_#000] brawl-text-stroke">
                    SALA DA SOPHIA
                  </h2>
                  <p className="text-[9px] text-purple-400 uppercase tracking-widest font-mono font-bold">
                    🦄 Princesa Unicórnio Mágica 🍬
                  </p>
                </div>
              </div>

              {/* Troféus Sophia */}
              <div className="flex items-center gap-1.5 bg-black/60 border-2 border-black rounded-lg px-2.5 py-1">
                <span className="text-yellow-400 text-xs">🏆</span>
                <span className="font-brawl text-sm text-yellow-300">
                  {profiles.find(p => p.id === 'sophia')?.trophies}
                </span>
              </div>
            </div>

            {/* Meet Banner Se Ativo */}
            {isMeetActive && (
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 border-4 border-black rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3.5 shadow-md brawl-pulse">
                <div>
                  <h4 className="font-brawl text-white uppercase text-base text-shadow">CONVOCAÇÃO DO PAPAI!</h4>
                  <p className="text-xs text-white/95 font-sans-alt">O Meet da Família está online. Toque abaixo para abrir sua câmera!</p>
                </div>
                <a 
                  href={savedLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="brawl-btn-yellow py-2 px-6 font-brawl uppercase text-sm block tracking-widest text-center whitespace-nowrap"
                >
                  Entrar no QG 🎬
                </a>
              </div>
            )}

            {/* Chat Sophia */}
            <BrawlChatComponent 
              activeUser="sophia"
              chatMessages={chatMessages}
              activeChatTab={activeChatTab}
              setActiveChatTab={setActiveChatTab}
              messageInputText={messageInputText}
              setMessageInputText={setMessageInputText}
              onSendMessage={handleSendMessage}
              themeSelector="theme-sophia"
            />

          </div>
        </main>
      )}

      {/* TELA 5: PAINEL DO CONVIDADO (Geral) */}
      {activeScreen === 'convidado' && (
        <main className={`flex-grow max-w-6xl w-full mx-auto px-4 py-4 ${getThemeClass()}`}>
          <div className="bg-gradient-to-b from-[#1b2530] to-[#0d1218] border-4 border-slate-500 rounded-3xl p-5 shadow-[0_10px_0_rgba(0,0,0,0.5)]">
            
            <div className="flex items-center justify-between border-b-4 border-black pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 bg-slate-800 rounded-xl border-4 border-black flex items-center justify-center">
                  <span className="text-2xl">👾</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-brawl text-slate-300 uppercase drop-shadow-[1px_1px_0px_#000] brawl-text-stroke">
                    MODO CONVIDADO
                  </h2>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono">
                    Canal Público Temporário
                  </p>
                </div>
              </div>
            </div>

            {/* Chat do Convidado */}
            <BrawlChatComponent 
              activeUser="convidado"
              chatMessages={chatMessages}
              activeChatTab={activeChatTab}
              setActiveChatTab={setActiveChatTab}
              messageInputText={messageInputText}
              setMessageInputText={setMessageInputText}
              onSendMessage={handleSendMessage}
              themeSelector="theme-convidado"
            />

          </div>
        </main>
      )}

      {/* FOOTER GERAL */}
      <footer className="py-4 text-center text-[10px] text-white/40 border-t border-white/5 bg-black/40 mt-auto">
        <p>© 2026 QG do Papai • Desenvolvido com Identidade Brawl Stars Oficiais</p>
        <p className="uppercase mt-0.5 tracking-wider text-yellow-500/50">Conexão Git Ativada com Deploy contínuo</p>
      </footer>

    </div>
  );
}
