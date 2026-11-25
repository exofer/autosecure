// Minecraft & Security Tools View Module
const ToolsView = {
  activeTool: 'ssid',

  async render(params = {}) {
    if (params.tool) this.activeTool = params.tool;

    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title"><re-icon icon="designtools" size="18" aria-hidden="true"></re-icon> Minecraft & Security Tools</span>
          <span class="badge-tag info">Utilities Suite</span>
        </div>

        <div class="tabs-header" style="margin-top:14px;">
          <button class="tab-btn ${this.activeTool === 'ssid' ? 'active' : ''}" onclick="ToolsView.switchTool('ssid')">
            <re-icon icon="user-id" size="15" aria-hidden="true"></re-icon> SSID Checker
          </button>
          <button class="tab-btn ${this.activeTool === 'skin' ? 'active' : ''}" onclick="ToolsView.switchTool('skin')">
            <re-icon icon="tshirt" size="15" aria-hidden="true"></re-icon> Change Skin
          </button>
          <button class="tab-btn ${this.activeTool === 'ign' ? 'active' : ''}" onclick="ToolsView.switchTool('ign')">
            <re-icon icon="pen-writing" size="15" aria-hidden="true"></re-icon> Change IGN
          </button>
          <button class="tab-btn ${this.activeTool === 'hypixel' ? 'active' : ''}" onclick="ToolsView.switchTool('hypixel')">
            <re-icon icon="gamepad" size="15" aria-hidden="true"></re-icon> Hypixel Stats & Status
          </button>
          <button class="tab-btn ${this.activeTool === 'cosmetics' ? 'active' : ''}" onclick="ToolsView.switchTool('cosmetics')">
            <re-icon icon="magic-star" size="15" aria-hidden="true"></re-icon> Cosmetics
          </button>
          <button class="tab-btn ${this.activeTool === 'ban' ? 'active' : ''}" onclick="ToolsView.switchTool('ban')">
            <re-icon icon="ban" size="15" aria-hidden="true"></re-icon> Ban Check
          </button>
          <button class="tab-btn ${this.activeTool === 'locked' ? 'active' : ''}" onclick="ToolsView.switchTool('locked')">
            <re-icon icon="security-user" size="15" aria-hidden="true"></re-icon> Check Lock
          </button>
          <button class="tab-btn ${this.activeTool === 'otp' ? 'active' : ''}" onclick="ToolsView.switchTool('otp')">
            <re-icon icon="sms" size="15" aria-hidden="true"></re-icon> Request OTP
          </button>
          <button class="tab-btn ${this.activeTool === 'quarantine' ? 'active' : ''}" onclick="ToolsView.switchTool('quarantine')">
            <re-icon icon="shield-alert" size="15" aria-hidden="true"></re-icon> Quarantine Vault
          </button>
        </div>

        <div class="card-body">
          <!-- TOOL 1: SSID CHECKER -->
          <div id="tool-view-ssid" style="${this.activeTool === 'ssid' ? 'display:block' : 'display:none'}">
            <div style="max-width:620px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px;">
                Validate Minecraft SSID session token, decode expiration epoch, and preview account profile & skins.
              </p>
              <div class="form-group">
                <label class="form-label">SSID (Minecraft Bearer Token)</label>
                <textarea id="tool-ssid-input" class="form-textarea" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." style="height:90px;"></textarea>
              </div>
              <button class="btn btn-primary" onclick="ToolsView.runSSIDCheck()">
                <re-icon icon="search" size="15" aria-hidden="true"></re-icon> Inspect SSID
              </button>
            </div>
            <div id="tool-ssid-result" style="margin-top:20px;display:none;"></div>
          </div>

          <!-- TOOL 2: CHANGE SKIN -->
          <div id="tool-view-skin" style="${this.activeTool === 'skin' ? 'display:block' : 'display:none'}">
            <div style="max-width:620px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px;">
                Change Minecraft skin via valid session SSID.
              </p>
              <div class="form-group">
                <label class="form-label">SSID Session Token *</label>
                <input type="text" id="tool-skin-ssid" class="form-input" placeholder="Bearer Token" />
              </div>
              <div class="form-group">
                <label class="form-label">Skin Image URL *</label>
                <input type="text" id="tool-skin-url" class="form-input" placeholder="https://textures.minecraft.net/texture/..." />
              </div>
              <div class="form-group">
                <label class="form-label">Model Variant</label>
                <select id="tool-skin-variant" class="form-select">
                  <option value="classic">Classic (4px Arms)</option>
                  <option value="slim">Slim / Alex (3px Arms)</option>
                </select>
              </div>
              <button class="btn btn-primary" onclick="ToolsView.runChangeSkin()">
                <re-icon icon="paintbrush" size="15" aria-hidden="true"></re-icon> Update Skin
              </button>
            </div>
          </div>

          <!-- TOOL 3: CHANGE IGN -->
          <div id="tool-view-ign" style="${this.activeTool === 'ign' ? 'display:block' : 'display:none'}">
            <div style="max-width:620px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px;">
                Change Minecraft in-game name (IGN) using account SSID token.
              </p>
              <div class="form-group">
                <label class="form-label">SSID Session Token *</label>
                <input type="text" id="tool-ign-ssid" class="form-input" placeholder="Bearer Token" />
              </div>
              <div class="form-group">
                <label class="form-label">New Minecraft Username *</label>
                <input type="text" id="tool-ign-newname" class="form-input" placeholder="3-16 characters" maxlength="16" />
              </div>
              <button class="btn btn-primary" onclick="ToolsView.runChangeIGN()">
                <re-icon icon="check" size="15" aria-hidden="true"></re-icon> Change Name
              </button>
            </div>
          </div>

          <!-- TOOL 4: HYPIXEL STATS & STATUS -->
          <div id="tool-view-hypixel" style="${this.activeTool === 'hypixel' ? 'display:block' : 'display:none'}">
            <div style="max-width:620px;">
              <div style="display:flex;gap:10px;">
                <input type="text" id="tool-hypixel-user" class="form-input" placeholder="Minecraft username or UUID" />
                <button class="btn btn-primary" onclick="ToolsView.runHypixelLookup()">Lookup</button>
              </div>
            </div>
            <div id="tool-hypixel-result" style="margin-top:24px;display:none;"></div>
          </div>

          <!-- TOOL 5: COSMETICS -->
          <div id="tool-view-cosmetics" style="${this.activeTool === 'cosmetics' ? 'display:block' : 'display:none'}">
            <div style="max-width:620px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px;">
                Query Lunar Client cosmetics, cloaks, and emotes for an account.
              </p>
              <div class="form-group">
                <label class="form-label">SSID Token</label>
                <input type="text" id="tool-cosmetics-ssid" class="form-input" placeholder="SSID Token" />
              </div>
              <button class="btn btn-primary" onclick="ToolsView.runCosmeticsCheck()">
                <re-icon icon="magic-star" size="15" aria-hidden="true"></re-icon> Fetch Cosmetics
              </button>
            </div>
            <div id="tool-cosmetics-result" style="margin-top:20px;display:none;"></div>
          </div>

          <!-- TOOL 6: BAN CHECK -->
          <div id="tool-view-ban" style="${this.activeTool === 'ban' ? 'display:block' : 'display:none'}">
            <div style="max-width:620px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px;">
                Check if account is banned from Hypixel Network or multiplayer servers.
              </p>
              <div class="form-group">
                <label class="form-label">SSID Token</label>
                <input type="text" id="tool-ban-ssid" class="form-input" placeholder="SSID Token" />
              </div>
              <button class="btn btn-primary" onclick="ToolsView.runBanCheck()">
                <re-icon icon="judge" size="15" aria-hidden="true"></re-icon> Check Ban Status
              </button>
            </div>
            <div id="tool-ban-result" style="margin-top:20px;display:none;"></div>
          </div>

          <!-- TOOL 7: CHECK LOCKED -->
          <div id="tool-view-locked" style="${this.activeTool === 'locked' ? 'display:block' : 'display:none'}">
            <div style="max-width:620px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px;">
                Check if Microsoft / Xbox account is locked, suspended, or flagged for suspicious activity.
              </p>
              <div class="form-group">
                <label class="form-label">Microsoft Account Email</label>
                <input type="email" id="tool-locked-email" class="form-input" placeholder="user@outlook.com" />
              </div>
              <button class="btn btn-primary" onclick="ToolsView.runLockCheck()">
                <re-icon icon="shield" size="15" aria-hidden="true"></re-icon> Verify Account Status
              </button>
            </div>
            <div id="tool-locked-result" style="margin-top:20px;display:none;"></div>
          </div>

          <!-- TOOL 8: REQUEST OTP -->
          <div id="tool-view-otp" style="${this.activeTool === 'otp' ? 'display:block' : 'display:none'}">
            <div style="max-width:620px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px;">
                Send verification code to an account's security email or phone number.
              </p>
              <div class="form-group">
                <label class="form-label">Target Email Address</label>
                <input type="email" id="tool-reqotp-email" class="form-input" placeholder="target@outlook.com" />
              </div>
              <button class="btn btn-primary" onclick="ToolsView.runRequestOTP()">
                <re-icon icon="paper-plane" size="15" aria-hidden="true"></re-icon> Send OTP
              </button>
            </div>
            <div id="tool-reqotp-result" style="margin-top:20px;display:none;"></div>
          </div>

          <!-- TOOL 9: QUARANTINE VAULT -->
          <div id="tool-view-quarantine" style="${this.activeTool === 'quarantine' ? 'display:block' : 'display:none'}">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin:0;">
                Quarantined accounts are isolated and protected from lock triggers.
              </p>
              <button class="btn btn-primary btn-sm" onclick="ToolsView.openAddQuarantineModal()">
                <re-icon icon="plus" size="14" aria-hidden="true"></re-icon> Quarantine Account
              </button>
            </div>
            <div id="tool-quarantine-table-container"></div>
          </div>
        </div>
      </div>
    `;

    if (this.activeTool === 'quarantine') {
      this.loadQuarantine();
    }
  },

  switchTool(toolId) {
    this.activeTool = toolId;
    this.render();
  },

  async runSSIDCheck() {
    const ssid = document.getElementById('tool-ssid-input').value.trim();
    if (!ssid) return Toasts.warning('Please enter an SSID token');

    const resultBox = document.getElementById('tool-ssid-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = App.waveDots('Checking SSID token validity...', 'sm');

    try {
      const res = await API.post('/api/tools/ssid/check', { ssid });
      if (!res.valid) {
        resultBox.innerHTML = `
          <div style="padding:16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:var(--radius-md);color:#f87171;">
            <re-icon icon="close-circle" size="16" aria-hidden="true"></re-icon> <b>Invalid or Expired SSID</b>
            <div style="font-size:0.8rem;margin-top:6px;color:var(--text-muted);">${res.error || 'Token rejected'}</div>
          </div>
        `;
        return;
      }

      const p = res.profile;
      resultBox.innerHTML = `
        <div style="padding:20px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);">
          <div style="display:flex;align-items:center;gap:18px;margin-bottom:16px;">
            <img src="https://visage.surgeplay.com/full/${encodeURIComponent(p.name)}" 
                 onerror="this.src='https://cdn.pfps.gg/pfps/59339-erwan-meunier.gif'"
                 style="height:85px;object-fit:contain;" />
            <div>
              <h3 style="font-size:1.15rem;font-weight:700;">${p.name}</h3>
              <div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);margin:4px 0;">UUID: ${p.id}</div>
              <span class="badge-tag success"><re-icon icon="check" size="12" aria-hidden="true"></re-icon> Valid Token</span>
              <span class="badge-tag info">${res.isExpired ? 'Expired' : 'Active Session'}</span>
            </div>
          </div>
          <div style="font-size:0.8rem;color:var(--text-dim);">
            Expires At: ${res.expiresAt ? new Date(res.expiresAt).toLocaleString() : 'N/A'}
          </div>
        </div>
      `;
    } catch (err) {
      resultBox.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async runChangeSkin() {
    const ssid = document.getElementById('tool-skin-ssid').value.trim();
    const skinUrl = document.getElementById('tool-skin-url').value.trim();
    const variant = document.getElementById('tool-skin-variant').value;

    if (!ssid || !skinUrl) return Toasts.warning('SSID and Skin URL are required');

    try {
      const res = await API.post('/api/tools/ssid/change-skin', { ssid, skinUrl, variant });
      if (res.success) {
        Toasts.success('Skin successfully updated!');
      } else {
        Toasts.error(res.error || 'Failed to update skin');
      }
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async runChangeIGN() {
    const ssid = document.getElementById('tool-ign-ssid').value.trim();
    const newName = document.getElementById('tool-ign-newname').value.trim();

    if (!ssid || !newName) return Toasts.warning('SSID and new username are required');

    try {
      const res = await API.post('/api/tools/ssid/change-ign', { ssid, newName });
      if (res.success) {
        Toasts.success(`Username changed to ${newName}!`);
      } else {
        Toasts.error(res.error || 'Failed to change name');
      }
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async runHypixelLookup() {
    const username = document.getElementById('tool-hypixel-user').value.trim();
    if (!username) return Toasts.warning('Please enter a username');

    const resultBox = document.getElementById('tool-hypixel-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = App.waveDots('Querying Hypixel & Mojang APIs...', 'sm');

    try {
      const [statsRes, statusRes] = await Promise.all([
        API.post('/api/tools/hypixel/stats', { username }),
        API.post('/api/tools/hypixel/status', { username }).catch(() => ({ success: false }))
      ]);

      if (!statsRes.success) {
        resultBox.innerHTML = `<div style="color:var(--danger);">${statsRes.error || 'Player not found'}</div>`;
        return;
      }

      const s = statsRes.stats;
      const status = statusRes.success ? statusRes : null;

      resultBox.innerHTML = `
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:22px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
            <div style="display:flex;align-items:center;gap:14px;">
              <img src="https://visage.surgeplay.com/bust/${encodeURIComponent(username)}?y=-40" 
                   onerror="this.src='https://cdn.pfps.gg/pfps/59339-erwan-meunier.gif'"
                   style="width:48px;height:48px;border-radius:6px;" />
              <div>
                <h3 style="font-size:1.2rem;font-weight:700;">${username}</h3>
                <div style="font-size:0.75rem;color:var(--text-dim);font-family:var(--font-mono);">${s.uuid || ''}</div>
              </div>
            </div>
            <div>
              ${status?.online ? `
                <span class="badge-tag success"><re-icon icon="record" size="10" aria-hidden="true"></re-icon> Online (${status.game || 'In Game'})</span>
              ` : `
                <span class="badge-tag danger"><re-icon icon="record" size="10" aria-hidden="true"></re-icon> Offline</span>
              `}
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:14px;">
            <div class="stat-card" style="padding:14px;">
              <div class="stat-label">Bedwars</div>
              <div class="stat-value" style="font-size:1.3rem;">${s.bedwars?.level || 0}★</div>
              <div class="stat-sub">Wins: ${s.bedwars?.wins || 0} | Final Kills: ${s.bedwars?.finalKills || 0}</div>
            </div>
            <div class="stat-card" style="padding:14px;">
              <div class="stat-label">Skywars</div>
              <div class="stat-value" style="font-size:1.3rem;">${s.skywars?.levels || 0}★</div>
              <div class="stat-sub">Wins: ${s.skywars?.wins || 0} | Kills: ${s.skywars?.kills || 0}</div>
            </div>
            <div class="stat-card" style="padding:14px;">
              <div class="stat-label">Duels</div>
              <div class="stat-value" style="font-size:1.3rem;">${s.duels?.wins || 0}</div>
              <div class="stat-sub">WLR: ${s.duels?.WLRatio || 0}</div>
            </div>
            <div class="stat-card" style="padding:14px;">
              <div class="stat-label">Skyblock Networth</div>
              <div class="stat-value" style="font-size:1.3rem;color:#34d399;">
                ${OverviewView.formatCoins(s.skyblock?.[0]?.networth || 0)}
              </div>
              <div class="stat-sub">${s.skyblock?.[0]?.cute_name || 'No Profile'}</div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      resultBox.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async runCosmeticsCheck() {
    const ssid = document.getElementById('tool-cosmetics-ssid').value.trim();
    if (!ssid) return Toasts.warning('Please enter an SSID');

    const resultBox = document.getElementById('tool-cosmetics-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = App.waveDots('Checking cosmetics on Lunar & Minecraft...', 'sm');

    try {
      const res = await API.post('/api/tools/cosmetics', { ssid });
      resultBox.innerHTML = `
        <div style="padding:16px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md);">
          <h4 style="font-size:0.9rem;margin-bottom:10px;">Lunar / MC Cosmetics Results</h4>
          <pre style="font-family:var(--font-mono);font-size:0.8rem;background:rgba(0,0,0,0.3);padding:12px;border-radius:4px;overflow-x:auto;">${JSON.stringify(res.cosmetics, null, 2)}</pre>
        </div>
      `;
    } catch (err) {
      resultBox.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async runBanCheck() {
    const ssid = document.getElementById('tool-ban-ssid').value.trim();
    if (!ssid) return Toasts.warning('Please enter an SSID');

    const resultBox = document.getElementById('tool-ban-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = App.waveDots('Checking account ban status...', 'sm');

    try {
      const res = await API.post('/api/tools/check-ban', { ssid });
      resultBox.innerHTML = `
        <div style="padding:16px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md);">
          <h4 style="font-size:0.9rem;margin-bottom:10px;">Ban Verification Response</h4>
          <pre style="font-family:var(--font-mono);font-size:0.8rem;background:rgba(0,0,0,0.3);padding:12px;border-radius:4px;overflow-x:auto;">${JSON.stringify(res.result, null, 2)}</pre>
        </div>
      `;
    } catch (err) {
      resultBox.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async runLockCheck() {
    const email = document.getElementById('tool-locked-email').value.trim();
    if (!email) return Toasts.warning('Please enter an email address');

    const resultBox = document.getElementById('tool-locked-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = App.waveDots('Inquiring Microsoft SAF API...', 'sm');

    try {
      const res = await API.post('/api/tools/check-locked', { email });
      const d = res.data;

      resultBox.innerHTML = `
        <div style="padding:18px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <re-icon icon="${d.locked ? 'lock' : 'check-circle'}" size="20" style="color:${d.locked ? '#ef4444' : '#10b981'};" aria-hidden="true"></re-icon>
            <h4 style="font-size:1rem;font-weight:700;">Account Lock Status: ${d.locked ? 'LOCKED / SUSPENDED' : 'CLEAN / ACTIVE'}</h4>
          </div>
          <div style="font-size:0.85rem;color:var(--text-muted);display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;">
            <div>Suspended: <b>${d.locked ? 'Yes' : 'No'}</b></div>
            <div>Compromised: <b>${d.compromised ? 'Yes' : 'No'}</b></div>
            <div>Blocked: <b>${d.blocked ? 'Yes' : 'No'}</b></div>
            <div>2FA Enabled: <b>${d.tsvEnabled ? 'Yes' : 'No'}</b></div>
          </div>
          <div style="margin-top:10px;font-size:0.8rem;color:var(--text-dim);">
            Reason: ${d.reason || 'None reported'}
          </div>
        </div>
      `;
    } catch (err) {
      resultBox.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async runRequestOTP() {
    const email = document.getElementById('tool-reqotp-email').value.trim();
    if (!email) return Toasts.warning('Please enter an email address');

    const resultBox = document.getElementById('tool-reqotp-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = App.waveDots('Triggering Microsoft OTP dispatch...', 'sm');

    try {
      const res = await API.post('/api/tools/request-otp', { email });
      if (res.requireProofSelection) {
        resultBox.innerHTML = `
          <div style="padding:16px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md);">
            <h4 style="font-size:0.9rem;margin-bottom:10px;">Select Security Proof Method:</h4>
            ${res.proofs.map(p => `
              <button class="btn btn-secondary btn-sm" style="margin-right:8px;margin-bottom:8px;" 
                      onclick="ToolsView.selectProofAndSend('${email}', '${p.id}')">
                ${p.display} (${p.type})
              </button>
            `).join('')}
          </div>
        `;
      } else if (res.success) {
        resultBox.innerHTML = `
          <div style="padding:14px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:var(--radius-md);color:#34d399;">
            <re-icon icon="check-circle" size="16" aria-hidden="true"></re-icon> OTP request dispatched successfully! Check inbox.
          </div>
        `;
      } else {
        resultBox.innerHTML = `<div style="color:var(--danger);">${res.error || 'Failed to dispatch OTP'}</div>`;
      }
    } catch (err) {
      resultBox.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async selectProofAndSend(email, proofId) {
    try {
      const res = await API.post('/api/tools/request-otp', { email, securityProof: proofId });
      Toasts.success(res.message || 'OTP dispatched!');
      this.runRequestOTP();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async loadQuarantine() {
    const container = document.getElementById('tool-quarantine-table-container');
    if (!container) return;

    try {
      const res = await API.get('/api/tools/quarantine');
      const list = res.quarantine || [];

      if (!list.length) {
        container.innerHTML = `
          <div style="text-align:center;padding:40px;color:var(--text-dim);">
            <re-icon icon="shield" size="32" style="margin-bottom:10px;opacity:0.4;" aria-hidden="true"></re-icon>
            <p>No accounts currently in quarantine.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>IGN / Name</th>
                <th>UUID</th>
                <th>Quarantined Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(q => `
                <tr>
                  <td><b>${q.name || 'Unknown'}</b></td>
                  <td style="font-family:var(--font-mono);font-size:0.78rem;">${q.uuid || 'N/A'}</td>
                  <td style="font-size:0.75rem;color:var(--text-dim);">${new Date(parseInt(q.time, 10)).toLocaleString()}</td>
                  <td>
                    <button class="btn btn-danger btn-sm" onclick="ToolsView.removeQuarantine('${q.id}')">
                      Release
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

  openAddQuarantineModal() {
    const bodyHtml = `
      <div class="form-group">
        <label class="form-label">Minecraft Username</label>
        <input type="text" id="add-q-name" class="form-input" placeholder="Player username" />
      </div>
      <div class="form-group">
        <label class="form-label">Account UUID</label>
        <input type="text" id="add-q-uuid" class="form-input" placeholder="Minecraft UUID" />
      </div>
      <div class="form-group">
        <label class="form-label">Session SSID (Optional)</label>
        <input type="text" id="add-q-ssid" class="form-input" placeholder="Bearer token" />
      </div>
    `;

    Modal.open({
      title: 'Quarantine Minecraft Account',
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="ToolsView.submitAddQuarantine()">Quarantine</button>
      `
    });
  },

  async submitAddQuarantine() {
    const name = document.getElementById('add-q-name').value.trim();
    const uuid = document.getElementById('add-q-uuid').value.trim();
    const ssid = document.getElementById('add-q-ssid').value.trim();

    try {
      await API.post('/api/tools/quarantine', { name, uuid, ssid });
      Modal.close();
      Toasts.success('Account placed in quarantine vault');
      this.loadQuarantine();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async removeQuarantine(id) {
    if (!confirm('Release account from quarantine?')) return;
    try {
      await API.delete(`/api/tools/quarantine/${id}`);
      Toasts.success('Quarantine removed');
      this.loadQuarantine();
    } catch (err) {
      Toasts.error(err.message);
    }
  }
};

window.ToolsView = ToolsView;
