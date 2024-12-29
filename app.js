// --------------------------------------------
// Global Variables & Audio
// --------------------------------------------
let canvas, ctx, w, h;
let displayActive = false; // True during the fireworks display
let playedExplosions = {};

// Physics constants
let gravity = 0.06;
let friction = 0.98;

// Instead of a fixed string, let's randomly pick from an alphabet for infinite rockets:
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// We'll track time so we can gradually increase rocket interval
let startFireworksTime = 0; // set when fireworks start
let lastLaunchTime = 0;     // tracks last rocket launch time

// --------------------------------------------
// Audio Objects
// --------------------------------------------
const newYearAudio = new Audio('newYearAudio.ogg');
const loopAudio    = new Audio('loopAudio.ogg');
loopAudio.loop     = true;

newYearAudio.preload = 'auto';
loopAudio.preload    = 'auto';

// --------------------------------------------
// 1. Explosion Audio (with random volume)
// --------------------------------------------
function playSingleBlast() {
  try {
    const explosionSound = new Audio('blast.ogg');
    explosionSound.currentTime = 0;
    const randomVolume = Math.random() * 0.7 + 0.2; 
    explosionSound.volume = randomVolume;
    explosionSound.play().catch(err => {
      console.error('Unable to play explosion sound:', err);
    });
  } catch (error) {
    console.error('Error in playSingleBlast:', error);
  }
}

function stopAllBlastSounds() {
  if (!newYearAudio.paused) {
    newYearAudio.pause();
    newYearAudio.currentTime = 0;
  }
  // We do NOT stop loopAudio here, so it continues playing.
}




// --------------------------------------------
// Attach click handler to the existing button
// --------------------------------------------
$(document).ready(function () {
  // Now we only bind the click event to the button placed in index.html
  $('#container1').on('click', function () {
    $(this).remove();
    runCountdown();
  });
});

document.addEventListener('DOMContentLoaded', () => {
    /**
     * Function to retrieve query parameters from the URL
     * @param {string} param - The name of the parameter to retrieve
     * @returns {string|null} - The value of the parameter or null if not found
     */
    function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }

    /**
     * Function to initialize the sender's name in the header
     */
    function initializeSenderName() {
      // Retrieve the 'sender' parameter from the URL
      const senderName = getQueryParam('n') || 'Sender';

      // Select the header's <h1> element within container1
      const headerElement = document.querySelector('#container1 .header h1');

      if (headerElement) {
        // Update the header with the sender's name
        headerElement.textContent = `${senderName}!`;
      } else {
        console.warn('Header element not found. Please check the HTML structure.');
      }
    }

    // Initialize sender's name in the header
    initializeSenderName();
    

    
  });


  

function runCountdown() {
  playCountdownAudio();

  let counter = 3;
  function displayCountdown() {
    if (counter > 0) {
      const countdown = $('<div id="countdown">' + counter + '</div>');
      countdown.appendTo($('.container'));
      countdown.css({ animation: 'countdownZoom 0.8s ease-in-out forwards' });
      countdown.on('animationend', function () {
        countdown.remove();
        counter--;
        displayCountdown();
      });
    } else {
      // Countdown ended
      newYearAudio.play().catch(err => {
        console.error('Failed to play newYearAudio:', err);
      });

      newYearAudio.addEventListener('ended', () => {
        loopAudio.play().catch(err => {
          console.error('Failed to play loopAudio:', err);
        });
        setTimeout(() => {
          loopAudio.volume = 0.25;
        }, 5000);
      });

      // Start fireworks, greeting, stars
      
      
      
      displayActive = true;
        showGreeting();
        startMainFireworks();
      
      
      
    }
  }
  displayCountdown();
  startTwinklingStars();

  
  
    
    
}

function playCountdownAudio() {
  try {
    const countdownAudio = new Audio('countdownAudio.ogg');
    countdownAudio.currentTime = 0;
    countdownAudio.volume = 1.0;
    countdownAudio.play().catch(err => {
      console.error('Failed to play countdown audio:', err);
    });
  } catch (error) {
    console.error('Error playing countdown audio:', error);
  }
}

// --------------------------------------------
// 3. Infinite Letter-Based Fireworks
// --------------------------------------------
function startMainFireworks() {
  canvas = document.createElement('canvas');
  document.getElementById('fireworks').appendChild(canvas);
  ctx = canvas.getContext('2d');
  resize();

  startFireworksTime = performance.now();
  lastLaunchTime = 0; 
  requestAnimationFrame(render);
}

function render(timestamp) {
  requestAnimationFrame(render);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.fillRect(0, 0, w, h);

  if (displayActive) {
    let currentInterval = getDynamicInterval(timestamp);
    if (timestamp - lastLaunchTime > currentInterval) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      const randomLetter = alphabet.charAt(randomIndex);
      launchRocket(randomLetter);
      lastLaunchTime = timestamp;
    }
  }

  updateRockets();
  updateExplosions();
}

