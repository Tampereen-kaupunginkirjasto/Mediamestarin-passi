const passportPageCover = document.querySelector('.passport-page-cover');
const passportPageAgelimit = document.querySelector('.passport-page-agelimit');
const continueButton = document.querySelector('.passport-page-cover .continue-button');
const passportImageContainer = document.querySelector('.passport-image-container');
const videoElement = document.querySelector('.passport-image-live');
const snapshotElement = document.querySelector('.passport-image-snapshot');
const flashEffectElement = document.querySelector('.passport-image-flash');
const captureButton = document.querySelector('.passport-image-button');
const offscreenCanvas = document.createElement('canvas');

const videoWidth = 1024;
let videoHeight = 0;
let videoTrack;
let videoPauseTimeout;

passportImageContainer.style.cursor = 'pointer';
passportImageContainer.addEventListener('click', initVideo);
captureButton.addEventListener('click', handleCapture);
continueButton.addEventListener('click', handleContinue);

//
// Page transitions
//
passportPageCover._passport = {
  enter: function() {
    passportPageCover.style.display = '';
    document.addEventListener('keyup', handleCapture);
    return Promise.resolve();
  },
  exit: function() {
    passportPageCover.style.display = 'none';
    document.removeEventListener('keyup', handleCapture);
    return Promise.resolve();
  },
};
function handleContinue() {
  passportPageCover._passport.exit();
  passportPageAgelimit._passport.enter();
}

//
// Camera controls
//
function handleCapture(event) {
  const SPACEBAR_KEY = ' ';
  const isKeyEvent = event.type === 'keyup';
  if (isKeyEvent && event.key !== SPACEBAR_KEY) {
    return;
  }
  if (passportPageElement.classList.contains('is-live')) {
    capturePhoto();
  }
  else {
    clearPhoto();
  }
}
function capturePhoto() {
  playFlashEffect();
  videoElement.pause();
  captureSnaposhotImageData();
  passportPageElement.classList.remove('is-live');
  clearTimeout(videoPauseTimeout);
  videoPauseTimeout = setTimeout(() => {
    videoTrack.enabled = false;
  });
}
function clearPhoto() {
  const unpauseEffectPromise = playUnpauseEffect();
  videoElement.play();
  videoTrack.enabled = true;
  unpauseEffectPromise.then(() => {
    passportPageElement.classList.add('is-live');
    clearSnapshotImageData();
  });
}

//
// Flash effect
//
let flashEffectAnimation;
function playFlashEffect() {
  if (flashEffectAnimation !== undefined) {
    flashEffectAnimation.cancel();
  }
  flashEffectAnimation = flashEffectElement.animate(
    [
      {opacity: '1', easing: 'ease-out'},
      {opacity: '0'},
    ],
    {duration: 1000},
  );
  return flashEffectAnimation.finished;
}

//
// Unpause effect
//
let videoUnpauseAnimation;
function playUnpauseEffect() {
  if (videoUnpauseAnimation !== undefined) {
    videoUnpauseAnimation.cancel();
  }
  videoUnpauseAnimation = videoElement.animate(
    [
      {opacity: '0'},
      {opacity: '0'},
      {opacity: '1'},
    ],
    {duration: 600},
  );
  return videoUnpauseAnimation.finished;
}

//
// Webcam to video element
//
function initVideo() {
  captureButton.style.display = '';
  passportImageContainer.style.cursor = '';
  passportImageContainer.removeEventListener('click', initVideo);
  passportPageElement.classList.add('is-live');
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'user',
    },
  })
  .then(stream => {
    videoElement.srcObject = stream;
    videoElement.play();
    videoTrack = stream.getTracks()[0];
    window.foo = videoTrack;
  })
  .catch(err => {
    console.error(`An error occurred: ${err}`);
  });
  videoElement.addEventListener('canplay', handleVideo);
}
function handleVideo() {
  videoElement.removeEventListener('canplay', handleVideo);
  videoHeight = videoElement.videoHeight / (videoElement.videoWidth / videoWidth);
  // Firefox has had a bug where the height can't be read from
  // the video, so we will make assumptions if this happens.
  if (isNaN(videoHeight)) {
    videoHeight = videoWidth / (4 / 3);
  }
  videoElement.setAttribute('width', videoWidth);
  videoElement.setAttribute('height', videoHeight);
  offscreenCanvas.setAttribute('width', videoWidth);
  offscreenCanvas.setAttribute('height', videoHeight);
}

//
// Video element to image
//
function captureSnaposhotImageData() {
  const context = offscreenCanvas.getContext('2d');
  offscreenCanvas.width = videoWidth;
  offscreenCanvas.height = videoHeight;
  context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
  const data = offscreenCanvas.toDataURL('image/png');
  snapshotElement.setAttribute('src', data);
}
function clearSnapshotImageData() {
  const context = offscreenCanvas.getContext('2d');
  context.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  const data = offscreenCanvas.toDataURL('image/png');
  snapshotElement.setAttribute('src', data);
}
