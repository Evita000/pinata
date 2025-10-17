let confetti = [];
let cheerSound;
let stickAngle = -30;   // resting angle
let swing = 0;          // swing amount triggered on tap
let pinataGif, brokenGif;
let broken = false;
let taps = 0;
let breakAt;
let candies = [];
let resetButton;
let loading = true;

function preload() {
  // You can comment this out temporarily if audio causes issues on iPhone
  cheerSound = loadSound(
    'assets/cheer.mp3',
    () => console.log("✅ Cheer sound loaded"),
    () => console.log("❌ Failed to load sound")
  );
}

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.elt.style.touchAction = "none"; // stop canvas from eating touches

  // Make the page background visible and remove scrollbars
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";

  userStartAudio();   // unlocks audio on mobile
  textAlign(CENTER, CENTER);
  textSize(32);
  breakAt = int(random(6, 12));   // random taps required

  // intact GIF
  pinataGif = createImg('assets/pinataf.gif');
  pinataGif.attribute("playsinline", "");
  pinataGif.style("pointer-events", "none"); // don't steal taps
  pinataGif.hide();
  pinataGif.elt.onload = () => { loading = false; pinataGif.show(); };

  // broken GIF
  brokenGif = createImg('assets/brokenf.gif');
  brokenGif.attribute("playsinline", "");
  brokenGif.style("pointer-events", "none");
  brokenGif.hide();

  // scale + center gifs initially
  resizeGifs();

  // ✅ reset button
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

  // native listeners for mobile reliability
  resetButton.elt.addEventListener("click", resetGame);
  resetButton.elt.addEventListener("touchstart", resetGame, {passive:true});
}

function draw() {
  // 🌈 Smooth color cycle between warm + cool tones
  let t = frameCount * 0.008;

  // Blend smoothly between two palettes
  let warmR = 255 * (0.5 + 0.5 * sin(t));
  let warmG = 170 * (0.5 + 0.5 * sin(t + 1.5));
  let warmB = 100 * (0.5 + 0.5 * sin(t + 3.0));

  let coolR = 120 * (0.5 + 0.5 * sin(t + 2.5));
  let coolG = 200 * (0.5 + 0.5 * sin(t + 0.8));
  let coolB = 255 * (0.5 + 0.5 * sin(t + 4.0));

  // Mix warm and cool gradually
  let mixAmt = (sin(t * 0.5) + 1) / 2; // oscillates 0–1
  let r = lerp(warmR, coolR, mixAmt);
  let g = lerp(warmG, coolG, mixAmt);
  let b = lerp(warmB, coolB, mixAmt);

  background(r, g, b); // canvas background (behind GIFs)
  document.body.style.backgroundColor = `rgb(${r|0},${g|0},${b|0})`; // page background too

  if (loading) {
    fill(0);
    textSize(40);
    text("Loading Piñata...", width/2, height/2);
    return;
  }

  if (!broken) {
    pinataGif.show();
    brokenGif.hide();

    // swinging stick
    push();
    translate(width/2 - 120, height - 100);
    rotate(radians(stickAngle + swing));
    stroke(80, 50, 20);
    strokeWeight(15);
    line(0, 0, 180, -180);
    pop();

    if (swing > 0) swing -= 2;

    fill(0);
    text("Taps: " + taps + " / ??", width/2, height - 50);

  } else {
    pinataGif.hide();
    brokenGif.show();

    for (let c of candies) { c.update(); c.show(); }
    for (let f of confetti) { f.update(); f.show(); }

    fill(0);
    text("It took " + taps + " taps!", width/2, height - 50);
    textSize(40);
    text("🎉 You did it! 🎉", width/2, height/2 + 200);
    text("Tap Reset to play again", width/2, height/2 + 250);
  }
}

function touchStarted() {
  registerTap();
  return false;
}

function mousePressed() {
  registerTap();
  return false;
}

function registerTap() {
  if (!broken) {
    taps++;
    swing = 20;  // swing the stick
    if (taps >= breakAt) {
      broken = true;
      spawnCandies();
      spawnConfetti();
      if (cheerSound && !cheerSound.isPlaying()) {
        cheerSound.setVolume(1);
        cheerSound.stop();   // restart from beginning
        cheerSound.play();
        console.log("🎵 Cheer sound playing");
      }
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
    this.x = x;
    this.y = y;
    this.r = r;
    this.speed = random(2, 6);
    this.color = color(random(255), random(255), random(255));
    this.angle = random(TWO_PI);
    this.rotationSpeed = random(-0.05, 0.05);
    this.type = random() < 0.5 ? "circle" : "wrapped";
  }
  update() {
    this.y += this.speed;
    this.angle += this.rotationSpeed;
  }
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    if (this.type === "circle") {
      fill(this.color);
      noStroke();
      ellipse(0, 0, this.r, this.r);
    } else {
      fill(this.color);
      noStroke();
      ellipse(0, 0, this.r, this.r);
      triangle(-this.r/2, 0, -this.r, -this.r/3, -this.r, this.r/3);
      triangle(this.r/2, 0, this.r, -this.r/3, this.r, this.r/3);
    }
    pop();
  }
}

class Confetti {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(5, 12);
    this.speedY = random(2, 6);
    this.speedX = random(-2, 2);
    this.color = color(random(255), random(255), random(255));
    this.angle = random(TWO_PI);
    this.rotationSpeed = random(-0.1, 0.1);
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.angle += this.rotationSpeed;
  }
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill(this.color);
    noStroke();
    rectMode(CENTER);
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
  resizeGifs(); // make sure gifs are centered after reset
  console.log("🔄 Game reset");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resizeGifs(); // scale gifs when window resizes
}

// ✅ helper: resize gifs proportionally
function resizeGifs() {
  if (pinataGif && brokenGif) {
    const imgSize = min(width, height) * 0.7;  // 70% of smaller screen side
    pinataGif.size(imgSize, imgSize);
    brokenGif.size(imgSize, imgSize);
    pinataGif.position(width/2 - imgSize/2, height/2 - imgSize/2);
    brokenGif.position(width/2 - imgSize/2, height/2 - imgSize/2);
  }
}
