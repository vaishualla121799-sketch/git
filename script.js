'use strict';
const $ = (s) => document.querySelector(s);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
const params = new URLSearchParams(location.search);
const clean = (k) => (params.get(k) || '').trim().slice(0, 30);
const toName = clean('to');
const fromName = clean('from') || 'someone who cares';

/* ---------- a different look + buddy every visit ---------- */
const themes = ['peach', 'mint', 'lilac', 'lemon', 'sky', 'berry'];
const buddies = [
  ['🌻', 'Sunny'], ['🐥', 'Pip'], ['🐻', 'Biscuit'], ['🐰', 'Clover'], ['🐱', 'Mochi'],
  ['🐼', 'Bao'], ['🦊', 'Ember'], ['🐢', 'Slowpoke'], ['🦄', 'Sparkle'], ['🐙', 'Inky'], ['🍄', 'Mossy'], ['🐨', 'Koko']
];
const theme = pick(themes);
document.body.dataset.theme = theme;
const [face, buddyName] = pick(buddies);
$('#buddyFace').textContent = face;
document.querySelector('[data-tab="buddy"] i').textContent = face;
document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.body).getPropertyValue('--bg1').trim() || '#fbeee6';

let visits = 1;
try { visits = (Number(localStorage.getItem('ps-visits')) || 0) + 1; localStorage.setItem('ps-visits', visits); } catch (e) {}

const titles = [['Get well', 'soon.'], ['Feel better', 'soon.'], ['Rest up,', 'superstar.'], ['Heal up', 'slowly.'], ['Sending', 'sunshine.']];
const [t1, t2] = pick(titles);
$('#title').innerHTML = `${t1} <em>${toName ? toName + '.' : t2}</em>`;
$('#sub').textContent = visits > 1 ? `Welcome back! ${buddyName} missed you.` : `Meet ${buddyName}. They'll keep you company.`;

/* ---------- floating background ---------- */
const bg = $('#floatLayer');
const bgSyms = { peach: ['✿', '✦', '♡'], mint: ['🍃', '✧', '❀'], lilac: ['✦', '✧', '☾'], lemon: ['☀', '✦', '✿'], sky: ['☁', '✧', '✦'], berry: ['♡', '✿', '✦'] }[theme];
for (let i = 0; i < 14; i++) {
  const el = document.createElement('span');
  el.className = 'float-item';
  el.textContent = pick(bgSyms);
  el.style.left = Math.random() * 100 + '%';
  el.style.fontSize = 12 + Math.random() * 18 + 'px';
  el.style.color = 'var(--accent)';
  el.style.setProperty('--sway', Math.random() * 120 - 60 + 'px');
  el.style.animationDuration = 16 + Math.random() * 18 + 's';
  el.style.animationDelay = -Math.random() * 30 + 's';
  bg.appendChild(el);
}

/* ---------- sound (opt-in) ---------- */
let ac = null, musicTimer = null, soundOn = false;
function tone(freq, start, dur, vol = 0.02, type = 'sine') {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(vol, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g); g.connect(ac.destination); o.start(start); o.stop(start + dur + 0.05);
}
const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
function plink(i = Math.floor(Math.random() * scale.length), vol = 0.05) { if (soundOn && ac) tone(scale[i % scale.length], ac.currentTime, 0.5, vol); }
function startMusic() {
  ac = new (window.AudioContext || window.webkitAudioContext)();
  const mel = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 523.25, 392];
  const bar = () => { if (!soundOn) return; const n = ac.currentTime; mel.forEach((f, i) => tone(f, n + i * 0.72, 1.4, 0.012)); [130.81, 196].forEach((f) => tone(f, n, 5.6, 0.008)); };
  bar(); musicTimer = setInterval(bar, 5900);
}
$('#soundToggle').addEventListener('click', (e) => {
  soundOn = !soundOn;
  try {
    if (soundOn) startMusic(); else { clearInterval(musicTimer); ac && ac.close(); ac = null; }
  } catch (err) { soundOn = false; }
  e.currentTarget.classList.toggle('on', soundOn);
  e.currentTarget.setAttribute('aria-pressed', soundOn);
  $('#soundLabel').textContent = soundOn ? 'sound on' : 'sound off';
});

