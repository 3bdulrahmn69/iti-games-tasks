window.addEventListener('load', function () {
  /* Selecting elements */
  const homeScreen = document.querySelector('.home-screen');
  const gameScreen = document.querySelector('.game-screen');
  const score = document.querySelector('#score');
  const gameOverScreen = document.querySelector('.game-over-screen');

  /* Audio */
  const gunshotAudio = new Audio('../assets/sounds/gunshot.mp3');
  gunshotAudio.load();
  const emptyGunShotAudio = new Audio('../assets/sounds/emptyGunShot.mp3');
  emptyGunShotAudio.load();
  const wakAudio = new Audio('../assets/sounds/wak.mp3');
  wakAudio.load();
  const gameOverAudio = new Audio('../assets/sounds/gameOver.mp3');
  gameOverAudio.load();
  const levelUpAudio = new Audio('../assets/sounds/levelUp.mp3');
  levelUpAudio.load();

  let gameStatus = {
    gameName: 'duckHunt',
    isStarted: false,
    isSoundOn: true,
    speedUp: true,
    tries: 5,
    totalScore: 0,
    duckSpeed: 0.2,
    sound: gunshotAudio,
    isInfinite: false,
  };

  const initGame = () => {
    gameStatus.tries = 5;
    gameStatus.duckSpeed = 0.2;
    gameStatus.totalScore = 0;
    updateHearts(gameStatus);
    score.innerText = gameStatus.totalScore;
    gameStatus.isStarted = true;
  }; // End of initGame

  const moveDuck = (duck) => {
    let positionX = duck.startX || 0;

    const fly = () => {
      if (!gameStatus.isStarted) return;

      if (
        gameStatus.totalScore % 10 === 0 &&
        gameStatus.totalScore !== 0 &&
        gameStatus.speedUp
      ) {
        gameStatus.duckSpeed += 0.05;
        if (gameStatus.isSoundOn) {
          levelUpAudio.currentTime = 0;
          levelUpAudio.play();
        }
        gameStatus.speedUp = false;
      } else {
        gameStatus.totalScore % 10 === 0
          ? (gameStatus.speedUp = false)
          : (gameStatus.speedUp = true);
      }

      positionX += gameStatus.duckSpeed;
      const verticalVariation = Math.sin(positionX / 10) * 5;

      duck.style.left = `${positionX}%`;
      duck.style.top = `${duck.startY + verticalVariation}%`;

      if (positionX > 102) {
        duck.remove();
      }

      requestAnimationFrame(fly);
    };

    fly();
  }; // End of moveDuck

  const spawnDuck = () => {
    const { x, y } = {
      x: -10,
      y: Math.floor(Math.random() * 60) + 15, // Random Y position between 15% and 75%
    };

    const duckElement = document.createElement('img');
    duckElement.src = '../assets/images/flying-duck.gif';
    duckElement.alt = 'duck';
    duckElement.classList.add('duck');
    gameScreen.appendChild(duckElement);

    // Store initial random position
    duckElement.startX = x;
    duckElement.startY = y;

    // Set initial position
    duckElement.style.position = 'absolute';
    duckElement.style.left = `${x}%`;
    duckElement.style.top = `${y}%`;

    moveDuck(duckElement);
  }; // End of spawnDuck

  setInterval(() => {
    if (gameStatus.isStarted) {
      spawnDuck();
    }
  }, 1000); // Spawn duck every second

  document.getElementById('start-game').addEventListener('click', () => {
    homeScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    initGame();
  }); // End of start-game event

  gameScreen.addEventListener('click', (e) => {
    if (e.target.classList.contains('duck')) {
      if (gameStatus.isSoundOn) {
        gameStatus.sound.currentTime = 0;
        gameStatus.sound.play();
      }

      e.target.remove();
      gameStatus.totalScore++;
      score.innerText = gameStatus.totalScore;
    } else if (e.target.classList.contains('game-screen')) {
      if (gameStatus.isSoundOn) {
        emptyGunShotAudio.currentTime = 0;
        emptyGunShotAudio.play();
      }
      gameStatus.tries--;
      updateHearts(gameStatus);
    } else {
      return;
    }

    if (gameStatus.tries === 0) {
      gameStatus.isStarted = false;
      if (gameStatus.isSoundOn) {
        gameOverAudio.currentTime = 0;
        gameOverAudio.play();
      }

      this.setTimeout(() => {
        gameScreen.style.display = 'none';
        gameOverScreen.style.display = 'block';
        document.querySelector('#final-score').innerText =
          gameStatus.totalScore;
      }, 1000);

      if (gameStatus.totalScore > 0) {
        saveScore(gameStatus.totalScore, gameStatus.gameName);
      }
    }
  }); // End of gameScreen click event

  document.getElementById('openSound').addEventListener('click', () => {
    openSound(gameStatus);
  }); // End of sound toggle

  document.getElementById('closeSound').addEventListener('click', () => {
    closeSound(gameStatus);
  }); // End of sound toggle

  document.getElementById('exit-game').addEventListener('click', () => {
    document.querySelectorAll('.duck').forEach((duck) => duck.remove());
    gameOverScreen.style.display = 'none';
    homeScreen.style.display = 'block';
    gameStatus.isStarted = false;
  }); // End of sound toggle

  document.getElementById('restart-game').addEventListener('click', () => {
    document.querySelectorAll('.duck').forEach((duck) => duck.remove());
    gameOverScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    initGame();
  }); // End of restart-game event

  document.getElementById('record').addEventListener('click', () => {
    document.getElementById('score-list').classList.remove('hidden');
    updateTable(gameStatus.gameName);
  }); // End of record event

  document.getElementById('close-score-list').addEventListener('click', () => {
    document.getElementById('score-list').classList.add('hidden');
  }); // End of close score list event

  document.getElementById('clear-scores').addEventListener('click', () => {
    localStorage.removeItem(gameStatus.gameName);
    updateTable(gameStatus.gameName);
  });

  document.getElementById('back-home').addEventListener('click', () => {
    document.querySelectorAll('.duck').forEach((duck) => duck.remove());
    gameOverScreen.style.display = 'none';
    homeScreen.style.display = 'block';
  }); // End of back-home event

  document.addEventListener('keydown', (e) => {
    handleEasterEgg(e, gameStatus);
  }); // End of Easter egg event
}); // End of window load event
