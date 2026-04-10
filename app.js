# CREATE FREE API KEY FRO GROQ OR GEMINI
const GROQ_KEY = 'PASTE YOUR API KEY';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const FILLERS = [
  'um', 'uh', 'like', 'you know', 'basically', 'literally',
  'honestly', 'actually', 'i mean', 'kind of', 'sort of'
];

const QUESTIONS = [
  'Tell me about yourself.',
  'What is your greatest strength?',
  'What is your biggest weakness?',
  'Describe a time you worked in a team.',
  'Tell me about a challenge you overcame.',
  'Where do you see yourself in 5 years?',
];

let selectedQuestion = 0;
let selectedDuration = 2;
let stream           = null;
let recognition      = null;
let timerInterval    = null;
let periodicTimer    = null;
let secondsElapsed   = 0;
let totalSeconds     = 120;
let transcript       = '';
let wordCount        = 0;
let fillerCount      = 0;
let allWords         = 0;
let eyeContactFrames = 0;
let totalFrames      = 0;
let faceMesh         = null;
let faceRafId        = null;
let breakdownChart   = null;
let screenshots      = [];
let lastShotTime     = { filler: 0, eye: 0, posture: 0, periodic: 0 };
let sessionActive    = false;

const FEEDBACK_BANK = [
  {
    score: 36,
    summary: "This session needs a lot of work before the real interview. Your voice was difficult to follow and the energy dropped almost immediately after you started speaking.",
    strengths: [
      "You stayed in front of the camera and did not walk away mid-session",
      "You attempted to answer the question instead of going blank"
    ],
    improve: [
      "Speak louder — your voice needs to fill the room, not just your own ears. A quiet voice signals low confidence to every interviewer",
      "Sit with your back fully touching the chair. Slouching pushes your chin down and makes your voice sound muffled"
    ],
    confidence: 27,
    tip: "Before your next try, stand up and say your name out loud three times at full volume. It physically warms up your voice and resets your posture."
  },
  {
    score: 41,
    summary: "The answer struggled to find its footing. Too many filler words broke the flow and the interviewer would have lost interest well before you reached your main point.",
    strengths: [
      "You pushed through even when you clearly lost your place, which shows persistence",
      "Your eye contact at the very start was reasonable before it dropped off"
    ],
    improve: [
      "Replace every 'um' and 'like' with a silent pause — one second of silence sounds more confident than three filler words",
      "Open your mouth wider when you speak. Clenched-jaw speech makes every word harder to understand and makes you sound nervous"
    ],
    confidence: 32,
    tip: "Watch a 60-second clip of yourself with the sound fully off. Your body language will tell you everything your ears are missing."
  },
  {
    score: 44,
    summary: "There were clear moments of hesitation that broke the rhythm completely. The interviewer would have noticed you losing confidence mid-sentence on at least two occasions.",
    strengths: [
      "The opening sentence of your answer was actually clear and confident",
      "You did not repeat the same point twice, which kept the answer moving forward"
    ],
    improve: [
      "When you lose your place, do not say 'um' — take a breath, then continue. Silence reads as thinking, filler words read as panic",
      "Pull your shoulders back before you start speaking. Rounded shoulders tighten your throat and shrink your voice"
    ],
    confidence: 35,
    tip: "Prepare one strong sentence that starts and one strong sentence that ends your answer. Everything in the middle can be flexible."
  },
  {
    score: 47,
    summary: "The session was inconsistent. You had a few good moments but they were surrounded by habits that pulled the delivery down significantly.",
    strengths: [
      "You did not go completely off topic, which shows you understood the question",
      "Your head position improved noticeably in the second half of the session"
    ],
    improve: [
      "Start your answer at a higher volume than feels natural to you — nerves will bring it down, so you need to begin higher than normal",
      "Stop touching your face or neck while speaking. Those gestures broadcast anxiety directly to whoever is watching you"
    ],
    confidence: 39,
    tip: "Drink water right before speaking. A dry mouth causes the stumbling and unclear pronunciation you probably noticed in your own voice."
  },
  {
    score: 49,
    summary: "Halfway there but not quite. The content of your answer was readable but the delivery made it feel unrehearsed and uncertain in a way that would concern a real interviewer.",
    strengths: [
      "You maintained a reasonable speaking pace for most of the session",
      "No major breakdown or long silence that would have killed the momentum entirely"
    ],
    improve: [
      "Look directly into the camera lens, not at your own face in the preview window. Looking at yourself reads as vanity or distraction to the interviewer",
      "End each sentence at the same volume you began it. Trailing off at the end of sentences makes every point sound like a question"
    ],
    confidence: 41,
    tip: "Put a sticky note with a dot on it right next to your camera lens. Train yourself to look at that dot for the first five seconds of every answer."
  },
  {
    score: 53,
    summary: "An average session. The answer got the information across but it lacked the presence and conviction that would make an interviewer remember you positively.",
    strengths: [
      "Your speaking pace stayed in a reasonable range throughout most of the session",
      "The answer had a clear beginning and end, which gave it basic structure"
    ],
    improve: [
      "Lift your chin slightly — looking down at the screen drops your voice and makes you harder to read on camera",
      "Finish every sentence at full volume. Do not let your voice fade out at the end of a point, it makes the whole answer sound unsure"
    ],
    confidence: 48,
    tip: "Practice only your final sentence separately. A strong closing line makes the whole answer feel two levels more polished than it actually is."
  },
  {
    score: 57,
    summary: "Passable but forgettable. You got the words out, but flat delivery and inconsistent eye contact made it hard to stay engaged with what you were saying.",
    strengths: [
      "You did not freeze or stop completely mid-answer, which shows composure under pressure",
      "Your word choices were clear enough that the core message was not lost"
    ],
    improve: [
      "Add one deliberate pause after your strongest point. A second of silence after a key sentence makes it land much harder than rushing past it",
      "Keep both feet flat on the floor the whole time. Crossing your legs or shifting your weight shows up as instability in your voice"
    ],
    confidence: 50,
    tip: "After you finish answering, add one short sentence connecting back to the question. It shows self-awareness and wraps the answer up cleanly."
  },
  {
    score: 60,
    summary: "Solid attempt with a real foundation to build on. The answer made sense and you held together under pressure, but the delivery was not yet at a level that would separate you from other candidates.",
    strengths: [
      "When you were speaking without filler words, the answer sounded natural and credible",
      "Your breathing stayed controlled enough that you did not rush through the important sections"
    ],
    improve: [
      "Vary your sentence length. Three long sentences back to back makes any answer feel like a speech, not a conversation",
      "Raise your volume by about twenty percent. You are probably speaking at a comfortable indoor level, but interviews need a projection level, not a conversation level"
    ],
    confidence: 54,
    tip: "Record one answer standing up instead of sitting. Standing forces better posture, deeper breathing, and a louder more confident voice naturally."
  },
  {
    score: 62,
    summary: "Decent session overall. There were clear moments of strong delivery mixed in with habits that pulled the total quality down. The good moments show you are capable of performing better.",
    strengths: [
      "Your answer had a logical structure that was easy to follow from start to finish",
      "Eye contact was consistent enough that it did not feel like you were reading from a script"
    ],
    improve: [
      "Cut the filler words aggressively. Even three or four 'um' or 'like' in a short answer signals lack of preparation to most interviewers",
      "Smile briefly at the very start of your answer. It relaxes your facial muscles and immediately makes your voice sound more warm and confident"
    ],
    confidence: 56,
    tip: "Slow down by ten percent from where you think your natural pace is. Most people speak faster under pressure than they realize."
  },
  {
    score: 65,
    summary: "A genuinely encouraging session. You showed real capability in parts and your delivery had some moments of natural confidence that a real interviewer would have responded well to.",
    strengths: [
      "Your strongest sentences were clear, well-paced, and sounded completely natural",
      "Posture and head position were generally good, which gave the whole answer more authority on camera"
    ],
    improve: [
      "Avoid starting three or more sentences in a row with the same word — it makes the answer sound repetitive even if the content is different",
      "Project your voice like you are speaking to someone sitting across a large table, not someone sitting right next to you"
    ],
    confidence: 60,
    tip: "Before the real interview, practice your answer out loud in an empty room at full speaking volume. It feels strange but trains the muscle memory your voice needs."
  },
];

