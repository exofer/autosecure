// Toast notification system
const Toasts = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3500) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    else if (type === 'error') icon = 'fa-exclamation-triangle';
    else if (type === 'warning') icon = 'fa-exclamation-circle';

    toast.innerHTML = `
      <i class="fas ${icon}"></i>
      <div style="flex:1;">${message}</div>
      <button class="toast-close-btn" style="background:none;border:none;color:var(--text-dim);cursor:pointer;margin-left:8px;padding:4px;display:flex;align-items:center;" aria-label="Close notification">
        <i class="fas fa-times"></i>
      </button>
    `;

    const closeToast = () => {
      if (toast.classList.contains('closing')) return;
      toast.classList.remove('open');
      toast.classList.add('closing');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 170); // 170ms exit matching recipe
    };

    toast.querySelector('.toast-close-btn').addEventListener('click', closeToast);

    this.container.appendChild(toast);

    // Trigger smooth entrance on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('open');
      });
    });

    // Auto dismiss after duration
    setTimeout(closeToast, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error', 4500); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'info'); }
};

window.Toasts = Toasts;
