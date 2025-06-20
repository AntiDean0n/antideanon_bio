// --- Элементы управления звуком ---
const music = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');
const musicBox = document.querySelector('.music-box'); // Получаем элемент music-box

// --- Основные элементы интерфейса ---
const buttons = document.querySelectorAll('nav button'); // Кнопки навигации
const sections = { // Объект для удобного доступа к секциям по их ID
    main: document.getElementById('main'),
    deffers: document.getElementById('deffers'),
    price: document.getElementById('price'),
    faq: document.getElementById('faq'),
    contact: document.getElementById('contact')
};
const commandInput = document.getElementById('command-input'); // Поле ввода команд
const logOutput = document.getElementById('log-output'); // Область для системных логов
const systemLogsBox = document.querySelector('.system-logs'); // Получаем элемент system-logs

let currentTypingEffect = null; // Переменная для хранения информации о текущем эффекте набора текста
let logInterval = null; // Переменная для интервала генерации системных логов

// --- НОВЫЕ ЭЛЕМЕНТЫ ДЛЯ ЛОГИНА И АДМИН-ПАНЕЛИ ---
const loginButton = document.getElementById('login-button');
const loginModal = document.getElementById('login-modal');
const closeButton = loginModal.querySelector('.close-button');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const submitLoginButton = document.getElementById('submit-login');
const loginMessage = document.getElementById('login-message');
const adminInfoDiv = document.getElementById('admin-info');
const viewCountSpan = document.getElementById('view-count');

// --- Учетные данные админа (ВНИМАНИЕ: НЕБЕЗОПАСНО!) ---
const ADMIN_USERNAME = 'fame.antideanon';
const ADMIN_PASSWORD = 'NeDarkKich22561.*'; // Пароль содержит специальные символы, будьте внимательны при копировании

// --- Функция для увеличения и получения счетчика просмотров ---
function updateAndGetViewCount() {
    let views = parseInt(localStorage.getItem('siteViews') || 0);
    if (!sessionStorage.getItem('sessionVisited')) {
        // Увеличиваем счетчик только один раз за сессию (пока открыт браузер)
        views++;
        localStorage.setItem('siteViews', views);
        sessionStorage.setItem('sessionVisited', 'true');
    }
    return views;
}

// --- Управление фоновой музыкой ---
function toggleSound() {
    if (music.paused) {
        music.play();
        musicIcon.textContent = '🔊'; // Иконка громкости
    } else {
        music.pause();
        musicIcon.textContent = '🔈'; // Иконка тишины
    }
}

// --- Функция для эффекта набора текста ---
function typeEffect(element, text, cursorElement) {
    // Если есть активный эффект набора, останавливаем его и отображаем весь текст
    if (currentTypingEffect) {
        clearInterval(currentTypingEffect.interval);
        currentTypingEffect.element.textContent = currentTypingEffect.fullText;
        currentTypingEffect.cursor.style.display = 'none'; // Скрываем старый курсор
    }

    element.textContent = ''; // Очищаем содержимое элемента
    cursorElement.style.display = 'inline-block'; // Показываем курсор
    let i = 0;
    const speed = 25; // Скорость набора (мс на символ)
    const fullText = text.trim(); // Удаляем лишние пробелы в начале/конце

    // Запускаем интервал для посимвольного вывода текста
    const interval = setInterval(() => {
        if (i < fullText.length) {
            element.textContent += fullText.charAt(i); // Добавляем следующий символ
            i++;
        } else {
            clearInterval(interval); // Останавливаем интервал, когда текст набран
            cursorElement.style.display = 'inline-block'; // Показываем курсор после завершения набора
        }
    }, speed);

    // Сохраняем информацию о текущем эффекте для возможности его остановки
    currentTypingEffect = { element: element, interval: interval, fullText: fullText, cursor: cursorElement };
}

