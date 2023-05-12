const passportPageScreentime = document.querySelector('.passport-page-screentime');
const continueButton = document.querySelector('.passport-page-screentime .continue-button');

continueButton.addEventListener('click', handleContinue);

//
// Page transitions
//
passportPageScreentime._passport = {
  enter: function() {
    passportPageScreentime.style.display = '';
    return Promise.resolve();
  },
  exit: function() {
    passportPageScreentime.style.display = 'none';
    return Promise.resolve();
  },
};
function handleContinue() {
  // Print passport
}
