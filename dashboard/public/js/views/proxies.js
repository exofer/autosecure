// Proxy Manager View Module
const ProxiesView = {
  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title"><re-icon icon="server" size="18" aria-hidden="true"></re-icon> Rotating Proxy Manager</span>
          <button class="btn btn-primary btn-sm" onclick="ProxiesView.openAddProxyModal()">
            <re-icon icon="plus" size="14" aria-hidden="true"></re-icon> Add Proxy
          </button>
        </div>

        <div class="card-body">
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:18px;">
            Configure residential or datacenter proxies to bypass Microsoft IP rate limits during securing and ban verification.
          </p>
          <div id="proxies-table-container">
            ${App.waveDots('Loading configured proxies...', 'lg')}
          </div>
        </div>
      </div>
    `;

    await this.loadProxies();
  },

  async loadProxies() {
    const container = document.getElementById('proxies-table-container');
    if (!container) return;

    try {
      const res = await API.get('/api/proxies');
      const proxies = res.proxies || [];

      if (!proxies.length) {
        container.innerHTML = `
          <div style="text-align:center;padding:40px;color:var(--text-dim);">
            <re-icon icon="globe" size="48" style="margin-bottom:12px;opacity:0.4;" aria-hidden="true"></re-icon>
            <h4>No custom proxies configured</h4>
            <p style="font-size:0.85rem;margin-top:4px;">Add a proxy formatted as <code>host:port:user:pass</code> to protect requests.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Proxy Address</th>
                <th>Status / Latency</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${proxies.map(p => `
                <tr>
                  <td style="font-family:var(--font-mono);font-size:0.85rem;">${p.proxy}</td>
                  <td id="proxy-status-${p.rowid}">
                    <span class="badge-tag info">Untested</span>
                  </td>
                  <td style="text-align:right;">
                    <div class="btn-group" style="justify-content:flex-end;">
                      <button class="btn btn-secondary btn-sm" onclick="ProxiesView.testProxy('${p.rowid}', '${p.proxy}')">
                        <re-icon icon="flask" size="14" aria-hidden="true"></re-icon> Test
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="ProxiesView.deleteProxy('${p.rowid}')" title="Delete Proxy" aria-label="Delete Proxy">
                        <re-icon icon="trash" size="14" aria-hidden="true"></re-icon>
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
      container.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  openAddProxyModal() {
    const bodyHtml = `
      <div class="form-group">
        <label class="form-label">Proxy String *</label>
        <input type="text" id="add-proxy-input" class="form-input" placeholder="host:port:username:password or http://..." required />
        <p style="font-size:0.75rem;color:var(--text-dim);margin-top:4px;">Supports HTTP, HTTPS, and SOCKS5 format.</p>
      </div>
    `;

    Modal.open({
      title: 'Add Dedicated Proxy',
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="ProxiesView.submitAddProxy()">Add Proxy</button>
      `
    });
  },

  async submitAddProxy() {
    const proxy = document.getElementById('add-proxy-input').value.trim();
    if (!proxy) return Toasts.warning('Proxy address required');

    try {
      await API.post('/api/proxies', { proxy });
      Modal.close();
      Toasts.success('Proxy added successfully!');
      this.loadProxies();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async testProxy(rowid, proxyStr) {
    const statusCell = document.getElementById(`proxy-status-${rowid}`);
    if (statusCell) {
      statusCell.innerHTML = `
        <span class="badge-tag info" style="display:inline-flex;align-items:center;gap:6px;">
          <span class="wave-dots wave-dots-sm"><span></span><span></span><span></span></span>
          Testing...
        </span>
      `;
    }

    try {
      const res = await API.post('/api/proxies/test', { proxy: proxyStr });
      if (res.success) {
        statusCell.innerHTML = `
          <span class="badge-tag success">
            <re-icon icon="check" size="14" aria-hidden="true"></re-icon> Online (${res.latencyMs}ms) - IP: ${res.ip}
          </span>
        `;
        Toasts.success(`Proxy working! IP: ${res.ip} (${res.latencyMs}ms)`);
      } else {
        statusCell.innerHTML = `<span class="badge-tag danger"><re-icon icon="x" size="14" aria-hidden="true"></re-icon> Failed</span>`;
        Toasts.error(res.error || 'Proxy test failed');
      }
    } catch (err) {
      if (statusCell) statusCell.innerHTML = `<span class="badge-tag danger"><re-icon icon="x" size="14" aria-hidden="true"></re-icon> Error</span>`;
      Toasts.error(err.message);
    }
  },

  async deleteProxy(rowid) {
    if (!confirm('Delete this proxy?')) return;
    try {
      await API.delete(`/api/proxies/${rowid}`);
      Toasts.success('Proxy removed');
      this.loadProxies();
    } catch (err) {
      Toasts.error(err.message);
    }
  }
};

window.ProxiesView = ProxiesView;
