'use strict'; // 启用严格模式

'use strict'; // 启用严格模式

import { updateTime } from './utils/time.js';
import { switchView, views, initViews } from './ui/view-manager.js';
import { initChat, scrollToBottom } from './modules/chat.js';
import { initSettingsPage } from './modules/settings.js';

// --- 元素缓存 ---
let mainContent;

// --- 事件处理 ---
function handleMainContentClick(event) {
    const target = event.target;
    const appIcon = target.closest('.app-icon');
    const backButton = target.closest('.back-button');

    if (appIcon) {
        const appName = appIcon.dataset.app;
        if (views[appName]) {
            switchView(appName);
            // 新增：如果切换到的是聊天视图，则滚动到底部
            if (appName === 'chat') {
                scrollToBottom();
            }
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

// --- 初始化 ---
function init() {
    // 在所有操作之前，立即设置应用的绝对高度
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);

    // 缓存主内容区
    mainContent = document.querySelector('.main-content');

    // 初始化所有视图和模块
    initViews();
    initChat();
    initSettingsPage();

    // 初始化时间
    updateTime();
    setInterval(updateTime, 60000);

    // 绑定主内容区域的点击事件
    if (mainContent) {
        mainContent.addEventListener('click', handleMainContentClick);
    }

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
