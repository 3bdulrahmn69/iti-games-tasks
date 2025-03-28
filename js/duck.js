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
  const wakAudio = new Audio('../assets/sounds/wak.mp3');
  wakAudio.load();

  let gameStatus = {
    isStarted: false,
    isSoundOn: true,
    speedUp: true,
    tries: 5,
    totalScore: 0,
    duckSpeed: 0.2,
    sound: gunshotAudio,
  };

  const updateHearts = () => {
    remainingTries.innerText = '❤️'.repeat(
      gameStatus.tries > 10 ? 10 : gameStatus.tries
    );
    if (gameStatus.tries >= 999) {
      gameStatus.tries = 9999;
      remainingTries.innerHTML = '<i class="fa-solid fa-infinity"></i>';
    }
  }; // End of updateHearts

  const initGame = () => {
    gameStatus.tries = 5;
    gameStatus.duckSpeed = 0.2;
    gameStatus.totalScore = 0;
    updateHearts();
    score.innerText = gameStatus.totalScore;
    gameStatus.isStarted = true;
  }; // End of initGame

  const randomStartPosition = () => ({
    x: Math.random() * 2,
    y: Math.random() * 40 + 20,
  }); // End of randomStartPosition

  const moveDuck = (duck) => {
    let positionX = duck.startX || 0;
    let direction = 1;

    const fly = () => {
      if (!gameStatus.isStarted) return;

      if (
        gameStatus.totalScore % 10 === 0 &&
        gameStatus.totalScore !== 0 &&
        gameStatus.speedUp
      ) {
        gameStatus.duckSpeed += 0.05;
        gameStatus.speedUp = false;
      } else {
        gameStatus.totalScore % 10 === 0
          ? (gameStatus.speedUp = false)
          : (gameStatus.speedUp = true);
      }

      positionX += gameStatus.duckSpeed * direction;
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
      updateHearts();
    } else {
      return;
    }

    if (gameStatus.tries === 0) {
      gameStatus.isStarted = false;
      gameScreen.style.display = 'none';
      gameOverScreen.style.display = 'block';
      document.querySelector('#final-score').innerText = gameStatus.totalScore;

      if (gameStatus.totalScore > 0) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const amPm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12; // Convert 0-23 to 12-hour format

        const formattedDate = `${String(now.getDate()).padStart(
          2,
          '0'
        )}/${String(now.getMonth() + 1).padStart(
          2,
          '0'
        )}/${now.getFullYear()} - ${String(hours12).padStart(2, '0')}:${String(
          minutes
        ).padStart(2, '0')} ${amPm}`;

        const gameScore = {
          score: gameStatus.totalScore,
          date: formattedDate,
        };

        const storedScores = JSON.parse(
          localStorage.getItem('duckGameScore') || '[]'
        );
        storedScores.push(gameScore);

        const topScores = storedScores
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        localStorage.setItem('duckGameScore', JSON.stringify(topScores));
      }
    }
  }); // End of gameScreen click event

  document.getElementById('openSound').addEventListener('click', () => {
    gameStatus.isSoundOn = true;
    document.getElementById('closeSound').classList.remove('hidden');
    document.getElementById('openSound').classList.add('hidden');
  }); // End of sound toggle

  document.getElementById('closeSound').addEventListener('click', () => {
    gameStatus.isSoundOn = false;
    document.getElementById('openSound').classList.remove('hidden');
    document.getElementById('closeSound').classList.add('hidden');
  }); // End of sound toggle

  document.getElementById('restart-game').addEventListener('click', () => {
    document.querySelectorAll('.duck').forEach((duck) => duck.remove());
    gameOverScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    initGame();
  }); // End of restart-game event

  const updateTable = () => {
    const storedScores = JSON.parse(
      localStorage.getItem('duckGameScore') || '[]'
    );

    console.log('updating');
    if (storedScores.length === 0) {
      document.getElementById('score-table').classList.add('hidden');
      document.getElementById('clear-scores').classList.add('hidden');
      document.getElementById('no-scores').classList.remove('hidden');
      return;
    }

    storedScores.forEach((score) => {
      console.log(score);
      const tr = document.createElement('tr');
      const tdRank = document.createElement('td');
      const tdScore = document.createElement('td');
      const tdDate = document.createElement('td');

      tdRank.innerText = storedScores.indexOf(score) + 1;
      tdScore.innerText = score.score;
      tdDate.innerText = score.date;

      tr.appendChild(tdRank);
      tr.appendChild(tdScore);
      tr.appendChild(tdDate);

      document.querySelector('#score-table tbody').innerHTML = '';
      document.querySelector('#score-table tbody').appendChild(tr);
    });
  }; // End of updateTable

  document.getElementById('record').addEventListener('click', () => {
    document.getElementById('score-list').classList.remove('hidden');
    updateTable();
  }); // End of record event

  document.getElementById('close-score-list').addEventListener('click', () => {
    document.getElementById('score-list').classList.add('hidden');
  }); // End of close score list event

  document.getElementById('clear-scores').addEventListener('click', () => {
    localStorage.removeItem('duckGameScore');
    updateTable();
  });

  document.getElementById('back-home').addEventListener('click', () => {
    document.querySelectorAll('.duck').forEach((duck) => duck.remove());
    gameOverScreen.style.display = 'none';
    homeScreen.style.display = 'block';
  }); // End of back-home event

  let keySequence = [];
  document.addEventListener('keydown', function handleEasterEgg(e) {
    keySequence.push(e.key.toLowerCase());
    keySequence = keySequence.slice(-3);

    if (keySequence.join('') === 'dog') {
      gameStatus.tries = 9999;
      updateHearts();

      const easterEggAlert = document.createElement('div');
      easterEggAlert.textContent = '🐶 Infinite tries activated! 🐶';
      easterEggAlert.style.position = 'fixed';
      easterEggAlert.style.top = '20px';
      easterEggAlert.style.left = '50%';
      easterEggAlert.style.transform = 'translateX(-50%)';
      easterEggAlert.style.background = 'rgba(0,0,0,0.8)';
      easterEggAlert.style.color = 'white';
      easterEggAlert.style.padding = '10px';
      easterEggAlert.style.borderRadius = '5px';
      easterEggAlert.style.zIndex = '1000';

      document.body.appendChild(easterEggAlert);

      setTimeout(() => {
        easterEggAlert.remove();
      }, 3000);
      keySequence = [];
    }

    if (keySequence.join('') === 'wak') {
      gameStatus.sound = wakAudio;

      const easterEggAlert = document.createElement('div');
      easterEggAlert.textContent = '🐶 wak sound changed 🐶';
      easterEggAlert.style.position = 'fixed';
      easterEggAlert.style.top = '20px';
      easterEggAlert.style.left = '50%';
      easterEggAlert.style.transform = 'translateX(-50%)';
      easterEggAlert.style.background = 'rgba(0,0,0,0.8)';
      easterEggAlert.style.color = 'white';
      easterEggAlert.style.padding = '10px';
      easterEggAlert.style.borderRadius = '5px';
      easterEggAlert.style.zIndex = '1000';

      document.body.appendChild(easterEggAlert);

      setTimeout(() => {
        easterEggAlert.remove();
      }, 3000);
      keySequence = [];
    }
  }); // End of Easter egg event
}); // End of window load event
