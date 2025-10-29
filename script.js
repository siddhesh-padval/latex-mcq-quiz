let questions = [];
let currentQuestion = 0;
let score = 0;
let username = '';

async function loadQuestionsFromTex() {
  try {
    const response = await fetch('questions.tex');
    if (!response.ok) throw new Error('Could not load questions.tex');
    const tex = await response.text();

    const questionBlocks = tex
      .split('\\question')
      .slice(1)
      .map(block => block.trim());

    questions = questionBlocks.map(block => {
      const questionMatch = block.match(/\{([^}]*)\}/);
      const question = questionMatch ? questionMatch[1] : '';

      const optionMatches = [...block.matchAll(/\\option\{([^}]*)\}/g)];
      const options = optionMatches.map(m => m[1]);

      const answerMatch = block.match(/\\answer\{(\d)\}/);
      const answerIndex = answerMatch ? parseInt(answerMatch[1]) : 1;

      return { question, options, answer: answerIndex };
    });
  } catch (err) {
    alert('Error loading questions.tex. Make sure the file exists and server is running.');
    console.error(err);
  }
}

function showQuestion() {
  if (currentQuestion >= questions.length) {
    document.getElementById('question-box').innerHTML = `
      <h3>Quiz Completed!</h3>
      <p>${username}, your score is ${score}/${questions.length}</p>
    `;
    localStorage.setItem(username, score);
    document.getElementById('next-btn').style.display = 'none';
    return;
  }

  const q = questions[currentQuestion];
  const box = document.getElementById('question-box');

  box.innerHTML = `
    <h3>${q.question}</h3>
    ${q.options
      .map(
        (opt, i) => `
        <label class="option">
          <input type="radio" name="option" value="${i + 1}">
          ${opt}
        </label><br>`
      )
      .join('')}
    <p id="feedback"></p>
  `;

  // Enable option click check
  document.querySelectorAll('input[name="option"]').forEach(input => {
    input.addEventListener('change', () => checkAnswer(parseInt(input.value)));
  });
}

function checkAnswer(selectedValue) {
  const q = questions[currentQuestion];
  const feedback = document.getElementById('feedback');
  const options = document.querySelectorAll('.option');

  options.forEach((label, i) => {
    if (i + 1 === q.answer) label.style.color = 'green';
    else if (i + 1 === selectedValue) label.style.color = 'red';
  });

  if (selectedValue === q.answer) {
    feedback.textContent = '✅ Correct!';
    score++;
  } else {
    feedback.textContent = `❌ Wrong! Correct answer: ${q.options[q.answer - 1]}`;
  }

  // Disable all options after answering
  document.querySelectorAll('input[name="option"]').forEach(i => (i.disabled = true));
}

document.getElementById('start-btn').addEventListener('click', async () => {
  username = document.getElementById('username').value.trim();
  if (!username) return alert('Please enter your name');

  await loadQuestionsFromTex();
  if (questions.length === 0) return;

  document.getElementById('user-section').style.display = 'none';
  document.getElementById('quiz-section').style.display = 'block';
  showQuestion();
});

document.getElementById('next-btn').addEventListener('click', () => {
  currentQuestion++;
  showQuestion();
});
