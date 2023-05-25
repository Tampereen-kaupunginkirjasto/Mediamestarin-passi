const passportPageMarketing = document.querySelector('.passport-page-marketing');
const passportPageScreentime = document.querySelector('.passport-page-screentime');
const continueButton = document.querySelector('.passport-page-screentime .continue-button');

continueButton.addEventListener('click', handleContinue);

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
