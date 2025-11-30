
var QUESTIONS = [
  {
    q: "You're at a coffee shop. A network named 'Free_Coffee_WiFi' appears. Staff told you the network is 'CafeGuest'. What do you do?",
    options: ["Join 'Free_Coffee_WiFi'", "Ask the staff and confirm the correct SSID before joining", "Join and immediately and do some mobile banking to test the speed"],
    answer: 1,
    explain: "Always confirm the exact SSID. Sometimes attackers create similar networks in order to fool you (evil twins)."
  },
  {
    q: "A site shows HTTP (no lock icon) when you're trying to login to your bank on public Wi-Fi. You should:",
    options: ["Proceed without caution", "Avoid entering credentials and use mobile data or a VPN", "Refresh until it shows HTTPS"],
    answer: 1,
    explain: "Never enter passwords on non-HTTPS pages. Use VPN or mobile data."
  },
  {
    q: "Your phone auto-connects to known networks. On public Wi-Fi you should:",
    options: ["Leave auto-join on", "Turn off auto-join and forget networks after use", "Only auto-join trusted hotspots"],
    answer: 1,
    explain: "Disable auto-join and forget open networks after use to prevent future attacks."
  },
  {
    q: "A public network asks you to 'Accept terms' and then opens a login page asking for your full name and payment info. You should:",
    options: ["Provide info to join", "Skip the network and use another method", "Type in some fake info"],
    answer: 1,
    explain: "Avoid giving  ANY sensitive personal/payment info to any portals that ask for extra details."
  },
  {
    q: "You're using public Wi-Fi for research. Is it OK to share files using an open SMB/Fileshare without encryption?",
    options: ["Yes if it's just PDFs", "No, file sharing protocols can expose files on open networks", "Only if the other person is in the same cafe"],
    answer: 1,
    explain: "Avoid unencrypted file sharing; use secure transfer methods (SFTP or cloud with TLS)."
  },
  {
    q: "A site shows HTTPS but the certificate name doesn't match the domain. You should:",
    options: ["Trust it", "Don't trust it", "Refresh and try again"],
    answer: 1,
    explain: "Certificate mismatch is a red flag. It could be a middleman attack."
  },
  {
    q: "Your OS asks you to 'Share files with network?' while on public Wi-Fi. You should choose:",
    options: ["Yes", "No", "Ignore it"],
    answer: 1,
    explain: "Set the network to 'Public' and disable file sharing/firewall exceptions."
  },
  {
    q: "You need to check your email. The best practice on public Wi-Fi is to:",
    options: ["Use webmail over HTTPS or an email app over encrypted connection (IMAPS/SMTPS)", "Use any client", "Check without password to be safe"],
    answer: 0,
    explain: "Use encrypted email transports (HTTPS/IMAPS) or a VPN."
  },
  {
    q: "You finf 'free USB charging' ports at the airport. You should:",
    options: ["Plug your phone in to charge", "Avoid it and use a power bank instead", "Have your friend try it first"],
    answer: 1,
    explain: "USB ports can carry data (juice jacking). Use your own bank or a 'Power Only' cable."
  },
  {
    q: "You're using a public Wi-Fi and need to sign in to a site you rarely use. Which is the safest?",
    options: ["Use password manager to paste a long unique password over HTTPS", "Type a short password to be fast", "Use the 'forgot password' option"],
    answer: 0,
    explain: "Use strong unique passwords (via a password manager) and make sure it's HTTPS."
  }
];

//html elements
var startButton = document.getElementById('start-btn');
var startCard = document.getElementById('start-card');
var questionCard = document.getElementById('question-card');
var questionNumberText = document.getElementById('q-num');
var questionText = document.getElementById('q-text');
var questionProgressBar = document.getElementById('q-progress');
var optionsList = document.getElementById('options');
var feedbackText = document.getElementById('feedback');
var nextButton = document.getElementById('next-btn');
var resultCard = document.getElementById('result-card');
var scoreText = document.getElementById('score');
var badgeText = document.getElementById('badge');
var resultDetailsContainer = document.getElementById('result-details');
var retryButton = document.getElementById('retry-btn');

//state
var quizState = { order: [], index: 0, score: 0, answers: [], tempSelection: null };

//shuffle array
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

//order of questions
function buildQuestionOrder() {
  var indices = [];
  for (var i = 0; i < QUESTIONS.length; i++) {
    indices.push(i);
  }
  return shuffleArray(indices);
}

