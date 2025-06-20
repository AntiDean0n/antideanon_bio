// --- Элементы управления звуком ---
const music = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');
const musicBox = document.querySelector('.music-box');

// --- Основные элементы интерфейса ---
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
const systemLogsBox = document.querySelector('.system-logs');

let currentTypingEffect = null;
let logInterval = null;

// --- НОВЫЕ/ИЗМЕНЕННЫЕ ЭЛЕМЕНТЫ ДЛЯ ЛОГИНА И АДМИН-ПАНЕЛИ ---
const authButton = document.getElementById('auth-button'); // Renamed from login-button
const loginModal = document.getElementById('login-modal');
const adminModal = document.getElementById('admin-modal'); // New admin panel modal
const closeButtons = document.querySelectorAll('.modal .close-button'); // Selects all close buttons for modals
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const submitLoginButton = document.getElementById('submit-login');
const loginMessage = document.getElementById('login-message');
const viewCountSpan = document.getElementById('view-count'); // This span is now inside adminModal
const adminPanelButton = document.getElementById('admin-panel-button'); // New admin panel button

// --- Учетные данные админа (ВНИМАНИЕ: НЕБЕЗОПАСНО!) ---
const ADMIN_USERNAME = 'fame.antideanon';
const ADMIN_PASSWORD = 'NeDarkKich22561.*';

// --- Функция для увеличения и получения счетчика просмотров ---
function updateAndGetViewCount() {
    let views = parseInt(localStorage.getItem('siteViews') || 0);
    // Increment view count only if it's a new session or not already incremented this session
    if (!sessionStorage.getItem('sessionVisited')) {
        views++;
        localStorage.setItem('siteViews', views);
        sessionStorage.setItem('sessionVisited', 'true');
    }
    return views;
}

// --- Обновление состояния кнопки "Login"/"Logout" и кнопки "Admin Panel" ---
function updateAuthUI() {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (isAdminLoggedIn) {
        authButton.textContent = 'Logout';
        adminPanelButton.style.display = 'block'; // Show admin panel button
        viewCountSpan.textContent = localStorage.getItem('siteViews') || '0'; // Update count if modal is shown
    } else {
        authButton.textContent = 'Login';
        adminPanelButton.style.display = 'none'; // Hide admin panel button
    }
}


// --- Управление фоновой музыкой ---
function toggleSound() {
    if (music.paused) {
        music.play();
        musicIcon.textContent = '🔊';
    } else {
        music.pause();
        musicIcon.textContent = '🔈';
    }
}

// --- Функция для эффекта набора текста ---
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

// --- Функция для показа определенной секции ---
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
            // The admin info is now inside the admin modal, not directly in main section
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
        // Ensure authButton is not set as active section
        if (btn.id !== 'auth-button') {
            btn.classList.toggle('active', btn.dataset.target === id);
        }
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
    },
    'logout': () => {
        localStorage.removeItem('isAdminLoggedIn');
        outputToTerminal("Logged out successfully.");
        updateAuthUI(); // Update button text and hide admin panel button
        // No need to show section main, as it's not affected by login status anymore.
    }
};


// --- Функция для вывода сообщений в лог терминала ---
function outputToTerminal(message, isError = false) {
    const span = document.createElement('span');
    const timestamp = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    span.textContent = `[${timestamp}] ${message}`;
    if (isError) {
        span.style.color = 'var(--accent-color)';
    }
    logOutput.appendChild(span);
    if (logOutput.children.length > 50) { // Keep log history to 50 lines
        logOutput.removeChild(logOutput.children[0]);
    }
    logOutput.scrollTop = logOutput.scrollHeight;
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

    if (logOutput.children.length > 50) {
        logOutput.removeChild(logOutput.children[0]);
    }
    logOutput.scrollTop = logOutput.scrollHeight;
}