function getDynamicInterval(timestamp) {
  const minInterval = 1000; 
  const maxInterval = 4000;   
  const rampDuration = 60000; 

  const timeElapsed = timestamp - startFireworksTime; 
  let fraction = Math.min(timeElapsed / rampDuration, 1); 
  let interval = minInterval + fraction * (maxInterval - minInterval);
  return interval;
}

let rockets = [];
let explosions = [];

function updateRockets() {
  for (let i = rockets.length - 1; i >= 0; i--) {
    let r = rockets[i];
    r.vy += gravity;
    r.x += r.vx;
    r.y += r.vy;

    drawRocket(r);

    if (r.vy >= 0 || r.y < r.targetHeight) {
      createExplosion(r);
      rockets.splice(i, 1);
    }
  }
}

function launchRocket(letter) {
  let startX = w * 0.2 + Math.random() * (w * 0.6);
  let startY = h;
  let velocityX = (Math.random() - 0.5) * 3.0;
  let velocityY = -(Math.random() * 5 + 3);
  let targetHeight = h * (0.4 + Math.random() * 0.2);
  let letterParticles = makeChar(letter);

  let rocket = {
    x: startX,
    y: startY,
    vx: velocityX,
    vy: velocityY,
    targetHeight: targetHeight,
    color: 'white',
    letterParticles: letterParticles
  };

  rockets.push(rocket);
}

function drawRocket(r) {
  ctx.beginPath();
  ctx.fillStyle = r.color;
  ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.moveTo(r.x, r.y);
  ctx.lineTo(r.x - r.vx * 5, r.y - r.vy * 5);
  ctx.stroke();
}

function createExplosion(rocket) {
  if (!displayActive) return; 
  playSingleBlast();

  let pts = rocket.letterParticles || [];
  let hue = Math.floor(Math.random() * 360);

  pts.forEach(pt => {
    let scale = 0.8 + Math.random() * 0.4;
    let offsetX = pt[0] * scale;
    let offsetY = pt[1] * scale;

    let angle = Math.atan2(offsetY, offsetX);
    let speed = 2 + Math.random() * 3;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;

    explosions.push({
      x: rocket.x,
      y: rocket.y,
      vx: vx,
      vy: vy,
      alpha: 1.0,
      color: `hsl(${hue}, 70%, 60%)`
    });
  });
}

function updateExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    let p = explosions[i];
    p.vx *= friction;
    p.vy *= friction;
    p.vy += gravity;
    p.x += p.vx;
    p.y += p.vy;

    p.alpha -= 0.01;

    ctx.globalAlpha = Math.max(p.alpha, 0);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    if (p.alpha <= 0) {
      explosions.splice(i, 1);
    }
  }
}

function makeChar(c) {
  let tmp = document.createElement('canvas');
  let size = (tmp.width = tmp.height = (window.innerWidth < 400 ? 200 : 300));
  let tmpCtx = tmp.getContext('2d');
  tmpCtx.font = 'bold ' + size + 'px Arial';
  tmpCtx.fillStyle = 'white';
  tmpCtx.textBaseline = 'middle';
  tmpCtx.textAlign = 'center';
  tmpCtx.fillText(c, size / 2, size / 2);

  let charData = tmpCtx.getImageData(0, 0, size, size);
  let charParticles = [];

  for (let i = 0; charParticles.length < 99 && i < size * size; i++) {
    let x = Math.random() * size;
    let y = Math.random() * size;
    let offset = Math.floor(y) * size * 4 + Math.floor(x) * 4;
    if (charData.data[offset] > 128) {
      charParticles.push([x - size / 2, y - size / 2]);
    }
  }
  return charParticles;
}

// --------------------------------------------
// 4. Resize the fireworks canvas
// --------------------------------------------
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', () => {
  if (canvas) resize();
});

// --------------------------------------------
// 5. Greeting
// --------------------------------------------
function showGreeting() {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get('n') || 'Your Friend';
  const greetingEl = document.getElementById('greeting');
  const userInputEl = document.getElementById('user-input');

  greetingEl.style.display = 'block';

  displayRandomQuote();
  displayRandomImage();
  displaySignature(name);

  setTimeout(() => {
    setTimeout(() => {
      userInputEl.style.display = 'flex';
    }, 3000);
  }, 3000);
}

// --------------------------------------------
// 6. User Name -> Shareable Link
// // --------------------------------------------
// function generateLink() {
//   const userName = document.getElementById('name').value || 'Your Friend';
//   const shareableLink = `${window.location.origin}${window.location.pathname}?n=${encodeURIComponent(userName)}`;
//   document.getElementById('shareable-link').textContent = shareableLink;
//   alert(`Shareable Link: ${shareableLink}`);
// }

