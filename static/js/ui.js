/**
 * DES Simulator — UI Renderer
 * Menangani semua rendering langkah-langkah DES ke DOM
 */

// ============================================================
// HELPER UI
// ============================================================

function formatBits(bits, groupSize = 4) {
  if (!bits) return '';
  const arr = Array.isArray(bits) ? bits.join('') : bits;
  if (!groupSize) return `<span class="bits">${arr}</span>`;
  let out = '';
  for (let i = 0; i < arr.length; i += groupSize) {
    out += `<span class="bit-group">${arr.substr(i, groupSize)}</span>`;
  }
  return `<span class="bits">${out}</span>`;
}

function formatBitsHighlight(bits, highlightIdx = [], groupSize = 4) {
  const arr = Array.isArray(bits) ? bits.join('') : bits;
  let html = '<span class="bits">';
  for (let i = 0; i < arr.length; i++) {
    const cls = highlightIdx.includes(i) ? 'bit-hi' : '';
    if (i > 0 && groupSize && i % groupSize === 0) html += '<span class="bit-sep"></span>';
    html += `<span class="bit ${cls}">${arr[i]}</span>`;
  }
  html += '</span>';
  return html;
}

function makeTable(headers, rows, className = '') {
  let html = `<div class="table-wrap"><table class="${className}"><thead><tr>`;
  headers.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';
  rows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => html += `<td>${cell}</td>`);
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function badge(text, type='info') {
  return `<span class="badge badge-${type}">${text}</span>`;
}

function collapse(id, title, content, open = false) {
  return `
  <details class="collapsible" ${open ? 'open' : ''}>
    <summary class="coll-header">${title}</summary>
    <div class="coll-body" id="${id}">${content}</div>
  </details>`;
}

// ============================================================
// RENDER KEY SCHEDULE
// ============================================================

function renderKeySchedule(ks) {
  let html = '';

  // PC-1
  html += `<div class="step-block">
    <div class="step-label">PC-1 Permutation <span class="step-note">64-bit → 56-bit (membuang parity bit)</span></div>
    <div class="bit-row">
      <span class="bit-label">Input (64-bit):</span>
      ${formatBits(ks.roundDetails[0] ? ks.C0.concat(ks.D0) : [], 8)}
    </div>
    <div class="bit-row">
      <span class="bit-label">Setelah PC-1 (56-bit):</span>
      ${formatBits([...ks.C0, ...ks.D0], 7)}
    </div>
    <div class="bit-row">
      <span class="bit-label">C0 (28-bit):</span>
      ${formatBits(ks.C0, 7)}
    </div>
    <div class="bit-row">
      <span class="bit-label">D0 (28-bit):</span>
      ${formatBits(ks.D0, 7)}
    </div>
  </div>`;

  // Subkey table
  const rows = ks.roundDetails.map(r => [
    badge(`Round ${r.round}`, 'primary'),
    r.shift,
    formatBits(r.C, 7),
    formatBits(r.D, 7),
    formatBits(r.Ki, 6)
  ]);

  html += `<div class="step-block">
    <div class="step-label">Pembangkitan 16 Subkunci (K1–K16)</div>
    ${makeTable(['Round', 'Shift', 'C (28-bit)', 'D (28-bit)', 'Ki setelah PC-2 (48-bit)'], rows, 'ks-table')}
  </div>`;

  return html;
}

// ============================================================
// RENDER SINGLE ROUND
// ============================================================

