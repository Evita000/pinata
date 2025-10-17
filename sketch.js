/* Piñata Party — v21 mobile-proof */
let confetti = [];
let candies = [];
let cheerSound;
let stickAngle = -30;
let swing = 0;
let pinataGif, brokenGif;
let broken = false;
let taps = 0;
let breakAt;
let resetButton;
let loading = true;

// ---------- p5 lifecycle ----------
function preload() {
  if (typeof loadSound === 'function') {
    try { cheerSound = loadSound('assets/cheer.mp3'); } catch(e) {}
  }
}

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.elt.style.touchAction = "none";  // prevent scroll gestures
  colorMode(HSB, 360, 100, 100, 1);

  textAlign(CENTER, CENTER);
  textSize(32);
  breakAt = int(random(6, 12));

  if (typeof userStartAudio === 'function') userStartAudio();

  // Intact GIF
  pinataGif = createImg('assets/pinataf.gif', 'pinata');
  pinataGif.attribute('playsinline', '');
  pinataGif.style('pointer-events', 'none');    // don’t steal taps
  pinataGif.hide();
  pinataGif.elt.onload = () => { loading = false; pinataGif.show(); };

  // Broken GIF
  brokenGif = createImg('assets/brokenf.gif', 'broken');
  brokenGif.attribute('playsinline', '');
  brokenGif.style('pointer-events', 'none');
  brokenGif.hide();

  resizeGifs();

  // Reset button: fixed position + native listeners (iOS-safe)
  resetButton = createButton("Reset Piñata");
  // Use CSS fixed so it stays above canvas on mobile
  resetButton.addClass('btn-fix');
  resetButton.mousePressed(resetGame); // p5 handler

  // Native handlers with preventDefault (iOS Safari)
  const nativeReset = (e) => { e.preventDefault(); e.stopPropagation(); resetGame(); };
  const btn = resetButton.elt;
  btn.addEventListener('click', nativeReset, { passive: false });
  btn.addEventListener('touchstart', nativeReset, { passive: false });
  btn.addEventListener('touchend', nativeReset, { passive: false });
  btn.addEventListener('pointerdown', nativeReset, { passive: false });

  // Fallback if GIF onload doesn’t fire on some mobiles
  setTimeout(() => { if (loading) { loading = false; pinataGif.show(); } }, 3000);
}

