function reddenPage() {
  document.body.style.backgroundColor = 'red';
}

chrome.action.onClicked.addListener(tab => {
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

  // transformations
  const rotate360 = [{ transform: 'rotate(360deg)' }];
  game.transformations = [rotate360];

  // get all elements from current tab
  game.getAllElements = function() {
    const elements = document.querySelectorAll('*');
    return [...elements];
  };
  const allElements = game.getAllElements();
  const maxSize = 200;
  // clean all elements (delete: <style>, etc)
  game.filterElements = function(elements) {
    return elements.filter((el, idx) => {
      // filter if width and length < maxSize
      if (
        parseInt(el.offsetWidth) < maxSize &&
        parseInt(el.offsetHeight) < maxSize
      ) {
        el.remove();
        return false;
      }
      // filter if style element
      if (
        el.tagName === 'SCRIPT' ||
        el.tagName === 'LINK' ||
        // el.tagName === 'HTML' ||
        el.tagName === 'TITLE'
        // el.tagName === 'HEAD'
        // el.tagName === 'A'
      ) {
        el.remove();
        return false;
      }

      return true;
    });
  };
  const filteredElements = game.filterElements(allElements);

  // for-each element...
  filteredElements.forEach((elementWithHandlers, idx) => {
    // remove all event handlers from each element
    const element = elementWithHandlers.cloneNode(true);
    elementWithHandlers.parentNode.replaceChild(element, elementWithHandlers);
    // assign unique z-index to each element on the page
    element.style.zIndex = `${idx}`;

    // update position absolute
    element.style.position = 'absolute';

    // css cleanup -> "remove" classes/ids from elements
    // but first... store a reference to w/h before styles change by deletion
    const width = parseInt(element.offsetWidth);
    const height = parseInt(element.offsetHeight);
    element.style.width = width;
    element.style.height = height;
    // "delete"
    element.setAttribute('id', `${idx}This_Couldnt_Possibly_Be_An_ID`);
    element.setAttribute('class', `${idx}This_Couldnt_Possibly_Be_a_CLASS`);

    // remove link from any linking elements
    element.removeAttribute('href');

    // apply a transformation to each element
    // element.animate(
    //   [
    //     { transform: 'translate3D(0, 0, 0)' },
    //     { transform: 'translate3D(0, -300px, 0)' },
    //   ],
    //   {
    //     duration: 10000,
    //     iterations: Infinity,
    //   }
    // );

    // add a click eventlistener to each element
    element.addEventListener('click', clickedElement);

    console.log(element);
  });

  function clickedElement(el) {
    // remove the node from the body or display: none?
    el.style.display = 'none';

    game.score++;
  }
}
