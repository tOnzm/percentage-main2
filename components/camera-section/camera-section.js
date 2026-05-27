// ── CAMERA COMPONENT ──────────────────────────────────────────────────────

function initCameraComponentEvents() {
  _renderSingleSelectGroup('angle-group', window.cameraAngles);
  _renderSingleSelectGroup('light-group', window.lightingData);
  _renderSingleSelectGroup('mood-group', window.moodData);
  _renderSingleSelectGroup('quality-group', window.qualityData);
  _renderSingleSelectGroup('lens-group', window.lensData);
  _renderSingleSelectGroup('finish-group', window.finishData);
  _bindSingleSelect('ratio-group');
/*   _bindMultiSelect('quality-group'); */
 /*  _bindSingleSelect('mood-group'); */

  // mood custom input — deactivates pills while typing
  const moodCustom = document.getElementById('mood-custom');
  if (moodCustom) {
    moodCustom.addEventListener('input', () => {
      if (moodCustom.value.trim()) {
        document.querySelectorAll('#mood-group .pill').forEach(p => p.classList.remove('active'));
      }
      tryRecompile();
    });
  }

  // extra textarea
  const extra = document.getElementById('extra');
  if (extra) extra.addEventListener('input', () => tryRecompile());
}

// ─── Render pills จาก array data แล้ว bind single-select ─────────────────
function _renderSingleSelectGroup(groupId, dataArray) {
  const group = document.getElementById(groupId);
  if (!group || !Array.isArray(dataArray) || !dataArray.length) return;

  group.innerHTML = '';
  dataArray.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pill' + (i === 0 ? ' active' : '');
    btn.dataset.val = item.val;
    if (item.icon) {
      const span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.textContent = item.icon + ' ';
      btn.appendChild(span);
    }
    btn.appendChild(document.createTextNode(item.label));
    group.appendChild(btn);
  });

  _bindSingleSelect(groupId);
}

// ─── Single-select: คลิกเลือกได้ 1 อัน ──────────────────────────────────
function _bindSingleSelect(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    tryRecompile();
  });
}

// ─── Multi-select: toggle ─────────────────────────────────────────────────
function _bindMultiSelect(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    pill.classList.toggle('active');
    tryRecompile();
  });
}
