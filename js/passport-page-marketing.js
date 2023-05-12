const passportPageMarketing = document.querySelector('.passport-page-marketing');
const passportPageScreentime = document.querySelector('.passport-page-screentime');
const continueButton = document.querySelector('.passport-page-marketing .continue-button');

continueButton.addEventListener('click', handleContinue);

//
// Page transitions
//
passportPageMarketing._passport = {
  enter: function() {
    passportPageMarketing.style.display = '';
    return Promise.resolve();
  },
  exit: function() {
    passportPageMarketing.style.display = 'none';
    return Promise.resolve();
  },
};
function handleContinue() {
  passportPageMarketing._passport.exit();
  passportPageScreentime._passport.enter();
}
