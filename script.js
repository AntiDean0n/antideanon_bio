const music = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');

const buttons = document.querySelectorAll('nav button');
const sections = {
  main: document.getElementById('main'),
  deffers: document.getElementById('deffers'),
  price: document.getElementById('price'),
  faq: document.getElementById('faq'),
  contact: document.getElementById('contact')
};
const commandInput = document.getElementById('command-input');
const logOutput = document.getElementById('log-output');

let currentTypingEffect = null;
let logInterval = null;

function toggleSound() {
  if (music.paused) {
    music.play();
    musicIcon.textContent = '🔊';
  } else {
    music.pause();
    musicIcon.textContent = '🔈';
  }
}

function typeEffect(element, text, cursorElement) {
  if (currentTypingEffect) {
    clearInterval(currentTypingEffect.interval);
    currentTypingEffect.element.textContent = currentTypingEffect.fullText;
    currentTypingEffect.cursor.style.display = 'none';
  }

  element.textContent = '';
  cursorElement.style.display = 'inline-block';
  let i = 0;
  const speed = 25;
  const fullText = text.trim();

  const interval = setInterval(() => {
    if (i < fullText.length) {
      element.textContent += fullText.charAt(i);
      i++;
    } else {
      clearInterval(interval);
      cursorElement.style.display = 'inline-block';
    }
  }, speed);

  currentTypingEffect = { element: element, interval: interval, fullText: fullText, cursor: cursorElement };
}

function showSection(id) {
  if (currentTypingEffect) {
    clearInterval(currentTypingEffect.interval);
    currentTypingEffect.element.textContent = currentTypingEffect.fullText;
    currentTypingEffect.cursor.style.display = 'none';
    currentTypingEffect = null;
  }

  let currentActiveSection = null;
  for (const key in sections) {
    if (sections[key].classList.contains('active-section')) {
      currentActiveSection = sections[key];
      break;
    }
  }

  const showTargetSection = () => {
    const targetSection = sections[id];
    if (!targetSection) {
      console.error("Section not found:", id);
      return;
    }
    targetSection.style.display = 'block';
    targetSection.offsetHeight;
    targetSection.classList.add('active-section');

    if (id !== 'main') {
      const preElement = targetSection.querySelector('pre[data-typed-text]');
      const cursorElement = targetSection.querySelector('.typed-cursor');
      if (preElement && cursorElement) {
        typeEffect(preElement, preElement.getAttribute('data-typed-text'), cursorElement);
      }
    } else {
      const mainCursor = sections.main.querySelector('.typed-cursor');
      if (mainCursor) mainCursor.style.display = 'none';
    }
  };

  if (currentActiveSection) {
    currentActiveSection.classList.remove('active-section');
    currentActiveSection.addEventListener('transitionend', function handler() {
      currentActiveSection.style.display = 'none';
      currentActiveSection.removeEventListener('transitionend', handler);
      showTargetSection();
    }, { once: true });
  } else {
    showTargetSection();
  }

  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === id);
  });
}

const commands = {
  'help': () => {
    outputToTerminal(` 
 Available commands: 
   show <section>  - Displays a section (e.g., show bio, show deffers, show price, show faq, show contact) 
   set theme <color> - Changes the terminal theme (e.g., set theme green, set theme red, set theme default) 
   clear           - Clears the terminal output 
   whoami          - Displays information about you (Easter egg) 
   ping            - Tests network connectivity (dummy) 
   play game       - Launches a simple text-based game (Easter egg) 
     `);
  },
  'show': (args) => {
    const sectionName = args[0];
    if (sections[sectionName]) {
      showSection(sectionName);
      outputToTerminal(`Section loaded: ${sectionName.toUpperCase()}.`);
    } else {
      outputToTerminal(`[ERROR] Unknown section: ${sectionName}. Try 'show bio'.`, true);
    }
  },
  'set theme': (args) => {
    const themeName = args[0];
    const body = document.body;
    body.classList.remove('theme-green', 'theme-red');

    if (themeName === 'green') {
      body.classList.add('theme-green');
      outputToTerminal(`Theme set to GREEN.`);
    } else if (themeName === 'red') {
      body.classList.add('theme-red');
      outputToTerminal(`Theme set to RED.`);
    } else if (themeName === 'default') {
      outputToTerminal(`Theme set to DEFAULT.`);
    } else {
      outputToTerminal(`[ERROR] Invalid theme: ${themeName}. Available: green, red, default.`, true);
    }
  },
  'clear': () => {
    logOutput.innerHTML = '';
    outputToTerminal("Terminal cleared.");
  },
  'whoami': () => {
    outputToTerminal(` 
 You are a visitor in the Antideanon Cyber Terminal. 
 Your IP: ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)} 
 Status: Authenticated Guest. 
 Access Level: Standard. 
 `);
  },
  'ping': () => {
    outputToTerminal("Pinging 8.8.8.8 with 32 bytes of data...");
    setTimeout(() => outputToTerminal("Reply from 8.8.8.8: bytes=32 time=1ms TTL=118"), 500);
    setTimeout(() => outputToTerminal("Reply from 8.8.8.8: bytes=32 time=2ms TTL=118"), 1000);
    setTimeout(() => outputToTerminal("Reply from 8.8.8.8: bytes=32 time=1ms TTL=118"), 1500);
    setTimeout(() => outputToTerminal("Ping statistics for 8.8.8.8:\n    Packets: Sent = 3, Received = 3, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 1ms, Maximum = 2ms, Average = 1ms"), 2000);
  },
  'play game': () => {
    outputToTerminal(` 
 Initiating Text Adventure... 
 Welcome, Hacker. You are at a crossroads. 
 Type 'left' or 'right'.`);

    let gameActive = true;
    const gameHandler = (e) => {
      if (e.key === 'Enter') {
        const input = commandInput.value.trim().toLowerCase();
        commandInput.value = '';
        if (!gameActive) return;

        if (input === 'left') {
          outputToTerminal("You chose left. You find a data chip. (End of demo game)");
          gameActive = false;
          commandInput.removeEventListener('keydown', gameHandler);
        } else if (input === 'right') {
          outputToTerminal("You chose right. A firewall blocks your path. (End of demo game)");
          gameActive = false;
          commandInput.removeEventListener('keydown', gameHandler);
        } else {
          outputToTerminal("[GAME] Invalid move. Type 'left' or 'right'.");
        }
      }
    };
    commandInput.addEventListener('keydown', gameHandler);
  }
};

