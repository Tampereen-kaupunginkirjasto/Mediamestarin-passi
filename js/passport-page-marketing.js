const passportPageAgelimit = document.querySelector('.passport-page-agelimit');
const passportPageMarketing = document.querySelector('.passport-page-marketing');
const passportPageScreentime = document.querySelector('.passport-page-screentime');
const continueButton = document.querySelector('.passport-page-marketing .continue-button');
const characterSelectPhaseContainer = document.querySelector('.marketing-page-phase[data-phase="select-character"]');
const productSelectPhaseContainer = document.querySelector('.marketing-page-phase[data-phase="select-product"]');
const argumentSelectPhaseContainer = document.querySelector('.marketing-page-phase[data-phase="select-arguments"]');
const productSelectContainer = document.querySelector('.product-select');
const returnToCharacterSelectButton = document.querySelector('[data-phase="select-product"] .character-head-container');
const argumentSelectContainer = document.querySelector('.argument-select');
const argumentStickers = Array.from(document.querySelectorAll('[data-phase="select-arguments"] .argument img'));
const argumentStickerArea = document.querySelector('.marketing-phone-sticker-area');
const phoneBackgroundColorElement = document.querySelector('.marketing-phone-background-color');
const colorSelectContainer = document.querySelector('.marketing-page-color-select');
const publishButton = document.querySelector('.passport-page-marketing .publish-button');
const successSound = new Audio('assets/sound-success.mp3');
const failureSound = new Audio('assets/sound-failure.mp3');
const clickSound = new Audio('assets/sound-click.mp3');
const publishSound = new Audio('assets/sound-publish.mp3');

let selectedCharacter = '';
let selectedReaction = '';

new Hammer(continueButton).on('doubletap', handleContinue);
characterSelectPhaseContainer.addEventListener('click', handleCharacterSelect);
returnToCharacterSelectButton.addEventListener('click', handleReturnToCharacterSelect);
productSelectContainer.addEventListener('click', handleProductSelect);
colorSelectContainer.addEventListener('click', handleColorSelect);
new Hammer(publishButton).on('doubletap', handlePublish);

//
// Page transitions
//
passportPageMarketing._passport = {
  enter: function() {
    passportPageMarketing.classList.add('active');
    window.addEventListener('popstate', handleBack);
    return Promise.resolve();
  },
  exit: function() {
    passportPageMarketing.classList.remove('active');
    window.removeEventListener('popstate', handleBack);
    return Promise.resolve();
  },
};
function handleContinue() {
  successSound.currentTime = 0;
  successSound.play();
  passportPageMarketing._passport.exit();
  passportPageScreentime._passport.enter();
  history.pushState({page: 'marketing'}, '');
}
function handleBack() {
  passportPageMarketing._passport.exit();
  passportPageAgelimit._passport.enter();
}

//
// Phase 1: Character select
//
function handleCharacterSelect(event) {
  const characterElement = event.target.closest('.marketing-character');
  selectedCharacter = characterElement.getAttribute('data-character');
  productSelectPhaseContainer.setAttribute('data-selected-character', selectedCharacter);
  argumentSelectPhaseContainer.setAttribute('data-selected-character', selectedCharacter);
  characterSelectPhaseContainer.classList.remove('active');
  productSelectPhaseContainer.classList.add('active');
  clickSound.currentTime = 0;
  clickSound.play();
}
function handleReturnToCharacterSelect() {
  productSelectPhaseContainer.classList.remove('active');
  characterSelectPhaseContainer.classList.add('active');
  clickSound.currentTime = 0;
  clickSound.play();
}

//
// Phase 2: Product select
//
function handleProductSelect(event) {
  const productElement = event.target.closest('.product');
  const productElementCopy = productElement.cloneNode(true);
  selectedReaction = productElement.getAttribute('data-reaction');
  argumentSelectPhaseContainer.setAttribute('data-selected-reaction', 'neutral');
  productElementCopy.removeAttribute('data-character');
  productElementCopy.removeAttribute('data-reaction');
  argumentSelectPhaseContainer.appendChild(productElementCopy);
  productSelectPhaseContainer.classList.remove('active');
  argumentSelectPhaseContainer.classList.add('active');
  publishButton.style.display = '';
  clickSound.currentTime = 0;
  clickSound.play();
}