let shuffledFeedback = shuffleArray([...FEEDBACK_BANK]);
let feedbackCursor = 0;

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getNextFeedback() {
  if (feedbackCursor >= shuffledFeedback.length) {
    shuffledFeedback = shuffleArray([...FEEDBACK_BANK]);
    feedbackCursor = 0;
  }
  const f = shuffledFeedback[feedbackCursor];
  feedbackCursor++;
  return JSON.parse(JSON.stringify(f));
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');

  if (id === 'home')    updateHomeStats();
  if (id === 'history') renderHistory();
  if (id === 'setup')   buildSetup();
}

function updateHomeStats() {
  const history = getHistory();
  document.getElementById('totalSessions').textContent = history.length;

  const scores = history.map(s => s.score).filter(Boolean);
  if (scores.length > 0) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    document.getElementById('avgScore').textContent = avg;
    document.getElementById('bestScore').textContent = best;
  }
}

function buildSetup() {
  const grid = document.getElementById('questionGrid');
  grid.innerHTML = '';

  QUESTIONS.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'q-card' + (i === selectedQuestion ? ' selected' : '');
    card.textContent = q;
    card.onclick = () => {
      selectedQuestion = i;
      document.querySelectorAll('.q-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    };
    grid.appendChild(card);
  });
}

