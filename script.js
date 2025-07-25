let player;
let videoList = [
  "M7lc1UVf-VE", // Replace these with real video IDs
  "dQw4w9WgXcQ",
  "eY52Zsg-KVI",
  "oHg5SJYRHA0"
];
let currentVideoIndex = 0;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "270",
    width: "480",
    videoId: videoList[currentVideoIndex],
    playerVars: {
      autoplay: 0,
      controls: 1,
    },
  });
}

function loadCustomVideo() {
  const url = document.getElementById("video-url").value.trim();
  const videoId = extractVideoId(url);
  if (videoId && player) {
    player.loadVideoById(videoId);
  } else {
    alert("Invalid YouTube URL");
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

      if (gesture === "Fist") {
        player?.playVideo();
      } else if (gesture === "Palm") {
        player?.pauseVideo();
      } else if (gesture === "Index") {
        let vol = player.getVolume();
        if (vol < 100) player.setVolume(vol + 5);
      } else if (gesture === "Two Fingers") {
        let vol = player.getVolume();
        if (vol > 0) player.setVolume(vol - 5);
      } else if (gesture === "Three Fingers") {
        currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
        player.loadVideoById(videoList[currentVideoIndex]);
      }
    } else {
      document.getElementById("gesture-name").textContent = "None";
    }
  });

  camera.start();
}

function recognizeGesture(landmarks) {
  const isFingerUp = (tipIndex) => landmarks[tipIndex].y < landmarks[tipIndex - 2].y;

  const indexUp = isFingerUp(8);
  const middleUp = isFingerUp(12);
  const ringUp = isFingerUp(16);
  const pinkyUp = isFingerUp(20);
  const thumbUp = landmarks[4].x < landmarks[3].x; // thumb extended left

  const upCount = [indexUp, middleUp, ringUp, pinkyUp, thumbUp].filter(Boolean).length;

  if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbUp) return "Fist";
  if (indexUp && middleUp && ringUp && pinkyUp && thumbUp) return "Palm";
  if (indexUp && !middleUp && !ringUp && !pinkyUp && !thumbUp) return "Index";
  if (indexUp && middleUp && !ringUp && !pinkyUp && !thumbUp) return "Two Fingers";
  if (indexUp && middleUp && ringUp && !pinkyUp && !thumbUp) return "Three Fingers";

  return "Unknown";
}

document.addEventListener("DOMContentLoaded", () => {
  initializeHands();
  initializeCamera();

  document.getElementById("load-video").addEventListener("click", loadCustomVideo);
  document.getElementById("video-url").addEventListener("keypress", (e) => {
    if (e.key === "Enter") loadCustomVideo();
  });

  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
});