/* ---------- effects ---------- */
const fx = $('#fx');
function burst(x, y, syms, n = 10, spread = 130) {
  for (let i = 0; i < n; i++) {
    const el = document.createElement('span');
    el.className = 'fx'; el.textContent = pick(syms);
    el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.fontSize = 14 + Math.random() * 14 + 'px';
    fx.appendChild(el);
    const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * spread;
    el.animate([
      { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d - 30}px)) scale(1.1) rotate(${Math.random() * 90}deg)`, opacity: 1, offset: .6 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d + 60}px)) scale(.8)`, opacity: 0 }
    ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => el.remove();
  }
}
function floatText(x, y, text) {
  const el = document.createElement('span');
  el.className = 'fx'; el.textContent = text;
  el.style.cssText += `left:${x}px;top:${y}px;font:700 15px 'DM Sans';color:var(--accent);text-shadow:0 1px 0 #fff`;
  fx.appendChild(el);
  el.animate([{ transform: 'translate(-50%,0)', opacity: 1 }, { transform: 'translate(-50%,-50px)', opacity: 0 }], { duration: 900 }).onfinish = () => el.remove();
}
const centerOf = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

/* ---------- healing meter ---------- */
let power = 0, level = 1;
const cheers = [
  ['Fully charged!', 'Your healing power just levelled up. Your body is quietly doing its best work.'],
  ['Level up! 🎉', 'Look at you, collecting sunshine. Rest is a skill and you are excellent at it.'],
  ['Sunshine overload!', 'That is the good kind of overload. Please enjoy a long, cozy nap as a reward.'],
  ['You did it!', 'Every little bit counts. Healing is made of small things exactly like this.']
];
function heal(n) {
  power += n;
  if (power >= 100) {
    power = 0; level++;
    $('#meterFill').style.width = '100%';
    setTimeout(() => { $('#meterFill').style.width = '0%'; $('#meterLevel').textContent = 'lvl ' + level; }, 700);
    const [h, p] = pick(cheers);
    const o = document.createElement('div');
    o.className = 'celebrate';
    o.innerHTML = `<div><big>${face}</big><b>${h}</b><p>${p}</p><button class="big-btn">Keep going ✨</button></div>`;
    document.body.appendChild(o);
    o.querySelector('button').onclick = () => o.remove();
    const W = innerWidth;
    for (let i = 0; i < 6; i++) setTimeout(() => burst(Math.random() * W, innerHeight * .3, ['🎉', '✨', '💛', '🌸', '⭐', '🎈'], 12, 220), i * 180);
    if (soundOn && ac) [0, 2, 3, 5].forEach((k, i) => tone(scale[k], ac.currentTime + i * 0.1, 0.8, 0.05));
  } else {
    $('#meterFill').style.width = power + '%';
  }
}
$('#meterLevel').textContent = 'lvl 1';

/* ---------- tabs ---------- */
const tabs = document.querySelectorAll('.tab[data-tab]');
function show(name) {
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === 'panel-' + name));
  name === 'pop' ? startPop() : stopPop();
  if (name === 'rx') $('#rxNote').textContent = pick(sideEffects);
}
tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.tab)));