function draw() {
  // 🌈 Smooth, device-proof glow (Canvas HSLA; consistent on iOS/Android)
  drawGlowBackground();

  // Version tag so you can confirm cache-bust on phone/laptop
  noStroke(); fill(255); textSize(12); text('v24', 20, 14);

  // ---- Loading screen text ----
  if (loading) {
    fill(0, 0, 100);
    textSize(40);
    text("🎈 Getting the party ready...", width / 2, height / 2);
    return;
  }

  if (!broken) {
    pinataGif.show(); 
    brokenGif.hide();

    // swinging stick
    push();
    translate(width / 2 - 120, height - 100);
    rotate(radians(stickAngle + swing));
    stroke(30, 60, 40);
    strokeWeight(15);
    line(0, 0, 180, -180);
    pop();
    if (swing > 0) swing -= 2;

    // ---- Tap counter text ----
    fill(0, 0, 100);
    textSize(32);
    text(`Taps: ${taps} / ??`, width / 2, height - 50);

  } else {
    pinataGif.hide(); 
    brokenGif.show();

    for (const c of candies) { c.update(); c.show(); }
    for (const f of confetti) { f.update(); f.show(); }

    // ---- Win texts ----
    fill(0, 0, 100);
    textSize(40);
    text('🎉 You did it! 🎉', width / 2, height / 2 + 200);
    text('💫 Party Unlocked! 💫', width / 2, height / 2 + 250);
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resizeGifs();
}

// ---------- interactions ----------
function touchStarted(){ registerTap(); return false; }
function mousePressed(){ registerTap(); return false; }

function registerTap() {
  if (broken) return;
  taps++;
  swing = 20;
  if (taps >= breakAt) {
    broken = true;
    spawnCandies();
    spawnConfetti();
    if (cheerSound && !cheerSound.isPlaying()) { try { cheerSound.play(); } catch(e) {} }
  }
}

function resetGame() {
  broken = false;
  taps = 0;
  candies = [];
  confetti = [];
  breakAt = int(random(6, 12));
  pinataGif.show(); brokenGif.hide();
  resizeGifs();
}

// ---------- visuals ----------
function resizeGifs() {
  const s = Math.min(width, height) * 0.7;
  if (pinataGif) pinataGif.size(s, s).position((width - s)/2, (height - s)/2);
  if (brokenGif) brokenGif.size(s, s).position((width - s)/2, (height - s)/2);
}

// Device-proof radial glow using Canvas HSLA (not p5 color mode)
function drawGlowBackground() {
  const t = millis() * 0.00025;
  const cx = width / 2, cy = height / 2;
  const maxR = Math.hypot(width, height) * 0.8;

  const hue1 = (t * 120) % 360;
  const hue2 = (hue1 + 120) % 360;
  const hue3 = (hue1 + 240) % 360;

  const ctx = drawingContext;

  const grad = ctx.createRadialGradient(cx, cy, maxR*0.1, cx, cy, maxR);
  grad.addColorStop(0.00, `hsla(${hue1}, 90%, 65%, 1)`);
  grad.addColorStop(0.55, `hsla(${hue2}, 80%, 45%, 0.95)`);
  grad.addColorStop(1.00, `hsla(${hue3}, 90%, 20%, 1)`);
  ctx.save(); ctx.fillStyle = grad; ctx.fillRect(0,0,width,height); ctx.restore();

  const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR*0.6);
  bloom.addColorStop(0, 'rgba(255,255,255,0.08)');
  bloom.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.save(); ctx.fillStyle = bloom; ctx.fillRect(0,0,width,height); ctx.restore();
}

// ---------- candy & confetti ----------
function spawnCandies() {
  candies = [];
  for (let i = 0; i < 30; i++) {
    candies.push(new Candy(random(width), -20, random(10, 25)));
  }
}

function spawnConfetti() {
  confetti = [];
  for (let i = 0; i < 50; i++) {
    confetti.push(new Confetti(random(width), -20));
  }
}

class Candy {
  constructor(x, y, r) {
    this.x = x; this.y = y; this.r = r;
    this.speed = random(2, 6);
    this.color = color(random(360), 80, 100);
    this.angle = random(TWO_PI);
    this.rotationSpeed = random(-0.05, 0.05);
    this.type = random() < 0.5 ? "circle" : "wrapped";
  }
  update() { this.y += this.speed; this.angle += this.rotationSpeed; }
  show() {
    push(); translate(this.x, this.y); rotate(this.angle);
    fill(this.color); noStroke();
    if (this.type === "circle") {
      ellipse(0, 0, this.r, this.r);
    } else {
      ellipse(0, 0, this.r, this.r);
      triangle(-this.r/2, 0, -this.r, -this.r/3, -this.r, this.r/3);
      triangle(this.r/2, 0, this.r, -this.r/3, this.r, this.r/3);
    }
    pop();
  }
}

class Confetti {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.size = random(5, 12);
    this.speedY = random(2, 6);
    this.speedX = random(-2, 2);
    this.color = color(random(360), 80, 100);
    this.angle = random(TWO_PI);
    this.rotationSpeed = random(-0.1, 0.1);
  }
  update() { this.y += this.speedY; this.x += this.speedX; this.angle += this.rotationSpeed; }
  show() {
    push(); translate(this.x, this.y); rotate(this.angle);
    fill(this.color); noStroke(); rectMode(CENTER);
    rect(0, 0, this.size, this.size);
    pop();
  }
}


