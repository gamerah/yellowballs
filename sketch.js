// Tiny Yellow Balls
// A Gamerah Project

// `offsetX`, `offsetY`: the offset where our 9x16 "subcanvas" will be drawn
// `subW`, `subH`: dimensions of our "subcanvas"
// (not really a canvas itself, just the area we draw onto)
var offsetX, offsetY, subW, subH;

var current_wave = 1;
var score = 0;
var lives = 3;
var ball;
var max_balls_in_wave = 20;
var balls_in_this_wave = 0;
var last_spawn = 0;
var spawn_period = 1000;
var txoropito1;
var txoropito2;
var r = 255,
  g = 0,
  b = 0,
  colorsign = +1;

function setup() {
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
    current_wave = current_wave + 1;
    max_balls_in_wave = max_balls_in_wave + 10;
    spawn_period = spawn_period - 50;
  }

  fill(r, g, b);
  ellipse(subW / 5, subH / 12, subW / 5, subW / 5);
  if (g > 100 || g < 0) {
    colorsign = -colorsign;
  }
  g = g + colorsign;
  b = b + colorsign;
  fill(0);
  ellipse(subW / 2, subH * 4, subH * 6.8, subH * 6.8);
  if (lives > 0) {
    txoropito1.move();
    txoropito2.move();
  }
  txoropito1.display();
  txoropito2.display();
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
  fill(0);
  text(score, subW / 20, subH / 12);
  var lives_cache = lives;
  var lives_str = "";
  while (lives_cache > 0) {
    lives_str += "♥";
    lives_cache = lives_cache - 1;
  }
  fill(255, 0, 0);
  text(lives_str, subW - subW / 8, subH / 12);
  if (lives < 1) {
    text("UR REKT", subW - subW / 6, subH / 12);
  }

  // Revert the effects of `translate` by going back to the previous offset checkpoint
  pop();
}

function txoropito(sign) {
  push();
  // Everything we draw after `translate` will be added the given offsets
  translate(offsetX, offsetY);

  this.x = subW / 2;
  this.y = subH - subH / 6;
  this.color = color(100, 200, 255);
  this.diameter = subW / 16;
  this.speed = (sign * subW) / 128;

  this.move = function () {
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
    fill(this.color);
    rect(
      this.x - this.diameter / 2,
      this.y - this.diameter / 2,
      this.diameter,
      this.diameter
    );
  };

  // Revert the effects of `translate` by going back to the previous offset checkpoint
  pop();
}

function yellowBall(sign, span) {
  push();
  // Everything we draw after `translate` will be added the given offsets
  translate(offsetX, offsetY);

  this.was_hit = false;
  this.was_scored = false;
  this.diameter = subW / 20;
  this.color = color(255, 204, 0);
  this.x = subW / 5;
  this.y = subH / 12;
  var framestofall = 300;
  this.yspeed = (subH * (1 - this.y / subH - 1 / 6)) / framestofall;
  var destination = (subW * (1 + sign * span)) / 2;
  this.xspeed = (destination - this.x) / framestofall;
  // console.log('span:' + sign * span + ' destination:' + destination + ' xspeed:' + this.xspeed);

  this.move = function () {
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
      }
      this.was_hit = true;
    }
  };

  this.display = function () {
    fill(this.color);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  };

  // Revert the effects of `translate` by going back to the previous offset checkpoint
  pop();
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
