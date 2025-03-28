window.addEventListener('load', function () {
  /* Selecting elements */
  const homeScreen = document.querySelector('.home-screen');
  const gameScreen = document.querySelector('.game-screen');
  const remainingTries = document.querySelector('#remain-tries');
  const score = document.querySelector('#score');
  const gameOverScreen = document.querySelector('.game-over-screen');

  /* Audio */
  const gunshotAudio = new Audio('../assets/sounds/gunshot.mp3');
  gunshotAudio.load();
  const emptyGunShotAudio = new Audio('../assets/sounds/emptyGunShot.mp3');
  emptyGunShotAudio.load();

  /* Game variables */
  let isGameStarted = false;
  let isSoundOn = true;
  let duckExists = false;
  let needToSpeedUp = true;

  /* Game logic */
  let NumberOfTries = 5;
  let totalScore = 0;
  let duckSpeed = 0.2;

  const updateHearts = () => {
    remainingTries.innerText = '❤️'.repeat(
      NumberOfTries > 10 ? 10 : NumberOfTries
    );
    if (NumberOfTries > 999) {
      remainingTries.innerText += '➿';
    }
  };

  const initGame = () => {
    NumberOfTries = 5;
    totalScore = 0;
    updateHearts();
    score.innerText = totalScore;
    isGameStarted = true;
    duckExists = false;
  };

  const randomStartPosition = () => ({
    x: Math.random() * 2,
    y: Math.random() * 40 + 20,
  });

  const moveDuck = (duck) => {
    let positionX = duck.startX || 0;
    let direction = 1;

    const fly = () => {
      if (!isGameStarted) return;

      if (totalScore % 10 === 0 && totalScore !== 0 && needToSpeedUp) {
        duckSpeed += 0.05;
        needToSpeedUp = false;
      } else {
        totalScore % 10 === 0
          ? (needToSpeedUp = false)
          : (needToSpeedUp = true);
      }

      positionX += duckSpeed * direction;
      const verticalVariation = Math.sin(positionX / 10) * 5;

      duck.style.left = `${positionX}%`;
      duck.style.top = `${duck.startY + verticalVariation}%`;

      requestAnimationFrame(fly);
    };

    fly();
  }; // End of moveDuck

  const spawnDuck = () => {
    if (!duckExists) {
      const { x, y } = randomStartPosition();
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
      duckExists = true;
    }
  }; // End of spawnDuck

  // Interval to check and spawn duck
  setInterval(() => {
    if (isGameStarted && !duckExists) {
      spawnDuck();
    }
  }, 1000);

  document.getElementById('start-game').addEventListener('click', () => {
    homeScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    initGame();
  });

  gameScreen.addEventListener('click', (e) => {
    if (e.target.classList.contains('duck')) {
      if (isSoundOn) {
        gunshotAudio.currentTime = 0;
        gunshotAudio.play();
      }

      e.target.remove();
      duckExists = false;
      totalScore++;
      score.innerText = totalScore;
    } else if (
      e.target.parentElement.classList.contains('details') ||
      e.target.parentElement.parentElement.classList.contains('settings')
    ) {
      return;
    } else {
      if (isSoundOn) {
        emptyGunShotAudio.currentTime = 0;
        emptyGunShotAudio.play();
      }
      NumberOfTries--;
      updateHearts();
    }

    if (NumberOfTries === 0) {
      isGameStarted = false;
      gameScreen.style.display = 'none';
      gameOverScreen.style.display = 'block';
      document.querySelector('#final-score').innerText = totalScore;
    }
  });

  document.getElementById('openSound').addEventListener('click', () => {
    isSoundOn = true;
    document.getElementById('closeSound').classList.remove('hidden');
    document.getElementById('openSound').classList.add('hidden');
  });

  document.getElementById('closeSound').addEventListener('click', () => {
    isSoundOn = false;
    document.getElementById('openSound').classList.remove('hidden');
    document.getElementById('closeSound').classList.add('hidden');
  });

  document.getElementById('restart-game').addEventListener('click', () => {
    document.querySelectorAll('.duck').forEach((duck) => duck.remove());
    gameOverScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    initGame();
  });

  document.getElementById('back-home').addEventListener('click', () => {
    document.querySelectorAll('.duck').forEach((duck) => duck.remove());
    gameOverScreen.style.display = 'none';
    homeScreen.style.display = 'block';
  });
}); // End of window load event
