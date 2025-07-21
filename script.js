// 使用 IIFE (立即调用函数表达式) 封装代码，避免污染全局作用域
(function() {
    'use strict'; // 启用严格模式

    // --- 元素缓存 ---
    const timeElement = document.querySelector('.time');
    const mainContent = document.querySelector('.main-content');
    const views = {
        home: document.querySelector('.home-screen'),
        chat: document.querySelector('.chat-view')
        // 未来可以轻松扩展，例如：
        // diary: document.querySelector('.diary-view')
    };
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.send-button');
    
    let chatHistory = []; // 用于存储聊天记录

    // --- 时间更新逻辑 ---
    function updateTime() {
        if (!timeElement) return;

        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12;

        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;

        timeElement.textContent = formattedTime;
    }

    // --- 视图切换逻辑 (重构为单一函数) ---
    function switchView(targetView) {
        // 遍历所有视图
        for (const viewName in views) {
            if (views[viewName]) {
                // 如果是目标视图，则显示；否则隐藏
                views[viewName].classList.toggle('hidden', viewName !== targetView);
            }
        }
    }

    // --- 事件处理 ---
    function handleMainContentClick(event) {
        const target = event.target;
        const appIcon = target.closest('.app-icon');
        const backButton = target.closest('.back-button');

        if (appIcon) {
            const appName = appIcon.dataset.app;
            if (views[appName]) {
                switchView(appName);
            } else {
                alert(`你点击了 "${appName}" 应用，但我们还没做这个功能哦！`);
            }
            return;
        }

        if (backButton) {
            switchView('home');
            return;
        }
    }

    // --- 聊天功能 ---
    function createMessageElement(text, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        messageElement.textContent = text;
        return messageElement;
    }

    function sendMessage() {
        const text = chatInput.value.trim();
        if (text === '') return;

        // 1. 更新数据
        const messageData = { text: text, type: 'sent' };
        chatHistory.push(messageData);
        saveChatHistory();

        // 2. 更新视图
        const messageElement = createMessageElement(messageData.text, messageData.type);
        chatMessages.appendChild(messageElement);

        // 3. 清理和滚动
        chatInput.value = '';
        chatInput.focus();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleChatInput(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    }

    // --- 本地存储 ---
    function saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    function loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            chatHistory = JSON.parse(savedHistory);
            chatHistory.forEach(messageData => {
                const messageElement = createMessageElement(messageData.text, messageData.type);
                chatMessages.appendChild(messageElement);
            });
            // 滚动到底部
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // --- 初始化 ---
    function init() {
        // 在所有操作之前，立即设置应用的绝对高度
        document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);

        // 初始化时间
        updateTime();
        setInterval(updateTime, 60000);

        // 绑定事件监听器
        if (mainContent) {
            mainContent.addEventListener('click', handleMainContentClick);
        }
        if (sendButton) {
            sendButton.addEventListener('click', sendMessage);
        }
        if (chatInput) {
            chatInput.addEventListener('keydown', handleChatInput);
        }

        // 加载历史记录
        loadChatHistory();

        // 初始显示主屏幕
        switchView('home');
    }

    // --- 启动应用 ---
    // 确保文档加载完毕后再执行初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
