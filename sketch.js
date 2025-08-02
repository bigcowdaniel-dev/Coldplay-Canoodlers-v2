// Coldplay Canoodlers v6.0 — Final Fixes

let gridRows = 100;
let gridCols = 100;
let people = [];
let cellSize = 10;

let canoodlerPos;
let score = 0;
let lastScore = 0;
let highScore = 0;

let zoom = 1;
let zoomTarget = 1;
let zoomLerpSpeed = 0.1;

let fillerActions = ["neutral", "flash", "cheer"];
let bgImg, canoodlerImg, crowdImg, homeImg, music, caughtSound;

let gameState = "home";
let musicPlaying = true;
let musicButton;
let foundTimer = 0;

function preload() {
  bgImg = loadImage("stadium.png");
  canoodlerImg = loadImage("canoodler.jpg");
  crowdImg = loadImage("a5cf0564-c3fa-4693-bb82-e6a2dec3357f.png");
  homeImg = loadImage("Homepage.png");
  music = loadSound("viva_la_vida.mp3");
  caughtSound = loadSound("caught.mp3");
}

function setup() {
  createCanvas(960, 540);
  generateCrowd();
  noStroke();
  textFont("monospace");

  musicButton = createButton("🔊 Music: ON");
  musicButton.position(10, height - 30);
  musicButton.mousePressed(toggleMusic);

  if (music && !music.isPlaying()) {
    music.setVolume(1);
    music.loop();
  }
}

function draw() {
  background(0);
  zoom = lerp(zoom, zoomTarget, zoomLerpSpeed);

  if (gameState === "home") {
    if (homeImg) image(homeImg, 0, 0, width, height);
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    text("Last Score: " + lastScore, 20, 20);
    text("High Score: " + highScore, 20, 40);
    return;
  }

  if (bgImg) image(bgImg, 0, 0, width, height);

  let zoomedCellSize = cellSize * zoom;
  let captureW = floor(180 / zoomedCellSize);
  let captureH = floor(120 / zoomedCellSize);

  let mouseGridX = mouseX / width * gridCols;
  let mouseGridY = mouseY / height * gridRows;
  let captureX = floor(mouseGridX - captureW / 2);
  let captureY = floor(mouseGridY - captureH / 2);

  captureX = constrain(captureX, 0, gridCols - captureW);
  captureY = constrain(captureY, 0, gridRows - captureH);

  // Jumbotron Area
  let jumbotronX = 340;
  let jumbotronY = 47;
  let jumbotronW = 280;
  let jumbotronH = 120;

  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(jumbotronX, jumbotronY, jumbotronW, jumbotronH);
  drawingContext.clip();

  let scaleX = jumbotronW / (captureW * cellSize);
  let scaleY = jumbotronH / (captureH * cellSize);
  translate(jumbotronX, jumbotronY);
  scale(scaleX, scaleY);

  // Show crowd background
  image(crowdImg, -captureX * cellSize, -captureY * cellSize, gridCols * cellSize, gridRows * cellSize);

  // Draw canoodler (5x bigger)
  let relX = (canoodlerPos.col - captureX) * cellSize;
  let relY = (canoodlerPos.row - captureY) * cellSize;
  image(canoodlerImg, relX, relY, cellSize * 10, cellSize * 10);

  drawingContext.restore();
  pop();

  // Jumbotron outline
  noFill();
  stroke(255);
  strokeWeight(2);
  rect(jumbotronX, jumbotronY, jumbotronW, jumbotronH);

  // UI
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("SCORE: " + score, 10, 10);
  textAlign(RIGHT, TOP);
  text("🎮 Coldplay Canoodlers", width - 10, 10);

  if (foundTimer > 0) {
    fill(255, 255, 255, 200);
    textAlign(CENTER, CENTER);
    textSize(48);
    text("💋 CANOODLER FOUND!", width / 2, height / 2);
    foundTimer--;
  }
}

function mousePressed() {
  if (gameState === "home") {
    if (mouseY > height * 0.75) {
      score = 0;
      gameState = "playing";
      generateCrowd();
    }
    return;
  }

  let zoomedCellSize = cellSize * zoom;
  let captureW = floor(180 / zoomedCellSize);
  let captureH = floor(120 / zoomedCellSize);
  let mouseGridX = mouseX / width * gridCols;
  let mouseGridY = mouseY / height * gridRows;
  let captureX = floor(mouseGridX - captureW / 2);
  let captureY = floor(mouseGridY - captureH / 2);

  if (
    canoodlerPos.col >= captureX &&
    canoodlerPos.col < captureX + captureW &&
    canoodlerPos.row >= captureY &&
    canoodlerPos.row < captureY + captureH
  ) {
    console.log("💋 NAILED IT");
    score++;
    foundTimer = 60;

    if (music && music.isPlaying()) music.setVolume(0.1);
    if (caughtSound) {
      caughtSound.setVolume(1.0);
      caughtSound.play();
    }
  } else {
    console.log("❌ Missed it");
  }

  lastScore = score;
  if (score > highScore) highScore = score;
  generateCrowd();
}

function keyPressed() {
  if (gameState === "home" && keyCode === ENTER) {
    score = 0;
    gameState = "playing";
    generateCrowd();
  }
}

function mouseWheel(event) {
  let zoomFactor = 0.05;
  zoomTarget -= event.delta * zoomFactor / 100;
  zoomTarget = constrain(zoomTarget, 1, 4);
  return false;
}

function toggleMusic() {
  if (music.isPlaying()) {
    music.pause();
    musicButton.html("🔇 Music: OFF");
  } else {
    music.setVolume(1);
    music.loop();
    musicButton.html("🔊 Music: ON");
  }
}

function generateCrowd() {
  people = [];
  for (let row = 0; row < gridRows; row++) {
    let rowArr = [];
    for (let col = 0; col < gridCols; col++) {
      rowArr.push({
        action: random(fillerActions),
        color: color(255)
      });
    }
    people.push(rowArr);
  }
  let randRow = floor(random(gridRows - 1));
  let randCol = floor(random(gridCols - 1));
  people[randRow][randCol].action = "kiss";
  canoodlerPos = { row: randRow, col: randCol };
}