function renderRound(r, roundNum) {
  let html = `
  <div class="round-header">
    ${badge(`ROUND ${roundNum}`, 'primary')}
    <span class="round-sub">L${roundNum-1} = ${formatBits(r.L_in,8)} &nbsp;|&nbsp; R${roundNum-1} = ${formatBits(r.R_in,8)}</span>
  </div>`;

  // Expansion E
  html += `<div class="step-block">
    <div class="step-label">1. Ekspansi E &nbsp;<span class="step-note">R${roundNum-1}: 32-bit → 48-bit</span></div>
    <div class="bit-row"><span class="bit-label">Input R (32-bit):</span> ${formatBits(r.R_in,8)}</div>
    <div class="bit-row"><span class="bit-label">Setelah E (48-bit):</span> ${formatBits(r.expansion,6)}</div>
  </div>`;

  // XOR with Ki
  html += `<div class="step-block">
    <div class="step-label">2. XOR dengan Subkunci K${roundNum}</div>
    <div class="xor-grid">
      <div class="xor-row"><span class="xor-lbl">E(R):</span> ${formatBits(r.expansion,6)}</div>
      <div class="xor-row"><span class="xor-lbl">K${roundNum}:&nbsp;</span> ${formatBits(r.Ki,6)}</div>
      <div class="xor-divider"></div>
      <div class="xor-row"><span class="xor-lbl">XOR:</span> ${formatBits(r.xorResult,6)}</div>
    </div>
  </div>`;

  // S-Box
  let sboxHtml = `<div class="sbox-grid">`;
  r.sboxDetail.forEach(s => {
    sboxHtml += `<div class="sbox-cell">
      <div class="sbox-title">S${s.sbox}</div>
      <div class="sbox-input">${formatBits(s.input,6)}</div>
      <div class="sbox-info">Baris: ${s.row} &nbsp; Kolom: ${s.col}</div>
      <div class="sbox-value">→ ${s.value} &nbsp; = &nbsp; ${formatBits(s.output,4)}</div>
    </div>`;
  });
  sboxHtml += `</div>
  <div class="bit-row"><span class="bit-label">Output S-Box (32-bit):</span> ${formatBits(r.sboxOut,4)}</div>`;

  html += `<div class="step-block">
    <div class="step-label">3. Substitusi S-Box (8 S-Box, 6-bit → 4-bit)</div>
    ${sboxHtml}
  </div>`;

  // Permutation P
  html += `<div class="step-block">
    <div class="step-label">4. Permutasi P</div>
    <div class="bit-row"><span class="bit-label">Input (32-bit):</span> ${formatBits(r.sboxOut,4)}</div>
    <div class="bit-row"><span class="bit-label">Output f (32-bit):</span> ${formatBits(r.fOut,4)}</div>
  </div>`;

  // XOR L with f
  html += `<div class="step-block">
    <div class="step-label">5. L${roundNum} = R${roundNum-1}, &nbsp; R${roundNum} = L${roundNum-1} ⊕ f(R${roundNum-1}, K${roundNum})</div>
    <div class="xor-grid">
      <div class="xor-row"><span class="xor-lbl">L${roundNum-1}:</span> ${formatBits(r.L_in,8)}</div>
      <div class="xor-row"><span class="xor-lbl">f(R,K):</span> ${formatBits(r.fOut,8)}</div>
      <div class="xor-divider"></div>
      <div class="xor-row"><span class="xor-lbl">R${roundNum}:</span> ${formatBits(r.R_out,8)}</div>
    </div>
    <div class="bit-row round-result">
      <span class="bit-label">L${roundNum} =</span> ${formatBits(r.L_out,8)}
      &nbsp;&nbsp;
      <span class="bit-label">R${roundNum} =</span> ${formatBits(r.R_out,8)}
    </div>
  </div>`;

  return html;
}

// ============================================================
// RENDER ALL ROUNDS
// ============================================================

function renderRounds(rounds) {
  let html = '';
  rounds.forEach((r, i) => {
    const rNum = i + 1;
    const content = renderRound(r, rNum);
    html += collapse(`round-${rNum}`, `${badge(rNum,'primary')} Round ${rNum} &nbsp;<small>L${rNum} = ${bitStr(r.L_out)} | R${rNum} = ${bitStr(r.R_out)}</small>`, content, i === 0);
  });
  return html;
}

function bitStr(arr) {
  if (!arr) return '';
  const s = arr.join('');
  const h = binToHex(s);
  return `<code>${h}</code>`;
}

function binToHex(bin) {
  let hex = '';
  for (let i = 0; i < bin.length; i += 4) {
    hex += parseInt(bin.substr(i, 4), 2).toString(16).toUpperCase();
  }
  return hex;
}

// ============================================================
// RENDER FULL RESULT
// ============================================================

