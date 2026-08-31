export class Toast {
  static show(message, type = 'info', duration = 2800) {
    let container = document.getElementById('toast-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-root';
      container.className = 'toast-container';
      const appContainer = document.querySelector('.app-container') || document.body;
      appContainer.appendChild(container);
    }

    // Clear previous toasts so they never stack on mobile screens
    container.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '❌';

    toast.innerHTML = `
      <span>${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }
}
