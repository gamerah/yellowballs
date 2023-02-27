// Tiny Yellow Balls
// A Gamerah Project

// `offsetX`, `offsetY`: the offset where our 9x16 "subcanvas" will be drawn
// `subW`, `subH`: dimensions of our "subcanvas"
// (not really a canvas itself, just the area we draw onto)
let offsetX, offsetY, subW, subH;

// Ball instance
let ball;
// Txoropito instances
let txoropito1, txoropito2;

// Variables to reset after each game
let score,
  lives,
  max_balls_in_wave,
  balls_in_this_wave,
  last_spawn,
  spawn_period;

// Time when game over happened
let gameover_time;
// Time to wait after game over, before retrying
const gameover_retry_waiting_time = 3000;

// Preload images form the spritesheet
let spritedata;
let spritesheet;

function preload() {
  spritedata = loadJSON("assets/ballmer.json");
  spritesheet = loadImage("assets/ballmer.png");
}

function setup() {
  gameover_time = null;
  score = 0;
  lives = 3;
  max_balls_in_wave = 20;
  balls_in_this_wave = 0;
  last_spawn = 0;
  spawn_period = 1000;
  // The canvas should cover the whole viewport
  createCanvas(windowWidth, windowHeight);
  // `windowResized` is automatically called by p5.js on window resized events,
  // but we call it here manually to initialize the offset and dimensions
  // of the area we will be drawing onto
  windowResized();

  // Ball setup
  ball = [];
  txoropito1 = new txoropito(+1);
  txoropito2 = new txoropito(-1);
  noStroke();

  console.log(spritedata);
}

function draw() {
  background(192);
  // `push` remembers the current `translate` offsets as a checkpoint
  // Offsets are currently 0, 0 since we have not called translate yet
  push();
  // Everything we draw after `translate` will be added the given offsets
  translate(offsetX, offsetY);

  // Draw a white rectangle covering the 9x16 area
  rect(0, 0, subW, subH);

  drawBackground();
  drawBalls();
  drawTxoropitos();
  drawScore();
  image(spritesheet, 0, 0);

  // Revert the effects of `translate` by going back to the previous offset checkpoint
  pop();
}

function drawBalls() {
  // console.log("balls:" + ball.length + " max_balls_in_wave:" + max_balls_in_wave + ' since last_spawn:' + (millis() - last_spawn));
  if (ball.length < max_balls_in_wave && millis() - last_spawn > spawn_period) {
    var span = Math.random();
    ball.push(new yellowBall(+1, span));
    ball.push(new yellowBall(-1, span));
    var span = Math.random();
    if (span >= 0.5) {
      ball.push(new yellowBall(+1, span));
    } else {
      ball.push(new yellowBall(-1, span));
    }
    balls_in_this_wave = balls_in_this_wave + 3;
    last_spawn = millis();
  }
  if (ball.length >= max_balls_in_wave && millis() - last_spawn > 5000) {
    max_balls_in_wave = max_balls_in_wave + 10;
    spawn_period = spawn_period - 50;
  }

  ball.forEach(function (b) {
    if (lives > 0) {
      b.move();
    }
    b.display();
  });
  for (var i = ball.length - 1; i >= 0; i--) {
    if (
      ball[i].y > txoropito1.y + ball[i].diameter &&
      ball[i].was_hit !== true
    ) {
      ball[i].color = color(200, 150, 50);
      if (ball[i].was_scored !== true && lives > 0) {
        score = score + 1;
        ball[i].was_scored = true;
      }
    }
  }
  for (var i = ball.length - 1; i >= 0; i--) {
    if (ball[i].y > subH) {
      ball.splice(i, 1);
    }
  }
}

function drawBackground() {
  // Red sun
  fill(255, 0, 0);
  ellipse(subW / 5, subH / 12, subW / 5, subW / 5);

  // Black horizon
  fill(0);
  ellipse(subW / 2, subH * 4, subH * 6.8, subH * 6.8);
}

function drawScore() {
  // Score
  fill(0);
  textSize(0.04 * subW);
  text(score, subW / 20, subH / 12);

  // Hearts
  var lives_cache = lives;
  var lives_str = "";
  while (lives_cache > 0) {
    lives_str += "♥";
    lives_cache = lives_cache - 1;
  }
  fill(255, 0, 0);
  textAlign(RIGHT);
  text(lives_str, subW - subW / 10, subH / 12);
  if (lives < 1) {
    text("UR REKT", subW - subW / 10, subH / 12);
  }
  if (
    gameover_time != null &&
    millis() > gameover_time + gameover_retry_waiting_time - 200
  ) {
    text("RETRY", subW / 2, subH / 2);
  }
}

