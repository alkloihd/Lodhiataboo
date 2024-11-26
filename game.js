let numQuestions = 10;
let timerDuration = 30;
let numTeams = 2;
let teams = [];
let currentTeamIndex = 0;
let usedCardIndices = new Set();
let cards = [];
let totalCards = 0;
let currentCard = null;
let skipsRemaining = 3;
let timer;
let timeLeft;
let scores = {};
let clueWordsUsed = 0;

// Load cards from questions.json
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        cards = data.cards;
        totalCards = cards.length;
    })
    .catch(error => {
        console.error('Error loading questions.json:', error);
    });

// Home Screen Event Listeners
document.getElementById('increase-questions').addEventListener('click', () => {
    if (numQuestions < 50) {
        numQuestions += 1;
        document.getElementById('num-questions').innerText = numQuestions;
    }
});

document.getElementById('decrease-questions').addEventListener('click', () => {
    if (numQuestions > 10) {
        numQuestions -= 1;
        document.getElementById('num-questions').innerText = numQuestions;
    }
});

document.getElementById('increase-timer').addEventListener('click', () => {
    if (timerDuration < 120) {
        timerDuration += 5;
        document.getElementById('timer-duration').innerText = timerDuration;
    }
});

document.getElementById('decrease-timer').addEventListener('click', () => {
    if (timerDuration > 30) {
        timerDuration -= 5;
        document.getElementById('timer-duration').innerText = timerDuration;
    }
});

document.getElementById('num-teams').addEventListener('change', (e) => {
    numTeams = parseInt(e.target.value);
});

document.getElementById('start-button').addEventListener('click', () => {
    startGame();
});

// Start Game
function startGame() {
    // Initialize teams and scores
    teams = [];
    scores = {};
    for (let i = 1; i <= numTeams; i++) {
        teams.push('Team ' + i);
        scores['Team ' + i] = 0;
    }
    // Shuffle the cards and reset used indices
    shuffle(cards);
    usedCardIndices.clear();
    // Prepare team selection buttons
    let teamButtonsDiv = document.getElementById('team-buttons');
    teamButtonsDiv.innerHTML = '';
    teams.forEach((team, index) => {
        let btn = document.createElement('button');
        btn.innerText = team;
        btn.addEventListener('click', () => {
            currentTeamIndex = index;
            selectTeam(team);
        });
        teamButtonsDiv.appendChild(btn);
    });
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
}

// Select Team
function selectTeam(team) {
    skipsRemaining = 3;
    document.getElementById('team-selection').style.display = 'none';
    document.getElementById('card').style.display = 'block';
    generateGuessingTeamButtons();
    showCard();
    startTimer();
}

// Start Timer
function startTimer() {
    timeLeft = timerDuration;
    document.getElementById('time-left').innerText = timeLeft;
    timer = setInterval(() => {
        timeLeft -= 1;
        document.getElementById('time-left').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            showTimeUpPopup();
        }
    }, 1000);
}

// Show Time's Up Popup
function showTimeUpPopup() {
    const popup = document.getElementById('time-up-popup');
    popup.style.display = 'flex';
    setTimeout(() => {
        popup.style.display = 'none';
        endTurn();
    }, 3000);
}

// Show Card
function showCard() {
    if (usedCardIndices.size >= numQuestions || usedCardIndices.size >= totalCards) {
        endGame();
        return;
    }
    let cardIndex;
    do {
        cardIndex = Math.floor(Math.random() * totalCards);
    } while (usedCardIndices.has(cardIndex));
    usedCardIndices.add(cardIndex);
    currentCard = cards[cardIndex];
    document.getElementById('word-to-guess').innerText = currentCard.word;
    // Display related words as a list
    let relatedWordsList = document.getElementById('related-words');
    relatedWordsList.innerHTML = '';
    currentCard.related_words.forEach(word => {
        let li = document.createElement('li');
        li.innerText = word;
        relatedWordsList.appendChild(li);
    });
    // Reset clue words used
    clueWordsUsed = 0;
    document.querySelectorAll('#clue-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// Generate Guessing Team Buttons
function generateGuessingTeamButtons() {
    let guessingTeamContainer = document.getElementById('guessing-team-container');
    guessingTeamContainer.innerHTML = '';
    teams.forEach(team => {
        if (team !== teams[currentTeamIndex]) {
            let btn = document.createElement('button');
            btn.classList.add('guessing-team-btn');
            btn.innerText = team;
            btn.addEventListener('click', () => {
                handleCorrectGuess(team);
            });
            guessingTeamContainer.appendChild(btn);
        }
    });
}

// Handle Correct Guess via Button
function handleCorrectGuess(team) {
    // Assign points
    let points = [5, 4, 3, 2, 0][clueWordsUsed] || 0;
    scores[teams[currentTeamIndex]] += points;
    if (team) {
        scores[team] += 2;
    }
    // Advance to next card if time permits
    if (timeLeft > 0) {
        clearInterval(timer);
        showCard();
        startTimer();
    }
}

// Clue Words Used Buttons
document.querySelectorAll('#clue-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#clue-buttons button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        clueWordsUsed = parseInt(btn.getAttribute('data-clues'));
    });
});

// Continue Button
document.getElementById('continue-button').addEventListener('click', () => {
    // Assign points based on clue words used
    let points = [5, 4, 3, 2, 0][clueWordsUsed] || 0;
    scores[teams[currentTeamIndex]] += points;
    // Check if a guessing team was selected via button
    // If not, no additional points
    clearInterval(timer);
    showCard();
    startTimer();
});

// Skip Button
document.getElementById('skip-button').addEventListener('click', () => {
    skipsRemaining -= 1;
    if (skipsRemaining < 0) {
        alert('No skips remaining! Passing to the next team.');
        endTurn();
    } else {
        showCard();
    }
});

// End Turn
function endTurn() {
    clearInterval(timer);
    document.getElementById('card').style.display = 'none';
    document.getElementById('team-selection').style.display = 'block';
    // Check if all questions are used
    if (usedCardIndices.size >= numQuestions || usedCardIndices.size >= totalCards) {
        endGame();
    }
}

// End Game and Display Scores
function endGame() {
    clearInterval(timer);
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('score-screen').style.display = 'block';
    let scoresDiv = document.getElementById('scores');
    scoresDiv.innerHTML = '';
    for (let team in scores) {
        let p = document.createElement('p');
        p.innerText = `${team}: ${scores[team]} points`;
        scoresDiv.appendChild(p);
    }
}

// Restart Game
document.getElementById('restart-button').addEventListener('click', () => {
    location.reload();
});

// Shuffle Cards
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
