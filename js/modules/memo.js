'use strict';

// --- 状态管理 ---
let memoList = [];
let memoIdToDelete = null; // 用于暂存待删除的备忘录ID

// --- 元素缓存 ---
let memoView;
let memoListArea;
let addMemoButton;
let addMemoPopup;
let cancelMemoButton;
let saveMemoButton;
let memoTextarea;
let deleteConfirmPopup;
let cancelDeleteButton;
let confirmDeleteButton;

// --- 本地存储 ---
function getMemos() {
    try {
        const memos = localStorage.getItem('memoList');
        return memos ? JSON.parse(memos) : [];
    } catch (error) {
        console.error("无法从 localStorage 解析备忘录:", error);
        return [];
    }
}

function saveMemos() {
    localStorage.setItem('memoList', JSON.stringify(memoList));
}

// --- 核心功能 ---

function renderMemos() {
    if (!memoListArea) return;
    
    memoListArea.innerHTML = ''; // 清空现有列表

    memoList.forEach(memo => {
        const li = document.createElement('li');
        li.className = `memo-item ${memo.isCompleted ? 'completed' : ''}`;
        li.dataset.id = memo.id;

        li.innerHTML = `
            <input type="checkbox" class="memo-checkbox" ${memo.isCompleted ? 'checked' : ''}>
            <span class="memo-content">${memo.content}</span>
            <button class="delete-memo-btn">🗑️</button>
        `;
        
        memoListArea.appendChild(li);
    });
}

function addMemo(content) {
    if (!content || !content.trim()) return;

    const newMemo = {
        id: Date.now(), // 使用时间戳作为唯一ID
        content: content.trim(),
        isCompleted: false
    };

    memoList.push(newMemo);
    saveMemos();
    renderMemos();
}

function deleteMemo(id) {
    memoList = memoList.filter(memo => memo.id !== id);
    saveMemos();
    renderMemos();
}

function toggleMemoStatus(id) {
    const memo = memoList.find(memo => memo.id === id);
    if (memo) {
        memo.isCompleted = !memo.isCompleted;
        saveMemos();
        renderMemos();
    }
}

// --- UI交互 ---

function showAddMemoPopup() {
    if (addMemoPopup) {
        memoTextarea.value = ''; // 清空输入框
        addMemoPopup.classList.remove('hidden');
        memoTextarea.focus();
    }
}

function hideAddMemoPopup() {
    if (addMemoPopup) {
        addMemoPopup.classList.add('hidden');
    }
}

function showDeleteConfirmPopup(id) {
    memoIdToDelete = id;
    if (deleteConfirmPopup) {
        deleteConfirmPopup.classList.remove('hidden');
    }
}

function hideDeleteConfirmPopup() {
    memoIdToDelete = null;
    if (deleteConfirmPopup) {
        deleteConfirmPopup.classList.add('hidden');
    }
}

// --- 事件处理 ---

function handleSaveMemo() {
    const content = memoTextarea.value;
    addMemo(content);
    hideAddMemoPopup();
}

function handleConfirmDelete() {
    if (memoIdToDelete !== null) {
        deleteMemo(memoIdToDelete);
    }
    hideDeleteConfirmPopup();
}

function handleMemoListClick(event) {
    const target = event.target;
    const memoItem = target.closest('.memo-item');
    if (!memoItem) return;

    const memoId = Number(memoItem.dataset.id);

    if (target.classList.contains('delete-memo-btn')) {
        showDeleteConfirmPopup(memoId); // 改为显示确认弹窗
    } else if (target.classList.contains('memo-checkbox')) {
        toggleMemoStatus(memoId);
    }
}

// --- 初始化 ---
function init() {
    memoView = document.querySelector('#memo-view');
    if (!memoView) return;

    // 缓存元素
    memoListArea = memoView.querySelector('.memo-list-area');
    addMemoButton = memoView.querySelector('.add-memo-button');
    
    addMemoPopup = document.querySelector('#add-memo-popup');
    cancelMemoButton = addMemoPopup.querySelector('#cancel-memo-btn');
    saveMemoButton = addMemoPopup.querySelector('#save-memo-btn');
    memoTextarea = addMemoPopup.querySelector('#memo-textarea');

    deleteConfirmPopup = document.querySelector('#delete-confirm-popup');
    cancelDeleteButton = deleteConfirmPopup.querySelector('#cancel-delete-btn');
    confirmDeleteButton = deleteConfirmPopup.querySelector('#confirm-delete-btn');

    // 绑定事件
    addMemoButton.addEventListener('click', showAddMemoPopup);
    cancelMemoButton.addEventListener('click', hideAddMemoPopup);
    saveMemoButton.addEventListener('click', handleSaveMemo);
    memoListArea.addEventListener('click', handleMemoListClick);
    cancelDeleteButton.addEventListener('click', hideDeleteConfirmPopup);
    confirmDeleteButton.addEventListener('click', handleConfirmDelete);

    // 加载数据并初次渲染
    memoList = getMemos();
    renderMemos();
}

// --- 导出 ---
// 重命名为 init 以便在 main.js 中统一调用
export { init as initMemo };
