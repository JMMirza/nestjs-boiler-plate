interface LandingPageOptions {
  appName: string;
  version: string;
  env: string;
  showDocs: boolean;
}

interface EndpointGroup {
  name: string;
  prefix: string;
  description: string;
  routes: [method: string, path: string, auth: 'public' | 'user' | 'admin'][];
}

const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    name: 'Auth',
    prefix: '/auth',
    description: 'Signup, login, email OTP and password flows',
    routes: [
      ['POST', '/auth/signup', 'public'],
      ['POST', '/auth/login', 'public'],
      ['POST', '/auth/verify-email', 'public'],
      ['POST', '/auth/forgot-password', 'public'],
      ['POST', '/auth/change-password', 'user'],
      ['POST', '/auth/seed-admin', 'public'],
    ],
  },
  {
    name: 'Users',
    prefix: '/user',
    description: 'Profiles, settings and admin user management',
    routes: [
      ['GET', '/user', 'admin'],
      ['GET', '/user/:id', 'user'],
      ['PATCH', '/user/:id/profile', 'user'],
      ['PATCH', '/user/settings', 'user'],
      ['POST', '/user/create', 'admin'],
    ],
  },
  {
    name: 'Access Control',
    prefix: '/admin/access-control',
    description: 'Roles and permissions (RBAC)',
    routes: [
      ['GET', '/admin/access-control/roles', 'admin'],
      ['POST', '/admin/access-control/roles', 'admin'],
      ['GET', '/admin/access-control/permissions', 'admin'],
      ['POST', '/admin/access-control/permissions', 'admin'],
    ],
  },
  {
    name: 'Notifications',
    prefix: '/notification',
    description: 'In-app notifications with optional email fan-out',
    routes: [
      ['GET', '/notification', 'user'],
      ['GET', '/notification/unread-notification', 'user'],
      ['POST', '/notification', 'user'],
      ['PUT', '/notification/mark-all-as-read', 'user'],
    ],
  },
  {
    name: 'Example',
    prefix: '/example',
    description: 'Reference CRUD module to copy for new features',
    routes: [
      ['GET', '/example', 'user'],
      ['POST', '/example', 'user'],
      ['PATCH', '/example/:id', 'user'],
      ['DELETE', '/example/:id', 'admin'],
    ],
  },
];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function renderGroups(): string {
  return ENDPOINT_GROUPS.map(
    (group) => `
      <article class="card">
        <header class="card-head">
          <h3>${group.name}</h3>
          <code class="prefix">${group.prefix}</code>
        </header>
        <p class="card-desc">${group.description}</p>
        <ul class="routes">
          ${group.routes
            .map(
              ([method, path, auth]) => `
            <li>
              <span class="method m-${method.toLowerCase()}">${method}</span>
              <code class="path">${path}</code>
              <span class="auth a-${auth}" title="${auth === 'public' ? 'No token needed' : auth === 'user' ? 'Bearer token required' : 'Admin token required'}">${auth}</span>
            </li>`,
            )
            .join('')}
        </ul>
      </article>`,
  ).join('');
}

