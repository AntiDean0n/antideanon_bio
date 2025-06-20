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

// --- Элементы для логина и админ-панели ---
const authButton = document.getElementById('auth-button'); // Кнопка "Login"/"Logout" сверху
const loginModal = document.getElementById('login-modal'); // Модальное окно логина
const adminModal = document.getElementById('admin-modal'); // Модальное окно админ-панели
const closeButtons = document.querySelectorAll('.modal .close-button'); // Все кнопки закрытия модальных окон
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const submitLoginButton = document.getElementById('submit-login');
const loginMessage = document.getElementById('login-message');
const viewCountSpan = document.getElementById('view-count'); // Span для счетчика просмотров внутри adminModal
const adminPanelButton = document.getElementById('admin-panel-button'); // Кнопка "Admin Panel" снизу

// --- Учетные данные админа (ВНИМАНИЕ: НЕБЕЗОПАСНО!) ---
const ADMIN_USERNAME = 'fame.antideanon';
const ADMIN_PASSWORD = 'NeDarkKich22561.*';

// --- Функция для увеличения и получения счетчика просмотров ---
function updateAndGetViewCount() {
    let views = parseInt(localStorage.getItem('siteViews') || 0);
    // Увеличиваем счетчик просмотров только если это новая сессия (уникальный визит за сессию)
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
        // Кнопка "Admin Panel" всегда видна на ПК, ее видимость на мобильных управляется handleDeviceDisplay
        // Нет необходимости устанавливать display здесь, это сделает handleDeviceDisplay
    } else {
        authButton.textContent = 'Login';
        // Кнопка "Admin Panel" всегда видна на ПК, ее видимость на мобильных управляется handleDeviceDisplay
    }
    // Обновляем счетчик в админ-панели, только если она открыта
    if (adminModal.style.display === 'flex') {
        viewCountSpan.textContent = localStorage.getItem('siteViews') || '0';
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
        // Принудительная перерисовка для запуска CSS-перехода
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
        // Убедимся, что authButton не становится активной секцией
        if (btn.id !== 'auth-button') {
            btn.classList.toggle('active', btn.dataset.target === id);
        }
    });
}

