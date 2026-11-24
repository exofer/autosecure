// Modal dialog engine
const Modal = {
  backdrop: null,
  box: null,

  init() {
    this.backdrop = document.getElementById('global-modal-backdrop');
    if (!this.backdrop) {
      this.backdrop = document.createElement('div');
      this.backdrop.id = 'global-modal-backdrop';
      this.backdrop.className = 'modal-backdrop';
      this.backdrop.innerHTML = `
        <div class="modal-box" id="global-modal-box">
          <div class="modal-header">
            <h3 class="modal-title" id="global-modal-title">Modal Title</h3>
            <button class="modal-close" onclick="Modal.close()">&times;</button>
          </div>
          <div class="modal-body" id="global-modal-body"></div>
          <div class="modal-footer" id="global-modal-footer"></div>
        </div>
      `;
      document.body.appendChild(this.backdrop);

      // Close on backdrop click
      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) this.close();
      });

      // Close on ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.backdrop.classList.contains('open')) {
          this.close();
        }
      });
    }
  },

  open({ title = '', bodyHtml = '', footerHtml = '', maxWidth = null, onOpen = null }) {
    if (!this.backdrop) this.init();

    document.getElementById('global-modal-title').textContent = title;
    document.getElementById('global-modal-body').innerHTML = bodyHtml;
    
    const footerEl = document.getElementById('global-modal-footer');
    if (footerHtml) {
      footerEl.innerHTML = footerHtml;
      footerEl.style.display = 'flex';
    } else {
      footerEl.innerHTML = '';
      footerEl.style.display = 'none';
    }

    const box = document.getElementById('global-modal-box');
    if (maxWidth) {
      box.style.maxWidth = maxWidth;
    } else {
      box.style.maxWidth = '650px';
    }

    this.backdrop.classList.add('open');
    if (typeof onOpen === 'function') onOpen();
  },

  close() {
    if (this.backdrop) {
      this.backdrop.classList.remove('open');
    }
  }
};

window.Modal = Modal;
