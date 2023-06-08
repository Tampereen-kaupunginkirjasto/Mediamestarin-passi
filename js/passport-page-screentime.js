const passportPageMarketing = document.querySelector('.passport-page-marketing');
const passportPageScreentime = document.querySelector('.passport-page-screentime');
const continueButton = document.querySelector('.passport-page-screentime .continue-button');
const activityElements = Array.from(document.querySelectorAll('.activity-select .activity'));
const selectedActivityElements = Array.from(document.querySelectorAll('.selected-activities .activity'));
const timeSlotsContainer = document.querySelector('.time-slots');

let selectedColor = '';

continueButton.addEventListener('click', handleContinue);
timeSlotsContainer.addEventListener('click', handleTimeSlotClick);

//
// Page transitions
//
passportPageScreentime._passport = {
  enter: function() {
    passportPageScreentime.classList.add('active');
    window.addEventListener('popstate', handleBack);
    return Promise.resolve();
  },
  exit: function() {
    passportPageScreentime.classList.remove('active');
    window.removeEventListener('popstate', handleBack);
    return Promise.resolve();
  },
};
function handleContinue() {
  // Print passport
}
function handleBack() {
  passportPageScreentime._passport.exit();
  passportPageMarketing._passport.enter();
}

//
// Activity select
//
activityElements.forEach(activityElement => {
  const activityImage = activityElement.querySelector('img');
  activityElement.style.maskImage = `url(${activityImage.src})`;
  activityElement.addEventListener('click', handleActivitySelect);
  function handleActivitySelect() {
    selectedColor = activityElement.getAttribute('data-color');
    activityElements.forEach(element => element.classList.remove('selected'));
    activityElement.classList.add('selected');
    timeSlotsContainer.setAttribute('data-color', selectedColor);
  }
});
selectedActivityElements.forEach(activityElement => {
  const activityImage = activityElement.querySelector('img');
  activityElement.style.maskImage = `url(${activityImage.src})`;
});

//
// Time slot select
//
function handleTimeSlotClick(event) {
  const segmentElement = event.target.closest('.segment');
  if (segmentElement === null) {
    return;
  }
  const previousColor = segmentElement.getAttribute('data-color');
  if (previousColor == selectedColor) {
    segmentElement.removeAttribute('data-color');
    const selectedColorSegments = document.querySelectorAll(`.time-slots .segment[data-color="${selectedColor}"]`);
    if (selectedColorSegments.length === 0) {
      document.querySelector(`.selected-activities .activity[data-color="${selectedColor}"]`).classList.remove('selected');
    }
  }
  else {
    segmentElement.setAttribute('data-color', selectedColor);
    document.querySelector(`.selected-activities .activity[data-color="${selectedColor}"]`).classList.add('selected');
    const selectedColorSegments = document.querySelectorAll(`.time-slots .segment[data-color="${previousColor}"]`);
    if (selectedColorSegments.length === 0) {
      document.querySelector(`.selected-activities .activity[data-color="${previousColor}"]`).classList.remove('selected');
    }
  }
}