// --- Функция для определения типа устройства и управления видимостью блоков ---
function handleDeviceDisplay() {
    const mobileBreakpoint = 768;

    if (window.innerWidth <= mobileBreakpoint) {
        musicBox.style.display = 'none';
        systemLogsBox.style.display = 'none';
        adminPanelButton.style.display = 'none'; // Hide admin button on mobile too
        if (logInterval) {
            clearInterval(logInterval);
            logInterval = null;
        }
    } else {
        musicBox.style.display = 'flex';
        systemLogsBox.style.display = 'block';
        // Show admin button only if admin is logged out or if it's the default state (not logged in)
        // If logged in, its display is handled by updateAuthUI()
        if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
             adminPanelButton.style.display = 'block';
        } else {
             adminPanelButton.style.display = 'none'; // Will be shown when admin logs out
        }

        if (!logInterval) {
            logInterval = setInterval(generateSystemLog, 3000 + Math.random() * 2000);
        }
    }
    updateAuthUI(); // Always update UI on resize to reflect login status
}


// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {
    music.play().catch(e => {
        console.log("Autoplay music failed:", e);
        musicIcon.textContent = '🔈';
    });

    updateAndGetViewCount(); // Update view count regardless of login status
    showSection('main'); // Show 'main' section by default

    // Добавляем обработчики кликов для кнопок навигации
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            // Handle regular section buttons
            if (targetId) {
                showSection(targetId);
            }
            // Logic for authButton is handled separately
        });
    });

    handleDeviceDisplay(); // Initial device check
    window.addEventListener('resize', handleDeviceDisplay); // Re-check on resize

    // --- ОБРАБОТЧИКИ ДЛЯ КНОПКИ AUTH (LOGIN/LOGOUT) ---
    authButton.addEventListener('click', () => {
        const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        if (isAdminLoggedIn) {
            // If logged in, click means logout
            localStorage.removeItem('isAdminLoggedIn');
            outputToTerminal("Logged out successfully.");
            updateAuthUI(); // Update UI after logout
            // Admin Panel button will appear again
        } else {
            // If not logged in, click means show login modal
            loginModal.style.display = 'flex';
            usernameInput.value = '';
            passwordInput.value = '';
            loginMessage.textContent = '';
            usernameInput.focus();
        }
    });

    // --- ОБРАБОТЧИКИ ДЛЯ КНОПКИ ADMIN PANEL ---
    adminPanelButton.addEventListener('click', () => {
        const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        if (isAdminLoggedIn) {
            // If admin is already logged in, show admin panel
            adminModal.style.display = 'flex';
            viewCountSpan.textContent = localStorage.getItem('siteViews') || '0'; // Ensure view count is updated
        } else {
            // If not logged in, show login modal
            loginModal.style.display = 'flex';
            usernameInput.value = '';
            passwordInput.value = '';
            loginMessage.textContent = '';
            usernameInput.focus();
        }
    });

    // --- ОБРАБОТЧИКИ ЗАКРЫТИЯ МОДАЛЬНЫХ ОКОН ---
    closeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.target.closest('.modal').style.display = 'none';
        });
    });

    // Закрытие модальных окон по клику вне их содержимого
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });

    // Функция для обработки логина
    const handleLogin = () => {
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('isAdminLoggedIn', 'true');
            loginModal.style.display = 'none';
            outputToTerminal("Admin login successful. Welcome, Antideanon!", false);
            updateAuthUI(); // Update UI after successful login
            adminModal.style.display = 'flex'; // Automatically show admin panel after login
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
            e.preventDefault();
            passwordInput.focus();
        }
    });

    // Обработка Enter в поле пароля: вызывает функцию логина
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLogin();
        }
    });

    // Initial UI update on load
    updateAuthUI();
});

// --- Глитч эффект для кнопок навигации (при наведении) ---
buttons.forEach(button => {
    button.addEventListener('mouseover', () => {
        button.style.filter = 'url(#glitch)';
    });
    button.addEventListener('mouseout', () => {
        button.style.filter = 'none';
    });
});
