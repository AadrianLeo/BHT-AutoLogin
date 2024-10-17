// Function to find element using XPath
function getElementByXPath(xpath) {
  return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// Determine the current site by checking the URL
const url = window.location.href;
let currentSite;

if (url.includes('lms.bht-berlin.de')) {
  currentSite = 'lms';
} else if (url.includes('polli.bht-berlin.de')) {
  currentSite = 'polli';
} else if (url.includes('teams.microsoft.com') || url.includes('login.microsoftonline.com')) {
  currentSite = 'bhtMicrosoft'; // Consolidated site name for Teams and Office
} else if (url.includes('login.bht-berlin.de') || url.includes('bht-berlin-de.zoom.us')) {
  currentSite = 'bhtZoom'; // login for comman platform and zoom for bht
} else if (url.includes('webmail.bht-berlin.de')) {
  currentSite = 'bhtWebMail'; // login for comman platform and zoom for bht
} 

// Get the stored credentials for the current site
chrome.storage.sync.get([currentSite], function (result) {
  if (result[currentSite]) {
    const { username, password } = result[currentSite];

    // Based on the site, use specific XPaths for login fields
    let usernameField, passwordField, loginButton, loginNext;

    if (currentSite === 'lms') {
      // LMS Moodle login
      usernameField = getElementByXPath('//*[@id="username"]');
      passwordField = getElementByXPath('//*[@id="password"]');
      loginButton = getElementByXPath('//*[@id="loginbtn"]');
    } else if (currentSite === 'polli') {
      // Polli login
      usernameField = getElementByXPath('//*[@id="asdf"]');
      passwordField = getElementByXPath('//*[@id="fdsa"]');
      loginButton = getElementByXPath('//*[@id="loginForm:login"]');
    } else if (currentSite === 'bhtMicrosoft') {
      // BHT Microsoft login (Teams/Office)
      usernameField = getElementByXPath('//input[@name="loginfmt"]');
      passwordField = getElementByXPath('//*[@id="i0118"]');
      loginNext = getElementByXPath('//*[@id="idSIButton9"]');
      loginButton = getElementByXPath('//*[@id="idSIButton9"]');
    } else if(currentSite == 'bhtZoom') {
      // BHT (Zoom/BHt Common portal)
      usernameField = getElementByXPath('//*[@id="username"]');
      passwordField = getElementByXPath('//*[@id="password"]');
      loginButton = getElementByXPath('//*[@id="mainBody"]/section[1]/form/div/div/button'); 
    } else if(currentSite == 'bhtWebMail') {
      // BHT (Zoom/BHt Common portal)
      usernameField = getElementByXPath('//*[@id="rcmloginuser"]');
      passwordField = getElementByXPath('//*[@id="rcmloginpwd"]');
      loginButton = getElementByXPath('//*[@id="rcmloginsubmit"]'); 
    }

    // Fill the fields and trigger login
    if (currentSite === 'bhtMicrosoft') {
      // Teams/Office step 1: enter username only and proceed to next step
      if (usernameField && loginNext) {
        usernameField.value = username;
        usernameField.focus();
        loginNext.click(); // Click the "Next" button

        // setTimeout(() => {
          if (passwordField && loginButton) {
            passwordField.value = password; // Fill in the password
            loginButton.click(); // Click the "Sign in" button
          }
        // }, 1000); // Delay for 1 second
      }
    } else if (usernameField && passwordField && loginButton) {
      // For other sites (LMS and Polli)
      usernameField.value = username;
      passwordField.value = password;
      loginButton.click();
    } else {
      console.error("Login fields not found for the current site.");
    }
  } else {
    console.error("Credentials not found for the current site.");
  }
});
