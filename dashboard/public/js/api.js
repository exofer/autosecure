// API client and state manager
const API = {
  currentUserId: localStorage.getItem('autosecure_user_id') || '1456875723494002908',
  isAdmin: false,

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': this.currentUserId,
      ...(options.headers || {})
    };

    try {
      const res = await fetch(endpoint, {
        ...options,
        headers
      });

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/plain') || contentType.includes('text/csv')) {
        return await res.text();
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP error ${res.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  get(endpoint, params = {}) {
    const url = new URL(endpoint, window.location.origin);
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        url.searchParams.append(k, params[k]);
      }
    });
    return this.request(url.toString(), { method: 'GET' });
  },

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint, params = {}) {
    const url = new URL(endpoint, window.location.origin);
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        url.searchParams.append(k, params[k]);
      }
    });
    return this.request(url.toString(), { method: 'DELETE' });
  },

  async copyText(text, label = 'Text') {
    try {
      await navigator.clipboard.writeText(text);
      Toasts.success(`Copied ${label} to clipboard!`);
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      Toasts.success(`Copied ${label} to clipboard!`);
    }
  },

  async switchSession(userId, licenseKey) {
    try {
      const res = await this.post('/api/auth/session', { userId, licenseKey });
      if (res.success && res.user) {
        this.currentUserId = res.user.id;
        this.isAdmin = res.user.isAdmin;
        localStorage.setItem('autosecure_user_id', res.user.id);
        Toasts.success(`Logged in as ${res.user.id}${res.user.isAdmin ? ' (Admin)' : ''}`);
        return res.user;
      }
    } catch (err) {
      Toasts.error(err.message || 'Login failed');
      throw err;
    }
  },

  async checkMe() {
    try {
      const res = await this.get('/api/auth/me');
      if (res.success && res.user) {
        this.currentUserId = res.user.id;
        this.isAdmin = res.user.isAdmin;
        localStorage.setItem('autosecure_user_id', res.user.id);
        return res.user;
      }
    } catch (e) {
      return null;
    }
  }
};

window.API = API;