// --------------------------------------------
// 7. Twinkling Stars
// --------------------------------------------
function startTwinklingStars() {
  let amount = 1000;
  const sky = $('#space');

  for (let i = 0; i < amount; i++) {
    let s = $('<div class="star-blink"></div>');
    s.css({
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      animationDelay: `${Math.random() * 100}s`,
      width: '12px',
      height: '12px',
      opacity: Math.random() * 0.5 + 0.5
    });

    if (i % 8 === 0) {
      s.addClass('red');
    } else if (i % 10 === 6) {
      s.addClass('blue');
    }
    sky.append(s);
  }
}

// --------------------------------------------
// 8. Random Quote and Image
// --------------------------------------------
const quotes = [
  "Wishing you a year of love, laughter, and happiness!",
  "May your dreams come true in 2025!",
  "May it be your best year yet!",
  "Wishing you peace, prosperity, and joy in 2025",
  "May the New Year bring you success and fulfillment!",
  "Here's to a year of new beginnings and endless possibilities!",
  "Wishing you a year filled with friendship, love, and adventure!",
  "May the New Year bring you courage, strength, and happiness!",
  "Wishing you a year of growth, learning, and self-discovery!",
  "May your New Year be bright, beautiful, and blessed!"
];

const images = [
  'https://cdn.pixabay.com/animation/2024/11/28/12/37/12-37-07-324_512.gif',
  'https://cdn.pixabay.com/animation/2024/12/07/21/56/21-56-57-850_512.gif',
  'https://cdn.pixabay.com/animation/2024/12/07/00/22/00-22-10-204_512.gif',
  'https://cdn.pixabay.com/animation/2024/09/02/08/29/08-29-52-859_512.gif',
  'https://cdn.pixabay.com/animation/2024/12/08/20/56/20-56-17-941_512.gif',
  'https://i.giphy.com/0n8j4zs6xhA6HuxDmQ.webp',
  'https://c.tenor.com/dVvlG5ueVjoAAAAC/tenor.gif',
  'https://data.textstudio.com/output/sample/animated/8/9/4/4/2025-10-14498.gif'
];

function displayRandomQuote() {
  const quoteEl = document.getElementById('quote');
  const randomIndex = Math.floor(Math.random() * quotes.length);
  quoteEl.textContent = `"${quotes[randomIndex]}"`;
}

function displayRandomImage() {
  const imageEl = document.getElementById('image');
  const randomIndex = Math.floor(Math.random() * images.length);
  imageEl.src = images[randomIndex];
  imageEl.alt = "Celebration Image";
}

function displaySignature(name) {
  const signatureEl = document.getElementById('signature');
  signatureEl.textContent = `— ${name}`;
}













function redirect() {
    const str1 = document.getElementById('name').value;
    if (str1) {
        // Redirect to share.html with the string as a query parameter
        window.location.href = `share.html?str1=${encodeURIComponent(str1)}`;
    } else {
        alert('Please enter a string before submitting!');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the share page
    initializeSharePage();
  });
  
  function initializePage() {
    // Display a personalized quote
    displayRandomQuote();
  
    // Display a random image
    displayRandomImage();
  
    // Start the twinkling stars animation
    startTwinklingStars();

    


  
    // Retrieve query parameter (e.g., "str1")
    function getQueryParameter(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }
  
    // Get the user name or signature from the query string
    const str1 = getQueryParameter('str1') || 'Your Friend';
    displaySignature(str1);
    setupWhatsAppShare(str1);
  
    // Display the greeting section with a fade-in effect
    const greetingSection = document.getElementById('greeting');
    if (greetingSection) {
      greetingSection.style.display = 'block';
      setTimeout(() => {
        greetingSection.style.opacity = '1'; // Trigger CSS transition
      }, 100);
    } else {
      console.warn('"greeting" section not found.');
    }
  }
  
  function setupWhatsAppShare(str1) {
    const shareButton = document.getElementById('whatsapp-share-btn');
    if (!shareButton) {
      console.warn('"whatsapp-share-btn" button not found.');
      return;
    }
  
    // Construct WhatsApp share URL
    const message = encodeURIComponent(
      `*Hi!*\n\nI’ve made a *special surprise* to make your *New Year* amazing 🎉\n\nTap this *secure link* to see it:\ncutielife.in/K/?n=${str1}`
    );
    
    
    
  const whatsappURL = `https://api.whatsapp.com/send?text=*Hi!*%0A%0AI%E2%80%99ve%20made%20a%20*special%20surprise*%20to%20make%20your%20*New%20Year*%20amazing%20%F0%9F%8E%89%0A%0ATap%20this%20*secure%20link*%20to%20see%20it%3A%0Acutielife.in%2FK%2F%3Fn%3D%0A${str1}`;

  
    // Add click event listener to the share button
    shareButton.addEventListener('click', () => {
      window.open(whatsappURL, '_blank');
    });
  }
  
  function initializeSharePage() {
    initializePage(); // Set up the page (stars, quote, image, etc.)
     // Configure the WhatsApp share button
  }
  