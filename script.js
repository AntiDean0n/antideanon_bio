// Получаем ссылки на элементы DOM
const navButtons = document.querySelectorAll('nav button');
const sections = {};
document.querySelectorAll('section').forEach(section => {
  sections[section.id] = section;
});
const logOutput = document.getElementById('log-output');
const commandInput = document.getElementById('command-input');
const musicBox = document.getElementById('music-box');
const bgMusic = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');

// --- Глобальные переменные для OSINT ---
let currentOsintMode = ''; // 'phone' или 'ip'
const osintInputArea = document.getElementById('osint-input-area');
const osintInput = document.getElementById('osint-input');
const osintSubmitBtn = document.getElementById('osint-submit-btn');
const osintResults = document.getElementById('osint-results');
const osintPhoneBtn = document.getElementById('search-phone-btn');
const osintIpBtn = document.getElementById('search-ip-btn');

// ВАЖНО: Ваш API ключ NumVerify.
// Помните, что при использовании CORS-прокси, этот ключ всё ещё виден в коде браузера.
const NUMVERIFY_API_KEY = 'b1a2969c8ecb83a7f0d6d2ca159e6819';

// --- Вспомогательные функции валидации ---
function isValidPhoneNumber(input) {
  // Простая валидация: начинается с '+' и содержит только цифры, допустимые символы номера.
  // Можно сделать более строгую регулярку, но для начала этого хватит.
  return /^\+[0-9\s-()]{7,25}$/.test(input);
}

function isValidIpAddress(input) {
  // Валидация IPv4 (простая)
  const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (ipv4Regex.test(input)) {
    return input.split('.').every(segment => parseInt(segment, 10) >= 0 && parseInt(segment, 10) <= 255);
  }
  // Валидация IPv6 (очень простая, можно улучшить)
  const ipv6Regex = /^[0-9a-fA-F:\.]{2,45}$/; // Базовая проверка на символы IPv6
  return ipv6Regex.test(input);
}

// --- Функции эффектов и логики ---

// Функция для вывода текста в лог
function outputToTerminal(text) {
  const span = document.createElement('span');
  span.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logOutput.appendChild(span);
  logOutput.scrollTop = logOutput.scrollHeight; // Прокрутка вниз
}

// Эффект набора текста
function typeEffect(element, text, cursorElement, delay = 50) {
  element.textContent = ''; // Очищаем текст перед набором
  if (cursorElement) cursorElement.style.display = 'inline-block'; // Показываем курсор
  let i = 0;
  const type = () => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, delay);
    } else {
      if (cursorElement) cursorElement.style.display = 'none'; // Скрываем курсор после набора
    }
  };
  type();
}

// Функция переключения секций
function showSection(id) {
  // Скрываем все секции
  Object.values(sections).forEach(section => {
    section.classList.remove('active-section');
    section.style.position = 'absolute'; // Возвращаем для скрытия
    section.style.visibility = 'hidden';
  });

  // Показываем выбранную секцию
  const targetSection = sections[id];
  if (targetSection) {
    targetSection.classList.add('active-section');
    targetSection.style.position = 'static'; // Делаем статичной для отображения
    targetSection.style.visibility = 'visible';

    // Обновляем активную кнопку навигации
    navButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`nav button[data-target="${id}"]`).classList.add('active');

    // Если секция не 'main', запускаем эффект набора текста
    if (id !== 'main') {
      const preElement = targetSection.querySelector('pre[data-typed-text]');
      const cursorElement = targetSection.querySelector('.typed-cursor');
      if (preElement && cursorElement && id !== 'osint') {
        // Для всех, кроме OSINT, запускаем эффект печати
        typeEffect(preElement, preElement.getAttribute('data-typed-text'), cursorElement);
      } else if (id === 'osint') {
        // Для OSINT секции сбрасываем состояние
        currentOsintMode = ''; // Сбрасываем выбранный режим
        osintInput.placeholder = 'Выберите тип поиска'; // Общий плейсхолдер
        osintResults.textContent = `
Выберите тип поиска и введите данные, чтобы получить информацию.
Например:
  Для номера телефона: +1234567890
  Для IP-адреса: 8.8.8.8
        `; // Начальный текст
        osintInput.value = ''; // Очищаем поле ввода
        osintInputArea.style.display = 'flex'; // Убедимся, что поле ввода видно

        // Убираем активные стили с кнопок OSINT
        osintPhoneBtn.classList.remove('active');
        osintIpBtn.classList.remove('active');
      }
    } else {
      // Для 'main' секции скрываем курсор
      const mainCursor = sections.main.querySelector('.typed-cursor');
      if (mainCursor) mainCursor.style.display = 'none';
    }

    outputToTerminal(`Переход к секции: ${id}`);
  }
}

// Переключение звука
function toggleSound() {
  if (bgMusic.paused) {
    bgMusic.play().then(() => {
      musicIcon.textContent = '🔊';
      outputToTerminal('Музыка включена.');
    }).catch(error => {
      console.error("Ошибка воспроизведения музыки:", error);
      outputToTerminal('Не удалось воспроизвести музыку (возможно, заблокировано браузером).');
    });
  } else {
    bgMusic.pause();
    musicIcon.textContent = '🔇';
    outputToTerminal('Музыка выключена.');
  }
}

