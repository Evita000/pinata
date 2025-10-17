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

// ---- sound helper (safe if p5.sound missing)
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

  // colorful hues (fixes gray)
  colorMode(HSB, 360, 100, 100, 1);

  textAlign(CENTER, CENTER);
  textSize(32);
  breakAt = int(random(6, 12));

  if (h
