const categoriesApiURL = 'https://opentdb.com/api_category.php';
const questionsApiURL1 = 'https://opentdb.com/api.php?amount=5&category=';
const questionsApiURL2 = '&type=multiple';
var numberCorrect = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    const startButton = document.getElementById('start-btn');
    startButton.addEventListener('click', startQuiz);
    document.getElementById('next-question').style.display = 'none';
});

let currentQuestionIndex = 0;
let questions = [];

function fetchCategories() {
    fetch(categoriesApiURL)
        .then(response => response.json())
        .then(data => {
            populateCategoryDropdown(data.trivia_categories); 
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
        });
}

function populateCategoryDropdown(categories) {
    const categorySelect = document.getElementById('category-select');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

function startQuiz() {
    const selectedCategory = document.getElementById('category-select').value;
    fetchQuestions(selectedCategory);
    document.getElementById('start-screen').style.display = 'none';
}

function fetchQuestions(categoryId) {
    fetch(questionsApiURL1 + categoryId + questionsApiURL2)
        .then(response => response.json())
        .then(data => {
            if (data.response_code === 0 && data.results.length) {
                questions = data.results;
                currentQuestionIndex = 0;
                displayQuestion(questions[currentQuestionIndex]);
                document.getElementById('question-container').style.display = 'block';
                document.getElementById('next-question').style.display = 'block';
            } else {
                console.error('No questions found or bad response code');
            }
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
        });
}

function displayQuestion(questionData) {
    const categoryElement = document.getElementById('category');
    const difficultyElement = document.getElementById('difficulty');
    const questionElement = document.getElementById('question');
    const answersElement = document.getElementById('answer-list');

    categoryElement.textContent = questionData.category;
    difficultyElement.textContent = `Difficulty: ${questionData.difficulty}`;
    questionElement.innerHTML = questionData.question;

    answersElement.innerHTML = '';

    const choices = [...questionData.incorrect_answers];
    const correctAnswerIndex = Math.floor(Math.random() * (choices.length + 1));
    choices.splice(correctAnswerIndex, 0, questionData.correct_answer);

    choices.forEach(answer => {
        const answerElement = document.createElement('li');
        answerElement.classList.add('answer');
        answerElement.innerHTML = answer;
        answerElement.addEventListener('click', () => selectAnswer(answer, questionData.correct_answer));
        answersElement.appendChild(answerElement);
    });
}

function selectAnswer(selectedAnswer, correctAnswer) {
    const answers = document.querySelectorAll('.answer');
    answers.forEach(answerEl => {
        if (answerEl.innerHTML === correctAnswer) {
            answerEl.classList.add('correct-answer');
        } else {
            answerEl.classList.add('incorrect-answer');
        }
        answerEl.classList.remove('answer');
        answerEl.style.pointerEvents = 'none';
    });

    if (selectedAnswer === correctAnswer) {
        numberCorrect++;
    }
    
    document.getElementById('next-question').disabled = false;
}

document.getElementById('next-question').addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(questions[currentQuestionIndex]);
    } else {
        console.log('Trivia finished! Correct Answers = ' + numberCorrect);
        document.getElementById('next-question').disabled = true;
    }
});

function showNextQuestion() {
    if (currentQuestionIndex < questions.length) {
        displayQuestion(questions[currentQuestionIndex]);
    } else {
        endQuiz();
    }
}

function displayResults() {
    const gameContainer = document.getElementById('game-container');
    
    let resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
        resultsContainer.remove();
    }
    
    resultsContainer = document.createElement('div');
    resultsContainer.id = 'results-container';
    resultsContainer.className = 'shadow-box';
    resultsContainer.innerHTML = `
        <h2>Your Trivia Results</h2>
        <p>You answered <strong>${numberCorrect}</strong> out of <strong>${questions.length}</strong> questions correctly!</p>
    `;
    
    gameContainer.appendChild(resultsContainer);
    
    const restartButton = document.createElement('button');
    restartButton.id = 'restart-button';
    restartButton.innerText = 'Play Again';
    restartButton.className = 'start-btn shadow-box';
    restartButton.addEventListener('click', restartQuiz);
    gameContainer.appendChild(restartButton);
}

function endQuiz() {
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('next-question').style.display = 'none';

    displayResults();
}

function restartQuiz() {
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
        resultsContainer.remove();
    }
    
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.remove();
    }
    
    document.getElementById('start-screen').style.display = 'block';
    
    numberCorrect = 0;
    currentQuestionIndex = 0;

    const nextQuestionButton = document.getElementById('next-question');
    nextQuestionButton.style.display = 'none';
}

document.getElementById('next-question').addEventListener('click', showNextQuestion);