// --- Функция для показа определенной секции ---
function showSection(id) {
    // Останавливаем активный эффект набора, если пользователь переключает секцию
    if (currentTypingEffect) {
        clearInterval(currentTypingEffect.interval);
        currentTypingEffect.element.textContent = currentTypingEffect.fullText;
        currentTypingEffect.cursor.style.display = 'none';
        currentTypingEffect = null;
    }

    let currentActiveSection = null;
    // Ищем текущую активную секцию
    for (const key in sections) {
        if (sections[key].classList.contains('active-section')) {
            currentActiveSection = sections[key];
            break;
        }
    }

    // Вспомогательная функция для показа целевой секции
    const showTargetSection = () => {
        const targetSection = sections[id];
        if (!targetSection) {
            console.error("Section not found:", id);
            return;
        }
        // Сначала делаем видимой (display: block) до добавления active-section,
        // чтобы переход opacity/transform сработал.
        targetSection.style.display = 'block';
        targetSection.offsetHeight; // Принудительный reflow для активации CSS-перехода
        targetSection.classList.add('active-section'); // Добавляем класс для активации стилей показа

        // Если секция не 'main', запускаем эффект набора текста
        if (id !== 'main') {
            const preElement = targetSection.querySelector('pre[data-typed-text]');
            const cursorElement = targetSection.querySelector('.typed-cursor');
            if (preElement && cursorElement) {
                typeEffect(preElement, preElement.getAttribute('data-typed-text'), cursorElement);
            }
        } else {
            // Для 'main' секции скрываем курсор, так как там своя анимация 'waiting-line'
            const mainCursor = sections.main.querySelector('.typed-cursor');
            if (mainCursor) mainCursor.style.display = 'none';

            // Показываем админ-информацию, если пользователь залогинен
            if (localStorage.getItem('isAdminLoggedIn') === 'true') {
                adminInfoDiv.style.display = 'block';
                viewCountSpan.textContent = localStorage.getItem('siteViews') || '0';
            } else {
                adminInfoDiv.style.display = 'none';
            }
        }
    };

    if (currentActiveSection) {
        // Если есть активная секция, сначала скрываем ее
        currentActiveSection.classList.remove('active-section');
        // Добавляем слушатель события transitionend, чтобы скрыть элемент после завершения анимации
        currentActiveSection.addEventListener('transitionend', function handler() {
            currentActiveSection.style.display = 'none'; // Скрываем элемент после завершения перехода
            currentActiveSection.removeEventListener('transitionend', handler); // Удаляем слушатель
            showTargetSection(); // Теперь показываем новую секцию
        }, { once: true }); // Слушатель сработает только один раз
    } else {
        // Если нет активной секции (например, при первой загрузке страницы), сразу показываем целевую
        showTargetSection();
    }

    // Обновляем активную кнопку навигации
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === id);
    });
}

// --- Объект с командами для командной строки ---
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
    logout          - Logs out from admin panel (if logged in)
        `);
    },
    'show': (args) => {
        const sectionName = args[0];
        if (sections[sectionName]) {
            showSection(sectionName); // Вызываем функцию показа секции
            outputToTerminal(`Section loaded: ${sectionName.toUpperCase()}.`);
        } else {
            outputToTerminal(`[ERROR] Unknown section: ${sectionName}. Try 'show bio'.`, true);
        }
    },
    'set theme': (args) => {
        const themeName = args[0];
        const body = document.body;
        // Удаляем все классы тем, чтобы избежать конфликтов
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
        logOutput.innerHTML = ''; // Очищаем содержимое логов
        outputToTerminal("Terminal cleared.");
    },
    'whoami': () => {
        const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
        outputToTerminal(`
You are a visitor in the Antideanon Cyber Terminal.
Your IP: ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}
Status: ${isAdmin ? 'Authenticated Administrator' : 'Authenticated Guest'}.
Access Level: ${isAdmin ? 'Administrator' : 'Standard'}.
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

        let gameActive = true; // Флаг для управления состоянием игры
        const gameHandler = (e) => { // Временный обработчик для игрового ввода
            if (e.key === 'Enter') {
                const input = commandInput.value.trim().toLowerCase();
                commandInput.value = ''; // Очищаем поле
                if (!gameActive) return;

                if (input === 'left') {
                    outputToTerminal("You chose left. You find a data chip. (End of demo game)");
                    gameActive = false;
                    commandInput.removeEventListener('keydown', gameHandler); // Удаляем обработчик после завершения игры
                } else if (input === 'right') {
                    outputToTerminal("You chose right. A firewall blocks your path. (End of demo game)");
                    gameActive = false;
                    commandInput.removeEventListener('keydown', gameHandler); // Удаляем обработчик
                } else {
                    outputToTerminal("[GAME] Invalid move. Type 'left' or 'right'.");
                }
            }
        };
        commandInput.addEventListener('keydown', gameHandler); // Добавляем временный обработчик событий
    },
    'logout': () => {
        localStorage.removeItem('isAdminLoggedIn');
        outputToTerminal("Logged out successfully.");
        adminInfoDiv.style.display = 'none'; // Скрываем админ-информацию
        showSection('main'); // Переключаемся на основную секцию
    }
};


// --- Функция для вывода сообщений в лог терминала ---
function outputToTerminal(message, isError = false) {
    const span = document.createElement('span'); // Создаем новый span-элемент
    const timestamp = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    span.textContent = `[${timestamp}] ${message}`; // Добавляем временную метку и сообщение
    if (isError) {
        span.style.color = 'var(--accent-color)'; // Красим ошибку в акцентный цвет
    }
    logOutput.appendChild(span); // Добавляем сообщение в блок логов
    logOutput.scrollTop = logOutput.scrollHeight; // Прокручиваем лог до конца
}

// --- Сообщения для системных логов на фоне ---
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

