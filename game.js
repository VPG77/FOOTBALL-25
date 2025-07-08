const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// Equipaciones y dificultad
let difficultyLevel = 2; // 0 fácil, 5 experto
const teamKits = {
  'Real Cosmos': { home: '#0047ab', away: '#ffffff' },
  'FC Meteoro': { home: '#d40000', away: '#ffcc00' }
};
let currentKit = 'home';

// Jugadores y equipos
const teams = [
  { name: 'Real Cosmos' },
  { name: 'FC Meteoro' }
];

const positionsOrder = ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'];
let playersTeamA = [];
let playersTeamB = [];

let controlledPlayerIndex = 0; // jugador controlado del equipo A
let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speedX: 0,
  speedY: 0,
};

class Player {
  constructor(name, position, teamName) {
    this.name = name;
    this.position = position;
    this.teamName = teamName;
    this.x = 0;
    this.y = 0;
    this.speed = 2 + Math.random() * 1.5;
    this.radius = 12;
    this.color = teamKits[teamName][currentKit];
    this.hasBall = false;
    this.rating = 60 + Math.floor(Math.random() * 40); // rating 60-99
  }
  
  updateColor() {
    this.color = teamKits[this.teamName][currentKit];
  }

  draw() {
    this.updateColor();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();

    // Dibuja el nombre debajo
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x, this.y + 20);

    // Dibuja rating arriba
    ctx.fillStyle = 'gold';
    ctx.fillText(`⭐${this.rating}`, this.x, this.y - 15);

    // Si tiene balón
    if(this.hasBall) {
      ctx.beginPath();
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = 3;
      ctx.arc(this.x, this.y, this.radius + 4, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  moveTowards(targetX, targetY) {
    let dx = targetX - this.x;
    let dy = targetY - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if(dist > 1) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
  }
}

function initPlayers() {
  playersTeamA = [];
  playersTeamB = [];
  // Posiciones distribuidas en el campo
  let startX_A = 200;
  let startX_B = canvas.width - 200;
  let startY = 100;
  let gapY = (canvas.height - 200) / (positionsOrder.length - 1);

  for(let i=0; i < positionsOrder.length; i++) {
    let pA = new Player(`A${i+1}`, positionsOrder[i], teams[0].name);
    pA.x = startX_A;
    pA.y = startY + gapY * i;
    playersTeamA.push(pA);

    let pB = new Player(`B${i+1}`, positionsOrder[i], teams[1].name);
    pB.x = startX_B;
    pB.y = startY + gapY * i;
    playersTeamB.push(pB);
  }
}
initPlayers();

// Variables para control de teclado y ratón
const keys = {};
let mouse = {
  left: false,
  right: false,
  wheelDelta: 0
};

window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;

  if(e.key === 'Escape') pauseGame();
  if(e.key.toLowerCase() === 'f') showHelp();
  if(e.key.toLowerCase() === 'e') changePlayer();
  if(e.key.toLowerCase() === 'q') markOrTackle();
  if(e.key.toLowerCase() === 'r') runWithCompanion();
  if(e.key.toLowerCase() === 'd') aggressiveTackle();
  if(e.key.toLowerCase() === 's') goalkeeperRush();
  if(e.key === 'ArrowUp') changeTactics('up');
  if(e.key === 'ArrowDown') changeMentality('down');
  if(e.key === 'ArrowLeft') changeMentality('left');
  if(e.key === 'ArrowRight') customTactics();
  if(e.key.toLowerCase() === 'k') toggleKit();

  if(['1','2','3','4','5','6'].includes(e.key)) {
    setDifficulty(parseInt(e.key) - 1);
  }
});

window.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousedown', e => {
  if(e.button === 0) mouse.left = true;
  if(e.button === 2) mouse.right = true;
});

canvas.addEventListener('mouseup', e => {
  if(e.button === 0) mouse.left = false;
  if(e.button === 2) mouse.right = false;
});

