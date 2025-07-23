'use strict';

// --- 视图容器 ---
const views = {};

// --- 初始化视图 ---
function initViews() {
    // 3. 正确的做法！我们不是换掉整个 views 对象，
    //    而是在原来的对象上，一个一个地添加属性！
    views.home = document.querySelector('.home-screen');
    views.chat = document.querySelector('.chat-view');
    views.settings = document.querySelector('.settings-view');
    views.memo = document.querySelector('#memo-view');
}

// --- 视图切换逻辑 ---
function switchView(targetView) {
    if (!views[targetView]) {
        console.error(`视图 "${targetView}" 不存在！`);
        return;
    }
    for (const viewName in views) {
        if (views[viewName]) {
            views[viewName].classList.toggle('hidden', viewName !== targetView);
        }
    }
}

// --- 导出 ---
export { views, switchView, initViews };
