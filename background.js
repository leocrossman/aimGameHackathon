function reddenPage() {
  document.body.style.backgroundColor = 'red';
}

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: main,
    // function: reddenPage,
  });
});

function main() {
  const game = {};
  game.score = 0;
  game.accuracy = 0;
  game.transformations = [];

  // get all elements from current tab
  game.getAllElements = function () {
    const elements = document.body.getElementsByTagName('*');
    return elements;
  };
  const allElements = game.getAllElements();
  // clean all elements (delete: <style>, etc)
  game.filterElements = function (elements) {
    // filter if width and length != 0
    // filter if style element
    return elements.filter((el, idx) => {
      if (el.offsetWidth > someNumber && el.off) {
        return el;
      }
    });
  };
  const filteredElements = game.filterElements(allElements);

  // assign unique z-index to each element on the page
}
