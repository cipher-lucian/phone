// --- 通用本地存储 ---

/**
 * 将数据保存到 localStorage
 * @param {string} key - 存储的键
 * @param {*} data - 要存储的数据
 */
export function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * 从 localStorage 加载数据
 * @param {string} key - 要加载的键
 * @returns {*} - 返回解析后的数据，如果不存在则返回 null
 */
export function loadFromStorage(key) {
    const savedData = localStorage.getItem(key);
    if (savedData) {
        try {
            return JSON.parse(savedData);
        } catch (e) {
            console.error("Error parsing JSON from localStorage", e);
            return null;
        }
    }
    return null;
}
