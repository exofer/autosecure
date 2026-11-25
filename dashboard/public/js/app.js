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

    // Restore desktop sidebar collapsed preference
    if (localStorage.getItem('sidebar_collapsed') === 'true') {
      document.getElementById('main-sidebar')?.classList.add('collapsed');
    }

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // '/' focuses quick view search if not inside an input/textarea
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        const searchInput = document.getElementById('sidebar-filter-input');
        if (searchInput) {
          // If sidebar is collapsed, expand it first
          document.getElementById('main-sidebar')?.classList.remove('collapsed');
          searchInput.focus();
        }
      }
      // ESC closes mobile more sheet
      if (e.key === 'Escape') {
        this.closeMobileMore();
      }
    });

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

    // Update active state in desktop sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-view') === viewKey) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update active state in mobile bottom app dock
    document.querySelectorAll('.dock-item, .dock-center-action').forEach(el => {
      if (el.getAttribute('data-dock-view') === viewKey) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Close mobile more sheet if open
    this.closeMobileMore();

    // Update topbar title
    const titleEl = document.getElementById('page-title-text');
    if (titleEl) {
      titleEl.textContent = this.views[viewKey].title;
    }

    // Trigger Charles UX view entrance animation
    const content = document.getElementById('view-content');
    if (content) {
      content.classList.remove('view-enter');
      void content.offsetWidth; // Reflow to restart animation cleanly
      content.classList.add('view-enter');
    }

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

  // Charles UX Wave Dots Loading Generator
  waveDots(label = '', size = '') {
    const sizeClass = size ? `wave-dots-${size}` : '';
    return `
      <div class="wave-dots-loader ${sizeClass}">
        <div class="wave-dots" role="status" aria-label="Loading">
          <span></span>
          <span></span>
          <span></span>
        </div>
        ${label ? `<span class="wave-dots-label">${label}</span>` : ''}
      </div>
    `;
  },

  // Charles UX Async Button helper
  buttonLoading(btn, text = 'Processing...') {
    if (!btn) return;
    btn.disabled = true;
    btn.dataset.origHtml = btn.innerHTML;
    btn.innerHTML = `
      <span class="btn-loading-content">
        <span class="wave-dots wave-dots-sm">
          <span></span><span></span><span></span>
        </span>
        <span>${text}</span>
      </span>
    `;
  },

  buttonReset(btn) {
    if (!btn) return;
    btn.disabled = false;
    if (btn.dataset.origHtml) {
      btn.innerHTML = btn.dataset.origHtml;
      delete btn.dataset.origHtml;
    }
  },

  // Desktop Collapsible Sidebar
  toggleSidebarCollapse() {
    const sidebar = document.getElementById('main-sidebar');
    if (!sidebar) return;
    const isCollapsed = sidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
  },

  // Dynamic Sidebar Nav Filter
  filterNav(rawQuery) {
    const q = (rawQuery || '').toLowerCase().trim();
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.nav-section');

    if (!q) {
      navItems.forEach(el => el.style.display = 'flex');
      sections.forEach(sec => sec.style.display = 'block');
      return;
    }

    navItems.forEach(el => {
      const text = el.textContent.toLowerCase();
      const match = text.includes(q);
      el.style.display = match ? 'flex' : 'none';
    });

    // Hide section titles if all items in section are hidden
    sections.forEach(sec => {
      const visibleChildren = sec.querySelectorAll('.nav-item[style*="display: flex"]');
      sec.style.display = visibleChildren.length > 0 ? 'block' : 'none';
    });
  },

  // Mobile "More Tools" Bottom Drawer
  toggleMobileMore() {
    const backdrop = document.getElementById('mobile-more-backdrop');
    if (!backdrop) return;
    if (backdrop.classList.contains('open')) {
      this.closeMobileMore();
    } else {
      this.openMobileMore();
    }
  },

  openMobileMore() {
    const backdrop = document.getElementById('mobile-more-backdrop');
    if (backdrop) {
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden'; // lock background scrolling
    }
  },

  closeMobileMore() {
    const backdrop = document.getElementById('mobile-more-backdrop');
    if (backdrop && backdrop.classList.contains('open')) {
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
};

window.App = App;
window.addEventListener('DOMContentLoaded', () => App.init());