//render a question
function renderQuestion() {
  var currentQIndex = quizState.order[quizState.index];
  var currentQuestion = QUESTIONS[currentQIndex];

  questionNumberText.textContent = "Q " + (quizState.index + 1) + " of " + QUESTIONS.length;
  questionProgressBar.max = QUESTIONS.length;
  questionProgressBar.value = quizState.index + 1;
  questionText.textContent = currentQuestion.q;

  //clear previous options
  optionsList.innerHTML = "";

  //add options
  for (var i = 0; i < currentQuestion.options.length; i++) {
    var optionElement = document.createElement('li');
    optionElement.tabIndex = 0;
    optionElement.textContent = currentQuestion.options[i];

    optionElement.onclick = (function(optionIndex, element) {
      return function() {
        selectOption(optionIndex, element);
      }
    })(i, optionElement);

    optionElement.onkeydown = (function(optionIndex, element) {
      return function(e) {
        if (e.key === 'Enter') {
          selectOption(optionIndex, element);
        }
      }
    })(i, optionElement);

    optionsList.appendChild(optionElement);
  }

  feedbackText.textContent = "";
  feedbackText.className = "feedback";
  nextButton.disabled = true;

  questionCard.classList.remove('hidden');
  startCard.classList.add('hidden');
  resultCard.classList.add('hidden');
}

//select an option
function selectOption(selectedIndex, element) {
  //remove previous selection
  for (var i = 0; i < optionsList.children.length; i++) {
    optionsList.children[i].classList.remove('selected');
  }
  element.classList.add('selected');

  var currentQIndex = quizState.order[quizState.index];
  var currentQuestion = QUESTIONS[currentQIndex];

  var isCorrect = (selectedIndex === currentQuestion.answer);

  feedbackText.textContent = isCorrect ? "✅ Correct — " + currentQuestion.explain : "❌ Nope — " + currentQuestion.explain;
  feedbackText.className = "feedback " + (isCorrect ? "correct" : "incorrect");

  quizState.tempSelection = { chosen: selectedIndex, correct: isCorrect };
  nextButton.disabled = false;
}

//next question
function nextQuestion() {
  if (!quizState.tempSelection) {
    return;
  }

  var currentQIndex = quizState.order[quizState.index];
  var currentQuestion = QUESTIONS[currentQIndex];

  quizState.answers.push({
    q: currentQuestion.q,
    chosen: quizState.tempSelection.chosen,
    correct: quizState.tempSelection.correct,
    explain: currentQuestion.explain,
    options: currentQuestion.options
  });

  if (quizState.tempSelection.correct) {
    quizState.score++;
  }

  quizState.index++;
  quizState.tempSelection = null;

  if (quizState.index >= QUESTIONS.length) {
    showResults();
  } else {
    renderQuestion();
  }
}

//results
function showResults() {
  questionCard.classList.add('hidden');
  resultCard.classList.remove('hidden');

  scoreText.textContent = quizState.score;

  if (quizState.score >= 9) {
    badgeText.textContent = " Cyber Detective!";
  } else if (quizState.score >= 7) {
    badgeText.textContent = "️ Wi-Fi Wise";
  } else if (quizState.score >= 4) {
    badgeText.textContent = " Needs Practice";
  } else {
    badgeText.textContent = "Phish Food";
  }

  resultDetailsContainer.innerHTML = "";
  for (var i = 0; i < quizState.answers.length; i++) {
    var a = quizState.answers[i];
    var div = document.createElement('div');
    div.className = "result-row";
    div.innerHTML = "<strong>Q" + (i+1) + ":</strong> " + a.q +
                    "<div class='muted small'>Your answer: " + (a.options[a.chosen] || "No answer") + " — " + (a.correct ? "Correct" : "Wrong") + "</div>" +
                    "<div class='muted small'>Explanation: " + a.explain + "</div><hr/>";
    resultDetailsContainer.appendChild(div);
  }
}

//start button
startButton.onclick = function() {
  quizState.order = buildQuestionOrder();
  quizState.index = 0;
  quizState.score = 0;
  quizState.answers = [];
  renderQuestion();
}

//next button 
nextButton.onclick = function() {
  nextQuestion();
}

//retry button
retryButton.onclick = function() {
  quizState.order = buildQuestionOrder();
  quizState.index = 0;
  quizState.score = 0;
  quizState.answers = [];
  resultCard.classList.add('hidden');
  questionCard.classList.remove('hidden');
  renderQuestion();
}

