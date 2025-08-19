document.addEventListener('DOMContentLoaded', function () {
  // Canvas & context
  const canvas = document.getElementById('breakoutCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // DOM refs
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const announcements = document.getElementById('announcements');
  const bricksLeftEl  = document.getElementById('bricksLeft');

  // Ball
  let x = canvas.width / 2;
  let y = canvas.height - 30;
  let dx = 2;
  let dy = -2;

  const ballRadius = 20; // used for collision bounds
  const eatingEmoji = '😃';
  let currentEmoji = '😊';
  const fontSize = ballRadius * 2; // ensure the emoji fits

  // Paddle
  const paddleHeight = 10;
  const paddleWidth = 75;
  let paddleX = (canvas.width - paddleWidth) / 2;

  // Input
  let rightPressed = false;
  let leftPressed = false;

  // Bricks
  const brickRowCount = 3;
  const brickColumnCount = 5;
  const brickWidth = 57;
  const brickHeight = 40;
  const brickPadding = 10;
  const brickOffsetTop = 30;
  const brickOffsetLeft = 30;
  const brickFontSize = brickHeight; // used with custom 'Choco' font
  let bricks = [];

  // Game state
  let gameStarted = false;
  let gameOver = false;
  let paused = false;

  // RAF guard
  let loopRunning = false;
  let rafId = null;

  // HUD
  let bricksLeft = brickRowCount * brickColumnCount;
  if (bricksLeftEl) bricksLeftEl.textContent = bricksLeft;

  // Build bricks array
  function buildBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  }

  function initGame() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2;
    rightPressed = false;
    leftPressed = false;
    currentEmoji = '😊';
    gameStarted = false;
    gameOver = false;
    paused = false;

    buildBricks();
    bricksLeft = brickRowCount * brickColumnCount;
    if (bricksLeftEl) bricksLeftEl.textContent = bricksLeft;

    // Hide overlays
    hideOverlay('gameOverMessage');
    hideOverlay('winMessage');

    // Draw initial frame
    init();
  }

  function startGame() {
    // Randomize initial velocity
    dx = (Math.random() * 4) - 2;      // -2..2
    dy = -(Math.random() * 2 + 2);     // -4..-2
    gameStarted = true;

    if (!loopRunning) {
      loopRunning = true;
      rafId = requestAnimationFrame(update);
    }
  }

  window.playAgain = function() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    loopRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initGame();
    canvas.focus();
  };

  // Touch controls
  if (leftBtn && rightBtn) {
    leftBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!gameStarted) startGame();
      leftPressed = true;
    });
    leftBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      leftPressed = false;
    });

    rightBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!gameStarted) startGame();
      rightPressed = true;
    });
    rightBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      rightPressed = false;
    });

    // Click helpers (desktop)
    leftBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!gameStarted) startGame();
      leftPressed = true;
      setTimeout(() => { leftPressed = false; }, 100);
    });

    rightBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!gameStarted) startGame();
      rightPressed = true;
      setTimeout(() => { rightPressed = false; }, 100);
    });
  }

  // Draw bricks
  function drawBricks() {
    ctx.fillStyle = 'rgb(28, 41, 48)';
    ctx.font = `${brickFontSize}px Choco`;
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 1) {
          let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
          let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;

          ctx.save();
          ctx.translate(brickX + brickWidth / 2, brickY + brickHeight / 2);
          ctx.rotate(Math.PI / 1.32);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          // Private Use Area glyph from the custom 'Choco' font
          ctx.fillText('\ue800', 0, 0);
          ctx.restore();
        }
      }
    }
  }

  // Brick collisions
  function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        let b = bricks[c][r];
        if (b.status === 1) {
          if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
            dy = -dy;
            b.status = 0;
            bricksLeft--;
            if (bricksLeftEl) bricksLeftEl.textContent = bricksLeft;

            // Toggle emoji briefly
            let toggle = true;
            const startTime = Date.now();
            const intervalId = setInterval(() => {
              const elapsed = Date.now() - startTime;
              if (elapsed > 500) {
                clearInterval(intervalId);
                currentEmoji = '😊';
              } else {
                currentEmoji = toggle ? '😃' : '😊';
                toggle = !toggle;
              }
            }, 125);
          }
        }
      }
    }
  }

  // Draw initial state
  function init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
  }

  // Input: keyboard
  document.addEventListener('keydown', keyDownHandler, false);
  document.addEventListener('keyup',   keyUpHandler,   false);

  // First arrow anywhere focuses canvas (so "press arrows to start" still works)
  document.addEventListener('keydown', (e) => {
    if (['ArrowLeft','ArrowRight'].includes(e.key)) {
      if (document.activeElement !== canvas) canvas.focus();
    }
  }, { capture: true });

  // Prevent page scrolling while playing in the canvas
  canvas.addEventListener('keydown', (e) => {
    if (['ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  });

  function keyDownHandler(e) {
    if (!gameStarted && (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'Left' || e.key === 'ArrowLeft')) {
      startGame();
    }
    if (e.key === ' ') {
      // Toggle pause
      paused = !paused;
      announcements.textContent = paused ? 'Paused.' : 'Resumed.';
    }
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
      leftPressed = true;
    } else if (e.key === 'Escape') {
      // Restart quickly via Esc
      window.playAgain();
    }
  }

  function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
      leftPressed = false;
    }
  }

  // Ball
  function drawBall() {
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentEmoji, x, y);
  }

  // Paddle
  function drawPaddle() {
    if (!gameOver) {
      ctx.beginPath();
      ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    }
  }

  // Win / Lose helpers
  function allBricksCleared() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 1) return false;
      }
    }
    return true;
  }

  function showOverlay(id, announceText) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    el.classList.add('show');
    gameOver = true;
    announcements.textContent = announceText;
    // Focus the dialog
    setTimeout(() => el.focus(), 0);

    // Stop loop
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    loopRunning = false;
  }
  function hideOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hidden');
    el.classList.remove('show');
  }

  function showWinMessage()      { showOverlay('winMessage',      'You won.'); }
  function showGameOverMessage() { showOverlay('gameOverMessage', 'Game over.'); }

  // Main loop
  function update() {
    // Guard: if we somehow got here without a started game
    if (!gameStarted) { loopRunning = false; return; }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw static elements
    drawBricks();
    drawBall();
    drawPaddle();

    // Check win/lose if not paused
    if (!paused) {
      // Collisions
      collisionDetection();

      // Bounce walls
      if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
      if (y + dy < ballRadius) {
        dy = -dy;
      } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX - ballRadius && x < paddleX + paddleWidth + ballRadius) {
          const deltaX = x - (paddleX + paddleWidth / 2);
          dx = deltaX * 0.15; // effect control
          dy = -dy;
        } else {
          showGameOverMessage();
          return;
        }
      }

      // Paddle movement
      if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
      } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
      }

      // Ball position
      x += dx;
      y += dy;

      // Win check
      if (allBricksCleared()) {
        showWinMessage();
        return;
      }
    }

    // Keep looping (even while paused, so Space can unpause without restarting)
    rafId = requestAnimationFrame(update);
  }

  // Font loading (fix .ttf extension)
    function readyWithFont() {
        if ('fonts' in document) {
            // load at a realistic size you use for bricks
            document.fonts.load('40px "Choco"').then(initGame).catch(initGame);
        } else {
            initGame();
        }
    }
    readyWithFont();

  // Device-specific controls: show touch buttons on mobile
  function adjustControlsForDevice() {
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const gameControls = document.getElementById('game-controls');
    const keyboardInstructions = document.getElementById('keyboard-instructions');

    if (isMobile) {
      if (gameControls) gameControls.style.display = 'block';
      if (keyboardInstructions) keyboardInstructions.style.display = 'none';
    } else {
      if (gameControls) gameControls.style.display = 'none';
      if (keyboardInstructions) keyboardInstructions.style.display = 'block';
    }
  }
  adjustControlsForDevice();
  window.addEventListener('resize', adjustControlsForDevice);
});
