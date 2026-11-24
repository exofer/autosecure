// Webmail View Module
const EmailsView = {
  state: {
    search: '',
    selectedEmailId: null
  },

  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:360px 1fr;gap:20px;height:calc(100vh - 140px);min-height:550px;">
        <!-- Left: Inbox List & Actions -->
        <div class="card" style="margin-bottom:0;display:flex;flex-direction:column;">
          <div class="card-header" style="padding:14px 18px;">
            <span class="card-title"><i class="fas fa-inbox"></i> Webmail Inbox</span>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="EmailsView.openRegisterModal()" title="Register Domain Email">
                <i class="fas fa-plus"></i>
              </button>
              <button class="btn btn-secondary btn-sm" onclick="EmailsView.loadInbox()" title="Refresh Inbox">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          <div style="padding:10px 14px;border-bottom:1px solid var(--border-color);">
            <input type="text" id="email-search-input" class="form-input" 
                   placeholder="Search sender, code, body..." 
                   value="${this.state.search}" 
                   oninput="EmailsView.onSearch(this.value)" />
          </div>

          <div id="email-list-container" style="flex:1;overflow-y:auto;padding:8px 0;">
            <div style="text-align:center;padding:30px;">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
          </div>
        </div>

        <!-- Right: Email Message Viewer -->
        <div class="card" style="margin-bottom:0;display:flex;flex-direction:column;">
          <div class="card-header" id="email-viewer-header">
            <span class="card-title"><i class="fas fa-envelope-open"></i> Message Viewer</span>
            <div id="email-extracted-badge" style="display:none;"></div>
          </div>

          <div id="email-viewer-body" style="flex:1;overflow-y:auto;padding:24px;">
            <div style="text-align:center;padding:80px 20px;color:var(--text-dim);">
              <i class="fas fa-envelope fa-3x" style="margin-bottom:14px;opacity:0.4;"></i>
              <p>Select a message from the inbox to read its contents and extract security codes.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    await this.loadInbox();
  },

  async loadInbox() {
    const listContainer = document.getElementById('email-list-container');
    if (!listContainer) return;

    try {
      const res = await API.get('/api/emails', {
        search: this.state.search,
        limit: 50
      });

      const { emails } = res.data;

      if (!emails.length) {
        listContainer.innerHTML = `
          <div style="text-align:center;padding:40px 14px;color:var(--text-dim);">
            <i class="fas fa-mail-bulk fa-2x" style="margin-bottom:8px;opacity:0.5;"></i>
            <p style="font-size:0.85rem;">No emails received yet.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = emails.map(email => `
        <div class="email-item ${this.state.selectedEmailId === email.id ? 'active' : ''}" 
             onclick="EmailsView.viewEmail(${email.id})"
             style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer;transition:background 0.15s ease;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span style="font-weight:600;font-size:0.82rem;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;">
              ${email.sender || 'Unknown Sender'}
            </span>
            <span style="font-size:0.7rem;color:var(--text-dim);white-space:nowrap;">
              ${email.time ? new Date(parseInt(email.time, 10) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
          <div style="font-size:0.78rem;font-weight:500;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;">
            ${email.subject || '(No Subject)'}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:0.72rem;color:var(--text-dim);font-family:var(--font-mono);">${email.receiver || ''}</span>
            ${email.extractedCode ? `
              <span class="badge-tag success" style="font-family:var(--font-mono);font-size:0.7rem;">
                <i class="fas fa-shield-alt"></i> ${email.extractedCode}
              </span>
            ` : ''}
          </div>
        </div>
      `).join('');
    } catch (err) {
      listContainer.innerHTML = `<div style="padding:14px;color:var(--danger);font-size:0.8rem;">${err.message}</div>`;
    }
  },

  onSearch(query) {
    this.state.search = query;
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => this.loadInbox(), 300);
  },

  async viewEmail(id) {
    this.state.selectedEmailId = id;
    const bodyContainer = document.getElementById('email-viewer-body');
    const badgeEl = document.getElementById('email-extracted-badge');

    bodyContainer.innerHTML = `<div style="text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>`;

    try {
      const res = await API.get(`/api/emails/${id}`);
      const email = res.data;

      if (email.extractedCode) {
        badgeEl.innerHTML = `
          <button class="btn btn-success btn-sm" onclick="API.copyText('${email.extractedCode}', 'OTP Code')">
            <i class="far fa-copy"></i> Code: ${email.extractedCode}
          </button>
        `;
        badgeEl.style.display = 'block';
      } else {
        badgeEl.style.display = 'none';
      }

      bodyContainer.innerHTML = `
        <div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border-color);">
          <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:12px;">${email.subject || '(No Subject)'}</h2>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:0.82rem;">
            <span style="color:var(--text-dim);">From:</span>
            <span style="font-weight:600;color:var(--text-main);">${email.sender}</span>
            <span style="color:var(--text-dim);">To:</span>
            <span style="font-family:var(--font-mono);color:var(--text-muted);">${email.receiver}</span>
            <span style="color:var(--text-dim);">Date:</span>
            <span style="color:var(--text-muted);">${email.time ? new Date(parseInt(email.time, 10) * 1000).toLocaleString() : 'N/A'}</span>
          </div>
        </div>

        ${email.extractedCode ? `
          <div style="background:rgba(16, 185, 129, 0.1);border:1px solid rgba(16, 185, 129, 0.3);border-radius:var(--radius-md);padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:0.75rem;color:#34d399;font-weight:600;text-transform:uppercase;">Extracted Security Verification Code</div>
              <div style="font-family:var(--font-mono);font-size:1.4rem;font-weight:700;color:#fff;letter-spacing:0.08em;margin-top:2px;">
                ${email.extractedCode}
              </div>
            </div>
            <button class="btn btn-success" onclick="API.copyText('${email.extractedCode}', 'Security Code')">
              <i class="far fa-copy"></i> Copy Code
            </button>
          </div>
        ` : ''}

        <div style="font-size:0.88rem;line-height:1.6;color:#cbd5e1;white-space:pre-wrap;font-family:var(--font-sans);background:rgba(0,0,0,0.2);padding:18px;border-radius:var(--radius-md);border:1px solid var(--border-color);">
          ${email.description || '(Empty message body)'}
        </div>
      `;

      // Update active selection highlighting in list
      const items = document.querySelectorAll('.email-item');
      items.forEach(el => el.classList.remove('active'));
    } catch (err) {
      bodyContainer.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async openRegisterModal() {
    try {
      const res = await API.get('/api/emails/meta/registered');
      const { registeredEmails, availableDomains, notifierEmails } = res.data;

      const bodyHtml = `
        <div style="margin-bottom:18px;">
          <h4 style="font-size:0.9rem;font-weight:600;margin-bottom:8px;">Register Custom Email</h4>
          <div style="display:flex;gap:8px;">
            <input type="text" id="reg-email-prefix" class="form-input" placeholder="myinbox" style="flex:1;" />
            <select id="reg-email-domain" class="form-select" style="width:160px;">
              ${availableDomains.map(d => `<option value="${d}">@${d}</option>`).join('')}
            </select>
            <button class="btn btn-primary" onclick="EmailsView.submitRegisterEmail()">Register</button>
          </div>
        </div>

        <div style="margin-top:20px;">
          <h4 style="font-size:0.9rem;font-weight:600;margin-bottom:8px;">Your Registered Inboxes</h4>
          <div style="max-height:180px;overflow-y:auto;border:1px solid var(--border-color);border-radius:var(--radius-sm);">
            ${registeredEmails.length ? registeredEmails.map(em => `
              <div style="padding:8px 12px;border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;font-size:0.82rem;">
                <span style="font-family:var(--font-mono);">${em}</span>
                <button class="btn btn-danger btn-sm" onclick="EmailsView.deleteRegisteredEmail('${em}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            `).join('') : '<div style="padding:14px;text-align:center;color:var(--text-dim);font-size:0.8rem;">No custom emails registered yet.</div>'}
          </div>
        </div>
      `;

      Modal.open({
        title: 'Domain Email Management',
        bodyHtml,
        footerHtml: `<button class="btn btn-secondary" onclick="Modal.close()">Close</button>`
      });
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async submitRegisterEmail() {
    const prefix = document.getElementById('reg-email-prefix').value.trim();
    const domain = document.getElementById('reg-email-domain').value;

    if (!prefix) {
      Toasts.warning('Please enter an email username');
      return;
    }

    const fullEmail = `${prefix}@${domain}`;
    try {
      await API.post('/api/emails/register', { email: fullEmail });
      Toasts.success(`Email ${fullEmail} registered!`);
      this.openRegisterModal();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async deleteRegisteredEmail(email) {
    try {
      await API.delete('/api/emails/register', { email });
      Toasts.success('Email removed');
      this.openRegisterModal();
    } catch (err) {
      Toasts.error(err.message);
    }
  }
};

window.EmailsView = EmailsView;
