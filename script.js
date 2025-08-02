const audio = document.getElementById("audioPlayer");
const volumeSlider = document.getElementById("volume");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 100;

const themes = {
  chill: {
    file: "assets/chill.mp3",
    bg: "linear-gradient(135deg, #3a6186, #89253e)"
  },
  relax: {
    file: "assets/relax.mp3",
    bg: "linear-gradient(135deg, #4568dc, #b06ab3)"
  },
  night: {
    file: "assets/night.mp3",
    bg: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
  }
};

let audioCtx = null;
let analyser = null;
let sourceNode = null;
let dataArray;
let bufferLength;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (sourceNode) {
    sourceNode.disconnect();
  }

  sourceNode = audioCtx.createMediaElementSource(audio);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 64;

  sourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);

  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) - 2;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i];
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
    x += barWidth + 2;
  }
}

function changeTheme(theme) {
  const { file, bg } = themes[theme];
  document.body.style.background = bg;

  // Ganti lagu
  audio.src = file;
  audio.load();
  pauseMusic(); // Set ke pause dulu
}

async function playMusic() {
  if (!audioCtx) {
    initAudioContext();
  }

  try {
    await audioCtx.resume();
    await audio.play();
  } catch (err) {
    console.error("Play error:", err);
  }
}

function pauseMusic() {
  audio.pause();
}

volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
});

document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener("change", () => {
    if (radio.checked) {
      changeTheme(radio.id);
    }
  });
});

audio.volume = volumeSlider.value;
drawVisualizer();
changeTheme("chill");
