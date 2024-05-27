<?php
/**
 * Plugin Name:     Choco Breakout
 * Plugin URI:      https://github.com/superkumario64/Choco-Breakout
 * Description:     Choco Themed Breakout Game
 * Author:          Choco Del Mar
 * Author URI:      https://chocodelmar.com
 * Text Domain:     choco-breakout
 * Domain Path:     /languages
 * Version:         0.1.0
 *
 * @package         Choco_Breakout
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// Enqueue game scripts and styles
function choco_breakout_enqueue_scripts() {
    wp_enqueue_script( 'choco-breakout-js', plugins_url( '/js/choco-breakout.js', __FILE__ ), array(), '1.0', true );
    wp_enqueue_style( 'choco-breakout-css', plugins_url( '/css/choco-breakout.css', __FILE__ ), array(), '1.0', 'all' );
    wp_localize_script('choco-breakout-js', 'choco_breakout_plugin_url', plugins_url('/', __FILE__));
}
add_action( 'wp_enqueue_scripts', 'choco_breakout_enqueue_scripts' );

// Shortcode to display the game
function choco_breakout_shortcode() {
    ob_start();
    ?>
    <div class="container">
        <canvas id="breakoutCanvas" width="380" height="320"></canvas>
        <div id="game-controls">
            <button id="leftBtn">Left</button>
            <button id="rightBtn">Right</button>
        </div>
        <p id="keyboard-instructions">Use the left and right arrows on the keyboard</p>
        <div id="winMessage" class="message hidden">
            <div class="message-text">🎉 You Won! 🎉</div>
            <button id="playAgainWin" onclick="playAgain()">Play Again</button>
        </div>
        <div id="gameOverMessage" class="message hidden">
            <div class="message-text">😢 Game Over 😢</div>
            <button id="playAgainLose" onclick="playAgain()">Try Again</button>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'choco_breakout', 'choco_breakout_shortcode' );
