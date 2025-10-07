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
  cheerSound = loadSound('assets/cheer.mp3'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  userStartAudio();   // ✅ unlocks sound on iPhone
  textAlign(CENTER, CENTER);
  textSize(32);

  breakAt = int(random(6, 12));   // random taps required

  recreateGifs(); // ✅ start with fresh gifs

  // reset button
  resetButton = createButton("Reset Piñata");
  resetButton.position(20, 20);
  resetButton.mousePressed(resetGame);
  resetButton.style("z-index","1000");
  resetButton.style("position","fixed");
  resetButton.style("background","#fff");
  resetButton.style("padding","10px 20px");
  resetButton.style("font-size","16px");
  resetButton.style("cursor","pointer");
  resetButton.style("border","2px solid black");
  resetButton.style("border-radius","8px");
}

function draw() {
  background(random(255), random(255), random(255));

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

    text("Taps: " + taps + " / ??", width/2, height - 50);

  } else {
    pinataGif.hide();
    brokenGif.show();

    // falling candies
    for (let c of candies) {
      c.update();
      c.show();
    }

    // falling confetti
    for (let f of confetti) {
      f.update();
      f.show();
    }

    text("It took " + taps + " taps!", width/2, height - 50);
    textSize(40);
    fill(0);
    text("🎉 You did it! 🎉", width/2, height/2 + 200);
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
      if (cheerSound) cheerSound.play();
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

// --- Candy class ---
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

// --- Confetti class ---
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

// --- Gif recreation ---
function recreateGifs() {
  if (pinataGif) pinataGif.remove();
  if (brokenGif) brokenGif.remove();

  pinataGif = createImg('assets/pinataf.gif');
  pinataGif.attribute("playsinline", "");
  pinataGif.size(300, 300);
  pinataGif.position(width/2 - 150, height/2 - 150);
  pinataGif.show();

  brokenGif = createImg('assets/brokenf.gif');
  brokenGif.attribute("playsinline", "");
  brokenGif.size(300, 300);
  brokenGif.position(width/2 - 150, height/2 - 150);
  brokenGif.hide();
}

// --- Reset function ---
function resetGame() {
  broken = false;
  taps = 0;
  breakAt = int(random(6, 12));
  swing = 0;
  stickAngle = -30;

  candies = [];
  confetti = [];

  recreateGifs(); // ✅ ensures gifs reload fresh
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (pinataGif) pinataGif.position(width/2 - 150, height/2 - 150);
  if (brokenGif) brokenGif.position(width/2 - 150, height/2 - 150);
}
