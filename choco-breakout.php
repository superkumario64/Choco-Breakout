<?php
/**
 * Plugin Name:     Choco Breakout
 * Plugin URI:      https://github.com/superkumario64/Choco-Breakout
 * Description:     Choco Themed Breakout Game
 * Author:          Choco Del Mar
 * Author URI:      https://chocodelmar.com
 * Text Domain:     choco-breakout
 * Domain Path:     /languages
 * Version:         0.1.1
 *
 * @package         Choco_Breakout
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// Enqueue game scripts and styles
function choco_breakout_enqueue_scripts() {
    $ver = '0.1.1';

    wp_enqueue_style(
        'choco-breakout-css',
        plugin_dir_url( __FILE__ ) . 'css/choco-breakout.css',
        array(),
        $ver,
        'all'
    );

    wp_enqueue_script(
        'choco-breakout-js',
        plugin_dir_url( __FILE__ ) . 'js/choco-breakout.js',
        array(),
        $ver,
        true
    );

    // Pass plugin base URL to JS for font loading, etc.
    wp_localize_script(
        'choco-breakout-js',
        'chocoBreakout',
        array(
            'pluginUrl' => plugin_dir_url( __FILE__ ),
        )
    );
}
add_action( 'wp_enqueue_scripts', 'choco_breakout_enqueue_scripts' );

// Shortcode to display the game
function choco_breakout_shortcode() {
    ob_start();
    ?>
    <div class="container">
        <!-- Focusable canvas with accessible name and description -->
        <canvas
            id="breakoutCanvas"
            width="380"
            height="320"
            tabindex="0"
            aria-label="Choco Breakout. Use Left and Right arrows to move the paddle. Space pauses. Escape restarts."
            aria-describedby="keyboard-instructions"
        ></canvas>

        <!-- Touch controls for mobile (hidden from screen readers) -->
        <div id="game-controls" aria-hidden="true">
            <button id="leftBtn" type="button" aria-label="Move left">Left</button>
            <button id="rightBtn" type="button" aria-label="Move right">Right</button>
        </div>

        <!-- Instructions + HUD in real text for SR users -->
        <p id="keyboard-instructions">
            Use the Left and Right arrow keys to start and move the paddle. Press Space to pause, Esc to restart.
        </p>

        <div id="hud" aria-live="polite">
            Bricks left: <span id="bricksLeft">15</span>
        </div>

        <!-- Assertive announcements for key events -->
        <div id="announcements" class="sr-only" aria-live="assertive"></div>

        <!-- Accessible dialogs -->
        <div id="winMessage" class="message hidden" role="dialog" aria-modal="true" tabindex="-1" aria-labelledby="winMessageText">
            <div id="winMessageText" class="message-text">🎉 You Won! 🎉</div>
            <button id="playAgainWin" type="button" onclick="playAgain()">Play Again</button>
        </div>

        <div id="gameOverMessage" class="message hidden" role="dialog" aria-modal="true" tabindex="-1" aria-labelledby="gameOverMessageText">
            <div id="gameOverMessageText" class="message-text">😢 Game Over 😢</div>
            <button id="playAgainLose" type="button" onclick="playAgain()">Try Again</button>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'choco_breakout', 'choco_breakout_shortcode' );
