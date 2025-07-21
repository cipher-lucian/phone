import { saveToStorage, loadFromStorage } from '../utils/storage.js';
import { formatTimestamp, getFormattedDateTime, getTimeDifferenceDescription } from '../utils/time.js';

// --- DOM 元素 ---
let chatMessages, chatInput, sendButton, chatTitle, apiCallButton;
let moreOptionsButton, personaModal, personaNameInput, personaPromptInput;
let userNameInput, userPersonaInput, savePersonaButton, cancelPersonaButton;

// --- 数据 ---
let chatHistory = []; // 用于存储聊天记录
let currentAiPersona = {}; // 用于存储当前 AI 人设
let currentUserPersona = {}; // 用于存储当前用户人设

// --- 默认人设 ---
const DEFAULT_AI_PERSONA = {
    name: 'AI 助手',
    prompt: '你是一个乐于助人、简洁明了的通用AI助手。'
};
const DEFAULT_USER_PERSONA = {
    name: '用户',
    prompt: ''
};

// --- 人设管理 ---
function loadPersonas() {
    currentAiPersona = loadFromStorage('currentAiPersona') || DEFAULT_AI_PERSONA;
    currentUserPersona = loadFromStorage('currentUserPersona') || DEFAULT_USER_PERSONA;
}

function savePersonas() {
    const aiName = personaNameInput.value.trim();
    const aiPrompt = personaPromptInput.value.trim();
    const userName = userNameInput.value.trim();
    const userPrompt = userPersonaInput.value.trim();

    if (!aiName) {
        alert('AI 名称不能为空');
        return;
    }

    currentAiPersona = { name: aiName, prompt: aiPrompt };
    currentUserPersona = { name: userName, prompt: userPrompt };

    saveToStorage('currentAiPersona', currentAiPersona);
    saveToStorage('currentUserPersona', currentUserPersona);

    updateChatHeader();
    closePersonaModal();
}

function updateChatHeader() {
    if (chatTitle) {
        chatTitle.textContent = currentAiPersona.name;
    }
}

// --- 模态框控制 ---
function openPersonaModal() {
    personaNameInput.value = currentAiPersona.name;
    personaPromptInput.value = currentAiPersona.prompt;
    userNameInput.value = currentUserPersona.name;
    userPersonaInput.value = currentUserPersona.prompt;
    personaModal.classList.remove('hidden');
}

function closePersonaModal() {
    personaModal.classList.add('hidden');
}

// --- 聊天功能 ---
function createMessageElement(messageData) {
    const { text, type, timestamp } = messageData;

    // 1. 创建最外层的包裹元素
    const wrapperElement = document.createElement('div');
    // 添加 'sent' 或 'received' 类用于整体布局
    wrapperElement.classList.add('message-wrapper', type);

    // 2. 创建消息气泡
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type); // 修正：将 type 类名加回来
    messageElement.textContent = text;

    // 3. 创建时间戳元素 (如果存在时间戳)
    let timestampElement;
    if (timestamp) {
        timestampElement = document.createElement('span');
        timestampElement.classList.add('message-timestamp');
        timestampElement.textContent = formatTimestamp(timestamp);
    }

    // 4. 组装
    wrapperElement.appendChild(messageElement);
    if (timestampElement) {
        wrapperElement.appendChild(timestampElement);
    }

    return wrapperElement;
}

// --- 加载提示 ---
function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('message', 'received', 'typing-indicator');
    typingElement.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;
    typingElement.id = 'typing-indicator';
    chatMessages.appendChild(typingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
        typingElement.remove();
    }
}

