// Tiny Yellow Balls
// A Gamerah Project

var offsetX, offsetY, windowMinSide; // Responsive canvas setup
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
  // Canvas
  createCanvas(displayWidth, displayHeight);
  windowResized();

  // Ball setup
  ball = [];
  txoropito1 = new txoropito(+1);
  txoropito2 = new txoropito(-1);
  noStroke();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  windowMinSide = min(windowHeight, windowWidth);
  offsetX = (windowWidth - windowMinSide) / 2;
  offsetY = (windowHeight - windowMinSide) / 2;

  // Setting the display height and width based on the window height
  displayHeight = windowHeight;
  displayWidth = windowHeight * 0.5625; // Ratio 9:16
}

// Fullscreen code taken from @takawo
// Instead mousePressed, let's create a button for this
/*function mousePressed() {
  let fs = fullscreen();
  fullscreen(!fs);
  if (fs) {
      cursor();
  } else {
      noCursor();
  }
}*/

function draw() {
  background(192);
  push();
  //translate(offsetX, offsetY);
  rect(0, 0, displayWidth, displayHeight); // red rectangle
  pop();

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
  ellipse(
    displayWidth / 5,
    displayHeight / 12,
    displayWidth / 5,
    displayWidth / 5
  );
  if (g > 100 || g < 0) {
    colorsign = -colorsign;
  }
  g = g + colorsign;
  b = b + colorsign;
  fill(0);
  ellipse(
    displayWidth / 2,
    displayHeight * 4,
    displayHeight * 6.8,
    displayHeight * 6.8
  );
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
    if (ball[i].y > displayHeight) {
      ball.splice(i, 1);
    }
  }
  fill(0);
  text(score, displayWidth / 20, displayHeight / 12);
  var lives_cache = lives;
  var lives_str = "";
  while (lives_cache > 0) {
    lives_str += "♥";
    lives_cache = lives_cache - 1;
  }
  fill(255, 0, 0);
  text(lives_str, displayWidth - displayWidth / 8, displayHeight / 12);
  if (lives < 1) {
    text("UR REKT", displayWidth - displayWidth / 6, displayHeight / 12);
  }
}

function txoropito(sign) {
  this.x = displayWidth / 2;
  this.y = displayHeight - displayHeight / 6;
  this.color = color(100, 200, 255);
  this.diameter = displayWidth / 16;
  this.speed = (sign * displayWidth) / 128;

  this.move = function () {
    if (mouseIsPressed || keyIsPressed) {
      this.x = this.x + this.speed;
    } else {
      this.x = this.x - this.speed;
    }
    if (this.speed > 0 && this.x < displayWidth / 2 + this.diameter / 2) {
      this.x = displayWidth / 2 + this.diameter / 2;
    } else if (
      this.speed < 0 &&
      this.x > displayWidth / 2 - this.diameter / 2
    ) {
      this.x = displayWidth / 2 - this.diameter / 2;
    }
    if (this.x > displayWidth - this.diameter / 2) {
      this.x = displayWidth - this.diameter / 2;
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
}

function yellowBall(sign, span) {
  this.was_hit = false;
  this.was_scored = false;
  this.diameter = displayWidth / 20;
  this.color = color(255, 204, 0);
  this.x = displayWidth / 5;
  this.y = displayHeight / 12;
  var framestofall = 300;
  this.yspeed =
    (displayHeight * (1 - this.y / displayHeight - 1 / 6)) / framestofall;
  var destination = (displayWidth * (1 + sign * span)) / 2;
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
}
