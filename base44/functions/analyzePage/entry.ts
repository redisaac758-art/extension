const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const url = body?.url;
    const contextType = body?.context_type || 'game';
    const deep = body?.deep === true;
    if (!url) return Response.json({ error: 'url is required' }, { status: 400 });

    let target;
    try { target = new URL(url); } catch { return Response.json({ error: 'Invalid URL' }, { status: 400 }); }

    let html = '';
    let allowsFraming = true;
    const technologies = [];
    let pageTitle = '';
    let fetchError = null;

    try {
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Base44Analyzer/1.0)' },
        redirect: 'follow'
      });
      const xfo = resp.headers.get('x-frame-options');
      const csp = resp.headers.get('content-security-policy') || '';
      if (xfo && /deny|sameorigin/i.test(xfo)) allowsFraming = false;
      if (/frame-ancestors[^;]*none/i.test(csp)) allowsFraming = false;
      if (/frame-ancestors[^;]*'self'/i.test(csp)) allowsFraming = false;
      html = await resp.text();
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch) pageTitle = titleMatch[1].trim().slice(0, 200);
      if (/react/i.test(html)) technologies.push('React');
      if (/vue/i.test(html)) technologies.push('Vue');
      if (/angular/i.test(html)) technologies.push('Angular');
      if (/phaser/i.test(html)) technologies.push('Phaser');
      if (/<canvas/i.test(html)) technologies.push('Canvas');
      if (/createjs|easeljs/i.test(html)) technologies.push('CreateJS');
      if (/unity/i.test(html)) technologies.push('Unity');
      if (/localStorage|sessionStorage/i.test(html)) technologies.push('Storage');
      if (/websocket/i.test(html)) technologies.push('WebSocket');
      if (/\/api\/|fetch\(|xmlhttprequest/i.test(html)) technologies.push('API');
    } catch (e) {
      fetchError = e.message;
    }

    // Extract inline scripts + external script URLs for deeper analysis
    let scriptContext = '';
    if (deep && html) {
      const inlineBlocks = [];
      const inlineRe = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
      let m;
      while ((m = inlineRe.exec(html)) !== null) {
        const code = m[1].trim();
        if (code.length > 20) inlineBlocks.push(code.slice(0, 4000));
      }
      const scriptUrls = [];
      const srcRe = /<script\b[^>]+src=["']([^"']+)["']/gi;
      while ((m = srcRe.exec(html)) !== null) {
        try { scriptUrls.push(new URL(m[1], url).href); } catch { /* ignore */ }
      }
      const fetched = [];
      for (const s of scriptUrls.slice(0, 4)) {
        try {
          const r = await fetch(s, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Base44Analyzer/1.0)' } });
          const t = await r.text();
          fetched.push(`// ${s}\n${t.slice(0, 6000)}`);
        } catch { /* ignore */ }
      }
      scriptContext = `Inline scripts:\n${inlineBlocks.join('\n---\n').slice(0, 16000)}\n\nExternal scripts:\n${fetched.join('\n---\n').slice(0, 16000)}`;
    }

    const mainExcerpt = html.slice(0, deep ? 30000 : 20000);

    const depthLine = deep
      ? 'DEEP SCAN mode: be exhaustive. Inspect the provided inline + external script sources for global game objects, score variables, currency, health, XP, timers, localStorage keys, WebSocket messages, and API endpoints. Infer variable paths precisely (e.g. window.GAME.player.coins, localStorage.getItem("highscore")). Provide as many trackable variables as you can find.'
      : 'Standard scan: identify the most prominent trackable variables and a few high-value cheats.';

    const prompt = `You are an elite reverse-engineer and "cheat engine" AI. Analyze the following web ${contextType} page (URL: ${url}).
${depthLine}

Identify trackable state variables (scores, health, coins, timers, answers, lives, level, inventory, XP, ammo, upgrades, highscore, etc.), categorize each by importance (critical/high/medium/low), and suggest concrete cheats/manipulations with realistic JavaScript snippets that could run in the page console.

For every cheat, include a "verify_code" field: a single JavaScript expression or snippet that returns a truthy value if the cheat actually worked (e.g. \`window.game.score > 9999\` or \`document.querySelector('#coins').textContent === '9999'\`). If no reliable check exists, return \`null\`.

Also provide "suggestions": specific actions the user should take IN the game/site so a deeper re-scan captures more variables (e.g. "Start a level and re-run Deep Scan to catch combat variables", "Open the shop tab to expose currency variables", "Trigger the timer then scan to isolate the countdown"). Each suggestion: { title, action }.

Return strict JSON matching the schema. Variable.selector = CSS selector or window property path. Cheat.code = runnable JS string. Cheat.injection_type = script|value|click|key. Cheat.risk = safe|moderate|risky.

Page title: ${pageTitle}. Technologies: ${technologies.join(', ') || 'unknown'}.
Fetch note: ${fetchError ? 'Could not fetch live HTML (' + fetchError + '); reason generically about a ' + contextType + ' of this kind.' : 'HTML fetched successfully.'}

HTML/source excerpt:
${mainExcerpt}

${scriptContext ? 'Script sources:\n' + scriptContext : ''}`;

    const llmResp = await db.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          variables: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                selector: { type: 'string' },
                importance: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                category: { type: 'string' },
                description: { type: 'string' }
              },
              required: ['name', 'importance', 'description']
            }
          },
          cheats: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                injection_type: { type: 'string', enum: ['script', 'value', 'click', 'key'] },
                code: { type: 'string' },
                verify_code: { type: ['string', 'null'] },
                risk: { type: 'string', enum: ['safe', 'moderate', 'risky'] }
              },
              required: ['title', 'code', 'risk']
            }
          },
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                action: { type: 'string' }
              },
              required: ['title', 'action']
            }
          },
          summary: { type: 'string' }
        },
        required: ['variables', 'cheats', 'summary']
      }
    });

    return Response.json({
      variables: llmResp.variables || [],
      cheats: llmResp.cheats || [],
      suggestions: llmResp.suggestions || [],
      summary: llmResp.summary || '',
      deep,
      siteInfo: { title: pageTitle, allows_framing: allowsFraming, technologies }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}