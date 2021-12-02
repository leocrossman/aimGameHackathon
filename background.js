chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: main,
  });
});
function main() {
  window.scrollTo({
    top: '50%',
    // left: 100,
    behavior: 'smooth',
  });
  const originalHtml = document.documentElement.innerHTML;
  const game = {};
  game.score = 0;
  game.hitCount = 0;
  game.totalClicks = 0;
  game._accuracy = 0;
  game.accuracyPercent = `${100}%`; // init to 100%
  game.highScore = localStorage.getItem('aimGameHighScore') ?? 0; // return 0 if no high score
  game.lowScore = localStorage.getItem('aimGameLowScore') ?? 0; // return 0 if no high score

  //TODO ADD FAIL SOUND

  // transformations
  const rotate360 = [
    { transform: 'rotate(360deg)' },
    {
      duration: 40000,
      iterations: Infinity,
    },
  ];
  const moveRightLeft = [
    {
      transform: `translate3d(500px,0,0)`,
      transform: `translate3d(-500px,0,0)`,
    },
    {
      duration: 20000,
      iterations: Infinity,
    },
  ];

  // downup animation

  const rotato = [
    [
      { transform: 'translateX(300px) rotate(.5turn)' },
      { transform: 'translateX(0) rotate(-.2turn)' },
      { transform: 'translateX(800px) rotate(2.5turn)' },
      { transform: 'translateX(0) rotate(-1.0turn)' },
    ],
    {
      duration: 20000,
      iterations: Infinity,
      animationTimingFunction: 'ease-in-out',
      animationDelay: 2000,
    },
  ];

  const moveDownUp = [
    [
      {
        transform: `translate3D(
						500px, 50px, 0)`,
      },
      {
        transform: `translate3D(
						-250px, 500px, 200px)`,
      },
      {
        transform: `translate3D(
						250px,-500px, 200px)`,
      },
      {
        transform: `translate3D(
						-500px, -50px, 0)`,
      },
    ],
    {
      duration: 10000,
      iterations: Infinity,
    },
  ];

  const bigMoveDownUp = [
    [
      {
        transform: `translate3D(
						500px, 4000px, 0)`,
      },
      {
        transform: `translate3D(
						-250px, 500px, 200px)`,
      },
      {
        transform: `translate3D(
						250px,-500px, 200px)`,
      },
      {
        transform: `translate3D(
						-500px, -4000px, 0)`,
      },
    ],
    {
      duration: 10000,
      iterations: Infinity,
    },
  ];

  game.transformations = [
    rotate360,
    moveRightLeft,
    moveDownUp,
    rotato,
    bigMoveDownUp,
    [...bigMoveDownUp], // increase chances of lots of vertical movement
  ];
  // add sound url
  let url = chrome.runtime.getURL('hitmarker.mp3');
  let hitMarker = new Audio(url);
  hitMarker.volume = 1;

  const getRandomAnim = () => {
    return game.transformations[
      Math.floor(Math.random() * game.transformations.length)
    ];
  };

  // get all elements from current tab
  game.getAllElements = function () {
    const elements = document.body.getElementsByTagName('*');
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

  // lowScore stuff
  const lowScoreText = document.createElement('h1');
  lowScoreText.innerText = `Worst: ${game.lowScore}`;
  lowScoreText.style.position = 'fixed';
  lowScoreText.style.top = '35%';
  lowScoreText.style.left = '80%';
  lowScoreText.style.fontSize = '80px';
  lowScoreText.style.textAlign = 'center';
  lowScoreText.style.zIndex = '999996';

  document.body.appendChild(lowScoreText);

  // score stuff
  const scoreText = document.createElement('h1');
  scoreText.innerText = game.score;
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

    const anim = getRandomAnim();

    // change A tags to divs because for some reason they cant animate🙄
    if (element.tagName === 'A') {
      element.style.zIndex = `${idx}`;
      element.style.width = 'auto';
      element.style.height = 'auto';
      element.style.margin = '0';

      const newText = document.createElement('div');
      newText.innerHTML = element.innerHTML;
      element.parentNode.replaceChild(newText, element);
      element = newText;
    }
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

  //MISS CLICKS HANDLING
  //if click body, decrease point
  document.body.addEventListener('click', function (event) {
    game.totalClicks++;
    if (game.score <= game.lowScore) {
      game.lowScore--;
      lowScoreText.innerText = `Worst: ${game.lowScore}`;
      localStorage.setItem('aimGameLowScore', game.lowScore);
    }
    game.score--;
    game._accuracy = game.hitCount / game.totalClicks;
    game.accuracyPercent = `${Math.round(game._accuracy * 100)}%`;

    scoreText.innerText = game.score;
    accuracyText.innerText = game.accuracyPercent;

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
