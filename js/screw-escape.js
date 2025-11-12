// Screw Escape - vanilla JS puzzle
// Author: automated helper
// Simple, modular structure. Levels define plates and screws. Plates fall when they have no screws.

const boardEl = document.getElementById('gameBoard');
const levelNumberEl = document.getElementById('levelNumber');
const scoreEl = document.getElementById('scoreDisplay');
const resetBtn = document.getElementById('resetBtn');
const nextBtn = document.getElementById('nextBtn');
const messageEl = document.getElementById('message');

let currentLevelIndex = 0;
let score = 0;

// Level format:
// { plates: [{id, x%, y%, w%, h%, label, screws:[screwIds]}], screws: [{id, x%, y%, plates:[plateIds]}] }
const levels = [
  // Level 1: simple 2 plates, 4 screws
  {
    plates: [
      { id: 'p1', x: 12, y: 8, w: 76, h: 34, label: 'Plate A', screws: ['s1','s2','s3','s4'] }
    ],
    screws: [
      { id: 's1', x: 18, y: 20, plates: ['p1'] },
      { id: 's2', x: 82, y: 20, plates: ['p1'] },
      { id: 's3', x: 18, y: 40, plates: ['p1'] },
      { id: 's4', x: 82, y: 40, plates: ['p1'] },
    ]
  },
  // Level 2: two plates stacked with shared screws
  {
    plates: [
      { id: 'p1', x: 6, y: 8, w: 44, h: 36, label: 'Top Plate', screws: ['s1','s2','s3','s4'] },
      { id: 'p2', x: 50, y: 8, w: 44, h: 36, label: 'Bottom Plate', screws: ['s3','s4','s5','s6'] }
    ],
    screws: [
      { id: 's1', x: 12, y: 18, plates: ['p1'] },
      { id: 's2', x: 46, y: 18, plates: ['p1'] },
      { id: 's3', x: 46, y: 40, plates: ['p1','p2'] },
      { id: 's4', x: 12, y: 40, plates: ['p1','p2'] },
      { id: 's5', x: 50, y: 18, plates: ['p2'] },
      { id: 's6', x: 84, y: 18, plates: ['p2'] }
    ]
  },
  // Level 3: small puzzle
  {
    plates: [
      { id: 'p1', x: 10, y: 6, w: 36, h: 28, label: 'A', screws: ['s1','s2','s3','s4'] },
      { id: 'p2', x: 54, y: 6, w: 36, h: 28, label: 'B', screws: ['s5','s6','s7','s8'] },
      { id: 'p3', x: 10, y: 44, w: 80, h: 34, label: 'C', screws: ['s3','s4','s5','s6'] }
    ],
    screws: [
      { id: 's1', x: 12, y: 12, plates: ['p1'] },
      { id: 's2', x: 34, y: 12, plates: ['p1'] },
      { id: 's3', x: 12, y: 32, plates: ['p1','p3'] },
      { id: 's4', x: 34, y: 32, plates: ['p1','p3'] },
      { id: 's5', x: 66, y: 12, plates: ['p2','p3'] },
      { id: 's6', x: 88, y: 12, plates: ['p2','p3'] },
      { id: 's7', x: 66, y: 32, plates: ['p2'] },
      { id: 's8', x: 88, y: 32, plates: ['p2'] }
    ]
  }
];

// Runtime maps
let plateState = {}; // id -> {remainingScrews, domEl}
let screwState = {}; // id -> {removed, domEl}
// Modal / UI elements for completion
const modal = document.getElementById('levelCompleteModal');
const modalScore = document.getElementById('modalScore');
const bestScoreEl = document.getElementById('bestScore');
const modalNext = document.getElementById('modalNext');
const modalReplay = document.getElementById('modalReplay');
const modalClose = document.getElementById('modalClose');

// Persistent best score
let bestScore = parseInt(localStorage.getItem('screwEscapeBest') || '0', 10) || 0;
bestScoreEl.textContent = bestScore;

function showMessage(text, timeout=1400){
  messageEl.textContent = text; messageEl.style.display = text? 'block':'none';
  if(text && timeout>0) setTimeout(()=>{messageEl.style.display='none'}, timeout);
}

function clearBoard(){
  boardEl.innerHTML = '';
  plateState = {}; screwState = {};
}

function renderLevel(index){
  clearBoard();
  const level = levels[index];
  if(!level) return;
  levelNumberEl.textContent = index+1;

  // Create plates first so screws are above them
  level.plates.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'plate';
    el.dataset.id = p.id;
    el.style.left = p.x + '%';
    el.style.top = p.y + '%';
    el.style.width = p.w + '%';
    el.style.height = p.h + '%';
    el.innerHTML = `<div class="label">${p.label}</div>`;
    boardEl.appendChild(el);
    plateState[p.id] = { remainingScrews: p.screws.length, domEl: el };
  });

  // Create screws
  level.screws.forEach(s=>{
    const btn = document.createElement('button');
    btn.className = 'screw';
    btn.dataset.id = s.id;
    btn.style.left = `calc(${s.x}% - 17px)`; // center the screw
    btn.style.top = `calc(${s.y}% - 17px)`;
    btn.innerHTML = `<span class="cross">+</span>`;
    btn.addEventListener('click', () => handleScrewClick(s.id));
    // touch-friendly
    btn.addEventListener('touchstart', (e)=>{ e.stopPropagation(); }, {passive:true});
    boardEl.appendChild(btn);
    screwState[s.id] = { removed: false, domEl: btn, plates: s.plates.slice() };
  });

  // Initial score / UI
  levelNumberEl.textContent = (index+1);
  updateScore(0); // keep existing score
}