// --- Обработчики событий ---

// Навигационные кнопки
navButtons.forEach(button => {
  button.addEventListener('click', () => {
    showSection(button.dataset.target);
  });
});

// Обработчики кнопок выбора режима поиска OSINT
osintPhoneBtn.addEventListener('click', () => {
  currentOsintMode = 'phone';
  osintInputArea.style.display = 'flex';
  osintInput.placeholder = 'Введите номер телефона (например, +1234567890)';
  osintResults.textContent = '';
  osintInput.value = '';
  outputToTerminal("Режим OSINT: Поиск по номеру. Введите номер и нажмите Искать.");

  // Управление активными классами кнопок
  osintPhoneBtn.classList.add('active');
  osintIpBtn.classList.remove('active');
});

osintIpBtn.addEventListener('click', () => {
  currentOsintMode = 'ip';
  osintInputArea.style.display = 'flex';
  osintInput.placeholder = 'Введите IP-адрес (например, 8.8.8.8)';
  osintResults.textContent = '';
  osintInput.value = '';
  outputToTerminal("Режим OSINT: Поиск по IP. Введите IP и нажмите Искать.");

  // Управление активными классами кнопок
  osintIpBtn.classList.add('active');
  osintPhoneBtn.classList.remove('active');
});

// Обработчик кнопки "Искать"
osintSubmitBtn.addEventListener('click', () => {
  const query = osintInput.value.trim();
  if (!query) {
    outputToTerminal("Введите запрос для поиска.");
    osintResults.textContent = "Ошибка: Введите запрос для поиска.";
    return;
  }
  performOsintSearch(query);
});


// Функция выполнения поиска OSINT с использованием CORS-прокси и валидацией
async function performOsintSearch(query) {
  osintResults.textContent = 'Поиск...';
  outputToTerminal(`Выполняется OSINT поиск для: "${query}"...`);

  let apiUrl = '';
  let errorMessage = 'Ошибка при выполнении поиска.';

  if (currentOsintMode === 'phone') {
    if (!isValidPhoneNumber(query)) {
      osintResults.textContent = 'Ошибка: Неверный формат номера телефона. Используйте формат: +1234567890.';
      outputToTerminal('Ошибка: Неверный формат номера телефона.');
      return;
    }
    const numverifyBaseUrl = `http://apilayer.net/api/validate?access_key=${NUMVERIFY_API_KEY}&number=${encodeURIComponent(query)}&country_code=&format=1`;
    apiUrl = `https://corsproxy.io/?${encodeURIComponent(numverifyBaseUrl)}`;
    errorMessage = 'Ошибка при поиске номера: Проверьте правильность номера или доступность сервиса.';
  } else if (currentOsintMode === 'ip') {
    if (!isValidIpAddress(query)) {
      osintResults.textContent = 'Ошибка: Неверный формат IP-адреса. Используйте формат: 8.8.8.8 или валидный IPv6.';
      outputToTerminal('Ошибка: Неверный формат IP-адреса.');
      return;
    }
    const ipApiBaseUrl = `http://ip-api.com/json/${encodeURIComponent(query)}?fields=status,message,query,country,countryCode,region,regionName,city,zip,lat,lon,timezone,offset,isp,org,as,asname,mobile,proxy,hosting`;
    apiUrl = `https://corsproxy.io/?${encodeURIComponent(ipApiBaseUrl)}`;
    errorMessage = 'Ошибка при поиске IP: Проверьте правильность IP или доступность сервиса.';
  } else {
    osintResults.textContent = 'Выберите режим поиска (по номеру или по IP).';
    outputToTerminal('Ошибка: Режим OSINT не выбран.');
    return;
  }

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    displayOsintResults(data);
  } catch (error) {
    console.error('OSINT Search Error:', error);
    osintResults.textContent = `${errorMessage} (${error.message})`;
    outputToTerminal(`Ошибка OSINT: ${errorMessage}`);
  }
}

