# 🎥 Hand Gesture Controlled YouTube Web App

This project is a **full-stack web application** that allows users to control YouTube video playback using **hand gestures** detected in real-time through their webcam. It combines the **YouTube IFrame API**, **MediaPipe Hands**, and **JavaScript** to build a gesture-responsive multimedia interface.

---

## 📌 Features

* ✅ Load YouTube videos dynamically by URL
* ✊ **Fist** – Play Video
* ✋ **Open Palm** – Pause Video
* 👆 **Index Finger Only** – Volume Up
* ✌️ **Two Fingers (Index + Middle)** – Volume Down
* 🤟 **Three Fingers (Index + Middle + Ring)** – Skip to next video in playlist
* 🎥 Real-time webcam gesture detection using **MediaPipe**

---

## 🛠️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Gesture Detection:** [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)
* **Video Playback:** [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)

---

## 🧠 How It Works

1. **User enters a YouTube video URL.**
2. The video is embedded using YouTube IFrame API.
3. Webcam is activated and tracks the user's hand.
4. Using MediaPipe Hands, the system detects hand landmarks.
5. Specific gestures trigger actions on the video player (play, pause, skip, etc.).

---

## ⚠️ Known Issue

> When showing 3 fingers (to skip video), the video was previously stuck repeating the same one.


Simply upload the three files:

* `index.html`
* `style.css`
* `script.js`

---

## 📷 Gesture Chart

| Gesture          | Action      |
| ---------------- | ----------- |
| ✊ Fist           | Play        |
| ✋ Palm           | Pause       |
| 👆 Index Only    | Volume Up   |
| ✌️ Two Fingers   | Volume Down |
| 🤟 Three Fingers | Next Video  |

---

## 📂 Folder Structure

```
project-folder/
├── index.html
├── style.css
├── script.js
```