function drawTxoropitos() {
  if (lives > 0) {
    txoropito1.move();
    txoropito2.move();
  }
  txoropito1.display();
  txoropito2.display();
}

class txoropito {
  constructor(sign) {
    // `x` and `y` are the position in pixels within the subcanvas
    this.x = subW / 2;
    this.y = subH - subH / 6;

    this.color = color(100, 200, 255);
    this.diameter = subW / 16;
    this.speed = (sign * subW) / 128;

    this.move = function () {
      this.speed = (sign * subW) / 128;
      if (mouseIsPressed || keyIsPressed) {
        this.x = this.x + this.speed;
      } else {
        this.x = this.x - this.speed;
      }
      if (this.speed > 0 && this.x < subW / 2 + this.diameter / 2) {
        this.x = subW / 2 + this.diameter / 2;
      } else if (this.speed < 0 && this.x > subW / 2 - this.diameter / 2) {
        this.x = subW / 2 - this.diameter / 2;
      }
      if (this.x > subW - this.diameter / 2) {
        this.x = subW - this.diameter / 2;
      } else if (this.x < this.diameter / 2) {
        this.x = this.diameter / 2;
      }
    };

    this.display = function () {
      this.y = subH - subH / 6;
      this.diameter = subW / 16;
      fill(this.color);
      rect(
        this.x - this.diameter / 2,
        this.y - this.diameter / 2,
        this.diameter,
        this.diameter
      );
    };
  }
}

class yellowBall {
  constructor(sign, span) {
    this.sign = sign;
    this.span = span;
    this.was_hit = false;
    this.was_scored = false;
    this.diameter = subW / 20;
    this.color = color(255, 204, 0);
    this.x = subW / 5;
    this.y = subH / 12;

    this.move = function () {
      var framestofall = 300;
      this.yspeed = (subH * (1 - subH / 12 / subH - 1 / 6)) / framestofall;
      var destination = (subW * (1 + this.sign * this.span)) / 2;
      this.xspeed = (destination - subW / 5) / framestofall;

      this.x = this.x + this.xspeed;
      this.y = this.y + this.yspeed;
      if (
        dist(this.x, this.y, txoropito1.x, txoropito1.y) <
          this.diameter / 2 + txoropito1.diameter / 2 ||
        dist(this.x, this.y, txoropito2.x, txoropito2.y) <
          this.diameter / 2 + txoropito2.diameter / 2
      ) {
        this.color = color(255, 0, 0);
        if (this.was_hit !== true) {
          lives = lives - 1;
          if (gameover_time === null && lives < 1) {
            gameover_time = millis();
          }
        }
        this.was_hit = true;
      }
    };

    this.display = function () {
      this.diameter = subW / 20;
      fill(this.color);
      ellipse(this.x, this.y, this.diameter, this.diameter);
    };
  }
}

function windowResized() {
  // We want to resize the whole p5.js canvas
  // to make sure it always is the same size as the viewport
  resizeCanvas(windowWidth, windowHeight);
  // This is the aspect ratio of the viewport,
  // which will usually be bigger (wider) or smaller (taller) than 9:16
  const windowAspect = windowWidth / windowHeight;
  // console.log(
  //   "windowAspect",
  //   windowAspect,
  //   (windowAspect * 16).toFixed(2) + ":16"
  // );
  if (windowAspect > 9 / 16) {
    // If we have a wide viewport
    // console.log("margin on the sides");
    // We match the viewport's height
    subH = windowHeight;
    // and calculate the width that will result in 9:16
    subW = (windowHeight * 9) / 16;
  } else {
    // If we have a tall viewport
    // console.log("margin on top and bottom");
    subW = windowWidth;
    subH = (windowWidth * 16) / 9;
  }
  // console.log("canvas", windowWidth, windowHeight, "subW subH", subW, subH);
  // Initialize the offsets for `translate`
  offsetX = (windowWidth - subW) / 2;
  offsetY = (windowHeight - subH) / 2;
}

function mousePressed() {
  if (
    gameover_time != null &&
    millis() > gameover_time + gameover_retry_waiting_time
  ) {
    setup();
  }
}
function keyPressed() {
  mousePressed();
}