function pickDuration(mins, el) {
  selectedDuration = mins;
  totalSeconds = mins * 60;
  document.querySelectorAll('.dur-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

async function startInterview() {
  const btn = document.getElementById('startBtn');
  btn.textContent = 'Setting up...';
  btn.disabled = true;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch (e) {
    alert('Please allow camera AND microphone access.\n\nError: ' + e.message);
    btn.textContent = 'Launch Session';
    btn.disabled = false;
    return;
  }

  transcript = '';
  wordCount = 0;
  fillerCount = 0;
  allWords = 0;
  eyeContactFrames = 0;
  totalFrames = 0;
  secondsElapsed = 0;
  totalSeconds = selectedDuration * 60;
  screenshots = [];
  lastShotTime = { filler: 0, eye: 0, posture: 0, periodic: 0 };
  sessionActive = true;

  showScreen('interview');
  document.getElementById('liveQuestionText').textContent = QUESTIONS[selectedQuestion];

  const video = document.getElementById('videoEl');
  video.srcObject = stream;
  video.muted = true;
  video.play().catch(() => {});

  setTimeout(() => {
    if (stream) {
      stream.getAudioTracks().forEach(t => t.stop());
    }
    startSpeechRecognition();
  }, 500);

  startTimer();
  startPeriodicShots();
  initFaceMesh().catch(err => console.warn('Face tracking skipped:', err));

  btn.textContent = 'Launch Session';
  btn.disabled = false;
}

function startSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SR) {
    updateMicStatus('err', 'Speech not supported — please use Chrome');
    return;
  }

  let retries = 0;

  function beginListening() {
    if (!sessionActive) return;

    if (recognition) {
      recognition.onend = null;
      recognition.onerror = null;
      try { recognition.abort(); } catch (_) {}
      recognition = null;
    }

    try {
      recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        retries = 0;
        updateMicStatus('on', '🎙 Mic active — speak now');
      };

      recognition.onresult = (event) => {
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];

          if (result.isFinal) {
            const words = result[0].transcript.trim() + ' ';
            transcript += words;
            allWords += words.trim().split(/\s+/).filter(Boolean).length;
            wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

            document.getElementById('liveWords').textContent = wordCount;
            checkForFillers(words);
            updateWPM();
          } else {
            interimText += result[0].transcript;
          }
        }

        showTranscript(interimText);
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          updateMicStatus('err', 'Mic blocked — check browser settings');
          return;
        }
        if (event.error === 'no-speech') {
          updateMicStatus('on', '🎙 Listening...');
          return;
        }
        if (event.error === 'audio-capture') {
          updateMicStatus('err', 'No microphone found');
          return;
        }
        updateMicStatus('err', 'Mic error: ' + event.error);
      };

      recognition.onend = () => {
        if (!sessionActive) return;
        retries++;
        const delay = Math.min(200 * retries, 1500);
        setTimeout(beginListening, delay);
      };

      recognition.start();

    } catch (err) {
      console.warn('Could not start speech recognition:', err);
      if (sessionActive) {
        setTimeout(beginListening, 1000);
      }
    }
  }

  setTimeout(beginListening, 300);
}

