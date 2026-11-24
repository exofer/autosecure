// License & Billing Hub View Module
const LicenseView = {
  async render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div style="text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
    `;

    try {
      const res = await API.get('/api/license');
      const lic = res.data;

      container.innerHTML = `
        <!-- Active Plan Banner -->
        <div class="card" style="background:linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(59,130,246,0.06) 100%);border-color:rgba(99,102,241,0.3);">
          <div class="card-body" style="padding:28px;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;">
              <div>
                <span class="badge-tag ${lic.isExpired ? 'danger' : 'success'}" style="margin-bottom:10px;">
                  ${lic.isOwner ? '👑 MASTER OWNER' : (lic.isTrial ? 'FREE TRIAL' : (lic.isExpired ? 'EXPIRED' : 'ACTIVE SUBSCRIPTION'))}
                </span>
                <h2 style="font-size:1.6rem;font-weight:700;letter-spacing:-0.02em;">
                  ${lic.isOwner ? 'Master Lifetime Access' : (lic.isTrial ? 'Autosecure 12H Trial' : 'Autosecure Monthly License')}
                </h2>
                <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-muted);margin-top:6px;">
                  Key: <code>${lic.licenseKey || 'No Active License Key'}</code>
                </div>
              </div>

              <div style="text-align:right;">
                <div style="font-size:0.8rem;color:var(--text-dim);">Subscription Expiration</div>
                <div style="font-size:1.4rem;font-weight:700;color:${lic.isExpired ? '#f87171' : '#34d399'};">
                  ${lic.isOwner ? 'Never (Lifetime)' : (lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : 'N/A')}
                </div>
                <div style="font-size:0.75rem;color:var(--text-dim);margin-top:2px;">
                  ${lic.isOwner ? 'Permanent' : (lic.daysRemaining ? `${lic.daysRemaining} days remaining` : '')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:18px;margin-bottom:24px;">
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Bot Slots</span>
              <div class="stat-icon primary"><i class="fas fa-robot"></i></div>
            </div>
            <div class="stat-value">${lic.botSlots}</div>
            <div class="stat-sub">Concurrent bot instances</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Secured Accounts</span>
              <div class="stat-icon success"><i class="fas fa-shield-alt"></i></div>
            </div>
            <div class="stat-value">${lic.securedCount}</div>
            <div class="stat-sub">Accounts captured</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Networth Valuation</span>
              <div class="stat-icon info"><i class="fas fa-coins"></i></div>
            </div>
            <div class="stat-value">${OverviewView.formatCoins(lic.totalNetworth)}</div>
            <div class="stat-sub">Skyblock coin balance</div>
          </div>
        </div>

        <!-- Operations Row: Redeem Key & Trial -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(360px, 1fr));gap:24px;">
          <!-- Redeem Key Card -->
          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <span class="card-title"><i class="fas fa-ticket-alt"></i> Redeem License Key</span>
            </div>
            <div class="card-body">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px;">
                Enter a purchased license voucher or extension key to activate or extend your subscription.
              </p>
              <form onsubmit="LicenseView.redeemKey(event)">
                <div class="form-group">
                  <label class="form-label">License Key</label>
                  <input type="text" id="redeem-key-input" class="form-input" placeholder="Exo-xxxx-xxxx-xxxx" required />
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%;">
                  <i class="fas fa-check"></i> Redeem License
                </button>
              </form>
            </div>
          </div>

          <!-- Free Trial & Recovery Card -->
          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <span class="card-title"><i class="fas fa-gift"></i> Free Trial & Account Recovery</span>
            </div>
            <div class="card-body">
              <div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border-color);">
                <h4 style="font-size:0.9rem;font-weight:600;margin-bottom:6px;">Claim 12-Hour Free Trial</h4>
                <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px;">
                  New user? Experience the full feature set with 1 free bot slot for 12 hours.
                </p>
                <button class="btn btn-secondary btn-sm" onclick="LicenseView.claimTrial()">
                  <i class="fas fa-stopwatch"></i> Activate 12H Trial
                </button>
              </div>

              <div>
                <h4 style="font-size:0.9rem;font-weight:600;margin-bottom:6px;">Data Recovery / Transfer</h4>
                <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px;">
                  Transfer all accounts and licenses from your previous Discord user ID to your current session.
                </p>
                <button class="btn btn-secondary btn-sm" onclick="LicenseView.openRecoveryModal()">
                  <i class="fas fa-exchange-alt"></i> Transfer My Data
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger);">${err.message}</div>`;
    }
  },

  async redeemKey(e) {
    e.preventDefault();
    const key = document.getElementById('redeem-key-input').value.trim();
    if (!key) return;

    try {
      const res = await API.post('/api/license/redeem', { key });
      Toasts.success(res.message || 'Key redeemed successfully!');
      this.render();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async claimTrial() {
    try {
      const res = await API.post('/api/license/trial');
      Toasts.success(res.message || 'Trial activated!');
      this.render();
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  openRecoveryModal() {
    const bodyHtml = `
      <div class="form-group">
        <label class="form-label">Old Discord User ID *</label>
        <input type="text" id="rec-old-user-id" class="form-input" placeholder="Previous Discord ID" required />
      </div>
      <p style="font-size:0.75rem;color:var(--text-dim);">
        All accounts, bot slots, and license records belonging to this ID will be transferred to your active session.
      </p>
    `;

    Modal.open({
      title: 'Recover Account Data',
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="LicenseView.submitRecovery()">Execute Transfer</button>
      `
    });
  },

  async submitRecovery() {
    const oldUserId = document.getElementById('rec-old-user-id').value.trim();
    if (!oldUserId) return Toasts.warning('Old User ID required');

    try {
      const res = await API.post('/api/license/recover', { oldUserId });
      Modal.close();
      Toasts.success(res.message || 'Data transferred successfully!');
      this.render();
    } catch (err) {
      Toasts.error(err.message);
    }
  }
};

window.LicenseView = LicenseView;
