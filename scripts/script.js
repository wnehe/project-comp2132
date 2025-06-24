/**
 * @author Winnie He
 * date: June 25, 2025
 */

const fetchFile = '../json/produce.json';
// game variables
const keyboard = document.getElementById("keyboard");
const game = document.getElementById("game");
const hint = document.getElementById("hint");
const word = document.getElementById("word");
const errCount = document.getElementById('wrong-guess-num');
const maxErr = 6;
let err = 0;
// new array to store words
let produce = [];
// variables to assign to json properties
let gameWord = '', gameHint = ''; 
// game end screen + animation
const endGameScreen = document.getElementById('animation-div')
const endGameMedia = document.getElementById("game-over-media");
const statement = document.getElementById('game-over-statement');
const winAudio = new Audio('../audio/senshi_theme.mp3')
const loseAudio = new Audio('../audio/zoldyck_family_theme.mp3');
// hangman animations
const hangshroom = document.getElementById('mushroom');
const shroomRunPath = '../images/mushroom-animation-images/mushroom-'; 
const hangshroomPath = '../images/shroom-cut-images/shroom-model-';
const knife = document.getElementById('knife');
const knifeAudio = new Audio('../audio/chop-sound.mp3');
const correctLetterAudio = new Audio('../audio/bubble-pop.mp3')
// animation handlers and delay
const limit = 6, delayAnimation = 100, delayScreen = 300, delayChop = 700;
let shroomAnimation, timeout;
let count = 0
// bool flag to track if animating
let running = false;
// play again buttons
const playButtonMain = document.getElementById('again-main');
const playButtonPopup = document.getElementById('again-pop');

/**
 * STEP 1 read file using fetch()
 * + calls getRandomWord() fx
 */
function fileFirst() {
    fetch(fetchFile) 
        .then(response => 
            response.ok ? response.json() : console.log("fetch failed"))
        .then(data => {
            // stores file data into new array
            produce = data;
            // call function
            getRandomWordFromArray(produce);
        })
        .catch(error => game.innerHTML = `<p>${error}. Please try again.</p>`);
}

/**
 * STEP 2 do math to get random word from array 
 * + add random word to DOM
 * @param {Array} produce - array from json elements
 */
function getRandomWordFromArray(produce) {
    // shuffle array to get random element
    let index = Math.floor(Math.random() * produce.length); 
    let whateverItem = produce[index];
    // assign random name and bio name to initialized variables
    gameWord = whateverItem.name;
    gameHint = whateverItem.scientific_name;
    // word split and lowercased
    hiddenWord = gameWord.toLowerCase().split("");
    // add each letter to ul element 
    hiddenWord.forEach(letter => {
        // add class letter to hide letter
        word.innerHTML += `<li class="letter">${letter}</li>`;
    })
    // change hint to bio name
    hint.innerText = `Hint: ${gameHint}`;
}

/**
 * STEP 3 keyboard class builds keyboard
 * + calls clickedLetter() fx
 */
class Keyboard {
    constructor(keyboard) {
        this.letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        this.keyboard = keyboard;
    }
    addLettersToKeyboard() {
        this.letters.forEach(letter => {
            const buttonKey = document.createElement('button');
            buttonKey.innerText = letter.toUpperCase();
            buttonKey.classList.add('key');
            // step 4 to every button
            buttonKey.addEventListener('click', () => clickedLetter(letter, buttonKey, keyboard))
            // add all buttons to keyboard
            this.keyboard.appendChild(buttonKey);
    }); 
    }
}

/**
 * STEP 4 extend buttonkey action for game
 * @param {String} letter - alphabet A-Z
 * @param {Element} key - button element
 * @param {Element} board - keyboard element contains button key elements
 */
function clickedLetter(letter, key, board) {
    // disable every click
    key.disabled = true;

    if (hiddenWord.includes(letter)) {
        hiddenWord.forEach(function( l, index ) {
            // find hw letter and index matching pressed key
            if (l === letter && hiddenWord[index] === letter) { 
                // bubble sound 
                correctLetterAudio.play();
                // display correct letter
                word.querySelectorAll('li')[index].classList.add('good');
                // disable keyboard if all letters found
                if (hiddenWord.length == word.querySelectorAll('.good').length) {
                    board.querySelectorAll('.key').forEach(k => k.disabled = true)
                    // call win fx
                    showWin();
                    // animate
                    if (!running) {
                        running = true;
                        shroomAnimation = requestAnimationFrame(loopImage);
                    }
                }
            } 
        })
    } else {
        err++
        knifeAction(err);
        hangshroom.src = `${hangshroomPath}${err+1}.png`
        if (err >= maxErr) {
            err = maxErr;
            // disable keyb when max errors reached
            board.querySelectorAll('.key').forEach(k => k.disabled = true)
            // call lose fx
            showLose();
        }
    }  
    // change text
    errCount.innerText = `${err} / ${maxErr}`;
}

/**
 * STEP 4.1 
 * win/lose status: change text, display end game div, play audio
 * lose game: change image 
 */
function showWin() {
    statement.innerText = `You guessed the word "${hiddenWord.join("")}" correctly!!`;
    displayEndGameScreen();
    winAudio.play();
}
function showLose() {
    statement.innerText = `Game Over! The correct word was "${hiddenWord.join("")}"`
    endGameMedia.src = '../images/other/game-over-1.gif'
    endGameMedia.style.borderRadius = '20px'
    displayEndGameScreen();
    loseAudio.play();
}
/** 
 * STEP 4.2 display end game div after .3s delay
 */
function displayEndGameScreen() {
    setTimeout(() => {
        endGameScreen.classList.add('show')
    }, delayScreen)
}

/**
 * JS animation fx
 * knifeAction fx plays chopping sound and animation on every wrong guess
 * loopImage fx loops images to display running shroom
 * @param {number} err 
 */
function knifeAction(err) {
    if (err < maxErr) {
        knifeAudio.play();
        knife.classList.add('cut');
        setTimeout(() => {
            knife.classList.remove('cut');
        }, delayChop);
    }
}
function loopImage() {
    count++;
    if (count > limit) {
        count = 1;
    }
    endGameMedia.src = `${shroomRunPath}${count}.JPG`;
    endGameMedia.style.borderRadius = '100%';
    
    timeout = setTimeout(function(){
        shroomAnimation = requestAnimationFrame(loopImage);
    }, delayAnimation)
}

// STEP 7 call file fetch fx
fileFirst();

// STEP 8 initialize keyboard obj
const kb = new Keyboard(keyboard);
kb.addLettersToKeyboard();

/**
 * STEP 9 reset elements and words without reloading page
 * call file fx again
 */
function again(){
    // reset variables
    err = 0;
    hiddenWord = [];
    word.innerHTML = '';
    hint.innerText = '';
    // reset wrong guesses count
    errCount.innerText = `${err} / ${maxErr}`;
    // reset hangman to image 1
    hangshroom.src = `${hangshroomPath}${err+1}.png`
    // end game display
    endGameScreen.classList.remove('show')
    knife.classList.remove('cut');
    // pause and reset audios 
    loseAudio.pause(); 
    loseAudio.currentTime = 0;
    winAudio.pause();
    winAudio.currentTime = 0;
    // reset animation
    running = false;
    clearTimeout(timeout);
    cancelAnimationFrame(shroomAnimation);
    // enable keyboard
    keyboard.querySelectorAll('.key').forEach(k => k.disabled = false);
    
    fileFirst();
}

// STEP 10 play again buttons call again() fx
playButtonMain.addEventListener('click', again);
playButtonPopup.addEventListener('click', again);