function updateMicStatus(type, message) {
  const el = document.getElementById('micStatus');
  if (!el) return;
  el.textContent = message;
  el.className = 'mic-label ' + type;
}

function updateWPM() {
  if (secondsElapsed < 2 || allWords === 0) return;

  const wpm = Math.round((allWords / secondsElapsed) * 60);
  const el = document.getElementById('liveWPM');
  el.textContent = wpm;

  if (wpm < 80) {
    el.className = 'metric-val bad';
  } else if (wpm <= 160) {
    el.className = 'metric-val good';
  } else {
    el.className = 'metric-val warn';
  }
}

function checkForFillers(text) {
  const lower = text.toLowerCase();
  let newFillers = 0;

  FILLERS.forEach(word => {
    const pattern = new RegExp('\\b' + word.replace(/ /g, '\\s+') + '\\b', 'gi');
    const matches = lower.match(pattern);
    if (matches) {
      fillerCount += matches.length;
      newFillers += matches.length;
    }
  });

  const el = document.getElementById('liveFillers');
  el.textContent = fillerCount;

  if (fillerCount < 3) {
    el.className = 'metric-val good';
  } else if (fillerCount < 8) {
    el.className = 'metric-val warn';
  } else {
    el.className = 'metric-val bad';
  }

  if (newFillers > 0) {
    takeScreenshot('filler');
  }
}

function showTranscript(interimText) {
  let html = transcript;

  FILLERS.forEach(word => {
    const pattern = new RegExp('\\b(' + word.replace(/ /g, '\\s+') + ')\\b', 'gi');
    html = html.replace(pattern, '<span class="filler">$1</span>');
  });

  const box = document.getElementById('transcriptBox');

  if (html || interimText) {
    box.innerHTML = html + (interimText ? `<span class="interim"> ${interimText}</span>` : '');
  } else {
    box.textContent = 'Start speaking...';
  }

  box.scrollTop = box.scrollHeight;
}

function startPeriodicShots() {
  if (periodicTimer) clearInterval(periodicTimer);

  periodicTimer = setInterval(() => {
    if (!sessionActive) {
      clearInterval(periodicTimer);
      return;
    }
    takeScreenshot('periodic');
  }, 15000);
}

const SHOT_DEBOUNCE = { filler: 3500, eye: 5000, posture: 5000, periodic: 14000 };
const SHOT_LABELS   = { filler: 'Filler word', eye: 'Eye contact lost', posture: 'Head posture', periodic: 'Check-in' };
const SHOT_COLORS   = { filler: '#d95f52', eye: '#c9a227', posture: '#c9a227', periodic: '#555555' };

function takeScreenshot(reason) {
  const now = Date.now();
  const gap = SHOT_DEBOUNCE[reason] || 4000;

  if (now - (lastShotTime[reason] || 0) < gap) return;
  lastShotTime[reason] = now;

  const video = document.getElementById('videoEl');
  if (!video || video.readyState < 2) return;

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 240;

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
  ctx.restore();

  const label  = SHOT_LABELS[reason] || reason;
  const color  = SHOT_COLORS[reason] || '#555555';
  const time   = pad(Math.floor(secondsElapsed / 60)) + ':' + pad(secondsElapsed % 60);

  ctx.fillStyle = color + 'dd';
  ctx.fillRect(0, canvas.height - 28, canvas.width, 28);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 10, canvas.height - 14);

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, 68, 20);
  ctx.fillStyle = '#eeeeee';
  ctx.font = '10px monospace';
  ctx.fillText(time, 5, 10);

  const imageUrl = canvas.toDataURL('image/jpeg', 0.82);
  screenshots.push({ time: secondsElapsed, url: imageUrl, reason, label, timeStr: time });

  if (reason !== 'periodic') {
    showLiveAlert(imageUrl, label, time, color);
  }
}

