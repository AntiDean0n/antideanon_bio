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

// Элементы консоли теперь находятся внутри #main, получаем их оттуда
const mainSection = document.getElementById('main');
const logOutput = mainSection.querySelector('#log-output');
const commandInput = mainSection.querySelector('#command-input'); // Это поле теперь readonly

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

    // Логика отображения/скрытия консоли
    if (id === 'main') {
      // Когда основная секция активна, показываем консоль
      mainSection.querySelector('.system-logs').style.display = 'block';
      mainSection.querySelector('.terminal-footer').style.display = 'flex';
      // Перезапускаем логи, если они были остановлены
      if (!logInterval) {
          logInterval = setInterval(generateSystemLog, 3000 + Math.random() * 2000);
      }
    } else {
      // В других секциях скрываем консоль
      mainSection.querySelector('.system-logs').style.display = 'none';
      mainSection.querySelector('.terminal-footer').style.display = 'none';
      // Останавливаем генерацию логов, если консоль неактивна
      clearInterval(logInterval);
      logInterval = null;
    }

    targetSection.style.display = 'block';
    targetSection.offsetHeight; // Запускаем рефлоу для срабатывания transition
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

  showSection('main'); // Показываем 'main' секцию по умолчанию при загрузке, что активирует консоль

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target;
      showSection(targetId);
    });
  });
});

buttons.forEach(button => {
  button.addEventListener('mouseover', () => {
    button.style.filter = 'url(#glitch)';
  });
  button.addEventListener('mouseout', () => {
    button.style.filter = 'none';
  });
});
