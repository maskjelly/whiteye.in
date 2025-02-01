(function() {
  const script = document.currentScript || [].slice.call(document.getElementsByTagName('script')).pop();
  
  // Configuration
  const config = {
    apiKey: script.getAttribute('data-api-key') || '',
    position: script.getAttribute('data-position') || 'bottom-right',
    title: script.getAttribute('data-title') || 'Chat Support'
  };

  // Create widget container with Shadow DOM for style isolation
  const widget = document.createElement('div');
  widget.id = 'chatbot-widget';
  const shadow = widget.attachShadow({ mode: 'open' });

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    .chat-container {
      position: fixed;
      ${config.position.includes('bottom') ? 'bottom: 20px' : 'top: 20px'};
      ${config.position.includes('right') ? 'right: 20px' : 'left: 20px'};
      width: 350px;
      background: white;
      box-shadow: 0 0 15px rgba(0,0,0,0.2);
      border-radius: 10px;
      font-family: Arial, sans-serif;
      z-index: 9999;
    }

    .chat-header {
      background: #007bff;
      color: white;
      padding: 15px;
      border-radius: 10px 10px 0 0;
      cursor: pointer;
    }

    .chat-body {
      height: 400px;
      overflow-y: auto;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .message {
      max-width: 80%;
      padding: 10px;
      border-radius: 15px;
    }

    .user-message {
      background: #007bff;
      color: white;
      align-self: flex-end;
    }

    .bot-message {
      background: #f1f1f1;
      align-self: flex-start;
    }

    .input-container {
      display: flex;
      padding: 15px;
      gap: 10px;
    }

    input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
    }
  `;

  // Chat HTML
  const chatHTML = `
    <div class="chat-container">
      <div class="chat-header">
        <h3>${config.title}</h3>
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
  const chatBody = shadow.getElementById('chat-body');
  const chatInput = shadow.getElementById('chat-input');
  const sendButton = shadow.getElementById('send-button');

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
      const response = await fetch('https://your-backend-api.com/chat', {
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
})();
