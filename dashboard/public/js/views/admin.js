// Master Owner Admin Console View Module
const AdminView = {
  activeTab: 'keys',

  async render() {
    const container = document.getElementById('view-content');

    if (!API.isAdmin) {
      container.innerHTML = `
        <div class="card" style="border-color:var(--danger);max-width:600px;margin:40px auto;">
          <div class="card-body" style="text-align:center;padding:40px;">
            <i class="fas fa-lock fa-3x" style="color:var(--danger);margin-bottom:14px;"></i>
            <h3 style="color:var(--danger);">Admin Console Locked</h3>
            <p style="color:var(--text-muted);margin:12px 0;">
              Your current Discord ID (<code>${API.currentUserId}</code>) is not registered in <code>config.json</code> under <code>owners</code>.
            </p>
            <p style="font-size:0.8rem;color:var(--text-dim);margin-bottom:18px;">
              To access admin privileges, switch your session ID to the primary owner ID (<code>1456875723494002908</code>) using the user switcher in the top bar.
            </p>
            <button class="btn btn-primary" onclick="App.openUserSwitchModal()">
              <i class="fas fa-user-shield"></i> Switch User Session
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-user-shield"></i> Master Owner Control Center</span>
          <span class="badge-tag danger"><i class="fas fa-crown"></i> Superadmin</span>
        </div>

        <div class="tabs-header" style="margin-top:14px;">
          <button class="tab-btn active" id="admin-tab-btn-keys" onclick="AdminView.switchTab('keys')">
            <i class="fas fa-key"></i> Key Generation & Licenses
          </button>
          <button class="tab-btn" id="admin-tab-btn-users" onclick="AdminView.switchTab('users')">
            <i class="fas fa-users"></i> Users & Bot Slots
          </button>
          <button class="tab-btn" id="admin-tab-btn-blacklist" onclick="AdminView.switchTab('blacklist')">
            <i class="fas fa-ban"></i> Blacklist Manager
          </button>
          <button class="tab-btn" id="admin-tab-btn-system" onclick="AdminView.switchTab('system')">
            <i class="fas fa-server"></i> System & Bot Engine
          </button>
        </div>

        <div class="card-body">
          <!-- TAB 1: KEYS -->
          <div id="admin-tab-content-keys">
            <div style="display:grid;grid-template-columns:360px 1fr;gap:24px;">
              <!-- Left: Key Generator Form -->
              <div style="background:rgba(255,255,255,0.02);padding:18px;border-radius:var(--radius-md);border:1px solid var(--border-color);">
                <h4 style="font-size:0.95rem;font-weight:700;margin-bottom:14px;">Generate License Keys</h4>
                <div class="form-group">
                  <label class="form-label">Duration in Days</label>
                  <input type="number" id="gen-key-duration" class="form-input" value="30" min="1" />
                </div>
                <div class="form-group">
                  <label class="form-label">Quantity</label>
                  <input type="number" id="gen-key-amount" class="form-input" value="1" min="1" max="50" />
                </div>
                <div class="form-group">
                  <label class="form-label">Assign Directly to User ID (Optional)</label>
                  <input type="text" id="gen-key-userid" class="form-input" placeholder="Leave empty for voucher key" />
                </div>
                <button class="btn btn-primary" style="width:100%;margin-bottom:12px;" onclick="AdminView.generateKeys()">
                  <i class="fas fa-plus"></i> Generate Key(s)
                </button>
                <div style="display:flex;gap:8px;">
                  <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="AdminView.extendAllKeys(7)">+7 Days All</button>
                  <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="AdminView.extendAllKeys(30)">+30 Days All</button>
                  <button class="btn btn-danger btn-sm" onclick="AdminView.deleteAllUnredeemed()">Flush</button>
                </div>
              </div>

              <!-- Right: Keys Table -->
              <div id="admin-keys-container">
                <div style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i></div>
              </div>
            </div>
          </div>

          <!-- TAB 2: USERS -->
          <div id="admin-tab-content-users" style="display:none;">
            <div id="admin-users-container">
              <div style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i></div>
            </div>
          </div>

          <!-- TAB 3: BLACKLIST -->
          <div id="admin-tab-content-blacklist" style="display:none;">
            <div style="display:grid;grid-template-columns:360px 1fr;gap:24px;">
              <div style="background:rgba(255,255,255,0.02);padding:18px;border-radius:var(--radius-md);border:1px solid var(--border-color);">
                <h4 style="font-size:0.95rem;font-weight:700;margin-bottom:14px;color:#f87171;">Blacklist User</h4>
                <div class="form-group">
                  <label class="form-label">Discord User ID *</label>
                  <input type="text" id="bl-userid" class="form-input" placeholder="e.g. 1497689626318475426" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Blacklist Reason</label>
                  <input type="text" id="bl-reason" class="form-input" placeholder="e.g. Chargeback, abuse, TOS violation" />
                </div>
                <button class="btn btn-danger" style="width:100%;" onclick="AdminView.submitBlacklist()">
                  <i class="fas fa-ban"></i> Blacklist & Revoke Access
                </button>
              </div>

              <div id="admin-blacklist-container">
                <div style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i></div>
              </div>
            </div>
          </div>

          <!-- TAB 4: SYSTEM & ENGINE -->
          <div id="admin-tab-content-system" style="display:none;">
            <div id="admin-system-container">
              <div style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.loadKeys();
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    ['keys', 'users', 'blacklist', 'system'].forEach(t => {
      const btn = document.getElementById(`admin-tab-btn-${t}`);
      const content = document.getElementById(`admin-tab-content-${t}`);
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

    if (tabId === 'keys') this.loadKeys();
    if (tabId === 'users') this.loadUsers();
    if (tabId === 'blacklist') this.loadBlacklist();
    if (tabId === 'system') this.loadSystemInfo();
  },

  async loadKeys() {
    const container = document.getElementById('admin-keys-container');
    if (!container) return;

    try {
      const res = await API.get('/api/admin/keys');
      const { unredeemed, redeemed } = res.data;

      container.innerHTML = `
        <div style="margin-bottom:16px;">
          <h4 style="font-size:0.9rem;font-weight:700;margin-bottom:8px;">Unredeemed License Keys (${unredeemed.length})</h4>
          <div class="table-wrapper" style="max-height:220px;overflow-y:auto;">
            <table>
              <thead>
                <tr>
                  <th>Voucher Key</th>
                  <th>Duration</th>
                  <th style="text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${unredeemed.length ? unredeemed.map(k => `
                  <tr>
                    <td style="font-family:var(--font-mono);font-size:0.8rem;color:#818cf8;">
                      <a href="javascript:void(0)" onclick="API.copyText('${k.license}', 'License Key')">${k.license}</a>
                    </td>
                    <td>${k.duration} Days</td>
                    <td style="text-align:right;">
                      <button class="btn btn-danger btn-sm" onclick="AdminView.deleteKey('${k.license}')">Delete</button>
                    </td>
                  </tr>
                `).join('') : `<tr><td colspan="3" style="text-align:center;color:var(--text-dim);">No unredeemed keys.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 style="font-size:0.9rem;font-weight:700;margin-bottom:8px;">Redeemed / Active Subscriptions (${redeemed.length})</h4>
          <div class="table-wrapper" style="max-height:260px;overflow-y:auto;">
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Key</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th style="text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${redeemed.length ? redeemed.map(k => `
                  <tr>
                    <td style="font-family:var(--font-mono);font-size:0.8rem;"><b>${k.user_id}</b></td>
                    <td style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);">${k.license}</td>
                    <td>
                      <span class="badge-tag ${k.isExpired ? 'danger' : 'success'}">
                        ${k.isExpired ? 'Expired' : (k.istrial ? 'Trial' : 'Active')}
                      </span>
                    </td>
                    <td style="font-size:0.75rem;color:var(--text-dim);">${new Date(k.expiresAt).toLocaleDateString()} (${k.daysLeft}d)</td>
                    <td style="text-align:right;">
                      <button class="btn btn-danger btn-sm" onclick="AdminView.deleteKey('${k.license}')">Revoke</button>
                    </td>
                  </tr>
                `).join('') : `<tr><td colspan="5" style="text-align:center;color:var(--text-dim);">No redeemed licenses.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async generateKeys() {
    const duration = document.getElementById('gen-key-duration').value;
    const amount = document.getElementById('gen-key-amount').value;
    const user_id = document.getElementById('gen-key-userid').value.trim();

    try {
      const res = await API.post('/api/admin/keys/create', { duration, amount, user_id });
      Toasts.success(res.message || 'Key(s) generated!');
      this.loadKeys();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async extendAllKeys(days) {
    if (!confirm(`Extend ALL active user subscriptions by ${days} days?`)) return;
    try {
      const res = await API.post('/api/admin/keys/extend-all', { days });
      Toasts.success(res.message || 'Keys extended!');
      this.loadKeys();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async deleteKey(key) {
    if (!confirm(`Delete license key ${key}?`)) return;
    try {
      await API.delete(`/api/admin/keys/${key}`);
      Toasts.success('License deleted');
      this.loadKeys();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async deleteAllUnredeemed() {
    if (!confirm('Flush and delete ALL unredeemed license keys?')) return;
    try {
      const res = await API.delete('/api/admin/keys');
      Toasts.success(res.message);
      this.loadKeys();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async loadUsers() {
    const container = document.getElementById('admin-users-container');
    if (!container) return;

    try {
      const res = await API.get('/api/admin/users');
      const users = res.users || [];

      container.innerHTML = `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User Discord ID</th>
                <th>Active License Key</th>
                <th>Bot Slots</th>
                <th>Secured Accounts</th>
                <th>Networth</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td><b>${u.user_id}</b></td>
                  <td style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);">${u.license || 'None'}</td>
                  <td><span class="badge-tag primary">${u.slots || 1} Slots</span></td>
                  <td style="font-weight:600;">${u.accountsCount || 0}</td>
                  <td style="font-weight:600;color:#34d399;">${OverviewView.formatCoins(u.networth || 0)}</td>
                  <td style="text-align:right;">
                    <button class="btn btn-secondary btn-sm" onclick="AdminView.openEditSlotsModal('${u.user_id}', ${u.slots || 1})">
                      <i class="fas fa-sliders-h"></i> Slots
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="AdminView.revokeUserAccess('${u.user_id}')">
                      <i class="fas fa-user-slash"></i> Revoke
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  openEditSlotsModal(userId, currentSlots) {
    const bodyHtml = `
      <div class="form-group">
        <label class="form-label">User ID</label>
        <input type="text" class="form-input" value="${userId}" readonly />
      </div>
      <div class="form-group">
        <label class="form-label">Allocated Slots</label>
        <input type="number" id="edit-user-slots-input" class="form-input" value="${currentSlots}" min="1" max="100" />
      </div>
    `;

    Modal.open({
      title: `Update Bot Slots for ${userId}`,
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="AdminView.submitSlots('${userId}')">Save Slots</button>
      `
    });
  },

  async submitSlots(userId) {
    const slots = parseInt(document.getElementById('edit-user-slots-input').value, 10) || 1;
    try {
      await API.post('/api/admin/users/slots', { user_id: userId, slots, mode: 'set' });
      Modal.close();
      Toasts.success(`Slots for ${userId} updated to ${slots}!`);
      this.loadUsers();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async revokeUserAccess(userId) {
    if (!confirm(`Revoke all licenses, slots, and access for user ${userId}?`)) return;
    try {
      await API.delete(`/api/admin/users/${userId}`);
      Toasts.success('Access revoked');
      this.loadUsers();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async loadBlacklist() {
    const container = document.getElementById('admin-blacklist-container');
    if (!container) return;

    try {
      const res = await API.get('/api/admin/blacklist');
      const list = res.blacklist || [];

      container.innerHTML = `
        <h4 style="font-size:0.95rem;font-weight:700;margin-bottom:12px;">Active Blacklist (${list.length})</h4>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Blacklisted User ID</th>
                <th>Reason</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${list.length ? list.map(b => `
                <tr>
                  <td><b>${b.user_id}</b></td>
                  <td style="color:var(--text-muted);font-size:0.8rem;">${b.reason || 'None'}</td>
                  <td style="text-align:right;">
                    <button class="btn btn-secondary btn-sm" onclick="AdminView.unblacklist('${b.user_id}')">
                      Unblacklist
                    </button>
                  </td>
                </tr>
              `).join('') : `<tr><td colspan="3" style="text-align:center;color:var(--text-dim);">No blacklisted users.</td></tr>`}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async submitBlacklist() {
    const user_id = document.getElementById('bl-userid').value.trim();
    const reason = document.getElementById('bl-reason').value.trim();

    if (!user_id) return Toasts.warning('User ID required');

    try {
      await API.post('/api/admin/blacklist', { user_id, reason });
      Toasts.success(`User ${user_id} blacklisted`);
      document.getElementById('bl-userid').value = '';
      document.getElementById('bl-reason').value = '';
      this.loadBlacklist();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async unblacklist(userId) {
    if (!confirm(`Unblacklist user ${userId}?`)) return;
    try {
      await API.delete(`/api/admin/blacklist/${userId}`);
      Toasts.success('User unblacklisted');
      this.loadBlacklist();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async loadSystemInfo() {
    const container = document.getElementById('admin-system-container');
    if (!container) return;

    try {
      const res = await API.get('/api/admin/system/info');
      const { tables, os, process: proc } = res.data;

      container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding:16px;background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:var(--radius-md);">
          <div>
            <h4 style="font-size:1.05rem;font-weight:700;">PM2 Bot Process Engine</h4>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">
              Restart the background PM2 daemon running <code>autosecure.js</code>.
            </p>
          </div>
          <button class="btn btn-danger" onclick="AdminView.restartBot()">
            <i class="fas fa-redo"></i> Restart Autosecure PM2
          </button>
        </div>

        <h4 style="font-size:0.95rem;font-weight:700;margin-bottom:12px;">SQLite Database Table Statistics</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;margin-bottom:24px;">
          ${Object.entries(tables).map(([tbl, count]) => `
            <div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
              <div style="font-size:0.75rem;color:var(--text-dim);font-family:var(--font-mono);">${tbl}</div>
              <div style="font-size:1.3rem;font-weight:700;color:var(--text-main);margin-top:2px;">${count} <span style="font-size:0.75rem;color:var(--text-dim);font-weight:normal;">rows</span></div>
            </div>
          `).join('')}
        </div>

        <h4 style="font-size:0.95rem;font-weight:700;margin-bottom:12px;">Runtime Environment Details</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;">
          <div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
            <div style="font-size:0.75rem;color:var(--text-dim);">PID</div>
            <div style="font-weight:600;font-family:var(--font-mono);">${proc.pid}</div>
          </div>
          <div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
            <div style="font-size:0.75rem;color:var(--text-dim);">Heap Used</div>
            <div style="font-weight:600;">${Math.round(proc.memoryUsage.heapUsed / (1024*1024))} MB</div>
          </div>
          <div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
            <div style="font-size:0.75rem;color:var(--text-dim);">System Architecture</div>
            <div style="font-weight:600;">${os.platform} (${os.arch})</div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async restartBot() {
    if (!confirm('Restart PM2 autosecure bot instance?')) return;
    try {
      const res = await API.post('/api/admin/system/restart');
      Toasts.success(res.message || 'Bot restart signal sent!');
    } catch (err) {
      Toasts.error(err.message);
    }
  }
};

window.AdminView = AdminView;
