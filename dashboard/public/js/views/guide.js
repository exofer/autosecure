// Documentation & Setup Guide View Module
const GuideView = {
  render() {
    const container = document.getElementById('view-content');
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title"><re-icon icon="book" size="18" aria-hidden="true"></re-icon> Autosecure Setup & Command Documentation</span>
          <span class="badge-tag info">Full Reference</span>
        </div>

        <div class="card-body" style="max-width:880px;line-height:1.7;">
          <section style="margin-bottom:28px;">
            <h3 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:10px;">
              <re-icon icon="rocket" size="18" aria-hidden="true"></re-icon> Overview & Discord Command Mapping
            </h3>
            <p style="color:var(--text-muted);font-size:0.9rem;">
              Every single Discord-based slash command, modal, and button has been ported to this native web dashboard:
            </p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;margin-top:14px;">
              <div style="background:var(--bg-input);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--primary);">/secure</div>
                <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px;">
                  Ported to <b>Securing Studio</b>: Supports OTP, Recovery Code, Zyger (TOTP), Bulk Rec, Bulk OTP, and full Profile customization rules.
                </div>
              </div>
              <div style="background:var(--bg-input);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--primary);">/accounts</div>
                <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px;">
                  Ported to <b>Accounts Management</b>: Search, live filters, account inspector, full extra info drawer, copy rec, formatted exports, and transfer.
                </div>
              </div>
              <div style="background:var(--bg-input);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--primary);">/email & mail</div>
                <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px;">
                  Ported to <b>Webmail Center</b>: Live message feed, search, automated OTP extraction badge with 1-click copy, and custom domain email registration.
                </div>
              </div>
              <div style="background:var(--bg-input);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--primary);">/ssidChecker & getSSID</div>
                <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px;">
                  Ported to <b>Tools -> SSID Checker</b>: Decodes JWT expiry, inspects Mojang profile, capes, skins, with direct skin changer & IGN changer.
                </div>
              </div>
              <div style="background:var(--bg-input);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--primary);">/stats & hypixelstatus</div>
                <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px;">
                  Ported to <b>Tools -> Hypixel Stats</b>: Live player online status, game mode, Bedwars stars, Skywars, Duels, and Skyblock Networth calculation.
                </div>
              </div>
              <div style="background:var(--bg-input);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--primary);">/cosmetics</div>
                <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px;">
                  Ported to <b>Tools -> Cosmetics</b>: Queries Lunar Client cosmetics, cloaks, and emotes for any valid SSID.
                </div>
              </div>
              <div style="background:var(--bg-input);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--primary);">/checklocked & bancheck</div>
                <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px;">
                  Ported to <b>Tools -> Check Lock & Ban Check</b>: Inspects Microsoft suspension and Hypixel network ban status.
                </div>
              </div>
              <div style="background:var(--bg-input);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--primary);">/quarantine</div>
                <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px;">
                  Ported to <b>Tools -> Quarantine Vault</b>: Isolate at-risk accounts, view quarantined credentials, release with 1-click.
                </div>
              </div>
              <div style="background:var(--bg-input);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--primary);">/bots & config</div>
                <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px;">
                  Ported to <b>Bot Fleet</b>: Manage multiple bot slots, tokens, command prefix, activity status, and export config JSON.
                </div>
              </div>
              <div style="background:var(--bg-input);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--primary);">/access & admin commands</div>
                <div style="font-size:0.78rem;color:var(--text-dim);margin-top:2px;">
                  Ported to <b>Owner Console</b>: Generate voucher keys, extend active subscriptions, configure bot slots, blacklist abusers, restart PM2.
                </div>
              </div>
            </div>
          </section>

          <section style="margin-bottom:28px;">
            <h3 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:10px;">
              <re-icon icon="server" size="18" aria-hidden="true"></re-icon> VPS & Deployment Quick Start
            </h3>
            <ol style="padding-left:20px;color:var(--text-muted);font-size:0.88rem;">
              <li style="margin-bottom:8px;">
                <b>Domain & DNS:</b> Purchase a domain name (e.g. from Namecheap or Hostinger) and point DNS A record to your VPS IP address.
              </li>
              <li style="margin-bottom:8px;">
                <b>Connect via SSH:</b> Open terminal / CMD and connect via SSH:
                <pre style="background:var(--bg-input);padding:8px;border-radius:4px;margin-top:4px;font-family:var(--font-mono);color:#cbd5e1;">ssh root@YOUR_VPS_IP</pre>
              </li>
              <li style="margin-bottom:8px;">
                <b>Install Node.js & Dependencies:</b> Ensure Node.js 20+ is installed on the server.
              </li>
              <li style="margin-bottom:8px;">
                <b>Run the Dashboard:</b> From inside <code>/root/balls/autosecure/dashboard</code>:
                <pre style="background:var(--bg-input);padding:8px;border-radius:4px;margin-top:4px;font-family:var(--font-mono);color:#cbd5e1;">npm start</pre>
                The dashboard runs on port <code>3000</code> by default (or custom <code>PORT</code> env variable).
              </li>
              <li style="margin-bottom:8px;">
                <b>Keep Running in Background (PM2):</b>
                <pre style="background:var(--bg-input);padding:8px;border-radius:4px;margin-top:4px;font-family:var(--font-mono);color:#cbd5e1;">pm2 start server/index.js --name "autosecure-dashboard"&#10;pm2 save</pre>
              </li>
            </ol>
          </section>

          <section>
            <h3 style="font-size:1.2rem;font-weight:700;color:var(--primary);margin-bottom:10px;">
              <re-icon icon="lightbulb" size="18" aria-hidden="true"></re-icon> Security & Best Practices
            </h3>
            <ul style="padding-left:20px;color:var(--text-muted);font-size:0.88rem;">
              <li style="margin-bottom:6px;">Always keep your 25-character recovery codes backed up securely.</li>
              <li style="margin-bottom:6px;">Use rotating residential proxies when securing accounts in bulk to prevent Microsoft rate limiting.</li>
              <li style="margin-bottom:6px;">Enable "Auto Quarantine" for valuable accounts with rare capes or high Skyblock networth.</li>
            </ul>
          </section>
        </div>
      </div>
    `;
  }
};

window.GuideView = GuideView;
