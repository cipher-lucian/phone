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