export function renderLandingPage(options: LandingPageOptions): string {
  const appName = escapeHtml(options.appName);
  const env = escapeHtml(options.env);
  const version = escapeHtml(options.version);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <meta name="description" content="${appName} API">
  <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#E0234E"/><path d="M9 23V9l14 14V9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  )}">
  <style>
    :root {
      --nest-red: #e0234e;
      --nest-red-strong: #ea2845;
      --bg: #0d0d10;
      --bg-elev: #16161b;
      --bg-card: #1a1a20;
      --border: #2a2a33;
      --text: #f2f2f5;
      --text-muted: #9b9ba8;
      --code-bg: #111115;
      --glow: rgba(224, 35, 78, 0.22);
      --ok: #2fd27a;
      --warn: #f5b041;
      --m-get: #3ea6ff;
      --m-post: #2fd27a;
      --m-patch: #f5b041;
      --m-put: #b07cff;
      --m-delete: #ff5470;
      color-scheme: dark;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f7f7f9;
        --bg-elev: #ffffff;
        --bg-card: #ffffff;
        --border: #e4e4ea;
        --text: #18181d;
        --text-muted: #61616e;
        --code-bg: #f1f1f5;
        --glow: rgba(224, 35, 78, 0.12);
        --m-get: #0b72d1;
        --m-post: #12935a;
        --m-patch: #b8740a;
        --m-put: #7a43d6;
        --m-delete: #d42a4a;
        color-scheme: light;
      }
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { -webkit-text-size-adjust: 100%; }
    body {
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.55;
      overflow-x: hidden;
    }
    body::before {
      content: "";
      position: fixed;
      inset: -20vh -10vw auto;
      height: 70vh;
      background: radial-gradient(ellipse at 50% 0%, var(--glow), transparent 65%);
      pointer-events: none;
      z-index: 0;
    }
    code, pre { font-family: "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace; }
    a { color: inherit; }

    .wrap { position: relative; z-index: 1; max-width: 1080px; margin: 0 auto; padding: 0 16px; }

    /* ── Nav ── */
    nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; gap: 12px; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; letter-spacing: -0.01em; text-decoration: none; }
    .brand-mark {
      width: 32px; height: 32px; border-radius: 8px; background: var(--nest-red);
      display: grid; place-items: center; box-shadow: 0 6px 20px var(--glow); flex-shrink: 0;
    }
    .nav-meta { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
    .pill {
      font-size: 12px; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--border);
      background: var(--bg-elev); color: var(--text-muted); white-space: nowrap;
    }

    /* ── Hero ── */
    .hero { padding: 64px 0 48px; text-align: center; }
    .status {
      display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;
      padding: 6px 14px; border-radius: 999px; border: 1px solid var(--border); background: var(--bg-elev);
      margin-bottom: 28px;
    }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--warn); }
    .status.ok .dot { background: var(--ok); box-shadow: 0 0 0 0 rgba(47, 210, 122, 0.6); animation: pulse 2s infinite; }
    .status.down .dot { background: var(--m-delete); }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(47, 210, 122, 0.55); }
      70% { box-shadow: 0 0 0 8px rgba(47, 210, 122, 0); }
      100% { box-shadow: 0 0 0 0 rgba(47, 210, 122, 0); }
    }
    h1 {
      font-size: clamp(2.2rem, 6vw, 3.8rem); line-height: 1.08; letter-spacing: -0.035em; font-weight: 800;
      margin-bottom: 18px;
    }
    h1 .accent { color: var(--nest-red); }
    .lede { font-size: clamp(1rem, 2.2vw, 1.15rem); color: var(--text-muted); max-width: 620px; margin: 0 auto 32px; }
    .lede code { font-size: 0.85em; color: var(--text); background: var(--code-bg); padding: 1px 6px; border-radius: 5px; white-space: nowrap; }
    .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn {
      display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 10px;
      font-weight: 600; font-size: 15px; text-decoration: none; border: 1px solid var(--border);
      background: var(--bg-elev); transition: transform .15s ease, border-color .15s ease, background .15s ease;
    }
    .btn:hover { transform: translateY(-1px); border-color: var(--nest-red); }
    .btn-primary { background: var(--nest-red); border-color: var(--nest-red); color: #fff; box-shadow: 0 8px 24px var(--glow); }
    .btn-primary:hover { background: var(--nest-red-strong); }
    .btn[aria-disabled="true"] { opacity: .5; pointer-events: none; }

    /* ── Sections ── */
    section { padding: 40px 0; }
    .section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    h2 { font-size: 1.4rem; letter-spacing: -0.02em; }
    h2::before { content: ""; display: inline-block; width: 4px; height: 0.9em; background: var(--nest-red); border-radius: 2px; margin-right: 10px; vertical-align: -0.05em; }
    .section-note { color: var(--text-muted); font-size: 14px; }

    /* ── Feature strip ── */
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
    .feature { padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
    .feature strong { display: block; margin-bottom: 4px; }
    .feature span { color: var(--text-muted); font-size: 14px; }

    /* ── Endpoint cards ── */
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 16px; }
    .card {
      border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); padding: 20px;
      transition: border-color .15s ease, transform .15s ease;
    }
    .card:hover { border-color: color-mix(in srgb, var(--nest-red) 55%, var(--border)); transform: translateY(-2px); }
    .card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
    .card-head h3 { font-size: 1.05rem; }
    .prefix { font-size: 12px; color: var(--nest-red); background: var(--code-bg); padding: 2px 8px; border-radius: 6px; overflow-wrap: anywhere; }
    .card-desc { color: var(--text-muted); font-size: 14px; margin-bottom: 14px; }
    .routes { list-style: none; display: grid; gap: 8px; }
    .routes li { display: grid; grid-template-columns: 62px minmax(0, 1fr) auto; align-items: center; gap: 10px; font-size: 13px; }
    .method { font-weight: 700; font-size: 11px; letter-spacing: .04em; text-align: center; padding: 3px 0; border-radius: 6px; background: var(--code-bg); }
    .m-get { color: var(--m-get); } .m-post { color: var(--m-post); } .m-patch { color: var(--m-patch); }
    .m-put { color: var(--m-put); } .m-delete { color: var(--m-delete); }
    .path { overflow-wrap: anywhere; color: var(--text); }
    .auth { font-size: 11px; color: var(--text-muted); border: 1px solid var(--border); border-radius: 999px; padding: 1px 8px; }
    .a-admin { color: var(--nest-red); border-color: color-mix(in srgb, var(--nest-red) 45%, var(--border)); }

    /* ── Quickstart ── */
    .terminal { border: 1px solid var(--border); border-radius: 14px; overflow: hidden; background: var(--code-bg); }
    .term-bar { display: flex; align-items: center; gap: 6px; padding: 10px 14px; border-bottom: 1px solid var(--border); background: var(--bg-elev); }
    .term-bar i { width: 10px; height: 10px; border-radius: 50%; background: var(--border); display: block; }
    .term-bar i:first-child { background: var(--nest-red); }
    .term-bar span { margin-left: 8px; font-size: 12px; color: var(--text-muted); }
    pre { padding: 18px; overflow-x: auto; font-size: 13px; line-height: 1.7; }
    pre .c { color: var(--text-muted); }
    pre .k { color: var(--nest-red); }

    footer { padding: 40px 0 56px; color: var(--text-muted); font-size: 13px; text-align: center; border-top: 1px solid var(--border); margin-top: 24px; }
    footer a { color: var(--nest-red); text-decoration: none; }

    @media (max-width: 520px) {
      .hero { padding: 40px 0 32px; }
      .nav-meta .pill:not(:first-child) { display: none; }
      .routes li { grid-template-columns: 54px minmax(0, 1fr); }
      .routes .auth { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; transition: none !important; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <nav>
      <a class="brand" href="/">
        <span class="brand-mark" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 32 32"><path d="M9 23V9l14 14V9" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        ${appName}
      </a>
      <div class="nav-meta">
        <span class="pill">v${version}</span>
        <span class="pill">${env}</span>
      </div>
    </nav>

    <header class="hero">
      <div class="status" id="status" role="status" aria-live="polite">
        <span class="dot"></span><span id="status-text">Checking API…</span>
      </div>
      <h1>Your API is <span class="accent">running</span>.</h1>
      <p class="lede">
        A NestJS + MongoDB backend with JWT auth, users, role-based access control and notifications.
        Every endpoint returns a consistent <code>{ success, data, error }</code> envelope.
      </p>
      <div class="actions">
        ${
          options.showDocs
            ? '<a class="btn btn-primary" href="/api">Open API docs →</a>'
            : '<a class="btn btn-primary" aria-disabled="true" title="Swagger is disabled in production">API docs off in production</a>'
        }
        <a class="btn" href="/ping">Health check</a>
      </div>
    </header>

    <section aria-labelledby="features-title">
      <div class="section-head"><h2 id="features-title">What's included</h2></div>
      <div class="features">
        <div class="feature"><strong>JWT auth</strong><span>Signup, login, email OTP and password reset</span></div>
        <div class="feature"><strong>RBAC</strong><span>Roles and permissions managed by admins</span></div>
        <div class="feature"><strong>Notifications</strong><span>In-app with read tracking, optional email</span></div>
        <div class="feature"><strong>MongoDB</strong><span>Mongoose schemas with shared timestamps</span></div>
      </div>
    </section>

    <section aria-labelledby="endpoints-title">
      <div class="section-head">
        <h2 id="endpoints-title">Endpoints</h2>
        <span class="section-note">Protected routes need <code>Authorization: Bearer &lt;token&gt;</code></span>
      </div>
      <div class="grid">${renderGroups()}</div>
    </section>

    <section aria-labelledby="quickstart-title">
      <div class="section-head"><h2 id="quickstart-title">Quickstart</h2></div>
      <div class="terminal">
        <div class="term-bar"><i></i><i></i><i></i><span>terminal</span></div>
<pre><span class="c"># 1. Create the first admin (only works once)</span>
<span class="k">curl</span> -X POST <span data-origin></span>/auth/seed-admin \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"admin@example.com","password":"Admin@123","firstName":"Ada","lastName":"Admin"}'

<span class="c"># 2. Log in and copy data.token from the response</span>
<span class="k">curl</span> -X POST <span data-origin></span>/auth/login \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"admin@example.com","password":"Admin@123"}'

<span class="c"># 3. Call a protected route</span>
<span class="k">curl</span> <span data-origin></span>/user -H 'Authorization: Bearer &lt;token&gt;'</pre>
      </div>
    </section>

    <footer>
      Built with <a href="https://nestjs.com" target="_blank" rel="noopener">NestJS</a> · ${appName} v${version}
    </footer>
  </div>

  <script>
    (function () {
      var origin = window.location.origin;
      document.querySelectorAll('[data-origin]').forEach(function (el) { el.textContent = origin; });

      var status = document.getElementById('status');
      var text = document.getElementById('status-text');
      function check() {
        var started = performance.now();
        fetch('/ping', { cache: 'no-store' })
          .then(function (res) { return res.json(); })
          .then(function (body) {
            if (!body || !body.success) throw new Error('bad response');
            status.className = 'status ok';
            text.textContent = 'API online · ' + Math.round(performance.now() - started) + ' ms';
          })
          .catch(function () {
            status.className = 'status down';
            text.textContent = 'API unreachable';
          });
      }
      check();
      setInterval(check, 15000);
    })();
  </script>
</body>
</html>`;
}
