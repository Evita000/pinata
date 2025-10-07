

 let stickAngle = -30;   // resting angle
let swing = 0;          // swing amount triggered on tap
let pinataGif, brokenGif;
let broken = false;
let taps = 0;
let breakAt = 5;
let candies = [];
let resetButton;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(32);

  // intact GIF
  pinataGif = createImg('assets/pinataf.gif');
  pinataGif.size(300, 300);
  pinataGif.position(width/2 - 150, height/2 - 150);

  // broken GIF
  brokenGif = createImg('assets/brokenf.gif');
  brokenGif.size(300, 300);
  brokenGif.position(width/2 - 150, height/2 - 150);
  brokenGif.hide(); // hidden until piñata breaks

  // reset button
  resetButton = createButton("Reset Piñata");
  resetButton.position(20, 20);
  resetButton.mousePressed(resetGame);
}

function draw() {
  background(random(255), random(255), random(255));

  if (!broken) {
    pinataGif.show();
    brokenGif.hide();

    // draw swinging stick aiming at piñata
    push();
    translate(width/2 - 120, height - 100);    // pivot point bottom-left
    rotate(radians(stickAngle + swing));       // apply swing
    stroke(80, 50, 20);
    strokeWeight(15);
    line(0, 0, 180, -180);                     // stick pointing toward piñata
    pop();

    // gradually return stick to rest
    if (swing > 0) {
      swing -= 2;
    }

    // show tap counter
    text("Taps: " + taps + " / " + breakAt, width/2, height - 50);

  } else {
    pinataGif.hide();
    brokenGif.show();

    // falling candies
    for (let c of candies) {
      c.update();
      c.show();
    }
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
    swing = 20;  // make stick swing
    if (taps >= breakAt) {
      broken = true;
      spawnCandies();
    }
  }
}

function spawnCandies() {
  for (let i = 0; i < 30; i++) {
    candies.push(new Candy(random(width), -20, random(10, 25)));
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

    // 50% chance: circle, 50% chance: wrapped candy
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
      // simple candy circle
      fill(this.color);
      noStroke();
      ellipse(0, 0, this.r, this.r);
    } else {
      // wrapped candy
      fill(this.color);
      noStroke();
      ellipse(0, 0, this.r, this.r); // body
      triangle(-this.r/2, 0, -this.r, -this.r/3, -this.r, this.r/3); // left wrapper
      triangle(this.r/2, 0, this.r, -this.r/3, this.r, this.r/3);   // right wrapper
    }

    pop();
  }
}

function resetGame() {
  broken = false;
  taps = 0;
  candies = [];   // clear old candies
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // reposition gifs when window changes size
  pinataGif.position(width/2 - 150, height/2 - 150);
  brokenGif.position(width/2 - 150, height/2 - 150);
}

