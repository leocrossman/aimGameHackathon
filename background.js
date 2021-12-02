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
  // localStorage.setItem('calendar', document.documentElement.innerHTML);
  const originalHtml = document.documentElement.innerHTML;
  const game = {};
  game.score = 0;
  game.accuracy = 0;
  const constrainToWindow = 9;
  // transformations
  const rotate360 = [{ transform: 'rotate(360deg)' }];

  game.transformations = [rotate360];

  const getRandomAnim = () => {
    return game.transformations[
      Math.floor(Math.random() * game.transformations.length)
    ];
  };

  // get all elements from current tab
  game.getAllElements = function () {
    const elements = document.body.getElementsByTagName('*');
    // for (let i = 0; i < elements.length; i++) {
    // 	const elementChildren = elements[i].childNodes;
    // 	for (let j = 0; j < elementChildren.length; j++) {
    // 	}
    // }
    //console.log("before flat", [...elements]);
    return [...elements].flat(Infinity);
  };
  const allElements = game.getAllElements();
  console.log(allElements);
  //document.body.innerHTML = '';
  document.body.innerHTML = '';
  document.body.style.cursor = 'crosshair';
  allElements.forEach((element) => {
    element.style.cursor = 'crosshair';
    document.body.appendChild(element);
  });
  console.log(allElements);
  //console.log('still hasnt started')
  //document.body.appendChild()
  const maxSize = 200;
  // clean all elements (delete: <style>, etc)

  game.filterElements = function (elements) {
    return elements.filter((el, idx) => {
      // filter if width and length < maxSize
      if (
        parseInt(el.offsetWidth) < maxSize &&
        parseInt(el.offsetHeight) < maxSize
      ) {
        //el.remove();
        return false;
      }
      // filter if style element
      if (
        el.tagName === 'SCRIPT' ||
        el.tagName === 'LINK' ||
        el.tagName === 'HTML' ||
        el.tagName === 'TITLE' ||
        el.tagName === 'BODY' ||
        el.tagName === 'SVG'
        // el.tagName === 'HEAD'
        // el.tagName === 'A'
      ) {
        //el.remove();
        return false;
      }
      return true;
    });
  };
  // const filteredElements = game.filterElements(allElements);

  // score stuff
  const scoreText = document.createElement('h1');
  scoreText.innerText = game.score;
  scoreText.style.margin = 'auto';
  scoreText.style.width = '100%';
  scoreText.style.position = 'fixed';
  scoreText.style.top = '50%';
  scoreText.style.fontSize = '100px';
  scoreText.style.textAlign = 'center';
  scoreText.style.zIndex = '999999';

  document.body.appendChild(scoreText);

  // for-each element...
  allElements.forEach((element, idx) => {
    // remove all event handlers from each element
    // const element = elementWithHandlers.cloneNode(true);
    // elementWithHandlers.parentNode.replaceChild(element, elementWithHandlers);
    // assign unique z-index to each element on the page
    element.style.zIndex = `${idx}`;

    element.removeAttribute('href');

    // downup animation
    const tenPercentOfElements = Math.random() < 0.1;
    if (tenPercentOfElements) {
      const downUp = [
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
      game.transformations.push(downUp);
    }

    const anim = getRandomAnim();
    // const anim = getAnim(element, idx);
    element.animate(anim[0], anim[1]);
    // add a click eventlistener to each element
    element.addEventListener('click', function (event) {
      element.remove();
      game.score++;
      scoreText.innerText = game.score;
    });
  });

  // create timer element
  const timer = document.createElement('h1');
  timer.style.margin = 'auto';
  timer.style.width = '100%';
  timer.style.position = 'fixed';
  timer.style.top = '10%';
  timer.style.left = '5%';
  timer.style.fontSize = '100px';
  timer.style.textAlign = 'center';
  timer.style.zIndex = '1000000';
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
      // location.reload();
      document.documentElement.innerHTML = originalHtml;
    } else {
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Display the result in the element with id="demo"
      timer.innerHTML = seconds + 's ';
    }

    // If the count down is finished, write some text
  }, 1000);
}
