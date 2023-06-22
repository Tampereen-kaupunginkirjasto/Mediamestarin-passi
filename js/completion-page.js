const passportPageScreentime = document.querySelector('.passport-page-screentime');
const completionPage = document.querySelector('.completion-page');
const printButton = document.querySelector('.print-button');

printButton.addEventListener('click', handlePrint);

//
// Page transitions
//
completionPage._passport = {
  enter: function() {
    completionPage.classList.add('active');
    window.addEventListener('popstate', handleBack);
    return Promise.resolve();
  },
  exit: function() {
    completionPage.classList.remove('active');
    window.removeEventListener('popstate', handleBack);
    return Promise.resolve();
  },
};
function handleBack() {
  completionPage._passport.exit();
  passportPageScreentime._passport.enter();
}

//
// Printing
//
function handlePrint() {
  window.print();
}