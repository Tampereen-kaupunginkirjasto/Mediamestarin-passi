const passportPageCover = document.querySelector('.passport-page-cover');
const passportPageAgelimit = document.querySelector('.passport-page-agelimit');
const passportPageMarketing = document.querySelector('.passport-page-marketing');
const passportPageScreentime = document.querySelector('.passport-page-screentime');
const completionPage = document.querySelector('.completion-page');
const continueButton = document.querySelector('.passport-page-cover .continue-button');

const passportImageContainer = document.querySelector('.passport-image-container');
const videoElement = document.querySelector('.passport-image-live');
const snapshotElement = document.querySelector('.passport-image-snapshot');
const flashEffectElement = document.querySelector('.passport-image-flash');
const captureButton = document.querySelector('.passport-image-button');
const offscreenCanvas = document.createElement('canvas');
const spacebarGuideElement = document.querySelector('.spacebar-guide');

const nameInput = document.querySelector('.passport-name-input');

const stampTool = document.querySelector('.passport-stamp-tool');
const stampToolImage = document.querySelector('.passport-stamp-tool img');
const stampImage = document.querySelector('.passport-stamp-image');
const stampArea = document.querySelector('.passport-stamp-area');

const successSound = new Audio('assets/sound-success.mp3');
const failureSound = new Audio('assets/sound-failure.mp3');
const cameraSound = new Audio('assets/sound-camera.mp3');
const stampSound = new Audio('assets/sound-stamp.mp3');

const videoWidth = 1024;
let videoHeight = 0;
let videoTrack;
let videoPauseTimeout;
let isStampHeld = false;
let successCriteria = {
  isStamped: false,
  hasName: false,
  hasImage: false,
};

passportImageContainer.style.cursor = 'pointer';
passportImageContainer.addEventListener('click', initVideo);
captureButton.addEventListener('click', handleCapture);
document.addEventListener('keyup', handleCapture);
new Hammer(continueButton).on('doubletap', handleContinue);
stampTool.addEventListener('click', handleStampClick);
nameInput.addEventListener('input', _event => {
  spacebarGuideElement.classList.remove('active');
  successCriteria.hasName = nameInput.value.length >= 1;
  checkSuccess();
});

//
// Page transitions
//
passportPageCover._passport = {
  enter: function() {
    passportPageCover.classList.add('active');
    document.addEventListener('keyup', handleCapture);
    return Promise.resolve();
  },
  exit: function() {
    passportPageCover.classList.remove('active');
    document.removeEventListener('keyup', handleCapture);
    return Promise.resolve();
  },
};
function handleContinue() {
  successSound.currentTime = 0;
  successSound.play();
  passportPageCover._passport.exit();
  passportPageAgelimit._passport.enter();
  history.pushState({page: 'cover'}, '');
  if ( ! window.onbeforeunload) {
    window.onbeforeunload = handleUnloadConfirmation;
  }
}

//
// Success criteria
//
function checkSuccess() {
  if (successCriteria.hasName && successCriteria.hasImage && successCriteria.isStamped) {
    stampTool.classList.add('active');
    continueButton.classList.add('active');
  }
  else if (successCriteria.hasName && successCriteria.hasImage) {
    stampTool.classList.add('active');
    continueButton.classList.remove('active');
  }
  else {
    stampTool.classList.remove('active');
    continueButton.classList.remove('active');
  }
}