// --- Объект с командами для командной строки ---
const commands = {
    'help': () => {
        outputToTerminal(`
Доступные команды:
    show <section>  - Отображает секцию (напр., show bio, show deffers, show price, show faq, show contact)
    set theme <color> - Меняет тему терминала (напр., set theme green, set theme red, set theme default)
    clear           - Очищает вывод терминала
    whoami          - Отображает информацию о вас (Пасхалка)
    ping            - Проверяет сетевое соединение (фиктивно)
    play game       - Запускает простую текстовую игру (Пасхалка)
    logout          - Выходит из админ-панели (если вошли)
        `);
    },
    'show': (args) => {
        const sectionName = args[0];
        if (sections[sectionName]) {
            showSection(sectionName);
            outputToTerminal(`Секция загружена: ${sectionName.toUpperCase()}.`);
        } else {
            outputToTerminal(`[ОШИБКА] Неизвестная секция: ${sectionName}. Попробуйте 'show bio'.`, true);
        }
    },
    'set theme': (args) => {
        const themeName = args[0];
        const body = document.body;
        body.classList.remove('theme-green', 'theme-red');

        if (themeName === 'green') {
            body.classList.add('theme-green');
            outputToTerminal(`Тема установлена на ЗЕЛЕНЫЙ.`);
        } else if (themeName === 'red') {
            body.classList.add('theme-red');
            outputToTerminal(`Тема установлена на КРАСНЫЙ.`);
        } else if (themeName === 'default') {
            outputToTerminal(`Тема установлена на ПО УМОЛЧАНИЮ.`);
        } else {
            outputToTerminal(`[ОШИБКА] Неверная тема: ${themeName}. Доступно: green, red, default.`, true);
        }
    },
    'clear': () => {
        logOutput.innerHTML = '';
        outputToTerminal("Терминал очищен.");
    },
    'whoami': () => {
        const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
        outputToTerminal(`
Вы посетитель Кибер-терминала Antideanon.
Ваш IP: ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}
Статус: ${isAdmin ? 'Аутентифицированный Администратор' : 'Аутентифицированный Гость'}.
Уровень доступа: ${isAdmin ? 'Администратор' : 'Стандартный'}.
`);
    },
    'ping': () => {
        outputToTerminal("Пинг 8.8.8.8 с 32 байтами данных...");
        setTimeout(() => outputToTerminal("Ответ от 8.8.8.8: байты=32 время=1мс TTL=118"), 500);
        setTimeout(() => outputToTerminal("Ответ от 8.8.8.8: байты=32 время=2мс TTL=118"), 1000);
        setTimeout(() => outputToTerminal("Ответ от 8.8.8.8: байты=32 время=1мс TTL=118"), 1500);
        setTimeout(() => outputToTerminal("Статистика пинга для 8.8.8.8:\n    Пакетов: Отправлено = 3, Получено = 3, Потеряно = 0 (0% потерь),\nПриблизительное время приема-передачи в миллисекундах:\n    Минимум = 1мс, Максимум = 2мс, Среднее = 1мс"), 2000);
    },
    'play game': () => {
        outputToTerminal(`
Инициализация текстового приключения...
Добро пожаловать, Хакер. Вы на распутье.
Наберите 'left' или 'right'.`);

        let gameActive = true;
        const gameHandler = (e) => {
            if (e.key === 'Enter') {
                const input = commandInput.value.trim().toLowerCase();
                commandInput.value = '';
                if (!gameActive) return;

                if (input === 'left') {
                    outputToTerminal("Вы выбрали 'left'. Вы нашли чип данных. (Конец демо-игры)");
                    gameActive = false;
                    commandInput.removeEventListener('keydown', gameHandler);
                } else if (input === 'right') {
                    outputToTerminal("Вы выбрали 'right'. Брандмауэр блокирует ваш путь. (Конец демо-игры)");
                    gameActive = false;
                    commandInput.removeEventListener('keydown', gameHandler);
                } else {
                    outputToTerminal("[ИГРА] Неверный ход. Наберите 'left' или 'right'.");
                }
            }
        };
        commandInput.addEventListener('keydown', gameHandler);
    },
    'logout': () => {
        localStorage.removeItem('isAdminLoggedIn');
        outputToTerminal("Вы успешно вышли из системы.", false);
        updateAuthUI(); // Обновить текст кнопки и видимость кнопки админ-панели
        adminModal.style.display = 'none'; // Скрыть админ-модаль, если она была открыта
        loginModal.style.display = 'none'; // Скрыть логин-модаль, если она вдруг была открыта
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
    if (logOutput.children.length > 50) { // Ограничиваем историю логов до 50 строк
        logOutput.removeChild(logOutput.children[0]);
    }
    logOutput.scrollTop = logOutput.scrollHeight;
}

// --- Сообщения для системных логов на фоне ---
const systemLogMessages = [
    "СКАНЕРИРОВАНИЕ_ПРОТОКОЛОВ_ЦЕЛОСТНОСТИ_СЕТИ...",
    "СТАТУС: ВСЕ_МОДУЛИ_ОНЛАЙН.",
    "ПОТОК_ДАННЫХ_ИНИЦИИРОВАН: ПОРТ 443.",
    "ДЕШИФРОВКА_ПОСЛЕДОВАТЕЛЬНОСТИ_ПАКЕТОВ_0xAF32...",
    "АНАЛИЗ_ТРАФИКА: ОБНАРУЖЕНИЕ_НИЗКОЙ_ЗАТОРМОЖЕННОСТИ.",
    "УСТАНОВЛЕНО_БЕЗОПАСНОЕ_СОЕДИНЕНИЕ.",
    "МОНИТОРИНГ_СИСТЕМ_ОБНАРУЖЕНИЯ_АНОМАЛИЙ.",
    "РУКОПОЖАТИЕ_ПРОТОКОЛА_ЗАВЕРШЕНО.",
    "ОБРАБОТКА_ЗАПРОСА_0xBE1C...",
    "СТАТУС_ФАЕРВОЛА: ОПТИМАЛЬНАЯ_ПРОИЗВОДИТЕЛЬНОСТЬ.",
    "ШИФРОВАНИЕ_ИСХОДЯЩИХ_ПАКЕТОВ_ДАННЫХ...",
    "СОСТОЯНИЕ_СИСТЕМЫ: НОРМАЛЬНО.",
    "ПРОВЕРКА_ЖУРНАЛОВ_ДОСТУПА_НА_НАЛИЧИЕ_ВТОРЖЕНИЙ...",
    "РЕЖИМ_ОЖИДАНИЯ_АКТИВИРОВАН. ЭНЕРГОСБЕРЕЖЕНИЕ: 75%.",
    "ОБНОВЛЕНИЕ_БАЗЫ_ДАННЫХ_УГРОЗ_ВЕРСИИ_4.7.1...",
    "ВНИМАНИЕ: УГРОЗ_НЕ_ОБНАРУЖЕНО.",
    "МАРШРУТИЗАЦИЯ_ЧЕРЕЗ_БЕЗОПАСНЫЙ_ПРОКСИ_УЗЕЛ_B9C.",
    "ГЕНЕРАЦИЯ_КЛЮЧЕЙ_ШИФРОВАНИЯ...",
    "СИНХРОНИЗАЦИЯ_СИСТЕМНОГО_ВРЕМЕНИ_С_NTP_СЕРВЕРОМ."
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
        adminPanelButton.style.display = 'none'; // Скрываем кнопку админ-панели на мобильных
        if (logInterval) {
            clearInterval(logInterval);
            logInterval = null;
        }
    } else {
        musicBox.style.display = 'flex';
        systemLogsBox.style.display = 'block';
        adminPanelButton.style.display = 'block'; // Показываем кнопку админ-панели на ПК
        if (!logInterval) {
            logInterval = setInterval(generateSystemLog, 3000 + Math.random() * 2000);
        }
    }
    updateAuthUI(); // Всегда обновляем UI при изменении размера окна, чтобы отразить статус логина
}


// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Попытка воспроизвести музыку (может быть заблокирована браузером)
    music.play().catch(e => {
        console.log("Автовоспроизведение музыки заблокировано:", e);
        musicIcon.textContent = '🔈'; // Показать значок выключенного звука
    });

    // 2. Обновляем счетчик просмотров (без отображения на главной)
    updateAndGetViewCount();

    // 3. СРАЗУ ПОКАЗЫВАЕМ СЕКЦИЮ 'MAIN'
    showSection('main');

    // 4. Инициализация видимости системных блоков и кнопки админ-панели в зависимости от размера экрана
    handleDeviceDisplay();
    window.addEventListener('resize', handleDeviceDisplay);

    // 5. Обработчики кликов для кнопок навигации
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            if (targetId) { // Если это обычная кнопка секции
                showSection(targetId);
            }
        });
    });

    // --- ОБРАБОТЧИКИ ДЛЯ КНОПКИ AUTH (LOGIN/LOGOUT) ---
    authButton.addEventListener('click', () => {
        const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        if (isAdminLoggedIn) {
            // Если вошли, клик означает выход
            localStorage.removeItem('isAdminLoggedIn');
            outputToTerminal("Вы успешно вышли из системы.", false);
            updateAuthUI(); // Обновляем UI после выхода
            adminModal.style.display = 'none'; // Скрываем админ-панель при выходе
            loginModal.style.display = 'none'; // Скрываем логин-модаль, если она вдруг была открыта
        } else {
            // Если не вошли, клик означает показать модальное окно логина
            loginModal.style.display = 'flex';
            usernameInput.value = ''; // Очищаем поля
            passwordInput.value = '';
            loginMessage.textContent = ''; // Очищаем сообщения об ошибках
            usernameInput.focus(); // Устанавливаем фокус на поле логина
        }
    });

    // --- ОБРАБОТЧИКИ ДЛЯ КНОПКИ ADMIN PANEL ---
    adminPanelButton.addEventListener('click', () => {
        const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        if (isAdminLoggedIn) {
            // Если админ уже вошел, показать админ-панель
            adminModal.style.display = 'flex';
            viewCountSpan.textContent = localStorage.getItem('siteViews') || '0'; // Убедиться, что счетчик обновлен
        } else {
            // Если не вошел, показать модальное окно логина
            loginModal.style.display = 'flex';
            usernameInput.value = ''; // Очищаем поля
            passwordInput.value = '';
            loginMessage.textContent = ''; // Очищаем сообщения об ошибках
            usernameInput.focus(); // Устанавливаем фокус
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
            loginModal.style.display = 'none'; // Закрываем модальное окно логина
            outputToTerminal("Вход администратора успешен. Добро пожаловать, Antideanon!", false);
            updateAuthUI(); // Обновляем UI после успешного логина (кнопка Logout, показать Admin Panel)
            adminModal.style.display = 'flex'; // Открываем модальное окно админ-панели сразу после логина
            viewCountSpan.textContent = localStorage.getItem('siteViews') || '0'; // Обновляем счетчик
        } else {
            loginMessage.textContent = 'Доступ запрещен: Неверные учетные данные.';
            outputToTerminal("[ОШИБКА] Попытка несанкционированного доступа.", true);
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

    // Initial UI update on load (чтобы кнопки были в правильном состоянии)
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