canvas.addEventListener('wheel', e => {
  mouse.wheelDelta = e.deltaY;
  performSkillMove(mouse.wheelDelta);
});

// Funciones juego

function toggleKit() {
  currentKit = currentKit === 'home' ? 'away' : 'home';
  playersTeamA.forEach(p => p.updateColor());
  playersTeamB.forEach(p => p.updateColor());
  console.log('Equipación cambiada a:', currentKit);
}

function setDifficulty(level) {
  difficultyLevel = Math.min(Math.max(level, 0), 5);
  console.log('Dificultad cambiada a nivel:', difficultyLevel);
}

function changePlayer() {
  controlledPlayerIndex = (controlledPlayerIndex + 1) % playersTeamA.length;
  console.log('Cambiado jugador a:', playersTeamA[controlledPlayerIndex].name);
}

function markOrTackle() {
  console.log('Marcaje o entrada realizada');
}

function runWithCompanion() {
  console.log('Carrera con compañero iniciada');
}

function aggressiveTackle() {
  console.log('Entrada agresiva ejecutada');
}

function goalkeeperRush() {
  console.log('Salida del portero activada');
}

function changeTactics(direction) {
  console.log('Cambiando táctica:', direction);
}

function changeMentality(direction) {
  console.log('Mentalidad cambiada:', direction);
}

function customTactics() {
  console.log('Tácticas personalizadas abiertas');
}

function performSkillMove(delta) {
  if(delta < 0) {
    console.log('Filigrana hacia izquierda');
  } else if(delta > 0) {
    console.log('Filigrana hacia derecha');
  }
}

function pauseGame() {
  console.log('Juego pausado');
}

function showHelp() {
  alert('Controles:\nWASD: mover\nShift: correr\nMouse click izq: pase corto\nMouse click der: pase largo\nE: cambiar jugador\nQ: entrada\nR: carrera\nD: entrada agresiva\nS: salida portero\nK: cambiar equipación\nNúmeros 1-6: dificultad');
}

function update() {
  // Control jugador principal
  let p = playersTeamA[controlledPlayerIndex];
  if(keys['w']) p.y -= p.speed;
  if(keys['s']) p.y += p.speed;
  if(keys['a']) p.x -= p.speed;
  if(keys['d']) p.x += p.speed;
  // Limitar al canvas
  p.x = Math.min(Math.max(p.x, p.radius), canvas.width - p.radius);
  p.y = Math.min(Math.max(p.y, p.radius), canvas.height - p.radius);

  // Bola sigue jugador con balón si tiene
  if(p.hasBall) {
    ball.x = p.x + 20;
    ball.y = p.y;
  } else {
    // simple física bola
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    ball.speedX *= 0.95;
    ball.speedY *= 0.95;

    if(ball.x < ball.radius || ball.x > canvas.width - ball.radius) ball.speedX *= -1;
    if(ball.y < ball.radius || ball.y > canvas.height - ball.radius) ball.speedY *= -1;
  }
}

function drawField() {
  ctx.fillStyle = '#006400';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Líneas de campo
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

  // Línea central
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, 50);
  ctx.lineTo(canvas.width/2, canvas.height - 50);
  ctx.stroke();

  // Círculo central
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, 70, 0, 2 * Math.PI);
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawField();

  // Dibujar jugadores
  playersTeamA.forEach(p => p.draw());
  playersTeamB.forEach(p => p.draw());

  // Dibujar balón
  ctx.beginPath();
  ctx.fillStyle = 'white';
  ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
  ctx.fill();

  // Indicador jugador controlado
  let p = playersTeamA[controlledPlayerIndex];
  ctx.strokeStyle = 'yellow';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius + 5, 0, 2 * Math.PI);
  ctx.stroke();

  // Mostrar dificultad y kit
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText(`Dificultad: ${difficultyLevel + 1}`, 10, 20);
  ctx.fillText(`Equipación: ${currentKit}`, 10, 40);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