//
// Camera controls
//
function handleCapture(event) {
  const SPACEBAR_KEY = ' ';
  const isKeyEvent = event.type === 'keyup';
  if (isKeyEvent && (event.key !== SPACEBAR_KEY || document.activeElement == nameInput)) {
    return;
  }
  if (passportPageCover.classList.contains('is-live')) {
    capturePhoto();
    successCriteria.hasImage = true;
    checkSuccess();
  }
  else {
    clearPhoto();
    successCriteria.hasImage = false;
    checkSuccess();
  }
}
function capturePhoto() {
  playFlashEffect();
  cameraSound.currentTime = 0;
  cameraSound.play();
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
    spacebarGuideElement.classList.add('active');
    new Hammer(passportImageContainer).on('doubletap', handleCapture);
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
function handleStampClick(event) {
  if (isStampHeld) {
    placeStamp();
  }
  else {
    pickUpStamp();
  }
}
function placeStamp() {
  stampImage.style.transform = '';
  const stampToolPosition = stampTool.getBoundingClientRect();
  const containerDimensions = passportPageCover.getBoundingClientRect();
  const top = stampToolPosition.bottom - containerDimensions.top;
  const left = stampToolPosition.left - containerDimensions.left;
  const stampImageOriginalTop = stampImage.style.top;
  const stampImageOriginalLeft = stampImage.style.left;
  stampImage.style.top = `${top / containerDimensions.height * 100}%`;
  stampImage.style.left = `${left / containerDimensions.width * 100}%`;
  // Validate stamp position
  const stampImagePosition = stampImage.getBoundingClientRect();
  const stampAreaPosition = stampArea.getBoundingClientRect();
  const isWithinStampArea = (
    stampImagePosition.top + (stampImagePosition.height / 2) >= stampAreaPosition.top
    && stampImagePosition.left + (stampImagePosition.width / 2) >= stampAreaPosition.left
    && stampImagePosition.right - (stampImagePosition.width / 2) <= stampAreaPosition.right
    && stampImagePosition.bottom - (stampImagePosition.height / 2) <= stampAreaPosition.bottom
  );
  if ( ! isWithinStampArea) {
    stampImage.style.top = stampImageOriginalTop;
    stampImage.style.left = stampImageOriginalLeft;
    playStampErrorAnimation();
    failureSound.currentTime = 0;
    failureSound.play();
    return;
  }
  const clampedTop = (
    top
    + Math.max(stampAreaPosition.top - stampImagePosition.top, 0)
    + Math.min(stampAreaPosition.bottom - stampImagePosition.bottom, 0)
  );
  const clampedLeft = (
    left
    + Math.max(stampAreaPosition.left - stampImagePosition.left, 0)
    + Math.min(stampAreaPosition.right - stampImagePosition.right, 0)
  );
  stampImage.style.top = `${clampedTop / containerDimensions.height * 100}%`;
  stampImage.style.left = `${clampedLeft / containerDimensions.width * 100}%`;
  stampImage.style.opacity = '1';
  isStampHeld = false;
  passportPageCover.classList.remove('is-stamp-held');
  document.body.style.cursor = '';
  stampSound.currentTime = 0;
  stampSound.play();
  // Reset stamp tool
  document.removeEventListener('mousemove', handleStampMove);
  playStampReturnAnimation().then(() => {
    stampTool.style.transform = '';
  });
  successCriteria.isStamped = true;
  checkSuccess();
}
function pickUpStamp() {
  isStampHeld = true;
  passportPageCover.classList.add('is-stamp-held');
  document.body.style.cursor = 'none';
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
let stampErrorAnimation;
function playStampErrorAnimation() {
  if (stampErrorAnimation !== undefined) {
    stampErrorAnimation.cancel();
  }
  stampErrorAnimation = stampToolImage.animate(
    [
      {transform: 'translateX(0)'},
      {transform: 'translateX(-5px)'},
      {transform: 'translateX(5px)'},
      {transform: 'translateX(-10px)'},
      {transform: 'translateX(10px)'},
      {transform: 'translateX(0)'},
    ], {
      duration: 300,
      easing: 'ease-in-out',
    },
  );
  return stampErrorAnimation.finished;
}

//
// Confirm unload
//
function handleUnloadConfirmation(event) {
  event.preventDefault();
  return (event.returnValue = '');
}

//
// Page skip for debugging
//
const queryParams = new URL(document.location).searchParams;
if (queryParams.get('page') == '1') {
  // We are already on page 1
}
else if (queryParams.get('page') == '2') {
  passportPageCover._passport.exit();
  setTimeout(() => { passportPageAgelimit._passport.enter(); }, 1000);
}
else if (queryParams.get('page') == '3') {
  passportPageCover._passport.exit();
  setTimeout(() => { passportPageMarketing._passport.enter(); }, 1000);
}
else if (queryParams.get('page') == '4') {
  passportPageCover._passport.exit();
  setTimeout(() => { passportPageScreentime._passport.enter(); }, 1000);
}
else if (queryParams.get('page') == '5') {
  passportPageCover._passport.exit();
  setTimeout(() => { completionPage._passport.enter(); }, 1000);
}
