chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: main,
  });
});
function main() {
  // localStorage.setItem('calendar', document.documentElement.innerHTML);
  const originalHtml = document.documentElement.innerHTML;
  const game = {};
  game.score = 0;
  game.hitCount = 0;
  game.totalClicks = 0;
  game._accuracy = 0;
  game.accuracyPercent = `${100}%`; // init to 100%
  game.highScore = localStorage.getItem('aimGameHighScore') ?? 0; // return 0 if no high score
  const constrainToWindow = 9;
  // transformations
  const rotate360 = [{ transform: 'rotate(360deg)' }];
  // add sound url
  let url = chrome.runtime.getURL('hitmarker.mp3');
  let hitMarker = new Audio(url);
  hitMarker.volume = 1;
  console.log(hitMarker);

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
  document.body.innerHTML = '';
  document.body.style.cursor = 'crosshair';
  allElements.forEach((element) => {
    element.style.cursor = 'crosshair';
    document.body.appendChild(element);
  });
  //console.log('still hasnt started')

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
  //scoreText.style.margin = 'auto';
  //scoreText.style.width = '100%';
  scoreText.style.position = 'fixed';
  scoreText.style.top = '50%';
  scoreText.style.left = '80%';
  scoreText.style.fontSize = '100px';
  scoreText.style.textAlign = 'center';
  scoreText.style.zIndex = '999999';
  const origColor = scoreText.style.color;

  document.body.appendChild(scoreText);

  // highScore stuff
  const highScoreText = document.createElement('h1');
  highScoreText.innerText = `Best: ${game.highScore}`;
  highScoreText.style.position = 'fixed';
  highScoreText.style.top = '65%';
  highScoreText.style.left = '80%';
  highScoreText.style.fontSize = '80px';
  highScoreText.style.textAlign = 'center';
  highScoreText.style.zIndex = '999997';

  document.body.appendChild(highScoreText);

  // accuracy stuff
  const accuracyText = document.createElement('h1');
  accuracyText.innerText = game.accuracyPercent;
  accuracyText.style.position = 'fixed';
  accuracyText.style.top = '80%';
  accuracyText.style.left = '80%';
  accuracyText.style.fontSize = '100px';
  accuracyText.style.textAlign = 'center';
  accuracyText.style.zIndex = '999998';

  document.body.appendChild(accuracyText);

  // for-each element...
  allElements.forEach((element, idx) => {
    // remove all event handlers from each element
    // const element = elementWithHandlers.cloneNode(true);
    // elementWithHandlers.parentNode.replaceChild(element, elementWithHandlers);
    // assign unique z-index to each element on the page
    element.style.zIndex = `${idx}`;

    element.removeAttribute('href');

    // constrains elements to respective width and height
    element.style.width = 'auto';
    element.style.height = 'auto';

    element.style.margin = '0';

    // removes videos?
    if (element.tagName === 'IFRAME') {
      element.setAttribute('src', '');
    }

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

    //ON CLICK OF EACH ELEMENT
    // add a click eventlistener to each element
    element.addEventListener('click', function (event) {
      // if (element.tagName === 'BODY') {
      //   console.log('body clicked');
      // }
      element.remove();
      game.totalClicks++;
      if (game.score >= game.highScore) {
        game.highScore++;
        highScoreText.innerText = `Best: ${game.highScore}`;
        localStorage.setItem('aimGameHighScore', game.highScore);
      }
      game.score++;
      game.hitCount++;
      game._accuracy = game.hitCount / game.totalClicks;
      game.accuracyPercent = `${Math.round(game._accuracy * 100)}%`;

      scoreText.innerText = game.score;
      accuracyText.innerText = game.accuracyPercent;

      //ADDED SOUND!
      hitMarker.play();

      // flash green text or body
      //document.body.style.backgroundColor = 'green';
      scoreText.style.color = 'green';
      setTimeout(function () {
        scoreText.style.color = origColor;
        document.body.style.backgroundColor = 'white';
      }, 200);
      //hitMarker.play();
      event.stopPropagation();
    });
  });

  //if click body, decrease point
  // flash red text or body
  document.body.addEventListener('click', function (event) {
    game.totalClicks++;
    game.score--;
    game._accuracy = game.hitCount / game.totalClicks;
    game.accuracyPercent = `${game._accuracy}%`;

    scoreText.innerText = game.score;
    accuracyPercent.innerText = game.accuracyPercent;

    // flash red text or body
    //document.body.style.backgroundColor = 'red';
    scoreText.style.color = 'red';
    setTimeout(function () {
      document.body.style.backgroundColor = 'white';
      scoreText.style.color = origColor;
    }, 100);
  });

  document.body.overflowX = 'hidden';

  // ! TIMER ELEMENT WAS BLOCKING ELEMENTS UNDER/NEXT TO IT FROM BEING CLICKED BC IT IS 100% WIDTH
  // create timer element
  const timer = document.createElement('h1');
  //timer.style.margin = 'auto';
  //timer.style.width = '100%';
  timer.style.position = 'fixed';
  timer.style.top = '10%';
  timer.style.left = '80%';
  timer.style.fontSize = '100px';
  timer.style.textAlign = 'right';
  timer.style.zIndex = '1000000';
  timer.innerHTML = '60s';
  document.body.appendChild(timer);

  // timer stuff
  var countDownDate = Number(Date.now()) + 61000;
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

      //change color to red at 10s
      if (seconds < 11) {
        timer.style.color = 'red';
      }
      // Display the result in the element with id="demo"
      timer.innerHTML = seconds + 's ';
    }

    // If the count down is finished, write some text
  }, 1000);
}
