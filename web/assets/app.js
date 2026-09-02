(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { fixture: null, scan: 'quick', results: [], controls: [], stage: 'target', scanning: false, shieldApplied: false, runtime: document.documentElement.dataset.runtime === 'boxlang', capsule: null, approvalCapsule: null, approvalNonce: null, patch: null };
  const statusRank = { ERROR: 0, NOT_APPLICABLE: 0, RESISTED: 1, WARNING: 2, VULNERABLE: 3 };

  const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const showToast = message => { const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>el.classList.remove('show'),2600); };

  async function apiPost(path, payload) {
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', credentials: 'same-origin', body: JSON.stringify(payload) });
    const envelope = await response.json().catch(() => null);
    if (!response.ok || !envelope || !envelope.ok) throw new Error(envelope?.error?.code || `HTTP_${response.status}`);
    return envelope.data;
  }

  async function loadFixture() {
    const response = await fetch(state.runtime ? '/api/report.bxm' : 'data/replay-v1.json', { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) throw new Error(`Fixture HTTP ${response.status}`);
    const body = await response.json();
    const data = state.runtime ? body?.data?.report : body;
    if (state.runtime && !body?.ok) throw new Error(body?.error?.code || 'REPORT_UNAVAILABLE');
    validateFixture(data);
    state.fixture = data;
    $('#hero-base-score').textContent = data.scores.baselineSafety;
    $('#hero-hard-score').textContent = data.scores.hardenedSafety;
    return data;
  }

  function validateFixture(data) {
    if (!data || data.schemaVersion !== '1.0.0' || !Array.isArray(data.results) || !Array.isArray(data.controls)) throw new Error('Invalid replay fixture schema');
    const ids = new Set();
    for (const item of data.results) {
      if (!item.attackId || ids.has(item.attackId) || !item.baseline || !item.hardened) throw new Error('Invalid paired result');
      ids.add(item.attackId);
    }
  }

  function openStage(name) {
    state.stage = name;
    $$('.stage-panel').forEach(panel => { const active=panel.dataset.panel===name; panel.hidden=!active; panel.classList.toggle('active',active); });
    $$('.step').forEach(step => { const active=step.dataset.stage===name; step.classList.toggle('active',active); step.setAttribute('aria-selected',String(active)); });
    if (name !== 'target') document.querySelector('#workflow').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function selectedRun() {
    const all = state.fixture.results;
    if (state.scan === 'full') return { results: all, controls: state.fixture.controls };
    const quickIds = new Set(['ATK-001','ATK-003','ATK-004','ATK-006','ATK-007','ATK-008','ATK-A01']);
    return { results: all.filter(r=>quickIds.has(r.attackId)), controls: state.fixture.controls.slice(0,1) };
  }

  function calculateSafety(results, side) {
    const applicable = results.reduce((sum,r)=>sum+r.weight,0);
    const observed = results.filter(r=>r[side].status==='VULNERABLE').reduce((sum,r)=>sum+r.weight,0);
    return applicable ? Math.round(100*(1-observed/applicable)) : 0;
  }

  function calculateUtility(controls, side) {
    const key = side === 'baseline' ? 'baselinePassed' : 'hardenedPassed';
    return controls.length ? Math.round(100*controls.filter(c=>c[key]).length/controls.length) : 0;
  }

  function resultRow(result, side='baseline') {
    const current=result[side];
    return `<article class="attack-row">
      <code>${escapeHTML(result.attackId)}</code>
      <div><strong>${escapeHTML(result.title)}${result.adaptive?' · ADAPTIVE':''}</strong><small>${escapeHTML(result.category)} · ${escapeHTML(current.evidence)}</small></div>
      <span class="severity ${escapeHTML(result.severity)}">${escapeHTML(result.severity)}</span>
      <span class="status ${current.status.toLowerCase()}">${escapeHTML(current.status)}</span>
    </article>`;
  }

  async function startScan(forceFull=false) {
    if (state.scanning) return;
    try {
      if (!state.fixture) await loadFixture();
    } catch (error) { showToast('Could not load the recorded fixture. Serve the project over HTTP.'); return; }
    state.scan = forceFull ? 'full' : $('#scan-size').value;
    if (state.runtime) {
      try {
        const evaluation = await apiPost('/api/evaluate.bxm', { suite: state.scan, mode: 'replay', targetId: 'acme-support' });
        state.capsule = evaluation.capsule;
        const proposal = await apiPost('/api/defend.bxm', { capsule: state.capsule });
        state.approvalCapsule = proposal.approvalCapsule;
        state.approvalNonce = proposal.approvalNonce;
        state.patch = proposal.patch;
      } catch (error) {
        showToast(`BoxLang replay API stopped safely: ${error.message}`);
        return;
      }
    }
    const selected=selectedRun(); state.results=selected.results; state.controls=selected.controls; state.scanning=true; state.shieldApplied=false;
    $('#approval-check').checked=false; $('#apply-shield-btn').disabled=true;
    $('#attack-list').innerHTML=''; $('#attack-empty').hidden=true; $('#progress-bar').style.width='0%';
    $('#run-state').className='run-state running'; $('#run-state').innerHTML='<i></i> RUNNING';
    openStage('attack');
    const start=performance.now();
    const sequence=[...state.results.map(r=>({kind:'attack',value:r})),...state.controls.map(c=>({kind:'control',value:c}))];
    for (let i=0;i<sequence.length;i++) {
      await wait(150);
      const item=sequence[i];
      if (item.kind==='attack') $('#attack-list').insertAdjacentHTML('beforeend',resultRow(item.value));
      else $('#attack-list').insertAdjacentHTML('beforeend',`<article class="attack-row"><code>${escapeHTML(item.value.controlId)}</code><div><strong>${escapeHTML(item.value.title)}</strong><small>Benign utility control · ${escapeHTML(item.value.baselineEvidence)}</small></div><span class="severity">control</span><span class="status passed">PASSED</span></article>`);
      const pct=Math.round(100*(i+1)/sequence.length); $('#progress-bar').style.width=`${pct}%`; $('#progress-text').textContent=`${i+1} / ${sequence.length} tests completed`; $('#run-clock').textContent=`00:${((performance.now()-start)/1000).toFixed(1).padStart(4,'0')}`;
    }
    $('#run-state').className='run-state'; $('#run-state').innerHTML='<i></i> COMPLETE'; state.scanning=false;
    renderBaseline(); renderPatch(); markComplete('target');markComplete('attack'); openStage('prove'); showToast('Baseline evidence complete. Adaptive attack frozen into replay set.');
  }

  function markComplete(name){ const el=$(`.step[data-stage="${name}"]`); if(el)el.classList.add('complete'); }

  function renderBaseline() {
    const safety=calculateSafety(state.results,'baseline'), utility=calculateUtility(state.controls,'baseline');
    const findings=state.results.filter(r=>['VULNERABLE','WARNING'].includes(r.baseline.status));
    $('#baseline-score').textContent=safety; $('#baseline-utility').textContent=utility; $('#finding-count').textContent=state.results.filter(r=>r.baseline.status==='VULNERABLE').length;
    $('#findings-list').innerHTML=findings.map(r=>`<article class="finding ${r.baseline.status==='WARNING'?'warning':''}"><div><strong>${escapeHTML(r.attackId)} · ${escapeHTML(r.title)}</strong><span class="status ${r.baseline.status.toLowerCase()}">${escapeHTML(r.baseline.status)}</span></div><p>${escapeHTML(r.baseline.evidence)}</p><code>${escapeHTML(r.baseline.responseHash)}</code></article>`).join('');
  }

  function renderPatch() {
    const patch=state.patch || state.fixture.patch; $('#patch-summary').textContent=patch.summary;
    $('#patch-list').innerHTML=patch.operations.map(op=>`<article class="patch-operation"><span>+</span><div><code>${escapeHTML(op.name)}</code><p>${escapeHTML(op.reason)}</p></div><small>${escapeHTML(op.utilityRisk)}</small></article>`).join('');
  }

  async function applyShield() {
    if (!$('#approval-check').checked || !state.results.length) return;
    $('#apply-shield-btn').disabled=true;
    $('#apply-shield-btn').textContent='Applying verified operations…';
    try {
      if (state.runtime) {
        const replay = await apiPost('/api/replay.bxm', { capsule: state.approvalCapsule, approved: true, approvalNonce: state.approvalNonce, approvalStatement: 'APPROVE_CLONE_ONLY' });
        state.fixture = replay.report;
        const selected = selectedRun();
        state.results = selected.results;
        state.controls = selected.controls;
      } else {
        await wait(650);
      }
      state.shieldApplied=true;
      markComplete('prove'); markComplete('shield');
      renderReplay(); openStage('replay');
      $('#apply-shield-btn').textContent='Shield applied to clone';
      showToast('Shield applied to cloned target. Exact paired replay complete.');
    } catch (error) {
      $('#apply-shield-btn').disabled=false;
      $('#apply-shield-btn').textContent='Approve & apply to clone';
      showToast(`Approval stopped safely: ${error.message}`);
    }
  }

  function renderReplay() {
    const before=calculateSafety(state.results,'baseline'), after=calculateSafety(state.results,'hardened'), baseUtility=calculateUtility(state.controls,'baseline'), hardUtility=calculateUtility(state.controls,'hardened');
    const fixed=state.results.filter(r=>r.baseline.status==='VULNERABLE'&&r.hardened.status!=='VULNERABLE').length;
    const remaining=state.results.filter(r=>r.hardened.status==='VULNERABLE').length;
    const regressions=state.controls.filter(c=>c.baselinePassed&&!c.hardenedPassed).length + state.results.filter(r=>statusRank[r.hardened.status]>statusRank[r.baseline.status]).length;
    $('#versus-before').textContent=before;$('#versus-after').textContent=after;$('#versus-delta').textContent=`+${after-before}`;$('#fixed-count').textContent=fixed;$('#remaining-count').textContent=remaining;$('#regression-count').textContent=regressions;$('#utility-retention').textContent=`${hardUtility}%`;
    $('#paired-body').innerHTML=state.results.map(r=>{let pair='HELD',cls='pair-held';if(r.baseline.status==='VULNERABLE'&&r.hardened.status!=='VULNERABLE'){pair='FIXED';cls='pair-fixed'}else if(r.hardened.status==='VULNERABLE'){pair='REMAINING';cls='pair-remaining'}return `<tr><td>${escapeHTML(r.attackId)} · ${escapeHTML(r.title)}</td><td>${escapeHTML(r.severity.toUpperCase())}</td><td><span class="status ${r.baseline.status.toLowerCase()}">${escapeHTML(r.baseline.status)}</span></td><td><span class="status ${r.hardened.status.toLowerCase()}">${escapeHTML(r.hardened.status)}</span></td><td class="${cls}">${pair}</td></tr>`}).join('');
    markComplete('replay');
  }

  function currentReport() {
    const results=state.results.length?state.results:state.fixture.results, controls=state.controls.length?state.controls:state.fixture.controls;
    return {...state.fixture,selectedSuite:state.scan,results,controls,computed:{baselineSafety:calculateSafety(results,'baseline'),hardenedSafety:calculateSafety(results,'hardened'),baselineUtility:calculateUtility(controls,'baseline'),hardenedUtility:calculateUtility(controls,'hardened')}};
  }

  function download(name,text,type='application/json') { const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);showToast(`${name} generated locally.`); }
  function markdownReport(report) {
    const lines=['# BoxShield Arena Evidence Report','',`- Run: \`${report.runId}\``,`- Mode: **${report.mode}**`,`- Model: \`${report.modelId}\``,`- Sample count: ${report.sampleCount}`,`- Corpus: \`${report.corpus.id}@${report.corpus.version}\``, '', '## Scores','',`- Baseline safety: ${report.computed.baselineSafety}/100`,`- Hardened safety: ${report.computed.hardenedSafety}/100`,`- Baseline utility: ${report.computed.baselineUtility}/100`,`- Hardened utility: ${report.computed.hardenedUtility}/100`,'','## Paired findings',''];
    report.results.forEach(r=>lines.push(`- **${r.attackId} ${r.title}** — ${r.baseline.status} → ${r.hardened.status} (${r.owasp})`));
    lines.push('','## Limitations','');report.limitations.forEach(x=>lines.push(`- ${x}`));lines.push('','> Authorized defensive testing only. OWASP-informed; not a certification.');return lines.join('\n');
  }

  function wire() {
    $$('.step').forEach(step=>step.addEventListener('click',()=>{ const stage=step.dataset.stage;if(stage==='target'||state.results.length)openStage(stage);else showToast('Run the baseline before opening this stage.'); }));
    $('#launch-btn').addEventListener('click',()=>startScan(false));$('#start-scan-btn').addEventListener('click',()=>startScan(false));$('#load-report-btn').addEventListener('click',()=>startScan(true));
    $('#approval-check').addEventListener('change',e=>{$('#apply-shield-btn').disabled=!e.target.checked||!state.results.length});$('#apply-shield-btn').addEventListener('click',applyShield);
    $('#download-json').addEventListener('click',()=>download('boxshield-evidence.json',JSON.stringify(currentReport(),null,2)));$('#download-md').addEventListener('click',()=>download('boxshield-report.md',markdownReport(currentReport()),'text/markdown'));$('#evidence-pack-btn').addEventListener('click',()=>download('boxshield-evidence-pack.json',JSON.stringify(currentReport(),null,2)));
  }

  async function init() { wire(); try { await loadFixture(); } catch(error) { console.error(error); showToast('Replay fixture unavailable. Start an HTTP server from the project root.'); } }
  document.addEventListener('DOMContentLoaded',init);
})();
