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
     
  const whatsappURL = `https://api.whatsapp.com/send?text=*Hi!*%0A%0AI%E2%80%99ve%20made%20a%20*special%20surprise*%20to%20make%20your%20*New%20Year*%20amazing%20%F0%9F%8E%89%0A%0ATap%20this%20*secure%20link*%20to%20see%20it%3A%0Abenadin.github.io%2FCustomWish%2F%3Fn%3D${str1}`;

  

  
    // Add click event listener to the share button
    shareButton.addEventListener('click', () => {
      window.open(whatsappURL, '_blank');
    });
  }
  
  function initializeSharePage() {
    initializePage(); // Set up the page (stars, quote, image, etc.)
     // Configure the WhatsApp share button
  }
  
