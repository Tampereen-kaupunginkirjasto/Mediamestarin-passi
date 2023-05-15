const passportPageCover = document.querySelector('.passport-page-cover');
const passportPageAgelimit = document.querySelector('.passport-page-agelimit');
const continueButton = document.querySelector('.passport-page-cover .continue-button');

const passportImageContainer = document.querySelector('.passport-image-container');
const videoElement = document.querySelector('.passport-image-live');
const snapshotElement = document.querySelector('.passport-image-snapshot');
const flashEffectElement = document.querySelector('.passport-image-flash');
const captureButton = document.querySelector('.passport-image-button');
const offscreenCanvas = document.createElement('canvas');

const stampTool = document.querySelector('.passport-stamp-tool');
const stampImage = document.querySelector('.passport-stamp-image');

const videoWidth = 1024;
let videoHeight = 0;
let videoTrack;
let videoPauseTimeout;

let isStampHeld = false;

passportImageContainer.style.cursor = 'pointer';
passportImageContainer.addEventListener('click', initVideo);
captureButton.addEventListener('click', handleCapture);
continueButton.addEventListener('click', handleContinue);
stampTool.addEventListener('click', handleStampPickup);

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
  history.pushState({page: 'cover'}, '');
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
  if (passportPageCover.classList.contains('is-live')) {
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
  passportPageCover.classList.remove('is-live');
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
    passportPageCover.classList.add('is-live');
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
  passportPageCover.classList.add('is-live');
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

//
// Stamping
//
function handleStampPickup(event) {
  if (isStampHeld) {
    // Place stamp
    stampImage.style.transform = '';
    const currentStampPosition = stampImage.getBoundingClientRect();
    const stampToolPosition = stampTool.getBoundingClientRect();
    const top = stampToolPosition.bottom - currentStampPosition.top;
    const left = stampToolPosition.left - currentStampPosition.left;
    stampImage.style.transform = `translate(-15%, -85%) translate(${left}px, ${top}px)`;
    stampImage.style.opacity = '1';
    // Reset stamp tool
    isStampHeld = false;
    document.removeEventListener('mousemove', handleStampMove);
    playStampReturnAnimation().then(() => {
      stampTool.style.transform = '';
    });
  }
  else {
    isStampHeld = true;
    const boundingRect = stampTool.getBoundingClientRect();
    // Where on the stamp tool the user clicked
    const clickOffsetTop = boundingRect.top - event.pageY;
    const clickOffsetLeft = boundingRect.left - event.pageX;
    stampTool._initialPosition = {
      top: boundingRect.top - clickOffsetTop,
      left: boundingRect.left - clickOffsetLeft,
    };
    document.addEventListener('mousemove', handleStampMove);
  }
}
function handleStampMove(event) {
  const top = event.pageY - stampTool._initialPosition.top;
  const left = event.pageX - stampTool._initialPosition.left;
  stampTool.style.transform = `translate(${left}px, ${top}px)`;
}
let stampReturnAnimation;
function playStampReturnAnimation() {
  if (stampReturnAnimation !== undefined) {
    stampReturnAnimation.cancel();
  }
  stampReturnAnimation = stampTool.animate(
    [
      {transform: stampTool.style.transform, easing: 'ease-out'},
      {transform: 'translate(0, 0)'},
    ],
    {duration: 300},
  );
  return stampReturnAnimation.finished;
}