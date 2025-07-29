let player;
let videoList = [
  "M7lc1UVf-VE",
  "dQw4w9WgXcQ",
  "eY52Zsg-KVI",
  "oHg5SJYRHA0"
];
let currentVideoIndex = 0;
let lastGesture = "";
let lastGestureTime = 0;
let playerReady = false;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "270",
    width: "480",
    videoId: videoList[currentVideoIndex],
    playerVars: {
      autoplay: 0,
      controls: 1,
    },
    events: {
      onReady: () => {
        playerReady = true;
      }
    }
  });
}

function loadCustomVideo() {
  const url = document.getElementById("video-url").value.trim();
  const videoId = extractVideoId(url);
  if (videoId && playerReady) {
    player.loadVideoById(videoId);
  } else {
    alert("Invalid YouTube URL or player not ready");
  }
}

function extractVideoId(url) {
  const regex = /(?:youtube\.com.*(?:\?v=|\/embed\/)|youtu\.be\/)([^&?/]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function initializeCamera() {
  const video = document.getElementById("webcam");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.play();
}

function initializeHands() {
  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  const video = document.getElementById("webcam");
  const canvas = document.getElementById("gesture-canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.width = 480;
  canvas.height = video.height = 270;

  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 480,
    height: 270,
  });

  hands.onResults((results) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: "#0F0", lineWidth: 3 });
      drawLandmarks(ctx, landmarks, { color: "#F00", lineWidth: 2 });

      const gesture = recognizeGesture(landmarks);
      document.getElementById("gesture-name").textContent = gesture;

      const now = Date.now();
      if (gesture !== lastGesture || now - lastGestureTime > 1500) {
        lastGesture = gesture;
        lastGestureTime = now;

        handleGesture(gesture);
      }
    } else {
      document.getElementById("gesture-name").textContent = "None";
    }
  });

  camera.start();
}

function handleGesture(gesture) {
  if (!playerReady || !player) return;

  switch (gesture) {
    case "Fist":
      player.playVideo();
      break;
    case "Palm":
      player.pauseVideo();
      break;
    case "Index":
      let volUp = player.getVolume();
      if (volUp < 100) player.setVolume(volUp + 10);
      break;
    case "Two Fingers":
      let volDown = player.getVolume();
      if (volDown > 0) player.setVolume(volDown - 10);
      break;
    case "Three Fingers":
      currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
      player.loadVideoById(videoList[currentVideoIndex]);
      break;
  }
}

function recognizeGesture(landmarks) {
  const isFingerUp = (tipIndex, dipIndex) =>
    landmarks[tipIndex].y < landmarks[dipIndex].y - 0.03;

  const indexUp = isFingerUp(8, 6);
  const middleUp = isFingerUp(12, 10);
  const ringUp = isFingerUp(16, 14);
  const pinkyUp = isFingerUp(20, 18);
  const thumbOut = Math.abs(landmarks[4].x - landmarks[3].x) > 0.05;

  const fingers = [thumbOut, indexUp, middleUp, ringUp, pinkyUp];

  if (!thumbOut && !indexUp && !middleUp && !ringUp && !pinkyUp) return "Fist";
  if (thumbOut && indexUp && middleUp && ringUp && pinkyUp) return "Palm";
  if (!thumbOut && indexUp && !middleUp && !ringUp && !pinkyUp) return "Index";
  if (!thumbOut && indexUp && middleUp && !ringUp && !pinkyUp) return "Two Fingers";
  if (!thumbOut && indexUp && middleUp && ringUp && !pinkyUp) return "Three Fingers";

  return "Unknown";
}

document.addEventListener("DOMContentLoaded", () => {
  initializeHands();
  initializeCamera();

  document.getElementById("load-video").addEventListener("click", loadCustomVideo);
  document.getElementById("video-url").addEventListener("keypress", (e) => {
    if (e.key === "Enter") loadCustomVideo();
  });

  // Load YT API script
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
});
