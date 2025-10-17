let confetti = [];
let cheerSound;
let stickAngle = -30;
let swing = 0;
let pinataGif, brokenGif;
let broken = false;
let taps = 0;
let breakAt;
let candies = [];
let resetButton;
let loading = true;

const hasLoadSound = (typeof loadSound === 'function');
function safePlayCheer() {
  if (!hasLoadSound) return;
  if (cheerSound && !cheerSound.isPlaying()) {
    cheerSound.setVolume(1);
    cheerSound.stop();
    cheerSound.play();
  }
}

function preload() {
  if (hasLoadSound) {
    cheerSound = loadSound('assets/cheer.mp3', () => {}, () => {});
  }
}

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.elt.style.touchAction = "none";
  colorMode(HSB, 360, 100, 100, 1);

  textAlign(CENTER, CENTER);
  textSize(32);
  breakAt = int(random(6, 12));

  if (hasLoadSound && typeof userStartAudio === 'function') userStartAudio();

  pinataGif = createImg('assets/pinataf.gif', 'pinata');
  pinataGif.attribute("playsinline", "");
  pinataGif.style("pointer-events", "none");
  pinataGif.hide();
  pinataGif.elt.onload = () => { loading = false; pinataGif.show(); };

  brokenGif = createImg('assets/brokenf.gif', 'broken');
  brokenGif.attribute("playsinline", "");
  brokenGif.style("pointer-events", "none");
  brokenGif.hide();

  resizeGifs();

  resetButton = createButton("Reset Piñata");
  resetButton.style("position", "fixed");
  resetButton.style("top", "20px");
  resetButton.style("left", "20px");
  resetButton.style("z-index", "9999");
  resetButton.style("padding", "12px 24px");
  resetButton.style("font-size", "18px");
  resetButton.style("background", "#ffcccc");
  resetButton.style("border", "2px solid #000");
  resetButton.style("cursor", "pointer");
  resetButton.elt.addEventListener("click", resetGame, { passive: true });
  resetButton.elt.addEventListener("touchstart", resetGame, { passive: true });

  setTimeout(() => { if (loading) { loading = false; pinataGif.show(); } }, 3000);
}

function draw() {
  drawGlowBackground();

  if (loading) {
    fill(0, 0, 20);
    textSize(40);
    text("Loading Piñata...", width / 2, height / 2);
    return;
  }

  if (!broken) {
    pinataGif.show();
    brokenGif.hide();

    push();
    translate(width / 2 - 120, height - 100);
    rotate(radians(stickAngle + swing));
    stroke(30, 60, 40);
    strokeWeight(15);
    line(0, 0, 180, -180);
    pop();

    if (swing > 0) swing -= 2;

    fill(0, 0, 100);
    text("Taps: " + taps + " / ??", width / 2, height - 50);
  } else {
    pinataGif.hide();
    brokenGif.show();

    for (let c of candies) { c.update(); c.show(); }
    for (let f of confetti) { f.update(); f.show(); }

    fill(0, 0, 100);
    text("It took " + taps + " taps!", width / 2, height - 50);
    textSize(40);
    text("🎉 You did it! 🎉", width / 2, height / 2 + 200);
    text("Tap Reset to play again", width / 2, height / 2 + 250);
  }
}

function touchStarted() { registerTap(); return false; }
function mousePressed()  { registerTap(); return false; }

function registerTap() {
  if (!broken) {
    taps++;
    swing = 20;
    if (taps >= breakAt) {
      broken = true;
      spawnCandies();
      spawnConfetti();
      safePlayCheer();
    }
  }
}

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
  update(){ this.y += this.speed; this.angle += this.rotationSpeed; }
  show(){
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
  update(){ this.y += this.speedY; this.x += this.speedX; this.angle += this.rotationSpeed; }
  show(){
    push(); translate(this.x, this.y); rotate(this.angle);
    fill(this.color); noStroke(); rectMode(CENTER);
    rect(0, 0, this.size, this.size); 
    pop();
  }
}

function resetGame() {
  broken = false;
  taps = 0;
  candies = [];
  confetti = [];
  breakAt = int(random(6, 12));
  pinataGif.show();
  brokenGif.hide();
  resizeGifs();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resizeGifs();
}

function resizeGifs() {
  const s = Math.min(width, height) * 0.7;
  if (pinataGif) pinataGif.size(s, s).position((width - s) / 2, (height - s) / 2);
  if (brokenGif) brokenGif.size(s, s).position((width - s) / 2, (height - s) / 2);
}

// 🌈 color-changing glow background
function drawGlowBackground() {
  const h = (millis() * 0.02) % 360;
  background(h, 60, 95);

  noStroke();
  const steps = 12;
  const cx = width / 2, cy = height / 2;
  const maxR = Math.hypot(width, height) * 0.65;
  for (let i = steps; i >= 1; i--) {
    const r = (i / steps) * maxR;
    const a = 0.06 * (i / steps);
    fill((h + i * 15) % 360, 70, 90, a);
    ellipse(cx, cy, r * 2, r * 2);
  }
}
