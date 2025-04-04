window.addEventListener('load', () => {
  /* selectors */
  const homeScreen = document.querySelector('.home-screen');
  const gameScreen = document.querySelector('.game-screen');
  const gameOverScreen = document.querySelector('.game-over-screen');
  const score = document.querySelector('#score');
  const remainingTries = document.querySelector('#remain-tries');
  const nest = document.querySelector('#nest');
  let targetX = nest.offsetLeft;

  const catchAudio = new Audio('../assets/sounds/catch.mp3');
  catchAudio.load();
  const missAudio = new Audio('../assets/sounds/miss.mp3');
  missAudio.load();
  const gameOverAudio = new Audio('../assets/sounds/gameOverEgg.mp3');
  gameOverAudio.load();
  const levelUpAudio = new Audio('../assets/sounds/levelUp.mp3');
  levelUpAudio.load();

  let gameStatus = {
    isStarted: false,
    isSoundOn: true,
    speedUp: true,
    tries: 5,
    totalScore: 0,
    eggSpeed: 0,
    eggInterval: 1000,
    nestSpeed: 30,
    isUsingKeyboard: false,
  };

  let eggSPownIntervalId = null;

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
    gameStatus.isStarted = true;
    gameStatus.tries = 5;
    gameStatus.totalScore = 0;
    gameStatus.eggSpeed = 5;
    gameStatus.eggInterval = 1000;
    gameStatus.nestSpeed = 30;
    updateHearts();
    score.innerText = gameStatus.totalScore;
  };

  const randomStartPosition = () => ({
    x: Math.random() * 90,
    y: 0,
  });

  const saveScore = (score) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} - ${String(hours12).padStart(
      2,
      '0'
    )}:${String(minutes).padStart(2, '0')} ${amPm}`;

    const storedScores = JSON.parse(
      localStorage.getItem('eggGameScore') || '[]'
    );

    if (storedScores.some((entry) => entry.score === score)) return;

    const gameScore = { score, date: formattedDate };
    storedScores.push(gameScore);

    const topScores = storedScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    localStorage.setItem('eggGameScore', JSON.stringify(topScores));
  };

  let activeEggs = [];

  const addCrackedEgg = (eggElement) => {
    const eggX =
      (gameScreen.offsetWidth * parseFloat(eggElement.style.left)) / 100;

    const crackedEggElement = document.createElement('img');

    crackedEggElement.src = '../assets/images/cracked.png';
    crackedEggElement.alt = 'cracked egg';
    crackedEggElement.classList.add('egg-cracked');

    crackedEggElement.style.position = 'absolute';
    crackedEggElement.style.left = `${eggX}px`;
    crackedEggElement.style.bottom = `${0}px`;
    crackedEggElement.style.width = '50px';
    crackedEggElement.style.height = '50px';

    // Ensure CSS position context
    if (getComputedStyle(gameScreen).position !== 'relative') {
      gameScreen.style.position = 'relative';
    }

    gameScreen.appendChild(crackedEggElement);

    // Add fade-out animation
    setTimeout(() => {
      crackedEggElement.style.opacity = '0';
      crackedEggElement.style.transition = 'opacity 0.5s ease-out';
    }, 1500);

    setTimeout(() => {
      if (crackedEggElement.parentElement) {
        gameScreen.removeChild(crackedEggElement);
      }
    }, 2000);
  };

  const moveEgg = (eggElement) => {
    // Add egg to tracking array
    activeEggs.push(eggElement);

    eggElement.style.transition = `top ${gameStatus.eggSpeed}s linear`;
    eggElement.style.top = '100%';

    eggElement.addEventListener('transitionend', () => {
      addCrackedEgg(eggElement);

      // Delay removal to ensure position calculation
      setTimeout(() => {
        if (eggElement.parentElement) {
          gameScreen.removeChild(eggElement);
        }
      }, 50); // 50ms delay

      const index = activeEggs.indexOf(eggElement);
      if (index > -1) activeEggs.splice(index, 1);

      if (gameStatus.isStarted) {
        gameStatus.tries -= 1;
        if (gameStatus.isSoundOn) {
          missAudio.currentTime = 0;
          missAudio.play();
        }
        updateHearts();
        gameScreen.removeChild(eggElement);

        if (gameStatus.tries <= 0) {
          gameOverScreen.classList.remove('hidden');
          gameScreen.classList.add('hidden');
          gameStatus.isStarted = false;

          if (gameStatus.isSoundOn) {
            gameOverAudio.currentTime = 0;
            gameOverAudio.play();
          }

          // Update final score display
          document.getElementById('final-score').textContent =
            'Your score: ' + gameStatus.totalScore;

          // Save to localStorage
          if (gameStatus.totalScore > 0) {
            saveScore(gameStatus.totalScore);
          }
        }
      }
    });
  };

  // Function to create and spawn an egg
  const spawnEgg = () => {
    if (!gameStatus.isStarted) return;

    const { x, y } = randomStartPosition();
    const eggElement = document.createElement('img');
    const randomIndex = Math.floor(Math.random() * 3) + 1;

    eggElement.src = `../assets/images/${randomIndex}.png`;
    eggElement.alt = 'egg';
    eggElement.classList.add('egg');

    // Initial position and styling
    eggElement.style.position = 'absolute';
    eggElement.style.left = `${x}%`;
    eggElement.style.top = `${y}px`;
    eggElement.style.width = '50px'; // Adjust size if needed
    eggElement.style.height = '50px'; // Adjust size if needed

    gameScreen.appendChild(eggElement);

    // Move the egg downwards
    setTimeout(() => moveEgg(eggElement), 100);
  };

  // Spawn an egg every second
  eggSPownIntervalId = setInterval(() => {
    if (gameStatus.isStarted) {
      spawnEgg();
    }
  }, gameStatus.eggInterval);

  document.querySelector('#start').addEventListener('click', () => {
    homeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    initGame();
  });

  document.querySelector('#exit-game').addEventListener('click', () => {
    gameScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
  });

  document.addEventListener('mousemove', (e) => {
    gameStatus.isUsingKeyboard = false;
    if (!gameStatus.isUsingKeyboard) {
      targetX = e.clientX - nest.offsetWidth / 2;
    }
  });

  document.addEventListener('keydown', (e) => {
    const nestWidth = nest.offsetWidth;
    const screenWidth = window.innerWidth;

    if (e.key === 'Escape') {
      gameScreen.classList.add('hidden');
      homeScreen.classList.remove('hidden');
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      gameStatus.isUsingKeyboard = true;

      if (e.key === 'ArrowLeft') {
        targetX = Math.max(0, targetX - gameStatus.nestSpeed);
      } else if (e.key === 'ArrowRight') {
        targetX = Math.min(
          screenWidth - nestWidth,
          targetX + gameStatus.nestSpeed
        );
      }
    }
  });

  function animate() {
    // Update nest position
    const currentX = nest.offsetLeft;
    const deltaX = (targetX - currentX) * 0.1;
    nest.style.left = `${currentX + deltaX}px`;

    // Collision detection
    if (gameStatus.isStarted) {
      const nestRect = nest.getBoundingClientRect();

      // Check collisions for all active eggs
      activeEggs.forEach((egg, index) => {
        const eggRect = egg.getBoundingClientRect();

        // Check for overlap between egg and nest
        if (
          eggRect.bottom >= nestRect.top &&
          eggRect.top <= nestRect.bottom &&
          eggRect.right >= nestRect.left &&
          eggRect.left <= nestRect.right
        ) {
          // Collision detected!
          gameStatus.totalScore += 1;
          if (gameStatus.isSoundOn) {
            catchAudio.currentTime = 0;
            catchAudio.play();
          }
          score.innerText = gameStatus.totalScore;
          if (gameStatus.totalScore % 10 === 0 && gameStatus.totalScore !== 0) {
            if (gameStatus.isSoundOn) {
              levelUpAudio.currentTime = 0;
              levelUpAudio.play();
            }

            if (gameStatus.eggSpeed > 1) {
              gameStatus.eggSpeed -= 0.5;
              console.log('Egg speed increased:', gameStatus.eggSpeed);
            } else if (gameStatus.eggSpeed > 0.5) {
              gameStatus.eggSpeed -= 0.2;
            } else {
              gameStatus.eggSpeed = 0.5;
              if (gameStatus.eggInterval > 300) {
                console.log('Egg interval decreased:', gameStatus.eggInterval);
                gameStatus.eggInterval -= 100;
                clearInterval(eggSPownIntervalId);
                eggSPownIntervalId = setInterval(() => {
                  if (gameStatus.isStarted) {
                    spawnEgg();
                  }
                }, gameStatus.eggInterval);
              }
            }
          }

          // Remove egg from DOM
          gameScreen.removeChild(egg);

          // Remove from active eggs array
          activeEggs.splice(index, 1);
        }
      });
    }

    requestAnimationFrame(animate);
  }
  animate(); // Start animation loop

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

  document.getElementById('exit-game').addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    gameStatus.isStarted = false;
  }); // End of sound toggle

  document.getElementById('restart-game').addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    initGame();
  }); // End of restart-game event

  document.getElementById('back-home').addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
  }); // End of back-home event

  const updateTable = () => {
    const storedScores = JSON.parse(
      localStorage.getItem('eggGameScore') || '[]'
    );

    const table = document.getElementById('score-table');
    const tbody = table.querySelector('tbody');
    const clearButton = document.getElementById('clear-scores');
    const noScoresMessage = document.getElementById('no-scores');

    if (storedScores.length === 0) {
      table.classList.add('hidden');
      clearButton.classList.add('hidden');
      noScoresMessage.classList.remove('hidden');
      return;
    }

    storedScores.sort((a, b) => b.score - a.score);
    tbody.innerHTML = '';

    storedScores.forEach((score, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${score.score}</td>
        <td>${score.date}</td>
      `;
      tbody.appendChild(tr);
    });

    table.classList.remove('hidden');
    clearButton.classList.remove('hidden');
    noScoresMessage.classList.add('hidden');
  };

  document.getElementById('record').addEventListener('click', () => {
    document.getElementById('score-list').classList.remove('hidden');
    updateTable();
  }); // End of record event

  document.getElementById('close-score-list').addEventListener('click', () => {
    document.getElementById('score-list').classList.add('hidden');
  }); // End of close score list event

  document.getElementById('clear-scores').addEventListener('click', () => {
    localStorage.removeItem('eggGameScore');
    updateTable();
  });

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
  }); // End of Easter egg event
}); // window load event