function outputToTerminal(message, isError = false) {
  const span = document.createElement('span');
  const timestamp = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  span.textContent = `[${timestamp}] ${message}`;
  if (isError) {
    span.style.color = 'var(--accent-color)';
  }
  logOutput.appendChild(span);
  logOutput.scrollTop = logOutput.scrollHeight;
}

commandInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const command = commandInput.value.trim();
    commandInput.value = '';
    outputToTerminal(`> ${command}`);

    if (command === '') return;

    const parts = command.toLowerCase().split(' ');
    const mainCommand = parts[0];
    const args = parts.slice(1);

    if (commands[command]) {
      commands[command]();
    } else if (commands[mainCommand] && typeof commands[mainCommand] === 'function') {
        commands[mainCommand](args);
    } else if (commands[mainCommand + ' ' + args[0]]) {
        commands[mainCommand + ' ' + args[0]](args.slice(1));
    } else {
      outputToTerminal(`[ERROR] UNKNOWN_COMMAND: '${command}'. Type 'help' for options.`, true);
    }
  }
});

const systemLogMessages = [
  "SCANNING NETWORK_INTEGRITY_PROTOCOLS...",
  "STATUS: ALL_MODULES_ONLINE.",
  "DATA_STREAM_INITIATED: PORT 443.",
  "DECRYPTING_PACKET_SEQUENCE_0xAF32...",
  "TRAFFIC_ANALYSIS: LOW_LATENCY_DETECTION.",
  "SECURE_CONNECTION_ESTABLISHED.",
  "MONITORING_ANOMALY_DETECTION_SYSTEMS.",
  "PROTOCOL_HANDSHAKE_COMPLETE.",
  "PROCESSING_REQUEST_0xBE1C...",
  "FIREWALL_STATUS: OPTIMAL_PERFORMANCE.",
  "ENCRYPTING_OUTGOING_DATA_PACKETS...",
  "SYSTEM_HEALTH: NOMINAL.",
  "CHECKING_ACCESS_LOGS_FOR_INTRUSIONS...",
  "IDLE_MODE_ACTIVATED. POWER_SAVE: 75%.",
  "UPDATING_THREAT_DATABASE_VERSION_4.7.1...",
  "ALERT: NO_THREATS_DETECTED.",
  "ROUTING_THROUGH_SECURE_PROXY_NODE_B9C.",
  "GENERATING_ENCRYPTION_KEYS...",
  "SYNCHRONIZING_SYSTEM_CLOCK_WITH_NTP_SERVER."
];

function generateSystemLog() {
  const randomIndex = Math.floor(Math.random() * systemLogMessages.length);
  const message = systemLogMessages[randomIndex];
  const span = document.createElement('span');
  const timestamp = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  span.textContent = `[${timestamp}] ${message}`;
  logOutput.appendChild(span);

  if (logOutput.children.length > 50) {
    logOutput.removeChild(logOutput.children[0]);
  }
  logOutput.scrollTop = logOutput.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
  music.play().catch(e => {
    console.log("Autoplay music failed:", e);
    musicIcon.textContent = '🔈';
  });

  showSection('main');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target;
      showSection(targetId);
    });
  });

  logInterval = setInterval(generateSystemLog, 3000 + Math.random() * 2000);
});

buttons.forEach(button => {
  button.addEventListener('mouseover', () => {
    button.style.filter = 'url(#glitch)';
  });
  button.addEventListener('mouseout', () => {
    button.style.filter = 'none';
  });
});
