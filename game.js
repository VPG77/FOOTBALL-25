// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let gameRunning = false;
let currentMode = 'partido';

// --- Equipos inventados y ligas ---
const leagues = ['Liga Futura', 'Super Copa', 'Premier Inventada'];
const teams = [
  { name: 'Real Cosmos', league: leagues[0], color: '#0052cc' },
  { name: 'FC Meteoro', league: leagues[1], color: '#cc0000' },
  { name: 'Atlético Neón', league: leagues[2], color: '#00cc44' },
];

// --- Jugadores ---
class Player {
  constructor(name, position, teamColor) {
    this.name = name;
    this.position = position; // 'DEL', 'MED', 'DEF', 'POR'
    this.x = 0;
    this.y = 0;
    this.speed = 2 + Math.random() * 1.5;
    this.radius = 12;
    this.color = teamColor;
    this.hasBall = false;
    this.rating = (60 + Math.floor(Math.random() * 40)); // 60-100
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.hasBall ? 'yellow' : 'black';
    ctx.shadowBlur = this.hasBall ? 15 : 0;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Nombre pequeño debajo
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x, this.y + 22);

    // Valoración arriba
    ctx.fillStyle = 'lightgreen';
    ctx.font = '12px Arial';
    ctx.fillText(`⭐${this.rating}`, this.x, this.y - 18);
  }
}

// --- Balón ---
class Ball {
  constructor() {
    this.x = WIDTH / 2;
    this.y = HEIGHT / 2;
    this.radius = 8;
    this.speedX = 0;
    this.speedY = 0;
    this.friction = 0.98;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 15;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Fricción para frenarlo poco a poco
    this.speedX *= this.friction;
    this.speedY *= this.friction;

    // Limites cancha
    if(this.x < this.radius) { this.x = this.radius; this.speedX *= -0.7; }
    if(this.x > WIDTH - this.radius) { this.x = WIDTH - this.radius; this.speedX *= -0.7; }
    if(this.y < this.radius) { this.y = this.radius; this.speedY *= -0.7; }
    if(this.y > HEIGHT - this.radius) { this.y = HEIGHT - this.radius; this.speedY *= -0.7; }
  }
}

// --- Variables globales ---
let playersTeamA = [];
let playersTeamB = [];
let ball;
let controlledPlayerIndex = 0;
let scoreA = 0;
let scoreB = 0;

// --- Inicializar jugadores ---
function initPlayers() {
  playersTeamA = [];
  playersTeamB = [];

  // 11 jugadores por equipo: 1 POR, 4 DEF, 4 MED, 2 DEL
  const positionsOrder = ['POR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'MED', 'DEL', 'DEL'];

  for(let i=0; i<11; i++) {
    playersTeamA.push(new Player(`A${i+1}`, positionsOrder[i], teams[0].color));
    playersTeamB.push(new Player(`B${i+1}`, positionsOrder[i], teams[1].color));
  }

  // Posiciones simples (ajusta a gusto)
  playersTeamA.forEach((p,i) => {
    p.x = 100 + i*50;
    p.y = 100 + (i%3)*100;
  });

  playersTeamB.forEach((p,i) => {
    p.x = WIDTH - 150 - i*50;
    p.y = 100 + (i%3)*100;
  });
}

// --- Estado controles ---
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;

  // Cambiar jugador con Tab
  if(e.key === 'Tab') {
    e.preventDefault();
    controlledPlayerIndex = (controlledPlayerIndex + 1) % playersTeamA.length;
  }
});
window.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

// --- Función para controlar jugador ---
function controlPlayer(player) {
  if(keys['arrowup']) player.y -= player.speed;
  if(keys['arrowdown']) player.y += player.speed;
  if(keys['arrowleft']) player.x -= player.speed;
  if(keys['arrowright']) player.x += player.speed;

  // Limitar dentro cancha
  player.x = Math.min(Math.max(player.radius, player.x), WIDTH - player.radius);
  player.y = Math.min(Math.max(player.radius, player.y), HEIGHT - player.radius);

  // Pase Z
  if(keys['z']) {
    if(player.hasBall) {
      kickBall(player, 5); // Pase fuerte a la derecha
      player.hasBall = false;
    }
  }

  // Chutar X
  if(keys['x']) {
    if(player.hasBall) {
      kickBall(player, 10);
      player.hasBall = false;
    }
  }
}

// --- Balón recibe impulso ---
function kickBall(player, force) {
  // Saco vector dirección jugador más cercano rival simple
  let targetX = player.x + force * 10;
  let targetY = player.y;
  ball.speedX = force;
  ball.speedY = 0;
  ball.x = player.x + player.radius + ball.radius + 2;
  ball.y = player.y;
}

// --- Detectar colisión jugador y balón ---
function checkBallControl() {
  let player = playersTeamA[controlledPlayerIndex];
  let dx = ball.x - player.x;
  let dy = ball.y - player.y;
  let dist = Math.sqrt(dx*dx + dy*dy);

  if(dist < ball.radius + player.radius) {
    player.hasBall = true;
    ball.speedX = 0;
    ball.speedY = 0;
    ball.x = player.x + player.radius + ball.radius;
    ball.y = player.y;
  } else {
    player.hasBall = false;
  }
}

// --- Bot enemigo simple ---
function botMove() {
  // Bot mueve balon de forma random simple para demo
  let bot = playersTeamB[0];
  if(!bot.hasBall && Math.random() < 0.01) {
    bot.hasBall = true;
    ball.x = bot.x + bot.radius + ball.radius;
    ball.y = bot.y;
    ball.speedX = -3;
  }

  if(bot.hasBall) {
    ball.x += ball.speedX;
    ball.y += ball.speedY;
  }
}

// --- Actualizar marcador ---
function updateScore() {
  document.getElementById('scoreboard').textContent = `${scoreA} - ${scoreB}`;
}

// --- Dibujar cancha simplificada ---
function drawField() {
  // Fondo
  ctx.fillStyle = '#0b3d02';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Líneas cancha
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;

  // Rectángulo borde cancha
  ctx.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);

  // Línea medio campo
  ctx.beginPath();
  ctx.moveTo(WIDTH/2, 10);
  ctx.lineTo(WIDTH/2, HEIGHT-10);
  ctx.stroke();

  // Círculo medio campo
  ctx.beginPath();
  ctx.arc(WIDTH/2, HEIGHT/2, 70, 0, Math.PI * 2);
  ctx.stroke();

  // Porterías simplificadas
  ctx.strokeRect(5, HEIGHT/2 - 50, 10, 100);
  ctx.strokeRect(WIDTH-15, HEIGHT/2 - 50, 10, 100);
}

// --- Función principal juego ---
function gameLoop() {
  if(!gameRunning) return;

  // Actualizar lógica
  controlPlayer(playersTeamA[controlledPlayerIndex]);
  checkBallControl();
  ball.update();
  botMove();
  updateScore();

  // Dibujar todo
  drawField();

  // Dibujar jugadores
  playersTeamA.forEach(p => p.draw());
  playersTeamB.forEach(p => p.draw());

  // Dibujar balón
  ball.draw();

  // Info jugador controlado
  let currentPlayer = playersTeamA[controlledPlayerIndex];
  document.getElementBy
