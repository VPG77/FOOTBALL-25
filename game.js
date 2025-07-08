const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const controls = document.getElementById("controls");

let gameRunning = false;

// Jugador ejemplo
const player = {
  x: 400,
  y: 225,
  radius: 15,
  color: "white",
  speed: 4,
  dx: 0,
  dy: 0,
};

const ball = {
  x: 400,
  y: 225,
  radius: 10,
  color: "yellow",
  dx: 0,
  dy: 0,
  speed: 5,
};

function startQuickMatch() {
  menu.style.display = "none";
  canvas.style.display = "block";
  controls.style.display = "block";
  gameRunning = true;
  player.x = 400;
  player.y = 225;
  ball.x = 400;
  ball.y = 225;
  ball.dx = 3;
  ball.dy = 3;
  requestAnimationFrame(gameLoop);
}

function startTournament() {
  alert("Modo Torneo no implementado aún.");
}

function startCareer() {
  alert("Modo Carrera no implementado aún.");
}

function playerAction(action) {
  if (!gameRunning) return;
  if (action === "pass") {
    ball.dx = 5;
    ball.dy = 0;
  } else if (action === "shoot") {
    ball.dx = 7;
    ball.dy = 0;
  } else if (action === "dribble") {
    player.speed = 6;
    setTimeout(() => (player.speed = 4), 1000);
  }
}

document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  if (e.key === "ArrowUp") player.dy = -player.speed;
  if (e.key === "ArrowDown") player.dy = player.speed;
  if (e.key === "ArrowLeft") player.dx = -player.speed;
  if (e.key === "ArrowRight") player.dx = player.speed;
});

document.addEventListener("keyup", (e) => {
  if (!gameRunning) return;
  if (["ArrowUp", "ArrowDown"].includes(e.key)) player.dy = 0;
  if (["ArrowLeft", "ArrowRight"].includes(e.key)) player.dx = 0;
});

function movePlayer() {
  player.x += player.dx;
  player.y += player.dy;

  // Límites del canvas
  if (player.x - player.radius < 0) player.x = player.radius;
  if (player.x + player.radius > canvas.width) player.x = canvas.width - player.radius;
  if (player.y - player.radius < 0) player.y = player.radius;
  if (player.y + player.radius > canvas.height) player.y = canvas.height - player.radius;
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Rebote en bordes
  if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.dx = -ball.dx;
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) ball.dy = -ball.dy;

  // Colisión simple con jugador
  const distX = ball.x - player.x;
  const distY = ball.y - player.y;
  const distance = Math.sqrt(distX * distX + distY * distY);

  if (distance < ball.radius + player.radius) {
    // Rebote bola simple
    ball.dx = -ball.dx;
    ball.dy = -ball.dy;
  }
}

function drawCircle(obj) {
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
  ctx.fillStyle = obj.color;
  ctx.fill();
  ctx.closePath();
}

function drawField() {
  // Fondo ya está verde por CSS, aquí podemos dibujar líneas de campo
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  // Líneas exteriores
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Línea central
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 10);
  ctx.lineTo(canvas.width / 2, canvas.height - 10);
  ctx.stroke();

  // Círculo central
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Área pequeña (porterías)
  ctx.strokeRect(10, (canvas.height / 2) - 50, 30, 100);
  ctx.strokeRect(canvas.width - 40, (canvas.height / 2) - 50, 30, 100);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawField();
  movePlayer();
  moveBall();
  drawCircle(player);
  drawCircle(ball);
  if (gameRunning) requestAnimationFrame(gameLoop);
}