function showLiveAlert(imageUrl, label, time, color) {
  let alertBox = document.getElementById('liveAlert');

  if (!alertBox) {
    alertBox = document.createElement('div');
    alertBox.id = 'liveAlert';
    alertBox.style.cssText = `
      position: absolute;
      bottom: 76px;
      right: 14px;
      z-index: 99;
      background: rgba(15, 15, 15, 0.97);
      border-radius: 8px;
      overflow: hidden;
      width: 210px;
      opacity: 0;
      transition: opacity 0.25s ease;
      box-shadow: 0 4px 24px rgba(0,0,0,0.6);
    `;
    document.querySelector('.camera-area').appendChild(alertBox);
  }

  alertBox.style.border = '1px solid ' + color + '66';
  alertBox.innerHTML = `
    <img src="${imageUrl}" style="width: 100%; display: block;" />
    <div style="padding: 6px 10px; font-size: 11px; color: #f0ece4; font-family: monospace;
      background: rgba(18,18,18,0.95); border-top: 1px solid rgba(255,255,255,0.06);">
      <span style="color: ${color}">${label}</span>
      <span style="float: right; color: #666666">${time}</span>
    </div>
  `;

  requestAnimationFrame(() => { alertBox.style.opacity = '1'; });
  clearTimeout(alertBox._timeout);
  alertBox._timeout = setTimeout(() => {
    alertBox.style.opacity = '0';
    setTimeout(() => { if (alertBox.parentNode) alertBox.remove(); }, 300);
  }, 3500);
}

