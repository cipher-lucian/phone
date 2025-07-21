import { saveToStorage, loadFromStorage } from '../utils/storage.js';

// --- DOM 元素 ---
let chatMessages, chatInput, sendButton;

// --- 数据 ---
let chatHistory = []; // 用于存储聊天记录

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
    saveToStorage('chatHistory', chatHistory);

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

function initChat() {
    // 缓存 DOM 元素
    chatMessages = document.querySelector('.chat-messages');
    chatInput = document.querySelector('.chat-input');
    sendButton = document.querySelector('.send-button');

    // 绑定事件监听器
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    if (chatInput) {
        chatInput.addEventListener('keydown', handleChatInput);
    }

    // 加载历史记录
    chatHistory = loadFromStorage('chatHistory') || [];
    chatHistory.forEach(messageData => {
        const messageElement = createMessageElement(messageData.text, messageData.type);
        chatMessages.appendChild(messageElement);
    });
    // 滚动到底部
    if(chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// --- 导出初始化函数 ---
export { initChat };
