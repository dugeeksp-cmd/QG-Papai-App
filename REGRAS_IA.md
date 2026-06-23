# Acordo de Convivência e Diretrizes de Escopo - QG do Papai

Este documento rege a divisão de responsabilidades, arquitetura estrutural e boas práticas de desenvolvimento paralelo entre o **Google AI Studio (Backend & Lógica de Integração)** e a **IA de UI/UX (Estilo, Layout & Visual)**.

---

## 1. Escopo de Trabalho e Matriz de Responsabilidade

### 1.1 `index.html` (Página Inicial / Seletor de Perfis)
- **Responsabilidade:** **EXCLUSIVA** da IA de UI/UX.
- **Instruções ao Google AI Studio:** Está estritamente proibido realizar alterações estruturais, visuais ou funcionais nesse arquivo. Todo o layout, identidade visual, carregamentos e fluxo de autenticação local serão mantidos pela IA de UI/UX.

### 1.2 `papai.html`, `miguel.html` e `sophia.html` (Páginas de Controle e Canais de Chat)
- **Responsabilidade:** **COMPARTILHADA**.
- **Regras para a IA de UI/UX:** É permitida a criação de novos elementos HTML decorativos e auxiliares (como novas divs de envelopamento, contêineres de alinhamento, wrappers de gradiente, ou overlays visuais), contanto que:
  1. **NÃO** remova elementos essenciais da lógica do Chat.
  2. **NÃO** altere os IDs protegidos que fazem a ponte com o JavaScript/Firebase.
  3. **NÃO** invalide nem quebre as funções nativas de lógica e escuta.

---

## 2. Flexibilidade e Registro de Modificações Estruturais

Alterações estruturais de HTML que se provem necessárias para viabilizar melhorias de layout são permitidas, desde que justificadas tecnicamente e registradas obrigatoriamente sob o formato abaixo para evitar quebras de backend e dessincronização de branchs.

### Log de Alterações de Tags ou ID's (Modelo de Registro)
Sempre que uma estrutura HTML for acrescentada ou modificada, preencher o seguinte bloco no histórico:
> **[LOG DE ALTERAÇÃO ESTRUTURAL]**
> - **Arquivo alterado:** [Nome do arquivo, ex: miguel.html]
> - **Motivo da alteração:** [Justificativa de layout ou integração]
> - **Elementos adicionados (classes/tags):** [Tags e classes criadas/alteradas]
> - **IDs alterados/reajustados:** [Se algum ID de ancoragem mudou]
> - **Impacto no Backend:** [Se afeta a leitura e varredura de dados]

---

## 3. Mapeamento de Arquitetura do Chat (Foco em UI/UX)

Para que a IA de design e layout possa criar ou otimizar as folhas de estilo externas (`papai.css`, `miguel.css`, `sophia.css` ou `style.css`) sem que nenhuma linha de código HTML precise ser alterada, seguem os elementos, IDs e a hierarquia semântica criados no Chat:

### 3.1 Controles e Botões Singulares (IDs Protegidos)
Estes IDs são mapeados e escutados de forma contínua e **não** devem ser renomeados:
- `channel-name-title` *(Título dinâmico do canal ativo)*
- `clear-chat-btn` *(Botão de limpar histórico)*
- `emoji-drawer-toggle-btn` *(Botão de abrir painel de Pins/Emojis)*
- `chat-input` *(Textarea ou Input para digitação da mensagem)*
- `chat-send-btn` *(Botão de envio da mensagem)*
- `chamar-papai-btn` *(Botão de alerta "Chamar Papai" nas interfaces dos filhos, vinculando a persistência no Firebase)*
- `chat-feed` *(Contêiner de mensagens scrollável principal)*

---

### 3.2 Hierarquia Interna de Mensagem Dinâmica (Gerada via Script)
O feed estrutural renderiza as balhas com a classe base `msg-bubble` acompanhada de `sent-by-user` (para mensagens enviadas por quem está logado) ou `received` (para os outros membros da família).

Abaixo está o modelo exato da hierarquia gerada no DOM para cada mensagem. Toda a estilização dos balões de fala, avatares e tipografias deve se basear nestas classes:

```html
<!-- Envoltório Principal de Mensagem (com a classe de direção correspondente) -->
<div class="msg-bubble sent-by-user"> <!-- Ou class="msg-bubble received" -->

  <!-- Container de layout flexível que alinha avatar ao conteúdo -->
  <div class="msg-wrapper">
    
    <!-- Retentor do Avatar -->
    <div class="msg-avatar-container">
      <img src="imagens/perfil/bull_portrait.png" class="msg-avatar" onerror="...">
    </div>

    <!-- Bloco principal de conteúdo da mensagem -->
    <div class="msg-content-container">
      
      <!-- Cabeçalho (Remetente, Cargo/Papel e Horário) -->
      <p class="msg-header text-slate-800"> <!-- Classe de cor dinâmica: text-slate-800, text-cyan-400, text-pink-400, text-yellow-400, text-blue-400 -->
        <span class="msg-sender">
          Papai (Admin) <span class="msg-role">(👑 ADMIN)</span>
        </span>
        <span class="msg-time">12:00</span>
      </p>

      <!-- VARIÇÃO DE CORPO 1: Mensagens de Texto Comum -->
      <div class="msg-body text-content">
        <span>Sejam bem-vindos ao clã oficial familiar! 🚀</span>
      </div>

      <!-- VARIÇÃO DE CORPO 2: Mensagens de Pin (Reações/Emojis Animados) -->
      <!--
      <div class="msg-body msg-pin">
        <img src="imagens/emoj_papai/ts_alien_pin.png" alt="pin" class="pin-img animate-bounce" onerror="...">
      </div>
      -->

    </div>
  </div>

</div>
```

---

## 4. Próxima Etapa: Integração do Lado do Servidor (Firebase)
Assim que os layouts e roupagens visuais forem aplicados pela outra folha de estilos estruturada sob estas classes, o Google AI Studio acionará as referências para ler, gravar e escutar alterações em tempo real via Firestore com os IDs `chat-feed`, `chat-input` e `chat-send-btn`, sem afetar o estilo gerado.
