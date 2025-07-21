import { loadFromStorage, saveToStorage } from '../utils/storage.js';

// --- DOM 元素 ---
let settingsView, apiUrlInput, apiKeyInput, apiModelSelect, fetchModelsBtn, statusMessageDiv;

// --- 常量 ---
const API_CONFIG_KEY = 'apiConfig';

// --- 初始化模块 ---
function initSettingsPage() {
    // 缓存 DOM 元素
    settingsView = document.querySelector('.settings-view');
    apiUrlInput = settingsView.querySelector('#api-url');
    apiKeyInput = settingsView.querySelector('#api-key');
    apiModelSelect = settingsView.querySelector('#api-model');
    fetchModelsBtn = settingsView.querySelector('#fetch-models-btn');
    statusMessageDiv = settingsView.querySelector('#status-message');

    // 加载初始配置并绑定事件
    loadInitialConfig();
    fetchModelsBtn.addEventListener('click', fetchModels);
}

function loadInitialConfig() {
    const config = loadFromStorage(API_CONFIG_KEY);
    if (config) {
        apiUrlInput.value = config.url || '';
        apiKeyInput.value = config.key || '';
    }
}

function setStatus(message, isError = false) {
    statusMessageDiv.textContent = message;
    statusMessageDiv.className = 'status-message'; // Reset classes
    if (message) {
        statusMessageDiv.classList.add(isError ? 'error' : 'success');
    }
}

async function fetchModels() {
    const url = apiUrlInput.value.trim();
    const key = apiKeyInput.value.trim();

    if (!url || !key) {
        setStatus('请输入地址和密钥', true);
        return;
    }

    setStatus('正在拉取模型...');
    fetchModelsBtn.disabled = true;

    try {
        const response = await fetch(`${url}/v1/models`, {
            headers: {
                'Authorization': `Bearer ${key}`
            }
        });

        if (!response.ok) {
            throw new Error(`密钥无效或网络错误 (HTTP ${response.status})`);
        }

        const data = await response.json();
        
        apiModelSelect.innerHTML = ''; // Clear existing options
        data.data.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.id;
            apiModelSelect.appendChild(option);
        });

        setStatus('模型拉取成功！');
        saveToStorage(API_CONFIG_KEY, { url, key });

    } catch (error) {
        setStatus(`拉取失败：${error.message}`, true);
    } finally {
        fetchModelsBtn.disabled = false;
    }
}

export { initSettingsPage };
