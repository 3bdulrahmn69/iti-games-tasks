const updateHearts = (gameStatus) => {
  const remainingTries = document.querySelector('#remain-tries');

  remainingTries.innerText = '❤️'.repeat(
    gameStatus.tries > 10 ? 10 : gameStatus.tries
  );

  if (gameStatus.isInfinite) {
    gameStatus.tries = 9999;
    remainingTries.innerHTML = '<i class="fa-solid fa-infinity"></i>';
  }

  if (gameStatus.tries >= 999 && !gameStatus.isInfinite) {
    gameStatus.tries = 5;
    remainingTries.innerHTML = '❤️'.repeat(gameStatus.tries);
  }
}; // End of updateHearts

const openSound = (gameStatus) => {
  gameStatus.isSoundOn = true;
  document.getElementById('closeSound').classList.remove('hidden');
  document.getElementById('openSound').classList.add('hidden');
}; // End of openSound

const closeSound = (gameStatus) => {
  gameStatus.isSoundOn = false;
  document.getElementById('openSound').classList.remove('hidden');
  document.getElementById('closeSound').classList.add('hidden');
}; // End of closeSound

const saveScore = (score, gameName) => {
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

  const storedScores = JSON.parse(localStorage.getItem(gameName) || '[]');

  if (storedScores.some((entry) => entry.score === score)) return;

  const gameScore = { score, date: formattedDate };
  storedScores.push(gameScore);

  const topScores = storedScores.sort((a, b) => b.score - a.score).slice(0, 10);

  localStorage.setItem(gameName, JSON.stringify(topScores));
}; // End of saveScore

const updateTable = (gameName) => {
  const storedScores = JSON.parse(localStorage.getItem(gameName) || '[]');

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
}; // End of updateTable

let keySequence = [];
const handleEasterEgg = (e, gameStatus) => {
  keySequence.push(e.key.toLowerCase());
  keySequence = keySequence.slice(-3);

  if (keySequence.join('') === 'dog') {
    if (gameStatus.isInfinite) {
      const easterEggAlert = document.createElement('div');
      easterEggAlert.textContent = '🐶 Infinite tries deActivated 🐶';
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

      gameStatus.isInfinite = false;
      updateHearts(gameStatus);

      setTimeout(() => {
        easterEggAlert.remove();
      }, 3000);

      return;
    }

    gameStatus.isInfinite = true;
    updateHearts(gameStatus);

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

  if (gameStatus.gameName === 'Duck Hunt') {
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
  }
}; // End of handleEasterEgg
