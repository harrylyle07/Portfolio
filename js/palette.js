/* ==========================================================================
   Command palette (Ctrl/⌘ + K) and the terminal easter egg (`).
   Lazy-loaded by js/main.js, which calls HLPalette.init({...}).
   All text below mirrors content that already exists on the site.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var qs = function (s, el) { return (el || document).querySelector(s); };
  var qsa = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || '') || /Mac/.test(navigator.userAgent);
  var api = {};
  var hooks = {};

  /* Where is "home" from this page? (index: '', write-ups: '../index.html', 404: '/') */
  var brand = qs('.brand');
  var brandHref = brand ? brand.getAttribute('href') : '#hero';
  var HOME = brandHref.charAt(0) === '#' ? '' : brandHref.replace(/#.*$/, '');
  var onHome = HOME === '';
  var PROJECT_URL = onHome ? 'projects/proxmox-homelab.html' : (HOME === '/' ? '/projects/proxmox-homelab.html' : HOME.replace(/index\.html$/, '') + 'projects/proxmox-homelab.html');

  var LINKS = {
    linkedin: 'https://www.linkedin.com/in/harry-lyle-868854328/',
    github: 'https://github.com/harrylyle07',
    ms900: 'https://learn.microsoft.com/api/credentials/share/en-us/HarryLyle07/47EF6E8900F0A8FF?sharingId=82D4ED4172030532',
    l3: 'https://digitalcredentials.cityandguilds.com/b5383aba-2abe-4e74-896e-ac8e33bf4072#acc.02UgBwmb'
  };

  function emitOverlay(open) {
    document.dispatchEvent(new CustomEvent('overlay:change', { detail: { open: open } }));
  }
  function goSection(id) {
    if (onHome) {
      var el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: hooks.reduceMotion && hooks.reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
        history.replaceState(null, '', '#' + id);
      }
    } else {
      location.href = HOME + '#' + id;
    }
  }
  function openExternal(url) { window.open(url, '_blank', 'noopener,noreferrer'); }

  var icons = {
    section: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h7"/></svg>',
    page: '<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>',
    theme: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/></svg>',
    terminal: '<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m6 9 3 3-3 3M12 15h6"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 14 21 3M21 3h-6M21 3v6"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 10v7M7 7h.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7"/></svg>',
    cert: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/></svg>',
    print: '<svg viewBox="0 0 24 24"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'
  };

  function buildCommands() {
    var cmds = [];
    [['about', 'About'], ['skills', 'Skills'], ['projects', 'Projects & lab work'], ['experience', 'Experience'], ['certifications', 'Certifications'], ['contact', 'Contact']]
      .forEach(function (s) { cmds.push({ group: 'Sections', label: s[1], hint: '#' + s[0], icon: icons.section, keywords: 'go jump section ' + s[0], run: function () { goSection(s[0]); } }); });
    cmds.push({ group: 'Pages', label: 'Home', hint: 'harrylyle07.github.io', icon: icons.home, keywords: 'index start top', run: function () { if (onHome) goSection('hero'); else location.href = HOME || '/'; } });
    cmds.push({ group: 'Pages', label: 'Proxmox homelab build', hint: 'write-up', icon: icons.page, keywords: 'project lab proxmox homelab write-up', run: function () { location.href = PROJECT_URL; } });
    cmds.push({ group: 'Actions', label: 'Toggle theme', hint: function () { return 'switch to ' + (hooks.currentTheme && hooks.currentTheme() === 'dark' ? 'light' : 'dark'); }, icon: icons.theme, keywords: 'dark light mode colour appearance', keepFocus: true, run: function (origin) { if (hooks.toggleTheme) hooks.toggleTheme(origin); } });
    cmds.push({ group: 'Actions', label: 'Open terminal', hint: '`', icon: icons.terminal, keywords: 'console shell command line easter egg', run: function () { openTerminal(); } });
    cmds.push({ group: 'Actions', label: 'Copy link to this page', hint: 'clipboard', icon: icons.copy, keywords: 'share url', run: function () { try { navigator.clipboard.writeText(location.href.split('#')[0]); } catch (e) {} } });
    cmds.push({ group: 'Actions', label: 'Print / save as PDF', hint: 'one-page summary', icon: icons.print, keywords: 'cv resume pdf', run: function () { setTimeout(function () { window.print(); }, 150); } });
    cmds.push({ group: 'Links', label: 'Message me on LinkedIn', hint: 'linkedin.com', icon: icons.linkedin, keywords: 'contact connect social', run: function () { openExternal(LINKS.linkedin); } });
    cmds.push({ group: 'Links', label: 'GitHub profile', hint: 'github.com/harrylyle07', icon: icons.link, keywords: 'code repo source', run: function () { openExternal(LINKS.github); } });
    cmds.push({ group: 'Links', label: 'MS-900 credential', hint: 'Microsoft Learn', icon: icons.cert, keywords: 'microsoft 365 certified fundamentals certificate badge', run: function () { openExternal(LINKS.ms900); } });
    cmds.push({ group: 'Links', label: 'Level 3 Digital Support Technician credential', hint: 'City & Guilds', icon: icons.cert, keywords: 'qualification distinction certificate badge', run: function () { openExternal(LINKS.l3); } });
    return cmds;
  }

  /* ---- Fuzzy matching ------------------------------------------------------- */
  function score(query, text) {
    query = query.toLowerCase(); text = text.toLowerCase();
    if (!query) return { s: 1, idx: [] };
    var i = text.indexOf(query);
    if (i >= 0) {
      var idx = [];
      for (var k = 0; k < query.length; k++) idx.push(i + k);
      return { s: 100 - i, idx: idx };
    }
    // subsequence match
    var ti = 0, matched = [], gaps = 0;
    for (var q = 0; q < query.length; q++) {
      var c = query[q];
      if (c === ' ') continue;
      var found = text.indexOf(c, ti);
      if (found < 0) return null;
      if (matched.length && found > matched[matched.length - 1] + 1) gaps++;
      matched.push(found);
      ti = found + 1;
    }
    return { s: 40 - gaps * 4 - matched[0] * 0.2, idx: matched };
  }
  function highlight(text, idx) {
    if (!idx || !idx.length) return esc(text);
    var out = '', set = {};
    idx.forEach(function (i) { set[i] = true; });
    for (var i = 0; i < text.length; i++) out += set[i] ? '<mark>' + esc(text[i]) + '</mark>' : esc(text[i]);
    return out;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- Palette UI ------------------------------------------------------------- */
  var pal, input, list, commands, results = [], selected = 0, opener = null, isOpen = false;

  function buildPalette() {
    pal = document.createElement('div');
    pal.className = 'palette';
    pal.setAttribute('role', 'dialog');
    pal.setAttribute('aria-modal', 'true');
    pal.setAttribute('aria-label', 'Command palette');
    pal.innerHTML =
      '<div class="palette-box">' +
        '<div class="palette-head">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
          '<input class="palette-input" type="text" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list" aria-label="Search commands" placeholder="Jump to a section, open a link, toggle the theme…" autocomplete="off" spellcheck="false">' +
          '<span class="kbd" aria-hidden="true">Esc</span>' +
        '</div>' +
        '<ul class="palette-list" id="palette-list" role="listbox" aria-label="Commands"></ul>' +
        '<div class="palette-foot" aria-hidden="true">' +
          '<span><span class="kbd">↑</span><span class="kbd">↓</span> navigate</span>' +
          '<span><span class="kbd">↵</span> select</span>' +
          '<span><span class="kbd">Esc</span> close</span>' +
          '<span><span class="kbd">`</span> terminal</span>' +
        '</div>' +
      '</div>';
    body.appendChild(pal);
    input = qs('.palette-input', pal);
    list = qs('.palette-list', pal);
    commands = buildCommands();

    pal.addEventListener('click', function (e) { if (e.target === pal) closePalette(); });
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Home') { e.preventDefault(); select(0); }
      else if (e.key === 'End') { e.preventDefault(); select(results.length - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); runSelected(); }
      else if (e.key === 'Tab') { e.preventDefault(); move(e.shiftKey ? -1 : 1); }
    });
    pal.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); closePalette(); } });
    list.addEventListener('pointermove', function (e) {
      var li = e.target.closest('.palette-item');
      if (li) select(parseInt(li.getAttribute('data-i'), 10));
    });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('.palette-item');
      if (li) { select(parseInt(li.getAttribute('data-i'), 10)); runSelected(); }
    });
  }

  function render(query) {
    results = [];
    commands.forEach(function (c) {
      var m = score(query, c.label) || (query && score(query, c.keywords) ? { s: 5, idx: [] } : null);
      if (m) results.push({ cmd: c, s: m.s, idx: m.idx });
    });
    if (query) results.sort(function (a, b) { return b.s - a.s; });
    selected = 0;
    if (!results.length) { list.innerHTML = '<li class="palette-empty" role="presentation">No matches. Try "skills", "theme" or "LinkedIn".</li>'; input.removeAttribute('aria-activedescendant'); return; }
    var html = '', lastGroup = null;
    results.forEach(function (r, i) {
      if (!query && r.cmd.group !== lastGroup) { html += '<li class="palette-group" role="presentation">' + esc(r.cmd.group) + '</li>'; lastGroup = r.cmd.group; }
      var hint = typeof r.cmd.hint === 'function' ? r.cmd.hint() : r.cmd.hint;
      html += '<li class="palette-item" role="option" id="palette-opt-' + i + '" data-i="' + i + '" aria-selected="' + (i === 0) + '">' +
        r.cmd.icon + '<span class="pi-label">' + highlight(r.cmd.label, r.idx) + '</span>' + (hint ? '<span class="pi-hint">' + esc(hint) + '</span>' : '') + '</li>';
    });
    list.innerHTML = html;
    input.setAttribute('aria-activedescendant', 'palette-opt-0');
  }
  function select(i) {
    if (!results.length) return;
    selected = (i + results.length) % results.length;
    qsa('.palette-item', list).forEach(function (li, k) { li.setAttribute('aria-selected', String(k === selected)); });
    var li = qs('#palette-opt-' + selected, list);
    if (li) { li.scrollIntoView({ block: 'nearest' }); input.setAttribute('aria-activedescendant', li.id); }
  }
  function move(d) { select(selected + d); }
  function runSelected() {
    var r = results[selected];
    if (!r) return;
    var origin = opener;
    if (!r.cmd.keepFocus) closePalette();
    else closePalette();
    setTimeout(function () { r.cmd.run(origin); }, 20);
  }

  function openPalette() {
    if (!pal) buildPalette();
    if (isOpen) { input.focus(); return; }
    opener = document.activeElement;
    isOpen = true;
    pal.classList.add('is-open');
    body.style.overflow = 'hidden';
    input.value = '';
    render('');
    input.focus();
    emitOverlay(true);
    document.addEventListener('focusin', trapFocus);
  }
  function closePalette() {
    if (!isOpen) return;
    isOpen = false;
    pal.classList.remove('is-open');
    body.style.overflow = '';
    document.removeEventListener('focusin', trapFocus);
    emitOverlay(termOpen);
    if (opener && opener.focus && document.contains(opener)) opener.focus();
  }
  function trapFocus(e) { if (isOpen && !pal.contains(e.target)) input.focus(); }

  /* ---- Terminal --------------------------------------------------------------- */
  var term, termOut, termInput, termOpen = false, termOpener = null;
  var cmdHistory = [], histIdx = -1;

  var CONTENT = {
    whoami: [
      ['Harry', 't-accent'],
      ['Tier I Support Analyst & Dispatcher', 't-cmd'],
      ['Offsite Cloud · Managed service provider, Essex', ''],
      ['Tier I Support · building towards 2nd line', 't-muted']
    ],
    about: [
      ["I'm a Tier I Support Analyst & Dispatcher at Offsite Cloud, a managed service provider in Essex, where I've spent over two years supporting a range of client businesses. Day to day I administer Microsoft 365 across multiple tenants (Exchange Online, Entra ID, Intune and SharePoint), troubleshoot Windows endpoints, and handle tickets from first contact through to resolution or escalation.", ''],
      ['', ''],
      ['Outside work I run a Proxmox homelab, which is where I build, break and fix things to deepen my understanding of virtualisation, networking and self-hosting.', ''],
      ['', ''],
      ["I'm working towards 2nd line: taking ownership of more complex problems, digging into root causes and keeping on building my technical depth.", '']
    ],
    skills: [
      ['Microsoft 365 & Identity', 't-accent'], ['  Exchange Online · Entra ID · Intune · SharePoint', ''],
      ['Endpoints & Support', 't-accent'], ['  Windows 10/11 · Troubleshooting · Helpdesk & escalations', ''],
      ['Virtualisation & Homelab', 't-accent'], ['  Proxmox VE · Virtual machines · Containers · Self-hosting', ''],
      ['Networking & Security basics', 't-accent'], ['  TCP/IP, DNS & DHCP · MFA & account security · Firewall basics', ''],
      ['Scripting', 't-accent'], ['  PowerShell', '']
    ],
    certs: [
      ['[ OK ] Microsoft 365 Certified: Fundamentals (MS-900)', 't-ok'],
      ['       Microsoft · Earned 14 October 2025', 't-muted'],
      ['       ' + LINKS.ms900, 'link'],
      ['[ OK ] Level 3 Digital Support Technician', 't-ok'],
      ['       City & Guilds · Achieved with Distinction · April 2026', 't-muted'],
      ['       ' + LINKS.l3, 'link']
    ],
    homelab: [
      ['Proxmox homelab build · Since July 2026', 't-accent'],
      ['A Proxmox VE homelab I started with no Linux command-line experience. It now runs an Active Directory lab on an isolated VLAN, a set of self-hosted services, and Prometheus and Grafana monitoring with alerts to Discord.', ''],
      ['', ''],
      ['host:        HP 290 G1 SFF · i5-8500 · 32 GB RAM', ''],
      ['network:     Zyxel USG FLEX 200 firewall and GS1920-24 switch, isolated VLAN for the AD lab', ''],
      ['ad lab:      Domain controller, file server, Windows 11 client for Group Policy testing', ''],
      ['services:    Pi-hole, Home Assistant, Homarr, Plex', ''],
      ['monitoring:  Uptime Kuma, Prometheus and Grafana, Discord alerts', ''],
      ['', ''],
      ['write-up:    ' + PROJECT_URL, 'link']
    ],
    contact: [
      ["If you'd like to talk Microsoft 365, homelabs or anything IT support, or just want to connect, message me on LinkedIn.", ''],
      ['', ''],
      ['linkedin:  ' + LINKS.linkedin, 'link'],
      ['github:    ' + LINKS.github, 'link']
    ],
    help: [
      ['Available commands:', 't-muted'],
      ['  help       show this list', ''],
      ['  whoami     who runs this site', ''],
      ['  about      the longer version', ''],
      ['  skills     what I work with', ''],
      ['  certs      certifications & qualifications', ''],
      ['  homelab    the Proxmox lab at a glance', ''],
      ['  projects   open the homelab write-up', ''],
      ['  contact    how to get in touch', ''],
      ['  theme      toggle dark / light mode', ''],
      ['  ls         list the sections of the site', ''],
      ['  cd <id>    jump to a section (e.g. cd skills)', ''],
      ['  clear      clear the screen', ''],
      ['  exit       close the terminal (or press Esc)', '']
    ]
  };

  function buildTerminal() {
    term = document.createElement('div');
    term.className = 'term';
    term.setAttribute('role', 'dialog');
    term.setAttribute('aria-label', 'Terminal');
    term.innerHTML =
      '<div class="term-bar">' +
        '<span class="win-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="term-title">harry@portfolio: ~</span>' +
        '<button class="icon-btn term-close" type="button" aria-label="Close terminal"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '</div>' +
      '<div class="term-out" aria-live="polite" aria-atomic="false"></div>' +
      '<form class="term-form" autocomplete="off">' +
        '<label class="ps" for="term-input">harry@portfolio:~$</label>' +
        '<input class="term-input" id="term-input" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Terminal command">' +
      '</form>';
    body.appendChild(term);
    termOut = qs('.term-out', term);
    termInput = qs('.term-input', term);
    qs('.term-close', term).addEventListener('click', closeTerminal);
    qs('.term-form', term).addEventListener('submit', function (e) { e.preventDefault(); run(termInput.value); termInput.value = ''; });
    term.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeTerminal(); }
      else if (e.key === 'ArrowUp' && e.target === termInput) { e.preventDefault(); if (cmdHistory.length) { histIdx = Math.max(0, histIdx - 1); termInput.value = cmdHistory[histIdx] || ''; } }
      else if (e.key === 'ArrowDown' && e.target === termInput) { e.preventDefault(); if (cmdHistory.length) { histIdx = Math.min(cmdHistory.length, histIdx + 1); termInput.value = cmdHistory[histIdx] || ''; } }
      else if (e.key === 'Tab' && e.target === termInput && termInput.value) {
        var names = Object.keys(COMMANDS).filter(function (n) { return n.indexOf(termInput.value.toLowerCase()) === 0; });
        if (names.length === 1) { e.preventDefault(); termInput.value = names[0] + ' '; }
      } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); termOut.innerHTML = ''; }
    });
    term.addEventListener('click', function (e) { if (!e.target.closest('a, button')) termInput.focus(); });
    print([['Welcome. Type ', 't-muted'], ['help', 't-accent'], [' to see what this can do.', 't-muted']], true);
  }

  function print(lines, inline) {
    var frag = document.createDocumentFragment();
    if (inline) {
      var p = document.createElement('div'); p.className = 't-line';
      lines.forEach(function (l) { var s = document.createElement('span'); s.className = l[1]; s.textContent = l[0]; p.appendChild(s); });
      frag.appendChild(p);
    } else {
      lines.forEach(function (l) {
        var p = document.createElement('div');
        p.className = 't-line ' + (l[1] === 'link' ? '' : l[1]);
        if (l[1] === 'link') {
          var m = l[0].match(/^(\s*\S*:?\s*)(\S+)$/);
          var a = document.createElement('a');
          var url = m ? m[2] : l[0];
          a.href = url; a.textContent = url;
          if (/^https?:/.test(url)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
          p.appendChild(document.createTextNode(m ? m[1] : ''));
          p.appendChild(a);
        } else p.textContent = l[0] === '' ? ' ' : l[0];
        frag.appendChild(p);
      });
    }
    termOut.appendChild(frag);
    termOut.scrollTop = termOut.scrollHeight;
  }
  function echoCmd(cmd) {
    var p = document.createElement('div'); p.className = 't-line t-cmd';
    var ps = document.createElement('span'); ps.className = 'ps'; ps.textContent = 'harry@portfolio:~$ ';
    p.appendChild(ps); p.appendChild(document.createTextNode(cmd));
    termOut.appendChild(p);
  }

  var COMMANDS = {
    help: function () { print(CONTENT.help); },
    whoami: function () { print(CONTENT.whoami); },
    about: function () { print(CONTENT.about); },
    skills: function () { print(CONTENT.skills); },
    certs: function () { print(CONTENT.certs); },
    homelab: function () { print(CONTENT.homelab); },
    projects: function () { print([['Opening the homelab write-up…', 't-muted']]); setTimeout(function () { location.href = PROJECT_URL; }, 300); },
    contact: function () { print(CONTENT.contact); },
    theme: function () { if (hooks.toggleTheme) hooks.toggleTheme(qs('.theme-toggle')); print([['Theme: ' + (hooks.currentTheme ? hooks.currentTheme() : ''), 't-muted']]); },
    ls: function () { print([['about  skills  projects  experience  certifications  contact', 't-accent']]); },
    cd: function (arg) {
      var id = (arg || '').replace(/^#|\/$/g, '');
      if (!id || id === '~' || id === '/') { goSection('hero'); return; }
      if (['about', 'skills', 'projects', 'experience', 'certifications', 'contact', 'hero'].indexOf(id) < 0) { print([['cd: no such section: ' + id, 't-err']]); return; }
      print([['→ #' + id, 't-muted']]);
      goSection(id);
    },
    clear: function () { termOut.innerHTML = ''; },
    exit: function () { closeTerminal(); },
    pwd: function () { print([[location.pathname, '']]); },
    date: function () { print([[new Date().toString(), '']]); },
    echo: function (arg) { print([[arg || '', '']]); },
    palette: function () { closeTerminal(); openPalette(); }
  };
  COMMANDS.quit = COMMANDS.exit;
  COMMANDS.close = COMMANDS.exit;
  COMMANDS.cls = COMMANDS.clear;
  COMMANDS.certifications = COMMANDS.certs;
  COMMANDS.lab = COMMANDS.homelab;
  COMMANDS.linkedin = COMMANDS.contact;
  COMMANDS.cat = function (arg) { var n = (arg || '').replace(/\.(txt|md)$/, ''); if (COMMANDS[n] && n !== 'cat') COMMANDS[n](); else print([['cat: ' + (arg || '') + ': No such file', 't-err']]); };
  COMMANDS.sudo = function () { print([['Nice try. This terminal only reads the portfolio.', 't-muted']]); };
  COMMANDS.hi = COMMANDS.hello = function () { print([['Hi! Type help to look around.', '']]); };

  function run(raw) {
    var cmd = raw.trim();
    echoCmd(cmd);
    if (!cmd) return;
    cmdHistory.push(cmd); histIdx = cmdHistory.length;
    var parts = cmd.split(/\s+/);
    var name = parts[0].toLowerCase();
    var arg = parts.slice(1).join(' ');
    if (COMMANDS[name]) COMMANDS[name](arg);
    else print([['command not found: ' + name + '. Type help for the list.', 't-err']]);
    termOut.scrollTop = termOut.scrollHeight;
  }

  function openTerminal() {
    if (!term) buildTerminal();
    if (isOpen) closePalette();
    termOpener = document.activeElement;
    termOpen = true;
    term.classList.add('is-open');
    termInput.focus();
    emitOverlay(true);
  }
  function closeTerminal() {
    if (!termOpen) return;
    termOpen = false;
    term.classList.remove('is-open');
    emitOverlay(false);
    if (termOpener && termOpener.focus && document.contains(termOpener) && termOpener !== body) termOpener.focus();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (isOpen) { closePalette(); }
    else if (termOpen) { closeTerminal(); }
  });

  api.init = function (h) { hooks = h || {}; };
  api.open = openPalette;
  api.close = closePalette;
  api.toggle = function () { if (isOpen) closePalette(); else openPalette(); };
  api.openTerminal = openTerminal;
  api.closeTerminal = closeTerminal;
  api.toggleTerminal = function () { if (termOpen) closeTerminal(); else openTerminal(); };
  api.isMac = isMac;
  window.HLPalette = api;
})();