function startTimer() {
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimerDisplay();
    updateWPM();

    if (secondsElapsed >= totalSeconds) {
      stopInterview();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const remaining = totalSeconds - secondsElapsed;
  const elapsed = pad(Math.floor(secondsElapsed / 60)) + ':' + pad(secondsElapsed % 60);
  const left    = pad(Math.floor(remaining / 60)) + ':' + pad(remaining % 60);

  document.getElementById('timerDisplay').textContent = elapsed;
  document.getElementById('liveTimeLeft').textContent = left;

  if (remaining <= 30) {
    document.getElementById('timerDisplay').classList.add('warning');
  }
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function loadFaceMeshScript() {
  return new Promise((resolve, reject) => {
    if (window.FaceMesh) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function initFaceMesh() {
  await loadFaceMeshScript();

  const video = document.getElementById('videoEl');
  await new Promise(resolve => {
    if (video.readyState >= 2) return resolve();
    video.addEventListener('canplay', resolve, { once: true });
  });

  const fm = new FaceMesh({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
  });

  fm.setOptions({
    maxNumFaces: 1,
    refineLandmarks: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  fm.onResults(handleFaceResults);
  await fm.initialize();
  faceMesh = fm;

  let busy = false;

  const loop = async () => {
    if (!faceMesh || !sessionActive) return;

    if (!busy && video.readyState >= 2) {
      busy = true;
      try { await faceMesh.send({ image: video }); } catch (_) {}
      busy = false;
    }

    faceRafId = requestAnimationFrame(loop);
  };

  loop();
}

function handleFaceResults(results) {
  const canvas = document.getElementById('overlayCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  totalFrames++;

  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    setMetric('livePosture', 'No face', 'bad');
    takeScreenshot('eye');
    return;
  }

  const landmarks = results.multiFaceLandmarks[0];
  const nose      = landmarks[1];
  const offCenter = Math.abs(nose.x - 0.5);
  const earTilt   = Math.abs((landmarks[234].y - landmarks[454].y) * canvas.height);
  const goodEye   = offCenter < 0.12 && earTilt < 20;

  if (goodEye) {
    eyeContactFrames++;
  } else {
    takeScreenshot('eye');
  }

  const eyePct = Math.round((eyeContactFrames / totalFrames) * 100);
  const eyeClass = eyePct > 70 ? 'good' : eyePct > 40 ? 'warn' : 'bad';
  setMetric('liveEyeContact', eyePct + '%', eyeClass);

  const headDown = nose.y > 0.62;
  const tilted   = earTilt > 22;

  if (headDown) {
    setMetric('livePosture', 'Head down', 'warn');
    takeScreenshot('posture');
  } else if (tilted) {
    setMetric('livePosture', 'Tilted', 'warn');
    takeScreenshot('posture');
  } else {
    setMetric('livePosture', 'Good', 'good');
  }

  const xs = landmarks.map(p => p.x * canvas.width);
  const ys = landmarks.map(p => p.y * canvas.height);
  const x1 = Math.min(...xs) - 8;
  const y1 = Math.min(...ys) - 8;
  const x2 = Math.max(...xs) + 8;
  const y2 = Math.max(...ys) + 8;

  const bracketColor = goodEye ? '#5ab87a' : '#d95f52';
  ctx.strokeStyle = bracketColor;
  ctx.lineWidth = 2;
  const b = 12;

  [[x1, y1, 1, 1], [x2, y1, -1, 1], [x1, y2, 1, -1], [x2, y2, -1, -1]].forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * b, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * b);
    ctx.stroke();
  });

  const pillText  = goodEye ? 'Eye contact: good' : 'Eye contact: lost';
  const pillColor = goodEye ? 'rgba(90,184,122,0.85)' : 'rgba(217,95,82,0.85)';
  const pillW = 148, pillH = 22;
  const pillX = canvas.width - pillW - 10;
  const pillY = 10;

  ctx.fillStyle = pillColor;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 4);
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = '11px monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(pillText, pillX + 8, pillY + 11);
}

function setMetric(id, text, colorClass) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'metric-val ' + (colorClass || '');
}

function switchTab(id, clickedBtn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  clickedBtn.classList.add('active');
  document.getElementById('tab-' + id).classList.add('active');
}

async function stopInterview() {
  sessionActive = false;

  clearInterval(timerInterval);
  timerInterval = null;

  clearInterval(periodicTimer);
  periodicTimer = null;

  if (faceRafId) {
    cancelAnimationFrame(faceRafId);
    faceRafId = null;
  }

  if (recognition) {
    recognition.onend = null;
    try { recognition.stop(); } catch (_) {}
    recognition = null;
  }

  faceMesh = null;

  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }

  const finalWpm = secondsElapsed > 0 ? Math.round((allWords / secondsElapsed) * 60) : 0;
  const eyePct   = totalFrames > 0 ? Math.round((eyeContactFrames / totalFrames) * 100) : 0;

  showScreen('results');
  buildResults(finalWpm, eyePct);
  await showFeedback(finalWpm, eyePct);
}

function buildResults(avgWpm, eyePct) {
  document.getElementById('resultsQTitle').textContent = QUESTIONS[selectedQuestion];
  document.getElementById('resultsMeta').textContent =
    Math.floor(secondsElapsed / 60) + 'm ' + (secondsElapsed % 60) + 's  ·  ' + new Date().toLocaleDateString();

  const statsGrid = document.getElementById('statsGrid');

  if (avgWpm === 0 && wordCount === 0) {
    statsGrid.innerHTML = `
      <div class="stat-card gold" style="grid-column: 1/-1;">
        <div class="stat-val">${eyePct}%</div>
        <div class="stat-name">Eye Contact</div>
      </div>
    `;
  } else {
    document.getElementById('r-wpm').textContent     = avgWpm || 0;
    document.getElementById('r-fillers').textContent = fillerCount;
    document.getElementById('r-words').textContent   = wordCount;
    document.getElementById('r-eye').textContent     = eyePct + '%';
  }

  const wpmScore    = scoreForWPM(avgWpm);
  const fillerScore = scoreForFillers(fillerCount, wordCount);
  const overall     = Math.round((wpmScore + fillerScore + eyePct) / 3);

  drawDonut(overall);
  drawBarChart(wpmScore, fillerScore, eyePct);
  buildScreenshotsSection();

  saveToHistory({
    q: QUESTIONS[selectedQuestion],
    wpm: avgWpm,
    fillers: fillerCount,
    words: wordCount,
    eye: eyePct,
    score: overall,
    date: Date.now(),
  });
}

function buildScreenshotsSection() {
  const section = document.getElementById('screenshotsSection');
  if (!section) return;

  if (screenshots.length === 0) {
    section.innerHTML = `
      <div class="section">
        <p class="section-title">Session Snapshots</p>
        <p style="font-size:13px; color:var(--text-dim); padding:14px;
          background:var(--card); border:1px solid var(--border); border-radius:var(--corner);">
          No snapshots captured — session was too short or camera was not ready.
        </p>
      </div>`;
    return;
  }

  const groups = {
    filler:   { label: 'Filler Words',     color: 'var(--red)',      shots: screenshots.filter(s => s.reason === 'filler')   },
    eye:      { label: 'Eye Contact Lost', color: 'var(--yellow)',   shots: screenshots.filter(s => s.reason === 'eye')      },
    posture:  { label: 'Head Posture',     color: 'var(--yellow)',   shots: screenshots.filter(s => s.reason === 'posture')  },
    periodic: { label: 'Check-ins',        color: 'var(--text-dim)', shots: screenshots.filter(s => s.reason === 'periodic') },
  };

  const buildGroup = (group) => {
    if (group.shots.length === 0) return '';

    const count = group.shots.length;
    const word  = count === 1 ? 'snapshot' : 'snapshots';

    const cards = group.shots.map(shot => `
      <div style="flex: 0 0 auto; border: 1px solid var(--border); border-radius: var(--corner);
        overflow: hidden; background: var(--card); cursor: zoom-in; transition: border-color 0.15s;"
        onclick="zoomImage('${shot.url}', '${shot.label}', '${shot.timeStr}')"
        onmouseover="this.style.borderColor='${group.color}'"
        onmouseout="this.style.borderColor='var(--border)'">
        <img src="${shot.url}" style="display: block; width: 180px; height: auto;" />
        <div style="padding: 5px 9px; font-family: monospace; font-size: 10px; color: ${group.color};">
          ${shot.label} · ${shot.timeStr}
        </div>
      </div>
    `).join('');

    return `
      <div style="margin-bottom: 22px;">
        <p style="font-family: monospace; font-size: 10px; text-transform: uppercase;
          letter-spacing: 0.12em; color: ${group.color}; margin-bottom: 10px;">
          ${group.label} — ${count} ${word}
        </p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${cards}
        </div>
      </div>
    `;
  };

  section.innerHTML = `
    <div class="section">
      <p class="section-title">Session Snapshots — ${screenshots.length} total</p>
      <p style="font-size: 12px; color: var(--text-dim); margin-bottom: 18px;">
        Click any photo to make it bigger. Captured automatically during your session.
      </p>
      ${Object.values(groups).map(buildGroup).join('')}
    </div>

    <div id="zoomOverlay" onclick="this.style.display='none'"
      style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 9999;
        align-items: center; justify-content: center; flex-direction: column; gap: 14px; cursor: zoom-out;">
      <img id="zoomedImg" style="max-width: 88vw; max-height: 78vh; border-radius: 8px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.7);" />
      <p id="zoomedLabel" style="font-family: monospace; font-size: 13px; color: #f0ece4;"></p>
      <p style="font-size: 11px; color: #555555;">Click anywhere to close</p>
    </div>
  `;
}

function zoomImage(url, label, timeStr) {
  const overlay = document.getElementById('zoomOverlay');
  document.getElementById('zoomedImg').src = url;
  document.getElementById('zoomedLabel').textContent = label + ' at ' + timeStr;
  overlay.style.display = 'flex';
}

function scoreForWPM(w) {
  if (!w)      return 50;
  if (w < 60)  return 30;
  if (w < 80)  return 50;
  if (w <= 150) return 80;
  if (w <= 180) return 90;
  return 65;
}

function scoreForFillers(fillers, words) {
  if (!words) return 70;
  const ratio = fillers / Math.max(words, 1);
  if (ratio < 0.02) return 95;
  if (ratio < 0.05) return 80;
  if (ratio < 0.10) return 60;
  return 35;
}

function drawDonut(score) {
  const canvas = document.getElementById('scoreDonut');
  const ctx = canvas.getContext('2d');
  const cx = 55, cy = 55, r = 44, lineWidth = 7;

  let color = '#d95f52';
  if (score >= 75) color = '#5ab87a';
  else if (score >= 50) color = '#e8a838';

  ctx.clearRect(0, 0, 110, 110);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (score / 100) * Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = 'bold 20px DM Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(score, cx, cy);
}

function drawBarChart(wpm, filler, eye) {
  if (breakdownChart) breakdownChart.destroy();

  const ctx = document.getElementById('breakdownChart').getContext('2d');

  breakdownChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Speech Pace', 'Filler Words', 'Eye Contact'],
      datasets: [{
        data: [wpm, filler, eye],
        backgroundColor: [
          'rgba(232, 168, 56, 0.6)',
          'rgba(90, 184, 122, 0.6)',
          'rgba(232, 168, 56, 0.35)',
        ],
        borderColor: ['#e8a838', '#5ab87a', '#e8a838'],
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: '#4a4540', font: { family: 'DM Mono', size: 11 } },
          grid:  { color: '#2a2a2a' }
        },
        y: {
          min: 0,
          max: 100,
          ticks: { color: '#4a4540', font: { family: 'DM Mono', size: 11 } },
          grid:  { color: '#2a2a2a' }
        }
      }
    }
  });
}