//
// Phase 3: Argument select
//
let stickerZIndexCounter = 3;
argumentStickers.forEach(argumentSticker => {
  function handleInitialDrag(event, pointer) {
    // Reset draggabilly styles, and switch from relative to absolute,
    // so that stickers stick to the phone and won't move on resize/print.
    argumentSticker.style.transform = '';
    argumentSticker.style.left = '';
    argumentSticker.style.top = '';
    const containerDimensions = argumentSelectContainer.getBoundingClientRect();
    const stickerDimensions = argumentSticker.getBoundingClientRect();
    argumentSticker.style.left = stickerDimensions.left - containerDimensions.left;
    argumentSticker.style.top = stickerDimensions.top - containerDimensions.top;
    argumentSticker.style.position = 'absolute';
    this.handleDragStart();
    argumentSticker.closest('.argument').classList.add('was-dragged');
  }
  function handleDragEnd(event, pointer) {
    // Validate sticker position
    const argumentStickerPosition = argumentSticker.getBoundingClientRect();
    const argumentStickerAreaPosition = argumentStickerArea.getBoundingClientRect();
    const isWithinStickerArea = (
      argumentStickerPosition.top >= argumentStickerAreaPosition.top
      &&argumentStickerPosition.left >= argumentStickerAreaPosition.left
      && argumentStickerPosition.right <= argumentStickerAreaPosition.right
      && argumentStickerPosition.bottom <= argumentStickerAreaPosition.bottom
    );
    if (isWithinStickerArea) {
      clickSound.currentTime = 0;
      clickSound.play();
    }
    else {
      failureSound.currentTime = 0;
      failureSound.play();
      resetSticker();
    }
  }
  function setRemLeftTop() {
    const { x, y } = this.position;
    this.element.style.left = `${convertPixelsToRem(x)}rem`;
    this.element.style.top = `${convertPixelsToRem(y)}rem`;
  }
  function updateZIndex(event, pointer) {
    // This could be smarter and re-use the z-indices, but this naive approach should be enough for now.
    stickerZIndexCounter += 1;
    argumentSticker.style.zIndex = stickerZIndexCounter;
  }
  function resetSticker() {
    // TODO: Animate reset from current position to initial position.
    argumentSticker.style.transform = '';
    argumentSticker.style.position = '';
    argumentSticker.style.top = '';
    argumentSticker.style.left = '';
    argumentSticker.style.zIndex = '';
    argumentSticker.closest('.argument').classList.remove('was-dragged');
    draggie.once('dragStart', handleInitialDrag);
  }
  const draggie = new Draggabilly(argumentSticker);
  draggie.once('dragStart', handleInitialDrag);
  draggie.on('dragEnd', handleDragEnd);
  draggie.on('dragStart', updateZIndex);
  draggie.setLeftTop = setRemLeftTop;
  argumentSticker._draggie = draggie;
  argumentSticker._resetSticker = resetSticker;
  // Sticker shadow
  argumentSticker.parentElement.insertAdjacentHTML('afterbegin',
    `<div
      class="argument-shadow"
      style="
        -webkit-mask-image: url(${argumentSticker.src});
        mask-image: url(${argumentSticker.src});
      "
    ></div>`
  );
});
function handlePublish() {
  argumentSelectPhaseContainer.setAttribute('data-selected-reaction', selectedReaction);
  passportPageMarketing.classList.add('published');
  publishButton.style.display = 'none';
  publishSound.currentTime = 0;
  publishSound.play();
  setTimeout(() => {
    continueButton.classList.add('active');
  }, 1500);
}
function convertPixelsToRem(px) {
  const remBase = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return px * (1 / remBase);
}

//
// Background color select
//

function handleColorSelect(event) {
  const colorElement = event.target.closest('[data-color]');
  if ( ! colorElement) {
    return;
  }
  if (colorElement.classList.contains('selected')) {
    colorElement.classList.remove('selected');
    phoneBackgroundColorElement.removeAttribute('data-color');
    return;
  }
  const previouslySelected = passportPageMarketing.querySelector('.marketing-page-color-button.selected');
  if (previouslySelected) {
    previouslySelected.classList.remove('selected')
  }
  colorElement.classList.add('selected');
  const selectedColor = colorElement.getAttribute('data-color');
  phoneBackgroundColorElement.setAttribute('data-color', selectedColor);
}
