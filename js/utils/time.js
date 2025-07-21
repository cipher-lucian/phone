// --- 元素缓存 ---
const timeElement = document.querySelector('.time');

// --- 时间更新逻辑 ---
export function updateTime() {
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

/**
 * 将时间戳格式化为 "HH:MM" 格式
 * @param {number} timestamp - 时间戳 (例如 Date.now())
 * @returns {string} 格式化后的时间字符串
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 获取当前完整、人类可读的日期时间字符串
 * @returns {string} 例如 "2023年7月21日 星期五 下午2:30"
 */
export function getFormattedDateTime() {
  const now = new Date();
  // 使用 toLocaleString 来获取本地化的日期时间格式
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true 
  };
  // 使用 'zh-CN' 确保中文格式
  return now.toLocaleString('zh-CN', options);
}

/**
 * 根据与当前时间的差值，生成一段描述性文字
 * @param {number | undefined} timestamp - 上一条消息的时间戳
 * @returns {string} 描述性文字
 */
export function getTimeDifferenceDescription(timestamp) {
  // 边界情况：如果没有时间戳（例如第一次对话），返回默认文本
  if (!timestamp) {
    return '这是你们的第一次对话。';
  }

  const diff = Date.now() - timestamp; // 毫秒差
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return '对话刚刚还在继续。';
  if (minutes < 5) return '就在几分钟前。';
  if (minutes < 60) return `大约 ${minutes} 分钟前。`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `大约 ${hours} 小时前。`;

  const days = Math.floor(hours / 24);
  return `大约 ${days} 天前。`;
}
