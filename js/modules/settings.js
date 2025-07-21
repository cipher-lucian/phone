import { loadFromStorage, saveToStorage } from '../utils/storage.js';

// --- DOM 元素 ---
let settingsView, apiUrlInput, apiKeyInput, apiModelSelect, fetchModelsBtn, statusMessageDiv, saveSettingsBtn;

// --- 常量 ---
const API_CONFIG_KEY = 'apiSettings'; // 统一键名


// --- 初始化模块 ---
function initSettingsPage() {
    // 缓存 DOM 元素
    settingsView = document.querySelector('.settings-view');
    apiUrlInput = settingsView.querySelector('#api-url');
    apiKeyInput = settingsView.querySelector('#api-key');
    apiModelSelect = settingsView.querySelector('#api-model');
    fetchModelsBtn = settingsView.querySelector('#fetch-models-btn');
    statusMessageDiv = settingsView.querySelector('#status-message');
    saveSettingsBtn = settingsView.querySelector('#save-settings-btn'); // 获取新按钮

    // 加载初始配置并绑定事件
    loadInitialConfig();
    fetchModelsBtn.addEventListener('click', fetchModels);
    saveSettingsBtn.addEventListener('click', saveSettings); // 绑定保存事件
}

function loadInitialConfig() {
    const config = loadFromStorage(API_CONFIG_KEY);
    if (config) {
        apiUrlInput.value = config.apiUrl || '';
        apiKeyInput.value = config.apiKey || '';
        // 如果有已保存的模型，我们需要在模型列表加载后设置它
        // 我们将这个逻辑移动到 fetchModels 和 init 中
    }
}

// --- 新增：保存设置 ---
function saveSettings() {
    const config = {
        apiUrl: apiUrlInput.value.trim(),
        apiKey: apiKeyInput.value.trim(),
        model: apiModelSelect.value
    };

    if (!config.apiUrl || !config.apiKey) {
        setStatus('保存失败：API 地址和密钥不能为空。', true);
        return;
    }
    if (!config.model || config.model === '请先拉取模型') {
        setStatus('保存失败：请先拉取并选择一个模型。', true);
        return;
    }

    saveToStorage(API_CONFIG_KEY, config);
    setStatus('设置已保存！', false);
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
        const savedConfig = loadFromStorage(API_CONFIG_KEY);
        
        apiModelSelect.innerHTML = ''; // Clear existing options
        data.data.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.id;
            apiModelSelect.appendChild(option);
        });

        // 如果之前有保存过的模型，尝试选中它
        if (savedConfig && savedConfig.model) {
            apiModelSelect.value = savedConfig.model;
        }

        setStatus('模型拉取成功！请选择模型后点击保存。');
        // 不再在这里保存，由用户手动点击保存按钮

    } catch (error) {
        setStatus(`拉取失败：${error.message}`, true);
    } finally {
        fetchModelsBtn.disabled = false;
    }
}

export { initSettingsPage };
