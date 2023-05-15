const passportPageCover = document.querySelector('.passport-page-cover');
const passportPageAgelimit = document.querySelector('.passport-page-agelimit');
const passportPageMarketing = document.querySelector('.passport-page-marketing');
const continueButton = document.querySelector('.passport-page-agelimit .continue-button');

continueButton.addEventListener('click', handleContinue);

//
// Page transitions
//
passportPageAgelimit._passport = {
  enter: function() {
    passportPageAgelimit.style.display = '';
    window.addEventListener('popstate', handleBack);
    return Promise.resolve();
  },
  exit: function() {
    passportPageAgelimit.style.display = 'none';
    window.removeEventListener('popstate', handleBack);
    return Promise.resolve();
  },
};
function handleContinue() {
  passportPageAgelimit._passport.exit();
  passportPageMarketing._passport.enter();
  history.pushState({page: 'agelimit'}, '');
}
function handleBack() {
  passportPageAgelimit._passport.exit();
  passportPageCover._passport.enter();
}
