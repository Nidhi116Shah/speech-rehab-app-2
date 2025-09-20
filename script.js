// --- Levels and Words ---
const levels = {
  1: ["Hello", "World", "Dog", "Cat"],
  2: ["Apple", "Banana", "Chair", "Table"],
  3: ["Computer", "Keyboard", "Elephant", "Giraffe"]
};

let currentLevel = 1;
let score = 0;
let currentWord = "";

const wordDiv = document.getElementById('word');
const feedbackDiv = document.getElementById('feedback');
const scoreSpan = document.getElementById('score');
const levelSpan = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const recordBtn = document.getElementById('recordBtn');
const downloadLink = document.getElementById('downloadLink');

let recognition;
let mediaRecorder;
let audioChunks = [];

// --- Functions ---
function getRandomWord() {
  const wordList = levels[currentLevel];
  const index = Math.floor(Math.random() * wordList.length);
  return wordList[index];
}

function nextWord() {
  currentWord = getRandomWord();
  wordDiv.innerText = currentWord;
  feedbackDiv.innerText = "";
  downloadLink.style.display = "none";
}

// --- Initialize first word ---
nextWord();

// --- Update Level Display ---
function updateLevel() {
  levelSpan.innerText = currentLevel;
}

// --- Speech Recognition ---
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    if (transcript.toLowerCase() === currentWord.toLowerCase()) {
      feedbackDiv.innerText = "✅ Correct!";
      score += 10;
      scoreSpan.innerText = score;
      
      // Level up every 50 points
      if (score >= currentLevel * 50 && currentLevel < Object.keys(levels).length) {
        currentLevel += 1;
        updateLevel();
        feedbackDiv.innerText += " 🎉 Level Up!";
      }
    } else {
      feedbackDiv.innerText = `❌ Try Again: You said '${transcript}'`;
    }
    // Load next word after 1 second
    setTimeout(nextWord, 1000);
  };

  recognition.onerror = function(event) {
    feedbackDiv.innerText = 'Error: ' + event.error;
  };
} else {
  alert('Your browser does not support Speech Recognition API. Use Chrome.');
}

// --- Buttons ---
startBtn.addEventListener('click', () => {
  feedbackDiv.innerText = '';
  recognition.start();
});

// --- Audio Recording ---
recordBtn.addEventListener('click', async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      downloadLink.href = audioUrl;
      downloadLink.download = `${currentWord}.wav`;
      downloadLink.style.display = 'block';
      downloadLink.innerText = `Download recording of "${currentWord}"`;
    };

    mediaRecorder.start();
    recordBtn.innerText = "Stop Recording";
  } else if (mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordBtn.innerText = "Record Audio";
  }
});