/* ---------- buddy ---------- */
const buddy = $('#buddy'), talk = $('#talk');
const lines = [
  'You are doing better than you think.', 'Your only job today is to rest.', 'Be as gentle with yourself as you would be with a friend.',
  'Today does not have to be productive to be worthwhile.', 'Brighter days are already on their way.', 'I am so proud of you for resting.',
  'Slow is still moving. 🐌', 'Fun fact: naps are medically adorable.', 'Tell the to-do list it can wait.',
  'Blankets: a very underrated medicine.', 'You are so deeply cared for.', 'Okay, but have you had some water? 💧',
  'Take this one hour at a time.', 'I am not going anywhere. Take your time.', 'Psst. You matter a lot.'
];
let queue = [], say = (t) => { talk.classList.add('swap'); setTimeout(() => { talk.textContent = t; talk.classList.remove('swap'); }, 220); };
const nextLine = () => { if (!queue.length) queue = shuffle(lines); return queue.pop(); };
talk.textContent = visits > 1 ? `You're back! ${pick(['Yay! 🎉', 'I missed you.', 'Perfect timing.'])}` : `Hi! I'm ${buddyName}. Tap me!`;
let taps = 0, tapTimer;
function anim(cls) { buddy.classList.remove('boing', 'spin', 'munch'); void buddy.offsetWidth; buddy.classList.add(cls); }
buddy.addEventListener('click', (e) => {
  taps++; clearTimeout(tapTimer); tapTimer = setTimeout(() => (taps = 0), 1200);
  const [x, y] = centerOf(buddy);
  if (taps >= 5) { taps = 0; anim('spin'); say('Wheeee! Dizzy but happy! 🌀'); burst(x, y, ['🌀', '✨', '⭐'], 14, 160); heal(12); plink(5); return; }
  anim('boing'); say(nextLine()); burst(x, y - 30, ['♡', '💛', '✨'], 6, 90); heal(4); plink(); resetIdle();
});
document.querySelectorAll('.treats button').forEach((b) => b.addEventListener('click', () => {
  const [x, y] = centerOf(buddy), r = b.getBoundingClientRect();
  const el = document.createElement('span');
  el.className = 'fx'; el.textContent = b.dataset.treat; el.style.fontSize = '30px';
  fx.appendChild(el);
  el.animate([{ left: r.left + 20 + 'px', top: r.top + 'px', transform: 'scale(1)' }, { left: x + 'px', top: y + 'px', transform: 'scale(.3)' }], { duration: 450, easing: 'ease-in' }).onfinish = () => {
    el.remove(); anim('munch'); say(b.dataset.say); burst(x, y, ['💖', '✨', b.dataset.treat], 9, 110); heal(8); plink(3); floatText(x, y - 60, '+8');
  };
  resetIdle();
}));
let idleT;
function resetIdle() { clearTimeout(idleT); idleT = setTimeout(() => { if ($('#panel-buddy').classList.contains('active')) { anim('boing'); say(pick(['Psst, still here. 💛', 'Want to pop some bubbles?', 'Maybe a little stretch?', 'Boop me!'])); } resetIdle(); }, 15000); }
resetIdle();

