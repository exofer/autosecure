// Main Application Router & Controller
const App = {
  currentView: 'overview',
  views: {
    overview: { name: 'Overview', icon: 'fa-chart-pie', title: 'Dashboard Overview' },
    accounts: { name: 'Accounts', icon: 'fa-users', title: 'Account Management' },
    secure: { name: 'Securing', icon: 'fa-lock', title: 'Securing Studio' },
    emails: { name: 'Webmail', icon: 'fa-envelope', title: 'Webmail Center' },
    tools: { name: 'Tools', icon: 'fa-toolbox', title: 'Minecraft & Security Tools' },
    bots: { name: 'Bot Fleet', icon: 'fa-robot', title: 'Bot Fleet Manager' },
    builder: { name: 'Designer', icon: 'fa-magic', title: 'Discord UI Designer' },
    proxies: { name: 'Proxies', icon: 'fa-network-wired', title: 'Proxy Manager' },
    license: { name: 'License', icon: 'fa-ticket-alt', title: 'License & Subscription' },
    admin: { name: 'Admin', icon: 'fa-user-shield', title: 'Owner Control Center' },
    guide: { name: 'Guide', icon: 'fa-book', title: 'Documentation & Setup' }
  },

  async init() {
    Toasts.init();
    Modal.init();

    // Verify authentication session
    const me = await API.checkMe();
    this.updateUserBadge(me);

    // Initial navigation
    const hash = window.location.hash.replace('#', '') || 'overview';
    this.navigate(hash);

    // Listen to hash changes
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '') || 'overview';
      if (newHash !== this.currentView) {
        this.navigate(newHash, {}, false);
      }
    });
  },

  async navigate(viewKey, params = {}, updateHash = true) {
    if (!this.views[viewKey]) viewKey = 'overview';
    this.currentView = viewKey;

    if (updateHash) {
      window.location.hash = viewKey;
    }

    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-view') === viewKey) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update topbar title
    const titleEl = document.getElementById('page-title-text');
    if (titleEl) {
      titleEl.textContent = this.views[viewKey].title;
    }

    // Close mobile sidebar if open
    document.querySelector('.sidebar')?.classList.remove('mobile-open');

    // Render corresponding view
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (viewKey) {
      case 'overview':
        await OverviewView.render();
        break;
      case 'accounts':
        await AccountsView.render();
        break;
      case 'secure':
        await SecureView.render();
        break;
      case 'emails':
        await EmailsView.render();
        break;
      case 'tools':
        await ToolsView.render(params);
        break;
      case 'bots':
        await BotsView.render();
        break;
      case 'builder':
        await BuilderView.render();
        break;
      case 'proxies':
        await ProxiesView.render();
        break;
      case 'license':
        await LicenseView.render();
        break;
      case 'admin':
        await AdminView.render();
        break;
      case 'guide':
        GuideView.render();
        break;
      default:
        await OverviewView.render();
    }
  },

  updateUserBadge(user) {
    const idEl = document.getElementById('sidebar-user-id');
    const roleEl = document.getElementById('sidebar-user-role');
    const adminNav = document.getElementById('nav-item-admin');

    if (idEl) {
      idEl.textContent = user ? user.id : API.currentUserId;
    }

    const isAdmin = user ? user.isAdmin : API.isAdmin;
    if (roleEl) {
      roleEl.innerHTML = isAdmin 
        ? '<i class="fas fa-crown"></i> Owner / Admin' 
        : '<i class="fas fa-user"></i> Standard License';
      roleEl.style.color = isAdmin ? '#fbbf24' : '#10b981';
    }

    if (adminNav) {
      adminNav.style.display = 'flex';
    }
  },

  openUserSwitchModal() {
    const bodyHtml = `
      <div class="form-group">
        <label class="form-label">Discord User ID</label>
        <input type="text" id="switch-user-id" class="form-input" value="${API.currentUserId}" placeholder="Enter Discord ID" />
      </div>
      <div style="text-align:center;color:var(--text-dim);font-size:0.8rem;margin:10px 0;">— OR —</div>
      <div class="form-group">
        <label class="form-label">License Key</label>
        <input type="text" id="switch-license-key" class="form-input" placeholder="Exo-xxxx-xxxx-xxxx" />
      </div>
      <p style="font-size:0.75rem;color:var(--text-dim);margin-top:6px;">
        Owner ID: <code>1456875723494002908</code> (grants instant full admin privileges).
      </p>
    `;

    Modal.open({
      title: 'Switch User Session / Login',
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="App.submitUserSwitch()">Switch Session</button>
      `
    });
  },

  async submitUserSwitch() {
    const userId = document.getElementById('switch-user-id').value.trim();
    const licenseKey = document.getElementById('switch-license-key').value.trim();

    try {
      const user = await API.switchSession(userId, licenseKey);
      this.updateUserBadge(user);
      Modal.close();
      this.navigate(this.currentView);
    } catch (err) {
      // error handled by switchSession toast
    }
  },

  toggleMobileSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('mobile-open');
  }
};

window.App = App;
window.addEventListener('DOMContentLoaded', () => App.init());
