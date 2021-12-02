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

  const constrainToWindow = 9;

  // transformations
  const rotate360 = [{ transform: 'rotate(360deg)' }];
  const getAnim1 = (element, idx) => {
    return [
      [
        {
          transform: `translate3D(${
            (idx / constrainToWindow) % window.innerWidth
          }px, -50px, 0)`,
        },
        {
          transform: `translate3D(${
            (idx / constrainToWindow) % window.innerWidth
          }px, ${
            (JSON.stringify(element).length * 40) % window.innerHeight
          }px, 200px)`,
        },
        {
          transform: `translate3D(${
            (idx / constrainToWindow) % window.innerWidth
          }px, ${
            (-1 * (JSON.stringify(element).length * 40)) % window.innerHeight
          }px, 200px)`,
        },
        {
          transform: `translate3D(${
            (idx / constrainToWindow) % window.innerWidth
          }px, -50px, 0)`,
        },
      ],
      {
        duration: 5000,
        iterations: Infinity,
      },
    ];
  };

  game.transformations = [rotate360];

  // get all elements from current tab
  game.getAllElements = function () {
    const elements = document.querySelectorAll('*');
    return [...elements];
  };
  const allElements = game.getAllElements();
  const maxSize = 200;
  // clean all elements (delete: <style>, etc)
  game.filterElements = function (elements) {
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
        el.tagName === 'TITLE' ||
        el.tagName === 'SVG'
        // el.tagName === 'HEAD'
        // el.tagName === 'A'
      ) {
        el.remove();
        return false;
      }
      if (el.tagName === 'HTML' || el.tagName === 'BODY') {
        return false;
      }

      return true;
    });
  };
  const filteredElements = game.filterElements(allElements);

  // score stuff
  const scoreText = document.createElement('h1');
  scoreText.innerText = game.score;
  scoreText.style.margin = 'auto';
  scoreText.style.width = '100%';
  scoreText.style.position = 'absolute';
  scoreText.style.top = '50%';
  scoreText.style.fontSize = '100px';
  scoreText.style.textAlign = 'center';

  document.body.appendChild(scoreText);

  // for-each element...
  filteredElements.forEach((element, idx) => {
    // remove all event handlers from each element
    // const element = elementWithHandlers.cloneNode(true);
    // elementWithHandlers.parentNode.replaceChild(element, elementWithHandlers);
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
    const anim1 = getAnim1(element, idx);
    element.animate(anim1[0], anim1[1]);

    // add a click eventlistener to each element
    element.addEventListener('click', function (event) {
      // remove the node from the body or display: none?
      // element.style.display = 'none';
      console.log(element);
      // element.remove();
      element.animate(anim1[0], anim1[1]);
      game.score++;
      scoreText.innerText = game.score;
    });
  });
  const timer = document.createElement('h1');
  timer.style.margin = 'auto';
  timer.style.width = '100%';
  timer.style.position = 'absolute';
  timer.style.top = '10%';
  timer.style.left = '5%';
  timer.style.fontSize = '100px';
  timer.style.textAlign = 'center';
  document.body.appendChild(timer);

  // timer stuff
  var countDownDate = Number(Date.now()) + 10000;
  const x = setInterval(function () {
    var now = Number(Date.now());

    // Find the distance between now and the count down date
    var distance = countDownDate - now;
    if (distance < 0) {
      clearInterval(x);
      timer.innerHTML = 'EXPIRED';
      location.reload();
    } else {
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Display the result in the element with id="demo"
      timer.innerHTML = seconds + 's ';
    }

    // If the count down is finished, write some text
  }, 1000);
}