function renderResult(res) {
  const log = res.log;
  const mode = log.mode === 'encrypt' ? 'Enkripsi' : 'Dekripsi';
  const inputLabel = log.mode === 'encrypt' ? 'Plaintext' : 'Ciphertext';
  const outputLabel = log.mode === 'encrypt' ? 'Ciphertext' : 'Plaintext';

  let html = '';

  // ── Summary ──
  html += `<div class="summary-card">
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">${inputLabel}</div>
        <div class="summary-hex">${res.inputHex}</div>
        <div class="summary-bin">${formatBits(res.inputBin, 8)}</div>
      </div>
      <div class="summary-arrow">→</div>
      <div class="summary-item highlight">
        <div class="summary-label">${outputLabel}</div>
        <div class="summary-hex">${res.outputHex}</div>
        <div class="summary-bin">${formatBits(res.outputBin, 8)}</div>
      </div>
    </div>
  </div>`;

  // ── Tabs ──
  html += `<div class="tabs">
    <button class="tab-btn active" onclick="showTab('tab-ks')">Key Schedule</button>
    <button class="tab-btn" onclick="showTab('tab-ip')">IP & Rounds</button>
    <button class="tab-btn" onclick="showTab('tab-output')">IP⁻¹ & Output</button>
  </div>`;

  // ── Tab: Key Schedule ──
  html += `<div id="tab-ks" class="tab-pane active">
    <div class="section-title">🔑 Key Schedule — Pembangkitan Subkunci</div>
    ${renderKeySchedule(log.keySchedule)}
  </div>`;

  // ── Tab: IP & Rounds ──
  html += `<div id="tab-ip" class="tab-pane" style="display:none">
    <div class="section-title">🔀 Initial Permutation (IP)</div>
    <div class="step-block">
      <div class="bit-row"><span class="bit-label">Input (64-bit):</span> ${formatBits(log.IP.input, 8)}</div>
      <div class="bit-row"><span class="bit-label">Setelah IP (64-bit):</span> ${formatBits(log.IP.output, 8)}</div>
      <div class="bit-row"><span class="bit-label">L0 (32-bit):</span> ${formatBits(log.IP.L, 8)}</div>
      <div class="bit-row"><span class="bit-label">R0 (32-bit):</span> ${formatBits(log.IP.R, 8)}</div>
    </div>
    <div class="section-title">⚙️ 16 Putaran Feistel</div>
    ${renderRounds(log.rounds)}
  </div>`;

  // ── Tab: IP-1 & Output ──
  const lastR = log.rounds[15];
  html += `<div id="tab-output" class="tab-pane" style="display:none">
    <div class="section-title">🔁 Pre-Output (Swap R16 || L16)</div>
    <div class="step-block">
      <div class="bit-row"><span class="bit-label">L16:</span> ${formatBits(lastR.L_out, 8)}</div>
      <div class="bit-row"><span class="bit-label">R16:</span> ${formatBits(lastR.R_out, 8)}</div>
      <div class="bit-row"><span class="bit-label">R16 || L16 (64-bit):</span> ${formatBits(log.preOutput, 8)}</div>
    </div>
    <div class="section-title">🔄 IP⁻¹ (Final Permutation)</div>
    <div class="step-block">
      <div class="bit-row"><span class="bit-label">Input (64-bit):</span> ${formatBits(log.IP_INV.input, 8)}</div>
      <div class="bit-row"><span class="bit-label">Output akhir (64-bit):</span> ${formatBits(log.IP_INV.output, 8)}</div>
    </div>
    <div class="result-final">
      <div class="result-label">${outputLabel} Final</div>
      <div class="result-hex">${res.outputHex}</div>
      <div class="result-bin">${formatBits(res.outputBin, 8)}</div>
    </div>
  </div>`;

  return html;
}

// ============================================================
// TAB SWITCHER
// ============================================================

function showTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).style.display = 'block';
  const idx = ['tab-ks','tab-ip','tab-output'].indexOf(tabId);
  document.querySelectorAll('.tab-btn')[idx].classList.add('active');
}

// ============================================================
// MAIN CONTROLLER
// ============================================================

let lastResult = null;

function runSimulation(mode) {
  const ptInput  = document.getElementById('input-text').value.trim();
  const keyInput = document.getElementById('input-key').value.trim();
  const errEl    = document.getElementById('error-msg');
  const outEl    = document.getElementById('output-area');

  errEl.textContent = '';
  outEl.innerHTML   = '';

  if (!ptInput || !keyInput) {
    errEl.textContent = '⚠️ Harap isi Plaintext/Ciphertext dan Kunci terlebih dahulu.';
    return;
  }

  try {
    const result = runDES(ptInput, keyInput, mode);
    lastResult = result;

    outEl.innerHTML = renderResult(result);
    outEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update round-trip button
    document.getElementById('btn-roundtrip').style.display = 'inline-flex';
  } catch (e) {
    errEl.textContent = '❌ ' + e.message;
  }
}

function doRoundTrip() {
  if (!lastResult) return;
  const reverseMode = lastResult.log.mode === 'encrypt' ? 'decrypt' : 'encrypt';
  document.getElementById('input-text').value = lastResult.outputHex;
  runSimulation(reverseMode);
}

function resetAll() {
  document.getElementById('input-text').value = '';
  document.getElementById('input-key').value  = '';
  document.getElementById('error-msg').textContent = '';
  document.getElementById('output-area').innerHTML  = '';
  document.getElementById('btn-roundtrip').style.display = 'none';
  lastResult = null;
}

function loadExample() {
  // Known DES test vector
  document.getElementById('input-text').value = '0123456789ABCDEF';
  document.getElementById('input-key').value  = '133457799BBCDFF1';
}

function toggleFormat(inputId) {
  const el = document.getElementById(inputId);
  let val = el.value.trim().replace(/\s/g,'').toUpperCase();
  if (!val) return;
  try {
    if (/^[01]+$/.test(val)) {
      // binary → hex
      let hex = '';
      for (let i = 0; i < val.length; i += 4) {
        hex += parseInt(val.substr(i,4),2).toString(16).toUpperCase();
      }
      el.value = hex;
    } else {
      // hex → binary
      el.value = val.split('').map(h => parseInt(h,16).toString(2).padStart(4,'0')).join('');
    }
  } catch(e) {}
}

// Clipboard copy
function copyOutput() {
  if (!lastResult) return;
  const text = `${lastResult.log.mode === 'encrypt' ? 'Ciphertext' : 'Plaintext'}: ${lastResult.outputHex}`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btn-copy');
    btn.textContent = '✅ Disalin!';
    setTimeout(() => btn.textContent = '📋 Salin Hasil', 1500);
  });
}
