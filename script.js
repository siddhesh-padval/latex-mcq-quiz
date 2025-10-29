let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let username = "";

// Parse LaTeX-style questions from the .tex file
function parseQuestions(texContent) {
  const qBlocks = texContent.split("\\question").slice(1);
  return qBlocks.map(block => {
    const questionMatch = block.match(/\{([^}]*)\}/);
    const options = [...block.matchAll(/\\option\{([^}]*)\}/g)].map(m => m[1]);
    const answerMatch = block.match(/\\answer\{([^}]*)\}/);
    return {
      text: questionMatch ? questionMatch[1].trim() : "",
      options: options,
      answer: answerMatch ? answerMatch[1].trim() : ""
    };
  });
}

async function loadQuestions() {
  const response = await fetch("questions.tex?" + Date.now());
  const text = await response.text();
  questions = parseQuestions(text);
}

function startQuiz() {
  username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Please enter your name.");
    return;
  }

  document.getElementById("start-screen").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";
  document.getElementById("welcome").textContent = `Welcome, ${username}!`;
  score = 0;
  currentQuestionIndex = 0;
  showQuestion();
}

function showQuestion() {
  const q = questions[currentQuestionIndex];
  const questionElement = document.getElementById("question");
  const optionsContainer = document.getElementById("options");
  const feedback = document.getElementById("feedback");
  const nextBtn = document.getElementById("next-btn");

  questionElement.innerHTML = q.text;
  optionsContainer.innerHTML = "";
  feedback.textContent = "";
  nextBtn.style.display = "none";

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = option;
    btn.onclick = () => checkAnswer(option, q.answer, btn);
    optionsContainer.appendChild(btn);
  });

  // Render LaTeX if needed
  if (window.MathJax) MathJax.typesetPromise();
}

function checkAnswer(selected, correct, btn) {
  const feedback = document.getElementById("feedback");
  const optionButtons = document.querySelectorAll(".option-btn");
  optionButtons.forEach(b => (b.disabled = true));

  if (selected.trim() === correct.trim()) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "green";
    score++;
  } else {
    feedback.textContent = `❌ Wrong! Correct answer: ${correct}`;
    feedback.style.color = "red";
  }

  document.getElementById("next-btn").style.display = "inline-block";
  document.getElementById("score").textContent = `Score: ${score}/${questions.length}`;

  // Save score locally
  localStorage.setItem(username, score);
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  document.getElementById("question-container").innerHTML =
    `<h2>Quiz complete!</h2><p>Your final score is ${score}/${questions.length}.</p>`;
  document.getElementById("next-btn").style.display = "none";
  document.getElementById("feedback").textContent = "";
  if (window.MathJax) MathJax.typesetPromise();
}

// Button listeners
document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("next-btn").addEventListener("click", nextQuestion);

// Load questions when the page loads
window.addEventListener("load", loadQuestions);