function handleScrewClick(screwId){
  const screw = screwState[screwId];
  if(!screw || screw.removed) return;

  // Remove the screw visually
  screw.removed = true;
  screw.domEl.classList.add('removed');
  screw.domEl.disabled = true;

  // Play click sound
  playClick();

  // Update plates that referenced this screw
  const affectedPlates = screw.plates || [];
  affectedPlates.forEach(pid=>{
    const p = plateState[pid];
    if(!p) return;
    p.remainingScrews = Math.max(0, p.remainingScrews - 1);
    // If no screws left -> fall
    if(p.remainingScrews === 0){
      triggerPlateFall(pid);
    }
  });

  // Award small score for removing a screw
  updateScore(1);

  // Optionally detect locked state: if no removable screws remain but plates still exist
  setTimeout(()=>{
    checkForLockedState();
    checkLevelComplete();
  }, 220);
}

function triggerPlateFall(plateId){
  const st = plateState[plateId];
  if(!st || !st.domEl) return;
  const el = st.domEl;
  el.classList.add('falling');
  // spawn a few particle bits to sell the effect
  spawnParticles(el);
  // play fall sound
  playFall();
  // After animation remove from DOM and clear state
  setTimeout(()=>{
    if(el && el.parentNode) el.parentNode.removeChild(el);
    delete plateState[plateId];
  }, 920);
}

function checkForLockedState(){
  // A screw is removable if it is not removed yet. For simplicity we allow all screws to be removed.
  // A locked state is when there are plates left but all screws are removed or disabled.
  const remainingPlates = Object.keys(plateState).length;
  const remainingScrews = Object.values(screwState).filter(s=>!s.removed).length;
  if(remainingPlates>0 && remainingScrews===0){
    showMessage('Puzzle locked — try Reset', 2200);
  }
}

function checkLevelComplete(){
  if(Object.keys(plateState).length === 0){
    updateScore(5); // bonus
    // small delay so last plate fall animation can finish
    setTimeout(()=>{
      onLevelComplete();
    }, 380);
  }
}

function onLevelComplete(){
  // update best score
  if(score > bestScore){
    bestScore = score;
    localStorage.setItem('screwEscapeBest', String(bestScore));
  }
  modalScore.textContent = score;
  bestScoreEl.textContent = bestScore;
  openModal();
  playCelebrate();
  // vibrate if available
  if(navigator.vibrate) navigator.vibrate([80,40,80]);
}

function openModal(){ if(modal) modal.setAttribute('aria-hidden','false'); }
function closeModal(){ if(modal) modal.setAttribute('aria-hidden','true'); }

modalNext && modalNext.addEventListener('click', ()=>{ closeModal(); nextLevel(); });
modalReplay && modalReplay.addEventListener('click', ()=>{ closeModal(); resetLevel(); });
modalClose && modalClose.addEventListener('click', ()=>{ closeModal(); });

// Spawn simple rectangular particles from plate bounding box
function spawnParticles(plateEl){
  try{
    const rect = plateEl.getBoundingClientRect();
    const layer = modal ? modal.querySelector('.confetti-layer') : null;
    for(let i=0;i<16;i++){
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      // random color
      p.style.background = `hsl(${Math.round(Math.random()*60+10)},70%,60%)`;
      const startX = rect.left + Math.random()*rect.width;
      p.style.left = `${startX}px`;
      p.style.top = `${rect.top + Math.random()*rect.height}px`;
      (layer || document.body).appendChild(p);
      // animate by toggling class after a frame
      requestAnimationFrame(()=>{ p.classList.add('show'); });
      // cleanup
      setTimeout(()=>{ if(p && p.parentNode) p.parentNode.removeChild(p); }, 1600);
    }
  }catch(e){/* ignore */}
}

function updateScore(delta){
  if(delta) score += delta;
  scoreEl.textContent = score;
}

function resetLevel(){
  renderLevel(currentLevelIndex);
}

function nextLevel(){
  currentLevelIndex = (currentLevelIndex + 1) % levels.length;
  renderLevel(currentLevelIndex);
}

// Simple sounds using WebAudio (no assets)
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function ensureAudio(){ if(!audioCtx) audioCtx = new AudioCtx(); }
function playClick(){ try{ ensureAudio(); const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type='square'; o.frequency.value=880; g.gain.value=0.02; o.connect(g); g.connect(audioCtx.destination); o.start(); setTimeout(()=>{o.stop()},70);}catch(e){} }
function playFall(){ try{ ensureAudio(); const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type='sine'; o.frequency.value=220; g.gain.value=0.04; o.connect(g); g.connect(audioCtx.destination); o.start(); const now=audioCtx.currentTime; g.gain.setValueAtTime(0.04, now); g.gain.exponentialRampToValueAtTime(0.0001, now+0.6); setTimeout(()=>{o.stop()},700);}catch(e){} }

function playCelebrate(){ try{ ensureAudio(); const t = audioCtx; const now = t.currentTime; const g = t.createGain(); g.connect(t.destination); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.12, now+0.02);
  const freqs = [440, 660, 880, 1100];
  freqs.forEach((f,i)=>{ const o = t.createOscillator(); o.type='triangle'; o.frequency.value = f; o.connect(g); o.start(now + i*0.08); o.stop(now + i*0.18 + i*0.04); });
}catch(e){} }

// Wire UI
resetBtn.addEventListener('click', ()=>{ resetLevel(); showMessage('Level reset'); });
nextBtn.addEventListener('click', ()=>{ nextLevel(); showMessage('Next level'); });

// Initialize
window.addEventListener('load', ()=>{
  renderLevel(currentLevelIndex);
});

// Expose for debugging
window.ScrewEscape = { levels, renderLevel };
