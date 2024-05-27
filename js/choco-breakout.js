document.addEventListener('DOMContentLoaded', function () {


    // Get a reference to the canvas DOM element
    const canvas = document.getElementById('breakoutCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Define the ball properties
    // const ballRadius = 10;
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 2;
    let dy = -2;

    // Define the ball (or in this case, emoji) properties
    const ballRadius = 20; // Increase the radius to fit the emoji
    const eatingEmoji = '😃'; // An emoji with an open mouth
    let currentEmoji = '😊'; // Starts with the smiley face
    const fontSize = ballRadius * 2; // Ensure the emoji fits inside the circle

    // Define the paddle properties
    const paddleHeight = 10;
    const paddleWidth = 75;
    let paddleX = (canvas.width - paddleWidth) / 2;

    // Define user input variables
    let rightPressed = false;
    let leftPressed = false;

    // Define brick properties
    const brickRowCount = 3;
    const brickColumnCount = 5;
    const brickWidth = 57;
    const brickHeight = 40;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    const chocolateEmoji = '🍫';
    const brickFontSize = brickHeight; // You can adjust this size as needed

    let gameStarted = false;

    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    let gameOver = false;

    // Create the bricks array
    let bricks = [];
    for(let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for(let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    function initGame() {
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = 2; // You could also set this to random as in the startGame() function
        dy = -2;
        paddleX = (canvas.width - paddleWidth) / 2;
        rightPressed = false;
        leftPressed = false;
        currentEmoji = '😊';
        gameStarted = false;
        gameOver = false;
    
        // Reset the bricks
        for(let c = 0; c < brickColumnCount; c++) {
            for(let r = 0; r < brickRowCount; r++) {
                bricks[c][r].status = 1;
            }
        }
    
        // Hide game over and win messages
        document.getElementById('gameOverMessage').classList.add('hidden');
        document.getElementById('gameOverMessage').classList.remove('show');
        document.getElementById('winMessage').classList.add('hidden');
        document.getElementById('winMessage').classList.remove('show');
        // winMessage.classList.remove('hidden');
        // winMessage.classList.add('show');
    
        // Redraw the game
        drawBall();
        
        // Draw the paddle
        drawPaddle();

        drawBricks();
    }

    initGame();

    window.playAgain = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        initGame();
    }

    function startGame() {
        // Set a random angle for the ball's movement
        dx = (Math.random() * 4) - 2; // Random dx value between -2 and 2
        dy = -(Math.random() * 2 + 2); // Random dy value between -2 and -4 (so it always starts going up)
        gameStarted = true;
    }

    // Touch event listeners for the left button
    leftBtn.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Prevents the default touch behavior like scrolling
        if (!gameStarted) {
            startGame();
            update(); // Start the game loop
        } 
        leftPressed = true;
    });
    leftBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        leftPressed = false;
    });

    // Touch event listeners for the right button
    rightBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (!gameStarted) {
            startGame();
            update(); // Start the game loop
        } 
        rightPressed = true;
    });
    rightBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        rightPressed = false;
    });

    // Click event listeners for the left button
    leftBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevents the default click behavior
        if (!gameStarted) {
            startGame();
            update(); // Start the game loop
        } 
        leftPressed = true;
        // Optional: You may want to release the button press after a short delay
        setTimeout(function() {
            leftPressed = false;
        }, 100); // Release after 100ms
    });

    // Click event listeners for the right button
    rightBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (!gameStarted) {
            startGame();
            update(); // Start the game loop
        } 
        rightPressed = true;
        // Optional: You may want to release the button press after a short delay
        setTimeout(function() {
            rightPressed = false;
        }, 100); // Release after 100ms
    });

    // Drawing the bricks
    function drawBricks() {
        ctx.fillStyle = 'rgb(28, 41, 48)';
        ctx.font = `${brickFontSize}px Choco`;
        for(let c = 0; c < brickColumnCount; c++) {
            for(let r = 0; r < brickRowCount; r++) {
                if(bricks[c][r].status === 1) {
                    let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                    let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    
                    ctx.save(); // Save the current state of the canvas
                    ctx.translate(brickX + brickWidth / 2, brickY + brickHeight / 2); // Translate to the center of the brick
                    ctx.rotate(Math.PI / 1.32); // Rotate the canvas context 90 degrees (π/2 radians)
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    // Draw the chocolate bar emoji
                    ctx.fillText('\ue800', 0, 0); // Draw at the center of the rotated context
                    ctx.restore(); // Restore the canvas state to not affect other drawings
                }
            }
        }
    }

    // Collision detection for bricks
    function collisionDetection() {
        for(let c = 0; c < brickColumnCount; c++) {
            for(let r = 0; r < brickRowCount; r++) {
                let b = bricks[c][r];
                if(b.status === 1) {
                    if(x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                        dy = -dy;
                        b.status = 0; // The brick is now "broken" and won't be drawn

                        // // Change the emoji to the "eating" emoji
                        // currentEmoji = eatingEmoji;
                        
                        // // Set a timeout to change it back after 200ms
                        // setTimeout(() => {
                        //     currentEmoji = '😊'; // Change back to the original smiley face
                        // }, 400);

                        // Start toggling the emoji
                        let toggle = true;
                        const startTime = Date.now();

                        const intervalId = setInterval(() => {
                            const elapsed = Date.now() - startTime;
                            if (elapsed > 500) { // Check if 400ms have passed
                                clearInterval(intervalId); // Stop toggling
                                currentEmoji = '😊'; // Set back to the original smiley face
                            } else {
                                // Toggle between the emojis
                                currentEmoji = toggle ? '😃' : '😊';
                                toggle = !toggle;
                            }
                        }, 125);
                    }
                }
            }
        }
    }


    function init() {
        // Draw the initial game state
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
    }

    // Event listeners for user input
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);

    function keyDownHandler(e) {
        if (!gameStarted && (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'Left' || e.key === 'ArrowLeft')) {
            startGame();
            // Start the game loop
            update();
        }

        if(e.key === 'Right' || e.key === 'ArrowRight') {
            rightPressed = true;
        }
        else if(e.key === 'Left' || e.key === 'ArrowLeft') {
            leftPressed = true;
        }
    }

    function keyUpHandler(e) {
        if(e.key === 'Right' || e.key === 'ArrowRight') {
            rightPressed = false;
        }
        else if(e.key === 'Left' || e.key === 'ArrowLeft') {
            leftPressed = false;
        }
    }

    // Drawing the ball
    function drawBall() {
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(currentEmoji, x, y);
    }

    // Drawing the paddle
    function drawPaddle() {
        if (!gameOver) {    
            ctx.beginPath();
            ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        }
    }

    // Function to check for a win
    function checkWin() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    return false; // As soon as a brick is found that's not broken, return false
                }
            }
        }
        return true; // If no unbroken bricks are found, return true
    }

    function showWinMessage() {
        const winMessage = document.getElementById('winMessage');
        winMessage.classList.remove('hidden');
        winMessage.classList.add('show');
        gameOver = true;
    }

    function showGameOverMessage() {
        const gameOverMessage = document.getElementById('gameOverMessage');
        gameOverMessage.classList.remove('hidden');
        gameOverMessage.classList.add('show');
        gameOver = true;
    }

    // Updating the game state
    function update() {
        if (!gameStarted) {
            return; // Exit the function if the game hasn't started
        }



        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the ball
        drawBall();
        
        // Draw the paddle
        drawPaddle();

        drawBricks();
        // Check if the player has won
        if (checkWin()) {
            showWinMessage();
            // document.location.reload(); // Reload the game to restart
            return; // Exit the function to stop the game
        }
        collisionDetection();

        // Bounce off the walls
        if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if(y + dy < ballRadius) {
            dy = -dy;
        } else if(y + dy > canvas.height - ballRadius) {
            if(x > paddleX - ballRadius && x < paddleX + paddleWidth + ballRadius){
                // Move the ball differently based on where it hits the paddle
                let deltaX = x - (paddleX + paddleWidth / 2); // Distance from the center of the paddle
                dx = deltaX * 0.15; // Adjust this value to control the effect
                dy = -dy;
            }
            else {
                // Handle game over
                showGameOverMessage();
                return;
            }
        }

        // Move the paddle
        if(rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        }
        else if(leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
        
        // Update ball position
        x += dx;
        y += dy;



        // Request an animation frame
        requestAnimationFrame(update);
    }

    function loadFont() {
        if ('fonts' in document) {
            const font = new FontFace('Choco', 'url(' + choco_breakout_plugin_url + 'fonts/choco.tff' + ')', {});

            font.load().then(function(loadedFont) {
                // Add the loaded font to the font system
                document.fonts.add(loadedFont);
                init(); // Call your init function to draw the initial state
            }).catch(function(error) {
                console.error('Failed to load the font', error);
            });
        } else {
            console.error('Font Loading API is not supported in this browser.');
        }
    }
    loadFont();
    // Start the game loop
    document.addEventListener('keydown', keyDownHandler);


    function adjustControlsForDevice() {
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints; // works on most browsers
        const gameControls = document.getElementById('game-controls');
        const keyboardInstructions = document.getElementById('keyboard-instructions');

        if (isMobile) {
            gameControls.style.display = 'block';
            keyboardInstructions.style.display = 'none';
        } else {
            gameControls.style.display = 'none';
            keyboardInstructions.style.display = 'block';
        }
    }

    // Run the function when the script is loaded
    adjustControlsForDevice();

    // You may also want to run it on resize if you're supporting device rotation, etc.
    window.addEventListener('resize', adjustControlsForDevice);

});