// --- Функция для генерации случайных системных логов ---
function generateSystemLog() {
    const randomIndex = Math.floor(Math.random() * systemLogMessages.length);
    const message = systemLogMessages[randomIndex];
    const span = document.createElement('span');
    const timestamp = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    span.textContent = `[${timestamp}] ${message}`;
    logOutput.appendChild(span);

    // Ограничиваем количество строк в логах, чтобы не перегружать DOM
    if (logOutput.children.length > 50) {
        logOutput.removeChild(logOutput.children[0]); // Удаляем самую старую строку
    }
    logOutput.scrollTop = logOutput.scrollHeight; // Прокрутка к последнему сообщению
}

// --- Функция для определения типа устройства и управления видимостью блоков ---
function handleDeviceDisplay() {
    // Ширина, при которой считаем устройство "мобильным" (можно настроить)
    const mobileBreakpoint = 768; // px

    if (window.innerWidth <= mobileBreakpoint) {
        // Мобильное устройство: скрываем music-box и system-logs
        musicBox.style.display = 'none';
        systemLogsBox.style.display = 'none';
        // Очищаем интервал логов, чтобы не расходовать ресурсы, когда они не видны
        if (logInterval) {
            clearInterval(logInterval);
            logInterval = null;
        }
    } else {
        // ПК: показываем music-box и system-logs
        musicBox.style.display = 'flex'; // Предполагаем, что изначально music-box имеет display: flex
        systemLogsBox.style.display = 'block'; // Предполагаем, что изначально system-logs имеет display: block
        // Возобновляем генерацию логов, если ее нет
        if (!logInterval) {
            logInterval = setInterval(generateSystemLog, 3000 + Math.random() * 2000);
        }
    }
}


// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {
    // Пытаемся воспроизвести музыку автоматически.
    // Браузеры могут блокировать автовоспроизведение без взаимодействия пользователя.
    music.play().catch(e => {
        console.log("Autoplay music failed:", e);
        musicIcon.textContent = '🔈'; // Если автовоспроизведение не сработало, показываем иконку "выключен звук"
    });

    // Обновляем счетчик просмотров при каждой загрузке страницы
    updateAndGetViewCount();

    showSection('main'); // Показываем 'main' секцию по умолчанию при загрузке

    // Добавляем обработчики кликов для кнопок навигации
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target; // Получаем ID целевой секции из data-атрибута
            if (targetId) { // Проверяем, что data-target существует (для кнопок секций)
                showSection(targetId); // Вызываем функцию показа секции
            }
        });
    });

    // Вызываем функцию определения типа устройства при загрузке
    handleDeviceDisplay();
    // Добавляем слушатель события изменения размера окна
    window.addEventListener('resize', handleDeviceDisplay);


    // --- ОБРАБОТЧИКИ ДЛЯ ЛОГИНА ---
    loginButton.addEventListener('click', () => {
        loginModal.style.display = 'flex'; // Показываем модальное окно
        usernameInput.value = ''; // Очищаем поля
        passwordInput.value = '';
        loginMessage.textContent = ''; // Очищаем сообщение об ошибке
        usernameInput.focus(); // Устанавливаем фокус на поле логина
    });

    closeButton.addEventListener('click', () => {
        loginModal.style.display = 'none'; // Скрываем модальное окно
    });

    // Закрытие модального окна по клику вне его содержимого
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // Функция для обработки логина
    const handleLogin = () => {
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('isAdminLoggedIn', 'true'); // Сохраняем статус входа
            loginModal.style.display = 'none';
            outputToTerminal("Admin login successful. Welcome, Antideanon!", false);
            showSection('main'); // Переключаемся на главную секцию, чтобы обновить отображение
            // Обновляем отображение счетчика просмотров
            viewCountSpan.textContent = localStorage.getItem('siteViews') || '0';
        } else {
            loginMessage.textContent = 'Access Denied: Invalid credentials.';
            outputToTerminal("[ERROR] Attempted unauthorized access.", true);
        }
    };

    // Обработчик кнопки "Enter" в модальном окне
    submitLoginButton.addEventListener('click', handleLogin);

    // Обработка Enter в поле логина: переводит фокус на поле пароля
    usernameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Предотвращаем стандартное поведение Enter (отправка формы)
            passwordInput.focus(); // Переводим фокус на поле пароля
        }
    });

    // Обработка Enter в поле пароля: вызывает функцию логина
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Предотвращаем стандартное поведение Enter
            handleLogin(); // Вызываем функцию логина
        }
    });
});

// --- Глитч эффект для кнопок навигации (при наведении) ---
buttons.forEach(button => {
    button.addEventListener('mouseover', () => {
        button.style.filter = 'url(#glitch)'; // Применяем SVG-фильтр
    });
    button.addEventListener('mouseout', () => {
        button.style.filter = 'none'; // Удаляем фильтр
    });
});