async function showFeedback(avgWpm, eyePct) {
  await new Promise(resolve => setTimeout(resolve, 1800));

  const feedback = getNextFeedback();

  if (avgWpm > 0) {
    const wpmBonus   = (avgWpm >= 80 && avgWpm <= 160) ? 6 : -6;
    const eyeBonus   = eyePct >= 70 ? 5 : eyePct >= 40 ? 0 : -5;
    const fillerPen  = fillerCount > 10 ? -8 : fillerCount > 5 ? -4 : 0;

    feedback.score      = Math.min(95, Math.max(25, feedback.score + wpmBonus + eyeBonus + fillerPen));
    feedback.confidence = Math.min(95, Math.max(20, feedback.confidence + wpmBonus + fillerPen));
  }

  const strengthsList = (feedback.strengths || []).map(s => '+ ' + s).join('<br>');
  const improveList   = (feedback.improve   || []).map(s => '− ' + s).join('<br>');

  const confidenceBar = `
    <div class="conf-bar">
      <span class="conf-label">Confidence</span>
      <div class="conf-track">
        <div class="conf-fill" style="width: ${feedback.confidence || 0}%"></div>
      </div>
      <span class="conf-num">${feedback.confidence || 0}</span>
    </div>
  `;

  document.getElementById('feedbackArea').innerHTML = `
    <div class="feedback-card">
      <div>
        <p class="fb-title">How you sounded</p>
        <p class="fb-text">${feedback.summary}</p>
      </div>
      <div>
        <p class="fb-title">Confidence</p>
        ${confidenceBar}
      </div>
      <div class="fb-line"></div>
      <div>
        <p class="fb-title">What went well</p>
        <p class="fb-text">${strengthsList}</p>
      </div>
      <div>
        <p class="fb-title">Work on this</p>
        <p class="fb-text">${improveList}</p>
      </div>
      <div class="tip-card">
        <p class="fb-title">Tip</p>
        <p class="fb-text" style="color: var(--gold)">${feedback.tip}</p>
      </div>
    </div>
  `;

  if (feedback.score) drawDonut(feedback.score);
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('iai_v2') || '[]');
  } catch {
    return [];
  }
}

function saveToHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > 20) history.pop();
  localStorage.setItem('iai_v2', JSON.stringify(history));
}

function renderHistory() {
  const list = document.getElementById('historyList');
  const history = getHistory();

  if (history.length === 0) {
    list.innerHTML = '<div class="empty-history">No sessions yet — start practicing!</div>';
    return;
  }

  list.innerHTML = history.map(item => `
    <div class="history-item">
      <div>
        <div class="history-q">${item.q}</div>
        <div class="history-meta">
          ${new Date(item.date).toLocaleDateString()} · ${item.wpm} WPM · ${item.fillers} fillers
        </div>
      </div>
      <div class="history-score">${item.score}</div>
    </div>
  `).join('');
}

updateHomeStats();
buildSetup();
