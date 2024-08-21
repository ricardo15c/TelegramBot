// Variables del juego
let points = 0;
let bullets = 6;
let lives = 2;
let isReloading = false;
let gameTime = 60; // en segundos
let gameInterval;
let reloadingInterval;
let enemies = [];
let civilians = [];
let spawnInterval;
let spawnRate = 3000; // Intervalo inicial para aparición en milisegundos
const spawnRateDecrease = 100; // Reducción del intervalo cada segundo

// Configuración inicial
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

function startGame() {
    points = 0;
    bullets = 6;
    lives = 2;
    isReloading = false;
    gameTime = 60;
    enemies = [];
    civilians = [];

    document.getElementById('points').innerText = points;
    document.getElementById('lives').innerText = lives;
    document.getElementById('bullets').innerText = bullets;
    document.getElementById('time').innerText = gameTime;

    if (gameInterval) clearInterval(gameInterval);
    if (reloadingInterval) clearInterval(reloadingInterval);
    if (spawnInterval) clearInterval(spawnInterval);

    gameInterval = setInterval(updateGame, 1000);
    spawnInterval = setInterval(spawnEnemiesAndCivilians, spawnRate);
}

function spawnEnemiesAndCivilians() {
    if (gameTime <= 0) {
        clearInterval(spawnInterval); // Detener la aparición de enemigos y civiles
        return;
    }
    
    if (Math.random() < 0.25) spawnCivilian(); // 1 de cada 4 apariciones es un civil
    else spawnEnemy(); // 3 de cada 4 apariciones es un bandido
}

function spawnEnemy() {
    let x = Math.random() * (canvas.width - 50);
    let y = Math.random() * (canvas.height - 50);
    enemies.push({ x, y, hit: false });
    drawGameObjects();
}

function spawnCivilian() {
    let x = Math.random() * (canvas.width - 50);
    let y = Math.random() * (canvas.height - 50);
    civilians.push({ x, y, hit: false, timeout: setTimeout(() => removeCivilian(x, y), 5000) });
    drawGameObjects();
}

function removeCivilian(x, y) {
    civilians = civilians.filter(civilian => civilian.x !== x || civilian.y !== y);
    drawGameObjects();
}

function drawGameObjects() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'blue';
    for (const enemy of enemies) {
        if (!enemy.hit) {
            ctx.fillRect(enemy.x, enemy.y, 50, 50);
        }
    }

    ctx.fillStyle = 'green';
    for (const civilian of civilians) {
        if (!civilian.hit) {
            ctx.fillRect(civilian.x, civilian.y, 50, 50);
        }
    }

    // Actualiza otros elementos del juego
    document.getElementById('points').innerText = points;
    document.getElementById('lives').innerText = lives;
    document.getElementById('bullets').innerText = bullets;
}

function shoot(x, y) {
    if (isReloading || bullets <= 0) return;

    bullets--;
    document.getElementById('bullets').innerText = bullets;

    let hit = false;

    for (const enemy of enemies) {
        if (!enemy.hit && x > enemy.x && x < enemy.x + 50 && y > enemy.y && y < enemy.y + 50) {
            points++;
            enemy.hit = true;
            hit = true;
            break;
        }
    }

    if (!hit) {
        for (const civilian of civilians) {
            if (!civilian.hit && x > civilian.x && x < civilian.x + 50 && y > civilian.y && y < civilian.y + 50) {
                points = 0;
                civilian.hit = true;
                clearTimeout(civilian.timeout); // Detener el temporizador de desaparición
                break;
            }
        }
    }

    drawGameObjects();
}

function reload() {
    if (isReloading || bullets >= 6) return;

    isReloading = true;
    reloadingInterval = setInterval(() => {
        bullets++;
        document.getElementById('bullets').innerText = bullets;
        if (bullets === 6) {
            clearInterval(reloadingInterval);
            isReloading = false;
        }
    }, 500);
}

function updateGame() {
    gameTime--;
    document.getElementById('time').innerText = gameTime;

    // Reducir el intervalo de aparición gradualmente
    if (gameTime % 5 === 0 && spawnRate > 1000) {
        clearInterval(spawnInterval);
        spawnRate = Math.max(1000, spawnRate - spawnRateDecrease);
        spawnInterval = setInterval(spawnEnemiesAndCivilians, spawnRate);
    }

    if (gameTime <= 0) {
        clearInterval(gameInterval);
        clearInterval(spawnInterval); // Detener la aparición de enemigos y civiles
        // Finaliza el juego
        alert(`Juego terminado! Puntos finales: ${points}`);
        return;
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    shoot(x, y);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Evita el comportamiento por defecto del touch
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    shoot(x, y);
}, { passive: false });

document.getElementById('reloadButton').addEventListener('click', reload);

// Iniciar el juego al cargar
window.onload = startGame;