// Функция отображения результатов OSINT
function displayOsintResults(data) {
  let resultText = '';
  if (currentOsintMode === 'phone') {
    if (data.valid) {
      resultText += `Статус: ✅ Валидный номер\n`;
      resultText += `Номер: ${data.number || 'N/A'}\n`;
      resultText += `Локальный формат: ${data.local_format || 'N/A'}\n`;
      resultText += `Международный формат: ${data.international_format || 'N/A'}\n`;
      resultText += `Страна: ${data.country_name || 'N/A'} (${data.country_code || 'N/A'})\n`;
      if (data.location && data.location !== data.country_name) {
        resultText += `Регион/Город: ${data.location || 'N/A'}\n`;
      }
      resultText += `Оператор: ${data.carrier || 'N/A'}\n`;
      resultText += `Тип линии: ${data.line_type || 'N/A'}\n`;
    } else {
      resultText += `Статус: ❌ Невалидный номер или ошибка API.\n`;
      if (data.error) {
        resultText += `Код ошибки: ${data.error.code}\n`;
        resultText += `Сообщение: ${data.error.info}\n`;
      } else {
        resultText += `Нет данных или номер не валиден.`;
      }
    }
  } else if (currentOsintMode === 'ip') {
    if (data.status === 'success') {
      resultText += `Статус: ✅ Успешно\n`;
      resultText += `IP-адрес: ${data.query || 'N/A'}\n`;
      resultText += `Страна: ${data.country || 'N/A'} (${data.countryCode || 'N/A'})\n`;
      resultText += `Регион: ${data.regionName || 'N/A'} (${data.region || 'N/A'})\n`;
      resultText += `Город: ${data.city || 'N/A'}\n`;
      resultText += `Почтовый индекс: ${data.zip || 'N/A'}\n`;
      resultText += `Широта/Долгота: ${data.lat || 'N/A'}, ${data.lon || 'N/A'}\n`;
      resultText += `Часовой пояс: ${data.timezone || 'N/A'}\n`;
      resultText += `ISP (Провайдер): ${data.isp || 'N/A'}\n`;
      resultText += `Организация: ${data.org || 'N/A'}\n`;
      resultText += `AS (Автономная система): ${data.as || 'N/A'} (${data.asname || 'N/A'})\n`;
      resultText += `Мобильная сеть: ${data.mobile ? 'Да' : 'Нет'}\n`;
      resultText += `Прокси/VPN: ${data.proxy ? 'Да' : 'Нет'}\n`;
      resultText += `Хостинг: ${data.hosting ? 'Да' : 'Нет'}\n`;
    } else {
      resultText += `Статус: ❌ ${data.message || 'Ошибка'}\n`;
      resultText += `Не удалось получить информацию для IP-адреса.`;
    }
  }
  osintResults.textContent = resultText;
  outputToTerminal("OSINT поиск завершен.");
}


// Обработка командной строки (футера)
commandInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const command = commandInput.value.trim().toLowerCase();
    outputToTerminal(`> ${command}`);
    processCommand(command);
    commandInput.value = '';
  }
});

function processCommand(command) {
  const parts = command.split(' ');
  const cmd = parts[0];

  switch (cmd) {
    case 'help':
      outputToTerminal('Доступные команды:');
      outputToTerminal('  help - показать список команд');
      outputToTerminal('  clear - очистить лог');
      outputToTerminal('  goto [секция] - перейти к секции (main, deffers, price, faq, osint, contact)');
      outputToTerminal('  set theme [green/red/default] - изменить тему оформления');
      outputToTerminal('  play - включить музыку');
      outputToTerminal('  pause - выключить музыку');
      break;
    case 'clear':
      logOutput.innerHTML = '';
      outputToTerminal('Лог очищен.');
      break;
    case 'goto':
      if (parts[1] && sections[parts[1]]) {
        showSection(parts[1]);
      } else {
        outputToTerminal('Неверная секция. Используйте: main, deffers, price, faq, osint, contact.');
      }
      break;
    case 'set':
      if (parts[1] === 'theme' && parts[2]) {
        document.body.classList.remove('theme-green', 'theme-red');
        if (parts[2] === 'green') {
          document.body.classList.add('theme-green');
          outputToTerminal('Тема изменена на зеленую.');
        } else if (parts[2] === 'red') {
          document.body.classList.add('theme-red');
          outputToTerminal('Тема изменена на красную.');
        } else if (parts[2] === 'default') {
          outputToTerminal('Тема изменена на стандартную.');
        } else {
          outputToTerminal('Неверная тема. Используйте: green, red, default.');
        }
      } else {
        outputToTerminal('Неверная команда. Пример: set theme green.');
      }
      break;
    case 'play':
      if (bgMusic.paused) {
        toggleSound();
      } else {
        outputToTerminal('Музыка уже играет.');
      }
      break;
    case 'pause':
      if (!bgMusic.paused) {
        toggleSound();
      } else {
        outputToTerminal('Музыка уже на паузе.');
      }
      break;
    default:
      outputToTerminal(`Неизвестная команда: "${command}". Введите 'help' для списка команд.`);
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  showSection('main'); // Показываем главную секцию при загрузке
  outputToTerminal('Система загружена. Введите "help" для списка команд.');

  // Изначально показываем input area и сообщение для OSINT секции
  // Это сделано здесь, чтобы при первом переходе на OSINT секцию,
  // она не казалась пустой до выбора режима.
  osintInputArea.style.display = 'flex';
  osintResults.textContent = `
Выберите тип поиска и введите данные, чтобы получить информацию.
Например:
  Для номера телефона: +1234567890
  Для IP-адреса: 8.8.8.8
  `;
});

// Автоматическое воспроизведение музыки (с учетом ограничений браузеров)
// Браузеры могут блокировать autoplay без взаимодействия пользователя.
// Поэтому лучше предложить пользователю включить музыку.
// bgMusic.play().catch(e => console.log("Music autoplay blocked", e));
