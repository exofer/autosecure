// Accounts Manager View Module
const AccountsView = {
  state: {
    page: 1,
    limit: 15,
    search: '',
    filter: 'all',
    sort: 'time_desc',
    scope: 'user'
  },

  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <!-- Toolbar & Actions -->
      <div class="card" style="margin-bottom:20px;">
        <div class="card-body" style="padding:16px 20px;">
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;">
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;flex:1;max-width:600px;">
              <div style="position:relative;flex:1;min-width:220px;">
                <input type="text" id="acc-search-input" class="form-input" 
                       placeholder="Search username, email, UID, recovery code..." 
                       value="${this.state.search}"
                       onkeydown="if(event.key==='Enter') AccountsView.onSearch()" />
              </div>
              <button class="btn btn-secondary" onclick="AccountsView.onSearch()">
                <i class="fas fa-search"></i>
              </button>
            </div>

            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
              <button class="btn btn-primary btn-sm" onclick="AccountsView.openAddAccountModal()">
                <i class="fas fa-plus"></i> Add Account
              </button>
              <div class="dropdown" style="position:relative;display:inline-block;">
                <button class="btn btn-secondary btn-sm" onclick="AccountsView.toggleExportDropdown()">
                  <i class="fas fa-download"></i> Export <i class="fas fa-caret-down"></i>
                </button>
                <div id="export-dropdown-menu" style="display:none;position:absolute;right:0;top:100%;margin-top:4px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-sm);box-shadow:var(--shadow-md);z-index:30;min-width:180px;">
                  <a href="/api/accounts/export/download?format=txt&scope=${this.state.scope}" target="_blank" class="nav-item" style="margin:0;border-radius:0;">Download TXT</a>
                  <a href="/api/accounts/export/download?format=csv&scope=${this.state.scope}" target="_blank" class="nav-item" style="margin:0;border-radius:0;">Download CSV</a>
                  <a href="/api/accounts/export/download?format=json&scope=${this.state.scope}" target="_blank" class="nav-item" style="margin:0;border-radius:0;">Download JSON</a>
                  <a href="/api/accounts/export/recovery-codes?scope=${this.state.scope}" target="_blank" class="nav-item" style="margin:0;border-radius:0;">Recovery Codes Only</a>
                </div>
              </div>
              <button class="btn btn-danger btn-sm" onclick="AccountsView.confirmDeleteAll()">
                <i class="fas fa-trash-alt"></i> Delete All
              </button>
            </div>
          </div>

          <!-- Filters Row -->
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border-color);">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="btn btn-sm ${this.state.filter === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="AccountsView.setFilter('all')">All</button>
              <button class="btn btn-sm ${this.state.filter === 'mc' ? 'btn-primary' : 'btn-secondary'}" onclick="AccountsView.setFilter('mc')">Owns MC</button>
              <button class="btn btn-sm ${this.state.filter === 'capes' ? 'btn-primary' : 'btn-secondary'}" onclick="AccountsView.setFilter('capes')">Has Capes</button>
              <button class="btn btn-sm ${this.state.filter === 'nomc' ? 'btn-primary' : 'btn-secondary'}" onclick="AccountsView.setFilter('nomc')">No MC</button>
            </div>

            <div style="display:flex;align-items:center;gap:12px;">
              ${API.isAdmin ? `
                <label class="form-checkbox-label" style="font-size:0.8rem;padding:0;">
                  <input type="checkbox" id="acc-scope-all" ${this.state.scope === 'all' ? 'checked' : ''} onchange="AccountsView.toggleScope(this.checked)" />
                  Show All Users' Accounts
                </label>
              ` : ''}

              <select class="form-select" style="width:auto;padding:5px 10px;font-size:0.78rem;" onchange="AccountsView.setSort(this.value)">
                <option value="time_desc" ${this.state.sort === 'time_desc' ? 'selected' : ''}>Newest First</option>
                <option value="time_asc" ${this.state.sort === 'time_asc' ? 'selected' : ''}>Oldest First</option>
                <option value="username_asc" ${this.state.sort === 'username_asc' ? 'selected' : ''}>Username A-Z</option>
                <option value="username_desc" ${this.state.sort === 'username_desc' ? 'selected' : ''}>Username Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Accounts Table Card -->
      <div class="card">
        <div class="card-body" style="padding:0;">
          <div id="accounts-table-container">
            <div style="text-align:center;padding:40px;">
              <i class="fas fa-spinner fa-spin fa-2x" style="color:var(--primary);"></i>
            </div>
          </div>
        </div>
      </div>
    `;

    await this.loadAccounts();
  },

  async loadAccounts() {
    const tableContainer = document.getElementById('accounts-table-container');
    if (!tableContainer) return;

    try {
      const res = await API.get('/api/accounts', {
        page: this.state.page,
        limit: this.state.limit,
        search: this.state.search,
        filter: this.state.filter,
        sort: this.state.sort,
        scope: this.state.scope
      });

      const { accounts, pagination } = res.data;

      if (!accounts.length) {
        tableContainer.innerHTML = `
          <div style="text-align:center;padding:50px;">
            <i class="fas fa-user-slash fa-3x" style="color:var(--text-dim);margin-bottom:14px;"></i>
            <h4 style="color:var(--text-muted);">No accounts found</h4>
            <p style="font-size:0.85rem;color:var(--text-dim);margin-top:4px;">Try modifying your search or filters.</p>
          </div>
        `;
        return;
      }

      tableContainer.innerHTML = `
        <div class="table-wrapper" style="border:none;border-radius:0;">
          <table>
            <thead>
              <tr>
                <th>Minecraft User</th>
                <th>Email Address</th>
                <th>Recovery Code</th>
                <th>Owns MC</th>
                <th>Capes</th>
                <th>Added</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${accounts.map(acc => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <img src="https://visage.surgeplay.com/bust/${encodeURIComponent(acc.username)}?y=-40" 
                           onerror="this.src='https://cdn.pfps.gg/pfps/59339-erwan-meunier.gif'"
                           style="width:28px;height:28px;border-radius:4px;flex-shrink:0;" />
                      <div>
                        <div style="font-weight:600;display:flex;align-items:center;gap:6px;">
                          ${acc.username || 'Unknown'}
                          ${acc.is_quarantined ? '<span class="badge-tag danger"><i class="fas fa-lock"></i> Quarantined</span>' : ''}
                        </div>
                        <div style="font-size:0.72rem;color:var(--text-dim);font-family:var(--font-mono);">${acc.uid}</div>
                      </div>
                    </div>
                  </td>
                  <td style="font-family:var(--font-mono);font-size:0.8rem;color:var(--text-muted);">
                    ${acc.email}
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm" style="font-family:var(--font-mono);font-size:0.75rem;" 
                            onclick="API.copyText('${acc.recoverycode}', 'Recovery Code')">
                      <i class="far fa-copy"></i> ${acc.recoverycode ? acc.recoverycode.substring(0, 11) + '...' : 'N/A'}
                    </button>
                  </td>
                  <td>
                    <span class="badge-tag ${acc.ownsmc && !acc.ownsmc.includes('Failed') ? 'success' : 'danger'}">
                      ${acc.ownsmc || 'None'}
                    </span>
                  </td>
                  <td>
                    <span class="badge-tag ${acc.capes && acc.capes !== 'None' ? 'warning' : 'info'}">
                      ${acc.capes || 'None'}
                    </span>
                  </td>
                  <td style="font-size:0.75rem;color:var(--text-dim);white-space:nowrap;">
                    ${acc.time ? new Date(parseInt(acc.time, 10) * 1000).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style="text-align:right;">
                    <div class="btn-group" style="justify-content:flex-end;">
                      <button class="btn btn-secondary btn-sm" title="Inspect Full Account" onclick="AccountsView.inspectAccount('${acc.uid}')">
                        <i class="fas fa-search"></i>
                      </button>
                      <button class="btn btn-secondary btn-sm" title="Copy Formatted Line" onclick="AccountsView.copyFormatted('${acc.uid}', '${acc.username}', '${acc.ownsmc}', '${acc.capes}', '${acc.recoverycode}', '${acc.email}', '${acc.secemail}', '${acc.secretkey}', '${acc.password}')">
                        <i class="fas fa-file-alt"></i>
                      </button>
                      <button class="btn btn-secondary btn-sm" title="Transfer Account" onclick="AccountsView.openMoveModal('${acc.uid}')">
                        <i class="fas fa-exchange-alt"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" title="Delete Account" onclick="AccountsView.deleteAccount('${acc.uid}')">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div style="padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border-color);background:rgba(0,0,0,0.15);">
          <div style="font-size:0.8rem;color:var(--text-dim);">
            Showing page <b>${pagination.page}</b> of <b>${pagination.totalPages || 1}</b> (${pagination.total} accounts)
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-secondary btn-sm" ${pagination.page <= 1 ? 'disabled' : ''} onclick="AccountsView.setPage(${pagination.page - 1})">
              Previous
            </button>
            <button class="btn btn-secondary btn-sm" ${pagination.page >= pagination.totalPages ? 'disabled' : ''} onclick="AccountsView.setPage(${pagination.page + 1})">
              Next
            </button>
          </div>
        </div>
      `;
    } catch (err) {
      tableContainer.innerHTML = `
        <div style="text-align:center;padding:30px;color:var(--danger);">
          Error loading accounts: ${err.message}
        </div>
      `;
    }
  },

  onSearch() {
    this.state.search = document.getElementById('acc-search-input').value;
    this.state.page = 1;
    this.loadAccounts();
  },

  setFilter(filter) {
    this.state.filter = filter;
    this.state.page = 1;
    this.render();
  },

  setSort(sort) {
    this.state.sort = sort;
    this.loadAccounts();
  },

  setPage(page) {
    this.state.page = page;
    this.loadAccounts();
  },

  toggleScope(checked) {
    this.state.scope = checked ? 'all' : 'user';
    this.state.page = 1;
    this.loadAccounts();
  },

  toggleExportDropdown() {
    const el = document.getElementById('export-dropdown-menu');
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  },

  copyFormatted(uid, ign, mc, capes, rec, email, sec, key, pass) {
    const str = `${ign}:${mc}:${capes}:${rec}:${email}:${sec}:${key}:${pass}`;
    API.copyText(str, 'Credentials');
  },

  async inspectAccount(uid) {
    try {
      const res = await API.get(`/api/accounts/${uid}`);
      const acc = res.data;

      const bodyHtml = `
        <!-- Account Overview Card -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding:16px;background:rgba(255,255,255,0.02);border-radius:var(--radius-md);border:1px solid var(--border-color);">
          <img src="https://visage.surgeplay.com/full/${encodeURIComponent(acc.username)}" 
               onerror="this.src='https://cdn.pfps.gg/pfps/59339-erwan-meunier.gif'"
               style="height:90px;object-fit:contain;" />
          <div>
            <h3 style="font-size:1.2rem;font-weight:700;">${acc.username || 'Unknown'}</h3>
            <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
              <span class="badge-tag ${acc.ownsmc && !acc.ownsmc.includes('Failed') ? 'success' : 'danger'}">${acc.ownsmc || 'None'}</span>
              <span class="badge-tag warning">${acc.capes || 'No Capes'}</span>
              ${acc.quarantine ? '<span class="badge-tag danger"><i class="fas fa-lock"></i> Quarantined</span>' : ''}
            </div>
            <div style="font-size:0.75rem;color:var(--text-dim);margin-top:6px;font-family:var(--font-mono);">UID: ${acc.uid}</div>
          </div>
        </div>

        <!-- Detail Tabs -->
        <div class="tabs-header" style="padding:0;margin-bottom:16px;">
          <button class="tab-btn active" id="modal-tab-btn-creds" onclick="AccountsView.switchModalTab('creds')">Credentials</button>
          <button class="tab-btn" id="modal-tab-btn-extra" onclick="AccountsView.switchModalTab('extra')">Extra Information</button>
          <button class="tab-btn" id="modal-tab-btn-stats" onclick="AccountsView.switchModalTab('stats')">Hypixel Stats</button>
        </div>

        <!-- Tab 1: Credentials -->
        <div id="modal-tab-content-creds">
          <div style="display:grid;grid-template-columns:1fr;gap:12px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Email Address</label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="form-input" style="font-family:var(--font-mono);" readonly value="${acc.email}" />
                <button class="btn btn-secondary btn-sm" onclick="API.copyText('${acc.email}', 'Email')"><i class="far fa-copy"></i></button>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Password</label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="form-input" style="font-family:var(--font-mono);" readonly value="${acc.password || ''}" />
                <button class="btn btn-secondary btn-sm" onclick="API.copyText('${acc.password}', 'Password')"><i class="far fa-copy"></i></button>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">25-Digit Recovery Code</label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="form-input" style="font-family:var(--font-mono);color:#34d399;font-weight:600;" readonly value="${acc.recoverycode || ''}" />
                <button class="btn btn-secondary btn-sm" onclick="API.copyText('${acc.recoverycode}', 'Recovery Code')"><i class="far fa-copy"></i></button>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Secondary / Rescue Email</label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="form-input" style="font-family:var(--font-mono);" readonly value="${acc.secemail || 'None'}" />
                <button class="btn btn-secondary btn-sm" onclick="API.copyText('${acc.secemail}', 'Secondary Email')"><i class="far fa-copy"></i></button>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Secret Key (2FA TOTP)</label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="form-input" style="font-family:var(--font-mono);" readonly value="${acc.secretkey || 'Disabled'}" />
                <button class="btn btn-secondary btn-sm" onclick="API.copyText('${acc.secretkey}', 'Secret Key')"><i class="far fa-copy"></i></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Extra Information -->
        <div id="modal-tab-content-extra" style="display:none;">
          ${acc.extra ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;font-size:0.85rem;">
              <div style="padding:10px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="color:var(--text-dim);font-size:0.75rem;">Original Email (OGO)</div>
                <div style="font-weight:600;font-family:var(--font-mono);margin-top:2px;">${acc.extra.ogo || 'N/A'}</div>
              </div>
              <div style="padding:10px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="color:var(--text-dim);font-size:0.75rem;">Xbox Gamertag</div>
                <div style="font-weight:600;margin-top:2px;">${acc.extra.newgamertag || acc.extra.gtg || 'N/A'}</div>
              </div>
              <div style="padding:10px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="color:var(--text-dim);font-size:0.75rem;">Linked Cards</div>
                <div style="font-weight:600;margin-top:2px;">${acc.extra.cards || 'None'}</div>
              </div>
              <div style="padding:10px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="color:var(--text-dim);font-size:0.75rem;">Subscriptions</div>
                <div style="font-weight:600;margin-top:2px;">${acc.extra.subscriptions || 'None'}</div>
              </div>
              <div style="padding:10px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="color:var(--text-dim);font-size:0.75rem;">Addresses</div>
                <div style="font-weight:600;margin-top:2px;">${acc.extra.addresses || 'None'}</div>
              </div>
              <div style="padding:10px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="color:var(--text-dim);font-size:0.75rem;">Devices</div>
                <div style="font-weight:600;margin-top:2px;">${acc.extra.devices || 'None'}</div>
              </div>
              <div style="padding:10px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="color:var(--text-dim);font-size:0.75rem;">Creation Date</div>
                <div style="font-weight:600;margin-top:2px;">${acc.extra.creationdate || 'N/A'}</div>
              </div>
              <div style="padding:10px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="color:var(--text-dim);font-size:0.75rem;">SSID Token</div>
                <div style="font-weight:600;font-family:var(--font-mono);font-size:0.75rem;word-break:break-all;margin-top:2px;">
                  ${acc.extra.ssid ? acc.extra.ssid.substring(0, 32) + '...' : 'None'}
                </div>
              </div>
            </div>
          ` : `
            <div style="text-align:center;padding:30px;color:var(--text-dim);">
              No extra metadata captured for this account.
            </div>
          `}
        </div>

        <!-- Tab 3: Hypixel Stats -->
        <div id="modal-tab-content-stats" style="display:none;">
          ${acc.stats ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;">
              <div class="stat-card" style="padding:14px;">
                <div class="stat-label">Bedwars Level</div>
                <div class="stat-value" style="font-size:1.3rem;">${acc.stats.bedwars?.level || 0}★</div>
                <div class="stat-sub">FKDR: ${acc.stats.bedwars?.fkdr || 0} | Wins: ${acc.stats.bedwars?.wins || 0}</div>
              </div>
              <div class="stat-card" style="padding:14px;">
                <div class="stat-label">Skywars Level</div>
                <div class="stat-value" style="font-size:1.3rem;">${acc.stats.skywars?.levels || 0}★</div>
                <div class="stat-sub">Kills: ${acc.stats.skywars?.kills || 0} | Wins: ${acc.stats.skywars?.wins || 0}</div>
              </div>
              <div class="stat-card" style="padding:14px;">
                <div class="stat-label">Duels Wins</div>
                <div class="stat-value" style="font-size:1.3rem;">${acc.stats.duels?.wins || 0}</div>
                <div class="stat-sub">WLR: ${acc.stats.duels?.WLRatio || 0}</div>
              </div>
              <div class="stat-card" style="padding:14px;">
                <div class="stat-label">Skyblock Networth</div>
                <div class="stat-value" style="font-size:1.3rem;color:#34d399;">
                  ${OverviewView.formatCoins(acc.stats.skyblock?.[0]?.networth || 0)}
                </div>
                <div class="stat-sub">${acc.stats.skyblock?.[0]?.cute_name || 'No Profile'}</div>
              </div>
            </div>
          ` : `
            <div style="text-align:center;padding:30px;color:var(--text-dim);">
              No Hypixel stats data stored for this account.
            </div>
          `}
        </div>
      `;

      Modal.open({
        title: `Account Inspector: ${acc.username}`,
        bodyHtml,
        footerHtml: `
          <button class="btn btn-secondary" onclick="Modal.close()">Close</button>
        `,
        maxWidth: '720px'
      });
    } catch (err) {
      Toasts.error('Failed to load account details: ' + err.message);
    }
  },

  switchModalTab(tabId) {
    ['creds', 'extra', 'stats'].forEach(t => {
      const btn = document.getElementById(`modal-tab-btn-${t}`);
      const content = document.getElementById(`modal-tab-content-${t}`);
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
  },

  openAddAccountModal() {
    const bodyHtml = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="form-group">
          <label class="form-label">Minecraft Username</label>
          <input type="text" id="add-acc-username" class="form-input" placeholder="e.g. Steve" />
        </div>
        <div class="form-group">
          <label class="form-label">Email Address *</label>
          <input type="email" id="add-acc-email" class="form-input" placeholder="user@domain.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="text" id="add-acc-password" class="form-input" placeholder="Account password" />
        </div>
        <div class="form-group">
          <label class="form-label">25-Digit Recovery Code</label>
          <input type="text" id="add-acc-rec" class="form-input" placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" />
        </div>
        <div class="form-group">
          <label class="form-label">Secondary Email</label>
          <input type="text" id="add-acc-sec" class="form-input" placeholder="backup@domain.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Secret Key (2FA TOTP)</label>
          <input type="text" id="add-acc-key" class="form-input" placeholder="Secret Key" />
        </div>
        <div class="form-group">
          <label class="form-label">Owns MC</label>
          <select id="add-acc-mc" class="form-select">
            <option value="Purchased">Purchased</option>
            <option value="Xbox Game Pass">Game Pass</option>
            <option value="No MC">No MC</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Capes</label>
          <input type="text" id="add-acc-capes" class="form-input" placeholder="e.g. Migrator, 15th Anniversary" />
        </div>
      </div>
    `;

    Modal.open({
      title: 'Add Manual Account Entry',
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="AccountsView.submitAddAccount()">Save Account</button>
      `
    });
  },

  async submitAddAccount() {
    const username = document.getElementById('add-acc-username').value;
    const email = document.getElementById('add-acc-email').value;
    const password = document.getElementById('add-acc-password').value;
    const recoverycode = document.getElementById('add-acc-rec').value;
    const secemail = document.getElementById('add-acc-sec').value;
    const secretkey = document.getElementById('add-acc-key').value;
    const ownsmc = document.getElementById('add-acc-mc').value;
    const capes = document.getElementById('add-acc-capes').value;

    if (!email) {
      Toasts.error('Email address is required');
      return;
    }

    try {
      await API.post('/api/accounts', {
        username, email, password, recoverycode, secemail, secretkey, ownsmc, capes
      });
      Modal.close();
      Toasts.success('Account registered successfully!');
      this.loadAccounts();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  openMoveModal(uid) {
    const bodyHtml = `
      <div class="form-group">
        <label class="form-label">Target Discord User ID</label>
        <input type="text" id="move-target-user-id" class="form-input" placeholder="Enter recipient Discord ID" />
      </div>
    `;

    Modal.open({
      title: `Transfer Account (${uid})`,
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="AccountsView.submitMoveAccount('${uid}')">Transfer</button>
      `
    });
  },

  async submitMoveAccount(uid) {
    const targetUserId = document.getElementById('move-target-user-id').value;
    if (!targetUserId) {
      Toasts.error('Target User ID required');
      return;
    }

    try {
      await API.post(`/api/accounts/${uid}/move`, { targetUserId });
      Modal.close();
      Toasts.success(`Account transferred to ${targetUserId}`);
      this.loadAccounts();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async deleteAccount(uid) {
    if (!confirm(`Are you sure you want to delete account ${uid}?`)) return;

    try {
      await API.delete(`/api/accounts/${uid}`);
      Toasts.success('Account deleted');
      this.loadAccounts();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async confirmDeleteAll() {
    if (!confirm('DANGER: Are you sure you want to delete ALL your accounts? This action cannot be reversed.')) return;

    try {
      await API.delete('/api/accounts');
      Toasts.success('All accounts deleted');
      this.loadAccounts();
    } catch (err) {
      Toasts.error(err.message);
    }
  }
};

window.AccountsView = AccountsView;
