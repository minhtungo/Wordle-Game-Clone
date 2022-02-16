import {dictionary} from './dictionary.js';
import {targetWords} from './targetWords.js';

const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
const guessGrid = document.querySelector('[data-guess-grid]');
const keyboard = document.querySelector('[data-keyboard]');
const alertContainer = document.querySelector('[data-alert-container]');
const offsetFromDate = new Date(2022, 1, 1);
const msOffset = Date.now() - offsetFromDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
const targetWord = targetWords[Math.floor(dayOffset)];

const startInteraction = () => {
  document.addEventListener('click', handleMouseClick);
  document.addEventListener('keydown', handleKeyPress);
};

const stopInteraction = () => {
  document.removeEventListener('click', handleMouseClick);
  document.addEventListener('keydown', handleKeyPress);
};

const handleMouseClick = (e) => {
  if (e.target.matches('[data-key')) {
    pressKey(e.target.dataset.key);
    return;
  }
  if (e.target.matches('[data-enter]')) {
    submitGuess();
    return;
  }
  if (e.target.matches('[data-delete]')) {
    deleteKey();
    return;
  }
};

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    submitGuess();
    return;
  }

  if (e.key === 'Backspace' || e.key === 'Delete') {
    deleteKey();
    return;
  }

  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key);
    return;
  }
};

const pressKey = (key) => {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORD_LENGTH) return;
  const nextTile = guessGrid.querySelector(':not([data-letter])');
  nextTile.dataset.letter = key.toLowerCase();
  nextTile.textContent = key;
  nextTile.dataset.state = 'active';
};

const deleteKey = () => {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (!lastTile) return;
  lastTile.textContent = '';
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
};

const submitGuess = () => {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert('Not enough letters');
    shakeTiles(activeTiles);
    return;
  }
  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, '');
  if (!dictionary.includes(guess)) {
    showAlert('Not in word list');
    shakeTiles(activeTiles);
    return;
  }

  stopInteraction();
  activeTiles.forEach((...params) => flipTile(...params, guess));
};

const flipTile = (tile, index, array, guess) => {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i`);
  setTimeout(() => {
    tile.classList.add('flip');
  }, (index * FLIP_ANIMATION_DURATION) / 2);

  tile.addEventListener(
    'transitionend',
    () => {
      tile.classList.remove('flip');
      if (targetWord[index] === letter) {
        tile.dataset.state = 'correct';
        key.classList.add('correct');
      } else if (targetWord.includes(letter)) {
        tile.dataset.state = 'wrong-location';
        key.classList.add('wrong-location');
      } else {
        tile.dataset.state = 'wrong';
        key.classList.add('wrong');
      }
      if (index === array.length - 1) {
        tile.addEventListener(
          'transitionend',
          () => {
            startInteraction();
            checkWinLose(guess, array);
          },
          { once: true }
        );
      }
    },
    { once: true }
  );
};
const getActiveTiles = () => {
  return guessGrid.querySelectorAll('[data-state="active"]');
};

const showAlert = (message, duration = 1000) => {
  const alert = document.createElement('div');
  alert.textContent = message;
  alert.classList.add('alert');
  alertContainer.prepend(alert);
  if (!duration) {
    return;
  }
  setTimeout(() => {
    alert.classList.add('hide');
    alert.addEventListener('transitionend', () => {
      alert.remove();
    });
  }, duration);
};

const shakeTiles = (tiles) => {
  tiles.forEach((tile) => {
    tile.classList.add('shake');
    tile.addEventListener(
      'animationend',
      () => {
        tile.classList.remove('shake');
      },
      { once: true }
    );
  });
};

const checkWinLose = (guess, tiles) => {
  if (guess === targetWord) {
    showAlert('You Win', 5000);
    danceTiles(tiles);
    stopInteraction();
    return;
  }

  const remainingTiles = guessGrid.querySelectorAll(':not([data-letter])');
  if (remainingTiles.length === 0) {
    showAlert(targetWord.toUpperCase(), null);
    stopInteraction();
  }
};

const danceTiles = (tiles) => {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add('dance');
      tile.addEventListener(
        'animationend',
        () => {
          tile.classList.remove('dance');
        },
        { once: true }
      );
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
};

startInteraction();