// 新增：实现“一条一条”的打字效果
async function renderAiMessagesSequentially(commands) {
    // 这个函数现在只负责渲染，"正在输入"的显示和隐藏由 getAiReply 控制
    try {
        for (const command of commands) {
            if (command.type === 'text') {
                const messageData = { 
                    text: command.content, 
                    type: 'received',
                    timestamp: Date.now() // 添加时间戳
                };
                chatHistory.push(messageData);
                saveToStorage('chatHistory', chatHistory);

                const messageElement = createMessageElement(messageData); // 传递整个对象
                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // 模拟打字的随机延迟
                const delay = Math.random() * 1000 + 500; // 500ms - 1500ms
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            // 未来可以在这里添加对其他 command.type 的处理
        }
    } catch (error) {
        console.error('渲染 AI 消息时出错:', error);
        const errorElement = createMessageElement({ text: `渲染消息时出错: ${error.message}`, type: 'received' });
        chatMessages.appendChild(errorElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}


async function getAiReply() {
    // 1. 从 localStorage 获取 API 配置
    const apiSettings = loadFromStorage('apiSettings');
    if (!apiSettings || !apiSettings.apiKey || !apiSettings.apiUrl) {
        const replyText = '错误：请先在设置中配置 API 密钥和地址。';
        const errorElement = createMessageElement({ text: replyText, type: 'received' });
        chatMessages.appendChild(errorElement);
        return;
    }

    // 2. 准备系统消息 (System Prompt) - 【第一阶段修改】
    // 新增：为 AI 提供时间感知能力
    const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
    const timeDescription = getTimeDifferenceDescription(lastMessage?.timestamp);

    const finalSystemPrompt = `
    你现在扮演一个名为"${currentAiPersona.name}"的角色。
    核心规则
【【【格式铁律】】】: 你的回复【必须】是一个 JSON 数组格式的字符串。数组中的每一个元素都必须是一个带有 type 字段的 JSON 对象。
【【【对话节奏】】】: 模拟真人的聊天习惯，你可以一次性生成多条短消息。每次要回复至少3-8条消息！！！
【【【唯一指令】】】: 目前你只会一种操作：发送文本。格式为：
{"type": "text", "content": "你想说的内容"}

情景感知
当前时间: ${getFormattedDateTime()}
对话状态: ${timeDescription}

你的角色设定
${currentAiPersona.prompt}

用户信息
用户姓名：${currentUserPersona.name || '未提供'}
用户人设：${currentUserPersona.prompt || '未提供'}
`;

    const systemMessage = {
        role: 'system',
        content: finalSystemPrompt.trim()
    };

    // 3. 准备用户消息历史
    const userMessages = chatHistory.map(msg => ({
        role: msg.type === 'sent' ? 'user' : 'assistant',
        content: msg.text
    }));

    // 4. 组合最终发送到 API 的消息
    const messagesToSend = [systemMessage, ...userMessages];

    showTypingIndicator(); // 显示加载动画

    try {
        const response = await fetch(`${apiSettings.apiUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiSettings.apiKey}`
            },
            body: JSON.stringify({
                model: apiSettings.model,
                messages: messagesToSend
            })
        });

        if (!response.ok) {
            throw new Error(`API 请求失败，状态码: ${response.status}`);
        }

        const data = await response.json();
        let replyText = data.choices[0].message.content;

        // --- 【第二阶段修改 & 错误修复】 ---
        // 增加对AI可能返回Markdown格式JSON的兼容处理
        const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            replyText = jsonMatch[1];
        }

        let commands;
        try {
            commands = JSON.parse(replyText);
        } catch (parseError) {
            // AI 不听话，返回的不是标准 JSON
            console.error('JSON 解析失败:', parseError);
            const errorMsg = `AI 返回了无效的格式。原始内容：\n${replyText}`;
            const errorElement = createMessageElement({ text: errorMsg, type: 'received' });
            chatMessages.appendChild(errorElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return; // 提前退出
        }

        if (!Array.isArray(commands)) {
            // AI 返回了 JSON 但不是数组
            const errorMsg = `AI 返回了非数组格式。`;
            const errorElement = createMessageElement({ text: errorMsg, type: 'received' });
            chatMessages.appendChild(errorElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return; // 提前退出
        }
        
        // 成功解析，调用新函数进行渲染 - 【第三阶段修改】
        // 在调用新函数前，先隐藏“正在输入”，因为新函数会自己处理
        hideTypingIndicator();
        await renderAiMessagesSequentially(commands);


    } catch (error) {
        console.error('获取 AI 回复时出错:', error);
        const errorElement = createMessageElement({ text: `获取回复失败: ${error.message}`, type: 'received' });
        chatMessages.appendChild(errorElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } finally {
        // 确保无论如何都隐藏 "正在输入"
        hideTypingIndicator();
    }
}

// --- 新增：动态调整输入框高度 ---
function adjustTextareaHeight(textarea) {
    // 先重置高度，以便获取正确的 scrollHeight
    textarea.style.height = 'auto';
    
    // 设置新的高度
    textarea.style.height = `${textarea.scrollHeight}px`;

    // 根据是否超过最大高度来决定是否显示滚动条
    if (textarea.scrollHeight > parseInt(getComputedStyle(textarea).maxHeight)) {
        textarea.style.overflowY = 'auto';
    } else {
        textarea.style.overflowY = 'hidden';
    }
}


function sendMessage() {
    const text = chatInput.value.trim();
    if (text === '') return;

    // 1. 更新数据
    const messageData = { 
        text: text, 
        type: 'sent',
        timestamp: Date.now() // 添加时间戳
    };
    chatHistory.push(messageData);
    saveToStorage('chatHistory', chatHistory);

    // 2. 更新视图
    const messageElement = createMessageElement(messageData); // 传递整个对象
    chatMessages.appendChild(messageElement);

    // 3. 清理和滚动
    chatInput.value = '';
    chatInput.focus();
    adjustTextareaHeight(chatInput); // 重置输入框高度
    chatMessages.scrollTop = chatMessages.scrollHeight;

}

function handleChatInput(event) {
    // Shift + Enter 换行, 单独 Enter 发送
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 阻止默认的换行行为
        sendMessage();
    }
}

// --- 新增：滚动到底部函数 ---
function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function initChat() {
    // 缓存 DOM 元素
    chatMessages = document.querySelector('.chat-messages');
    chatInput = document.querySelector('.chat-input');
    sendButton = document.querySelector('.send-button');
    apiCallButton = document.querySelector('.api-call-button');
    chatTitle = document.querySelector('.chat-title');
    moreOptionsButton = document.querySelector('.more-options');
    personaModal = document.querySelector('#persona-modal');
    personaNameInput = document.querySelector('#persona-name');
    personaPromptInput = document.querySelector('#persona-prompt');
    userNameInput = document.querySelector('#user-name');
    userPersonaInput = document.querySelector('#user-persona');
    savePersonaButton = document.querySelector('#save-persona-btn');
    cancelPersonaButton = document.querySelector('#cancel-persona-btn');

    // 加载人设并更新标题
    loadPersonas();
    updateChatHeader();

    // 绑定事件监听器
    if (sendButton) sendButton.addEventListener('click', sendMessage);
    if (apiCallButton) apiCallButton.addEventListener('click', getAiReply);
    if (chatInput) {
        chatInput.addEventListener('keydown', handleChatInput);
        // 监听输入事件，实时调整高度
        chatInput.addEventListener('input', () => adjustTextareaHeight(chatInput));
    }
    if (moreOptionsButton) moreOptionsButton.addEventListener('click', openPersonaModal);
    if (savePersonaButton) savePersonaButton.addEventListener('click', savePersonas);
    if (cancelPersonaButton) cancelPersonaButton.addEventListener('click', closePersonaModal);
    if (personaModal) {
        personaModal.addEventListener('click', (event) => {
            if (event.target === personaModal) {
                closePersonaModal();
            }
        });
    }

    // 加载历史记录
    chatHistory = loadFromStorage('chatHistory') || [];
    chatHistory.forEach(messageData => {
        // 现在传递整个 messageData 对象，以支持旧消息（无时间戳）和新消息
        const messageElement = createMessageElement(messageData);
        chatMessages.appendChild(messageElement);
    });
    
    if(chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// --- 导出初始化函数 ---
export { initChat, scrollToBottom };
