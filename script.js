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

// Получаем элементы консоли, они теперь внутри #main
const systemLogs = document.querySelector('#main .system-logs');
const logOutput = document.getElementById('log-output');
const terminalFooter = document.querySelector('#main .terminal-footer');
const commandInput = document.getElementById('command-input'); // Он теперь disabled в HTML

let currentTypingEffect = null;
let logInterval = null;
let currentSystemLogMessageIndex = 0; // Для последовательного вывода логов

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

    // Управление видимостью консоли
    if (id === 'main') {
      systemLogs.style.display = 'block';
      terminalFooter.style.display = 'flex';
      // Добавляем класс для активации анимации CSS
      systemLogs.classList.add('active-console');
      terminalFooter.classList.add('active-console');
    } else {
      // Скрываем консоль при переключении
      systemLogs.classList.remove('active-console');
      terminalFooter.classList.remove('active-console');
      // Скрываем элементы через небольшой таймаут, чтобы анимация успела отработать
      setTimeout(() => {
        systemLogs.style.display = 'none';
        terminalFooter.style.display = 'none';
      }, 600); // Должно соответствовать transition в CSS
    }

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

// Удаляем объект commands, так как консоль неактивна для ввода
// Удаляем commandInput.addEventListener, так как ввод отключен

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
  // Выводим сообщения последовательно, а не случайно
  const message = systemLogMessages[currentSystemLogMessageIndex];
  currentSystemLogMessageIndex = (currentSystemLogMessageIndex + 1) % systemLogMessages.length;

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

  // Запуск генерации системных логов с случайным интервалом
  // Логи всегда генерируются, но отображаются только когда консоль видна
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
