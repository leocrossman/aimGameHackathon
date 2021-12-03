chrome.action.onClicked.addListener(tab => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: main,
  });
});
function main() {
  // get document height... or we can settle for body's offset >:(
  const docHeight =
    document.height !== undefined
      ? document.height
      : document.body.offsetHeight;
  // store original page html so we can put the page back together once the game is done
  const originalHtml = document.documentElement.innerHTML;
  // we tried to create a game class but the technology just isn't there yet for chrome extensions
  const game = {};
  game.score = 0;
  game.hitCount = 0;
  game.totalClicks = 0;
  game._accuracy = 0;
  game.accuracyPercent = `${100}%`; // init to 100%
  game.highScore = localStorage.getItem('aimGameHighScore') ?? 0; // return 0 if high score === undefined/null
  game.lowScore = localStorage.getItem('aimGameLowScore') ?? 0; // return 0 if low score === undefined/null

  // transformations
  const rotate360 = [
    { transform: 'rotate(360deg)' },
    {
      duration: 80000,
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
						500px, 0px, 0)`,
      },
      {
        transform: `translate3D(
						0px, 500px, 200px)`,
      },
      {
        transform: `translate3D(
						0px,-500px, 200px)`,
      },
      {
        transform: `translate3D(
						-500px, 0px, 0)`,
      },
    ],
    {
      duration: 20000,
      iterations: Infinity,
    },
  ];

  const bigMoveDownUp = [
    [
      {
        transform: `translate3D(
						-500px, -${docHeight}px, 0)`,
      },
      {
        transform: `translate3D(
						500px, ${docHeight}px, 0)`,
      },
      {
        transform: `translate3D(
						-250px, 500px, 200px)`,
      },
      {
        transform: `translate3D(
						250px,-500px, 200px)`,
      },
    ],
    {
      duration: 80000,
      iterations: Infinity,
    },
  ];

  // each element on the page will randomly get one of these transformations assigned to it
  game.transformations = [
    rotate360,
    moveRightLeft,
    moveDownUp,
    rotato,
    bigMoveDownUp,
    [...bigMoveDownUp], // increase chances of lots of vertical movement
  ];
  // add sound
  let url = chrome.runtime.getURL('hitmarker.mp3');
  let hitMarker = new Audio(url);
  hitMarker.volume = 1;

  const getRandomAnim = () => {
    return game.transformations[
      Math.floor(Math.random() * game.transformations.length)
    ];
  };

  // get all elements from current tab
  game.getAllElements = function() {
    const elements = document.body.getElementsByTagName('*');
    return [...elements].flat(Infinity);
  };
  const allElements = game.getAllElements();
  // nuke it!
  document.body.innerHTML = '';
  document.body.style.cursor = 'crosshair';
  allElements.forEach(element => {
    element.style.cursor = 'crosshair';
    document.body.appendChild(element);
  });

  // THIS FILTER FUNC WENT UNUSED BC IT WAS THE CAUSE OF DESTROYING ALL ELEMENTS
  // WHENEVER ONE EVENTLISTENER FIRED but we kept it in to show our thought process
  // clean all elements (delete: <style>, etc)
  game.filterElements = function(elements) {
    // dont waste our time if one of your dimensions < 200 pixels
    const minSize = 200;
    return elements.filter(el => {
      // filter if width and length < minSize (arbitrary bc too small is too hard to click on)
      if (
        parseInt(el.offsetWidth) < minSize &&
        parseInt(el.offsetHeight) < minSize
      ) {
        return false;
      }
      if (
        el.tagName === 'SCRIPT' ||
        el.tagName === 'LINK' ||
        el.tagName === 'HTML' ||
        el.tagName === 'TITLE' ||
        el.tagName === 'BODY' ||
        el.tagName === 'SVG'
      ) {
        return false;
      }
      return true;
    });
  };
  // const filteredElements = game.filterElements(allElements);

  // lowScore stuff
  const lowScoreText = document.createElement('h1');
  const emojiLaugh = document.createElement('span');
  // THIS IS A SICK HACK TO GET EMJOIS FILLED WITH COLOR IN CHROME
  // IF YOU DON'T USE THIS YOUR EMOJIS WILL BE B&W EW
  emojiLaugh.style.fontWeight = '100';
  lowScoreText.display = 'inline-block';
  lowScoreText.style.position = 'fixed';
  lowScoreText.style.top = '35%';
  lowScoreText.style.left = '80%';
  lowScoreText.style.fontSize = '80px';
  lowScoreText.style.textAlign = 'center';
  lowScoreText.style.zIndex = '999996';

  emojiLaugh.innerHTML = '😂';
  lowScoreText.innerText = `${game.lowScore}`;
  lowScoreText.appendChild(emojiLaugh);
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
  const emojiKing = document.createElement('span');
  emojiKing.style.fontWeight = '100';
  highScoreText.display = 'inline-block';
  highScoreText.style.position = 'fixed';
  highScoreText.style.top = '65%';
  highScoreText.style.left = '80%';
  highScoreText.style.fontSize = '80px';
  highScoreText.style.textAlign = 'center';
  highScoreText.style.zIndex = '999997';

  emojiKing.innerHTML = '👑';
  highScoreText.innerText = `${game.highScore}`;
  highScoreText.appendChild(emojiKing);
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
    // assign unique z-index to each element on the page
    element.style.zIndex = `${idx}`;

    // i hate <a> tags
    element.removeAttribute('href');

    // constrains elements to respective width and height
    element.style.width = 'auto';
    element.style.height = 'auto';

    element.style.margin = '0';

    // removes videos
    if (element.tagName === 'IFRAME') {
      element.setAttribute('src', '');
    }

    // pick a random animation for the current element
    const anim = getRandomAnim();

    // change A tags to divs because for some reason they cant animate🙄
    if (element.tagName === 'A') {
      element.style.zIndex = `${idx}`;
      element.style.width = 'auto';
      element.style.height = 'auto';
      element.style.margin = '0';

      const newTextFromATag = document.createElement('div');
      newTextFromATag.innerHTML = element.innerHTML;
      element.parentNode.replaceChild(newTextFromATag, element);
      element = newTextFromATag;
      // aaaaaand same for spans🙄
    } else if (element.tagName === 'SPAN') {
      element.style.zIndex = `${idx}`;
      element.style.width = 'auto';
      element.style.height = 'auto';
      element.style.margin = '0';

      const newTextFromSpanTag = document.createElement('div');
      newTextFromSpanTag.innerHTML = element.innerHTML;
      element.parentNode.replaceChild(newTextFromSpanTag, element);
      element = newTextFromSpanTag;
    }
    element.animate(anim[0], anim[1]);

    //ON CLICK OF EACH ELEMENT
    // add a click eventlistener to each element
    element.addEventListener('click', function(event) {
      element.remove();
      game.totalClicks++;
      if (game.score >= game.highScore) {
        game.highScore++;
        highScoreText.innerText = `👑 ${game.highScore}`;
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
      setTimeout(function() {
        scoreText.style.color = origColor;
        document.body.style.backgroundColor = 'white';
      }, 200);
      //hitMarker.play();
      event.stopPropagation();
    });
  });

  //MISS CLICKS HANDLING
  //if click body, decrease point
  document.body.addEventListener('click', function(event) {
    game.totalClicks++;
    if (game.score <= game.lowScore) {
      game.lowScore--;
      lowScoreText.innerText = `😂 ${game.lowScore}`;
      localStorage.setItem('aimGameLowScore', game.lowScore);
    }
    game.score--;
    game._accuracy = game.hitCount / game.totalClicks;
    game.accuracyPercent = `${Math.round(game._accuracy * 100)}%`;

    scoreText.innerText = game.score;
    accuracyText.innerText = game.accuracyPercent;

    // flash red text or body
    scoreText.style.color = 'red';
    setTimeout(function() {
      document.body.style.backgroundColor = 'white';
      scoreText.style.color = origColor;
    }, 100);
  });

  document.body.overflowX = 'hidden';

  // create timer element
  const timer = document.createElement('h1');
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
  const x = setInterval(function() {
    var now = Number(Date.now());

    // Find the distance between now and the count down date
    var distance = countDownDate - now;
    if (distance < 0) {
      clearInterval(x);
      timer.innerHTML = 'EXPIRED';
      // reset html back to its orignial state
      // wouldn't be very nice to destory the dom and leave it that way!
      document.documentElement.innerHTML = originalHtml;
    } else {
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      //change color to red at 10s
      if (seconds < 11) {
        timer.style.color = 'red';
      }
      timer.innerHTML = seconds + 's ';
    }
  }, 1000);
}