/* ---------- pop game ---------- */
const arena = $('#arena');
const words = ['rest', 'breathe', 'water', 'hugs', 'sleep', 'smile', 'tea', 'cozy', 'calm', 'warmth', 'soup', 'brave', 'loved', 'gentle', 'slow', 'sun', 'healing', 'peace', 'snuggle', 'hope'];
const colors = ['#ffd9dc', '#d6ecff', '#e0f6d8', '#f1e0ff', '#fff0c4', '#d8f5ef'];
let popTimer = null, popped = 0;
function spawn() {
  const h = arena.clientHeight; if (!h) return;
  const gold = Math.random() < 0.12, size = gold ? 84 : 58 + Math.random() * 30;
  const b = document.createElement('button');
  b.className = 'pop' + (gold ? ' gold' : '');
  b.textContent = gold ? '★ ' + pick(words) : pick(words);
  b.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * (arena.clientWidth - size)}px;--c:${pick(colors)};--h:${h + 140}px;--sway:${Math.random() * 60 - 30}px;--d:${6 + Math.random() * 4}s`;
  b.addEventListener('animationend', (e) => { if (e.animationName === 'rise') b.remove(); });
  b.addEventListener('pointerdown', (e) => {
    e.preventDefault(); if (b.classList.contains('bust')) return;
    b.classList.add('bust'); setTimeout(() => b.remove(), 300);
    popped++; $('#popCount').textContent = popped;
    const x = e.clientX, y = e.clientY;
    burst(x, y, gold ? ['⭐', '✨', '💛'] : ['·', '✧', '♡'], gold ? 14 : 5, gold ? 150 : 60);
    floatText(x, y - 14, gold ? '+12' : '+3'); heal(gold ? 12 : 3); plink(Math.floor(Math.random() * 6), gold ? 0.07 : 0.04);
  });
  arena.appendChild(b);
}
function startPop() { if (popTimer) return; for (let i = 0; i < 4; i++) setTimeout(spawn, i * 250); popTimer = setInterval(spawn, 650); }
function stopPop() { clearInterval(popTimer); popTimer = null; arena.innerHTML = ''; }

/* ---------- doctor's orders ---------- */
const rx = [
  ['☕ warm tea', '🥣 hot soup', '💧 cold water', '🍯 honey in tea', '🍊 an orange', '🍌 a banana', '🥛 warm milk', '🍫 one square of chocolate', '🫖 ginger tea'],
  ['🛋️ lie down', '🧦 put on cozy socks', '🎧 favourite playlist', '📺 a comfort show', '🪟 crack a window', '🧘 5 slow breaths', '😴 a 20-minute nap', '📖 re-read a favourite', '🌤️ sit in the sun'],
  ['💛 you are loved', '🌱 you are healing', '🐌 slow is fine', '🎈 tomorrow is lighter', '🫶 nothing to prove', '🌈 this will pass', '🧡 you are enough', '✨ small wins count']
];
const sideEffects = ['side effects may include smiling.', 'best taken with a blanket.', 'no refills needed. Come back anytime.', 'doctor-approved by a very cute buddy.', 'may cause sudden cosiness.', 'warning: highly lovable patient.', 'repeat as often as needed.'];
let rolling = false;
$('#rollBtn').addEventListener('click', () => {
  if (rolling) return; rolling = true; $('#rollBtn').disabled = true;
  $('#rxNote').textContent = 'consulting the stars...';
  let done = 0;
  rx.forEach((list, i) => {
    const el = $('#reel' + i), row = el.parentElement;
    row.classList.add('spinning');
    const iv = setInterval(() => { el.textContent = pick(list); plink(i * 2, 0.012); }, 70);
    setTimeout(() => {
      clearInterval(iv); el.textContent = pick(list);
      row.classList.remove('spinning'); row.classList.remove('land'); void row.offsetWidth; row.classList.add('land');
      const [x, y] = centerOf(row); burst(x, y, ['✨', '💛'], 5, 90); plink(i * 2 + 1, 0.05);
      if (++done === 3) { rolling = false; $('#rollBtn').disabled = false; $('#rxNote').textContent = pick(sideEffects); heal(10); $('#rollBtn').textContent = 'Roll again 🎲'; }
    }, 700 + i * 450);
  });
});

/* ---------- letter ---------- */
const modal = $('#modal'), letterBody = $('#letterBody');
const mids = [
  'I know being unwell makes everything feel heavier, even the small things. So this is me, quietly sitting beside you for a moment.',
  'You don’t have to be strong right now. You don’t have to answer messages, sound cheerful, or make it look easy.',
  'Resting is not falling behind. It is exactly what healing looks like.',
  'I hope you know how much you matter, not for what you do, but simply for who you are. The world is a little softer with you in it.',
  'Whatever the days bring, good, slow, or heavy, you are not alone in them.',
  'If today is a blanket-and-tea kind of day, then that is the most important thing you can do.'
];
const ends = ['Take all the time you need. I’ll be cheering for you, every single day.', 'Get well soon. Truly. I’m thinking of you today and every day after.', 'Feel better at your own pace. I’ll be right here.'];
const sends = ['With all my love,', 'Thinking of you,', 'Sending hugs,', 'Always in your corner,'];
function openLetter() {
  const paras = [`Dear ${toName || 'you'},`, ...shuffle(mids).slice(0, 3), pick(ends)];
  letterBody.innerHTML = paras.map((t, i) => `<p class="typed" style="animation-delay:${0.5 + i * 0.7}s"></p>`).join('') +
    `<p class="sign typed" style="animation-delay:${0.5 + paras.length * 0.7}s">${pick(sends)}<br><span></span> ♡</p>`;
  letterBody.querySelectorAll('p:not(.sign)').forEach((p, i) => (p.textContent = paras[i]));
  letterBody.querySelector('.sign span').textContent = fromName;
  modal.hidden = false; heal(10);
  burst(innerWidth / 2, innerHeight / 2, ['💌', '♡', '✨'], 10, 160); plink(2);
}
const closeLetter = () => { modal.hidden = true; };
$('#letterTab').addEventListener('click', openLetter);
$('#closeLetter').addEventListener('click', closeLetter);
modal.addEventListener('click', (e) => { if (e.target === modal) closeLetter(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLetter(); });
