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
    passportPageAgelimit.classList.add('active');
    initialGrid.refreshItems();
    initialGrid.layout();
    window.addEventListener('popstate', handleBack);
    return Promise.resolve();
  },
  exit: function() {
    passportPageAgelimit.classList.remove('active');
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

//
// Icons dragging
//
const allowedGridsForIcons = {};
const initialGrid = new Muuri('.agelimit-initial-grid', {
  dragEnabled: true,
  dragSort: () => allGrids,
  dragSortPredicate: customDragSortPredicate,
});
const targetGridOptions = {
  dragEnabled: true,
  dragSort: () => allGrids,
  dragSortPredicate: customDragSortPredicate,
};
const targetGrids = {
  // Person 1
  'target-1': new Muuri('.agelimit-target-grid[data-id="target-1"]', targetGridOptions),
  'target-2': new Muuri('.agelimit-target-grid[data-id="target-2"]', targetGridOptions),
  'target-3': new Muuri('.agelimit-target-grid[data-id="target-3"]', targetGridOptions),
  // Person 2
  'target-4': new Muuri('.agelimit-target-grid[data-id="target-4"]', targetGridOptions),
  'target-5': new Muuri('.agelimit-target-grid[data-id="target-5"]', targetGridOptions),
  'target-6': new Muuri('.agelimit-target-grid[data-id="target-6"]', targetGridOptions),
  'target-7': new Muuri('.agelimit-target-grid[data-id="target-7"]', targetGridOptions),
   // Person 3
  'target-8': new Muuri('.agelimit-target-grid[data-id="target-8"]', targetGridOptions),
  'target-9': new Muuri('.agelimit-target-grid[data-id="target-9"]', targetGridOptions),
  'target-10': new Muuri('.agelimit-target-grid[data-id="target-10"]', targetGridOptions),
  'target-11': new Muuri('.agelimit-target-grid[data-id="target-11"]', targetGridOptions),
  'target-12': new Muuri('.agelimit-target-grid[data-id="target-12"]', targetGridOptions),
};
const person1Grids = [
  targetGrids['target-1'],
  targetGrids['target-2'],
  targetGrids['target-3'],
];
const person2Grids = [
  targetGrids['target-4'],
  targetGrids['target-5'],
  targetGrids['target-6'],
  targetGrids['target-7'],
];
const person3Grids = [
  targetGrids['target-8'],
  targetGrids['target-9'],
  targetGrids['target-10'],
  targetGrids['target-11'],
  targetGrids['target-12'],
];
const allGrids = [initialGrid, ...person1Grids, ...person2Grids, ...person3Grids];
const allTargetGrids = [...person1Grids, ...person2Grids, ...person3Grids];
allowedGridsForIcons['icon-1'] = [initialGrid, ...person1Grids, ...person2Grids, ...person3Grids];
allowedGridsForIcons['icon-2'] = [initialGrid, ...person1Grids, ...person2Grids, ...person3Grids];
allowedGridsForIcons['icon-3'] = [initialGrid, ...person2Grids, ...person3Grids];
allowedGridsForIcons['icon-4'] = [initialGrid, ...person2Grids, ...person3Grids];
allowedGridsForIcons['icon-5'] = [initialGrid, ...person3Grids];
allowedGridsForIcons['icon-6'] = [initialGrid, ...person3Grids];
allowedGridsForIcons['icon-7'] = [initialGrid, ...person2Grids, ...person3Grids];
allowedGridsForIcons['icon-8'] = [initialGrid, ...person3Grids];
allowedGridsForIcons['icon-9'] = [initialGrid, ...person2Grids, ...person3Grids];
allowedGridsForIcons['icon-10'] = [initialGrid, ...person1Grids, ...person2Grids, ...person3Grids];

function getAllowedGridsForItem(item) {
  const iconId = item.getElement().getAttribute('data-id');
  return allowedGridsForIcons[iconId];
}
function customDragSortPredicate(item, event) {
  // Workaround for https://github.com/haltu/muuri/issues/455
  // `dragSort` allows all grids, then we manually check if the result grid is valid,
  // and if not, then we return the initialGrid instead, to return the item.
  const itemId = item.getElement().getAttribute('data-id');
  const result = Muuri.ItemDrag.defaultSortPredicate(item, {
    threshold: 10,
    action: 'move',
    migrateAction: 'move',
  });
  if (result === null) {
    return result;
  }
  if (allowedGridsForIcons[itemId].includes(result.grid)) {
    const isTargetGrid = allTargetGrids.includes(result.grid);
    if (isTargetGrid && result.grid.getItems().length >= 1) {
      // Allow only one item per target grid
      return {
        index: -1,
        grid: initialGrid,
        action: 'move',
      };
    }
    else {
      return result;
    }
  }
  return {
    index: -1,
    grid: initialGrid,
    action: 'move',
  };
}

//
// Success criteria
//
allGrids.forEach(grid => grid.on('dragReleaseEnd', checkSuccess));
function checkSuccess() {
  const initialGridRemainingItemCount = document.querySelectorAll('.agelimit-initial-grid .agelimit-item').length;
  if (initialGridRemainingItemCount === 0) {
    continueButton.classList.add('active');
  }
  else {
    continueButton.classList.remove('active');
  }
}
