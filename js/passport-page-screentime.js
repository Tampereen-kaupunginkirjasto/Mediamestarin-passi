const passportPageMarketing = document.querySelector('.passport-page-marketing');
const passportPageScreentime = document.querySelector('.passport-page-screentime');
const completionPage = document.querySelector('.completion-page');
const continueButton = document.querySelector('.passport-page-screentime .continue-button');
const activityContainerOptional = document.querySelector('.activity-select-section.section-optional');
const activityElements = Array.from(document.querySelectorAll('.activity-select .activity'));
const selectedActivitiesContainer = document.querySelector('.selected-activities');
const selectedActivityElements = Array.from(document.querySelectorAll('.selected-activities .activity'));
const timeSlotsContainer = document.querySelector('.time-slots');
const clickSound = new Audio('assets/sound-click.mp3');
const completedSound = new Audio('assets/sound-completed.mp3');

let selectedColor = '';

new Hammer(continueButton).on('doubletap', handleContinue);
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
  completedSound.currentTime = 0;
  completedSound.play();
  passportPageScreentime._passport.exit();
  completionPage._passport.enter();
  history.pushState({page: 'screentime'}, '');
}
function handleBack() {
  passportPageScreentime._passport.exit();
  passportPageMarketing._passport.enter();
}

//
// Activity select
//
activityElements.forEach(activityElement => {
  activityElement.addEventListener('click', handleActivitySelect);
  function handleActivitySelect() {
    selectedColor = activityElement.getAttribute('data-color');
    activityElements.forEach(element => element.classList.remove('selected'));
    activityElement.classList.add('selected');
    timeSlotsContainer.setAttribute('data-color', selectedColor);
  }
  checkSuccess();
});

//
// Time slot select
//
function handleTimeSlotClick(event) {
  const segmentElement = event.target.closest('.segment');
  if (segmentElement === null || selectedColor === '') {
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
    if (previousColor && selectedColorSegments.length === 0) {
      document.querySelector(`.selected-activities .activity[data-color="${previousColor}"]`).classList.remove('selected');
    }
  }
  clickSound.currentTime = 0;
  clickSound.play();
  checkSuccess();
}

//
// Success criteria
//
function checkSuccess() {
  // All required activities selected
  const requiredActivityCount = document.querySelectorAll('.selected-activities .activity[data-required]').length;
  let selectedActivityCount = 0;
  let selectedRequiredActivityCount = 0;
  selectedActivityElements.forEach(activityElement => {
    const isSelected = activityElement.classList.contains('selected');
    if (isSelected) {
      selectedActivityCount += 1;
    }
    if (isSelected && activityElement.hasAttribute('data-required')) {
      selectedRequiredActivityCount += 1;
    }
  });
  // All segments colored
  const segmentCount = document.querySelectorAll('.time-slots .segment').length;
  const coloredSegmentCount = document.querySelectorAll('.time-slots .segment[data-color]').length;
  const isRequiredDone = selectedRequiredActivityCount == requiredActivityCount;
  // Fit more than 10 activities
  if (selectedActivityCount > 10) {
    selectedActivitiesContainer.classList.add('compact');
  }
  else {
    selectedActivitiesContainer.classList.remove('compact');
  }
  // Optional section visibility
  if (isRequiredDone) {
    activityContainerOptional.classList.add('active');
  }
  else {
    activityContainerOptional.classList.remove('active');
  }
  const isSuccess = isRequiredDone && coloredSegmentCount == segmentCount;
  if (isSuccess) {
    continueButton.classList.add('active');
  }
  else {
    continueButton.classList.remove('active');
  }
}