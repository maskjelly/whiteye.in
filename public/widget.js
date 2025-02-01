(function() {
  const script = document.currentScript || [].slice.call(document.getElementsByTagName('script')).pop();
  
  // Configuration
  const config = {
    apiKey: script.getAttribute('data-api-key') || '',
    position: script.getAttribute('data-position') || 'bottom-right',
    title: script.getAttribute('data-title') || 'Chat Support',
    accentColor: script.getAttribute('data-accent-color') || '#4A90E2',
    fontFamily: script.getAttribute('data-font-family') || "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  // Create widget container with Shadow DOM for style isolation
  const widget = document.createElement('div');
  widget.id = 'chatbot-widget';
  const shadow = widget.attachShadow({ mode: 'open' });

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    .chat-container {
      position: fixed;
      ${config.position.includes('bottom') ? 'bottom: 20px' : 'top: 20px'};
      ${config.position.includes('right') ? 'right: 20px' : 'left: 20px'};
      width: 350px;
      background: #FFFFFF;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border-radius: 20px;
      font-family: ${config.fontFamily};
      z-index: 9999;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .chat-header {
      background: ${config.accentColor};
      color: white;
      padding: 20px;
      border-radius: 20px 20px 0 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .chat-header h3 {
      margin: 0;
      font-weight: 600;
      font-size: 18px;
    }

    .chat-toggle {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .chat-body {
      height: 400px;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      background: #F8F9FA;
    }

    .message {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }

    .user-message {
      background: ${config.accentColor};
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .bot-message {
      background: #FFFFFF;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .input-container {
      display: flex;
      padding: 15px;
      background: #FFFFFF;
      border-top: 1px solid #E9ECEF;
    }

    input {
      flex: 1;
      padding: 12px 15px;
      border: 1px solid #E9ECEF;
      border-radius: 25px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    input:focus {
      outline: none;
      border-color: ${config.accentColor};
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    button {
      background: ${config.accentColor};
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      margin-left: 10px;
    }

    button:hover {
      background: ${lightenDarkenColor(config.accentColor, -20)};
    }

    .chat-body::-webkit-scrollbar {
      width: 6px;
    }

    .chat-body::-webkit-scrollbar-track {
      background: #F1F3F5;
    }

    .chat-body::-webkit-scrollbar-thumb {
      background: #CED4DA;
      border-radius: 3px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message {
      animation: fadeIn 0.3s ease;
    }
  `;

  // Chat HTML
  const chatHTML = `
    <div class="chat-container">
      <div class="chat-header">
        <h3>${config.title}</h3>
        <button class="chat-toggle">−</button>
      </div>
      <div class="chat-body" id="chat-body"></div>
      <div class="input-container">
        <input type="text" id="chat-input" placeholder="Type your message..." />
        <button id="send-button">Send</button>
      </div>
    </div>
  `;

  // Attach elements
  shadow.appendChild(style);
  shadow.innerHTML += chatHTML;

  // Add to DOM
  document.body.appendChild(widget);

  // Chat functionality
  const chatContainer = shadow.querySelector('.chat-container');
  const chatBody = shadow.getElementById('chat-body');
  const chatInput = shadow.getElementById('chat-input');
  const sendButton = shadow.getElementById('send-button');
  const chatToggle = shadow.querySelector('.chat-toggle');

  function addMessage(message, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  async function handleUserInput() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, true);
    chatInput.value = '';

    try {
      const response = await fetch('https://salesbase.vercel.app/api/1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      addMessage(data.reply, false);
    } catch (error) {
      addMessage('Sorry, there was an error connecting to the chat service.', false);
    }
  }

  // Event listeners
  sendButton.addEventListener('click', handleUserInput);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
  });

  let isOpen = true;
  chatToggle.addEventListener('click', () => {
    isOpen = !isOpen;
    chatBody.style.display = isOpen ? 'flex' : 'none';
    chatContainer.style.height = isOpen ? 'auto' : '60px';
    chatToggle.textContent = isOpen ? '−' : '+';
  });

  // Utility function to lighten or darken a color
  function lightenDarkenColor(col, amt) {
    let usePound = false;
    if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
    }
    let num = parseInt(col,16);
    let r = (num >> 16) + amt;
    let b = ((num >> 8) & 0x00FF) + amt;
    let g = (num & 0x0000FF) + amt;
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
  }
})();
