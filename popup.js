document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  
  // Get the selected site
  const selectedSite = document.getElementById('siteSelector').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Store the credentials in Chrome storage for the specific site
  chrome.storage.sync.set({ [selectedSite]: { username, password } }, function () {
    alert(`${selectedSite} credentials saved successfully.`);
    displaySavedCredentials();
  });
});

// Toggle display of saved credentials
document.getElementById('toggleCredentials').addEventListener('click', function () {
  const savedCredentials = document.getElementById('savedCredentials');
  if (savedCredentials.style.display === 'none') {
    savedCredentials.style.display = 'block';
    this.textContent = 'Hide Credentials'; // Change button text
    displaySavedCredentials(); // Refresh credentials display
  } else {
    savedCredentials.style.display = 'none';
    this.textContent = 'Show Credentials'; // Change button text
  }
});

// Function to display saved credentials
function displaySavedCredentials() {
  chrome.storage.sync.get(null, function (items) {
    const savedCredentials = document.getElementById('savedCredentials');
    savedCredentials.innerHTML = '';

    for (const [key, value] of Object.entries(items)) {
      savedCredentials.innerHTML += `<p><strong>${key}:</strong> ${value.username} / ${value.password}</p>`;
    }

    if (Object.keys(items).length === 0) {
      savedCredentials.innerHTML = "<p>No saved credentials found.</p>";
    }
  });
}

// Auto-Fill and Login button
document.getElementById('autoLoginButton').addEventListener('click', function () {
  const selectedSite = document.getElementById('siteSelector').value;
  
  // Query the active tab and run the login function
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: autoLogin,
      args: [selectedSite]
    });
  });
});

// Function injected into the webpage to perform the login action
function autoLogin(site) {
  chrome.storage.sync.get([site], function (result) {
    if (result[site]) {
      const { username, password } = result[site];

      console.log(`Attempting login for ${site} with username: ${username}`);

      let usernameField, passwordField, loginButton, loginNext;

      // Handle different sites based on the selected option
      if (site === 'lms') {
        usernameField = document.querySelector('#username');
        passwordField = document.querySelector('#password');
        loginButton = document.querySelector('#loginbtn');
      } else if (site === 'polli') {
        usernameField = document.querySelector('#asdf');
        passwordField = document.querySelector('#fdsa');
        loginButton = document.querySelector('#loginForm\\:login');
      } else if (site === 'bhtMicrosoft') {
        // Microsoft login page elements
        usernameField = document.querySelector('input[name="loginfmt"]');
        passwordField = document.querySelector('input[name="#i0118"]');
        loginNext = document.querySelector('#idSIButton9') // Next button
        loginButton = document.querySelector('#idSIButton9'); // login Button
      } else if (site == 'bhtZoom') {
        usernameField = document.querySelector('input[name="username"]');
        passwordField = document.querySelector('input[name="password"]');
        loginButton = document.querySelector('input[name="mainBody"]');
      } else if (site == 'bhtWebMail') {
        usernameField = document.querySelector('input[name="rcmloginuser"]');
        passwordField = document.querySelector('input[name="rcmloginpwd"]');
        loginButton = document.querySelector('input[name="rcmloginsubmit"]');
      }

      // Fill the fields and trigger login
      if (usernameField) {
        usernameField.value = username;
        console.log("Username field found and filled.");
        setTimeout(( )=> {
          loginNext.click();
          console.log("Username filled and next button clicked.");
        }, 3000) 
      } else {
        console.error("Username field not found.");
      }

      // if (passwordField) {
      //   usernameField.value = username;
      //   console.log("Username field found and filled.");
      //   setTimeout(( )=> {
      //     loginNext.click();
      //     console.log("Username filled and next button clicked.");
      //   }, 3000) 
      // } else {
      //   console.error("Username field not found.");
      // }

      // if (passwordField) {
      //   setTimeout(( )=> {
      //         passwordField.value = password;
      //         console.log("Password field found and filled.");
      //         loginButton.click();
      //         console.log("Login button clicked for Microsoft 1.");
      //       }, 3000)
      // } else {
      //   console.error("Username field not found.");
      // }

      if (passwordField) {
        passwordField.value = password;
        console.log("Password field found and filled.");
        setTimeout(( )=> {
          loginButton.click();
          console.log("Login button clicked for Microsoft pass.");
        }, 3000)
      } else if (site === 'bhtMicrosoft') {
        // Microsoft login flow (password entry comes in the next step)
        console.log("Proceeding to the next step for password entry.");
        loginButton.click();
        setTimeout(() => {
          passwordField = document.querySelector('#i0118'); // Password field
          if (passwordField) {
            passwordField.value = password;
            console.log("Password field found and filled.");
            loginButton = document.querySelector('#idSIButton9'); // Sign in button
            setTimeout(() => {
              if (loginButton) {
                loginButton.click();
                console.log("Login button clicked for Microsoft.");
              }
            }, 3000)
          } else {
            console.error("Password field not found for Microsoft.");
          }
        }, 2000); // Wait for 2 seconds to allow the password field to load
      } else if (loginButton) {
        console.log("Login button found, clicking it...");
        loginButton.click();
      } else {
        console.error("Login button not found.");
      }
    } else {
      console.error("No credentials found for the selected site.");
    }
  });
}

// Display saved credentials on load
document.addEventListener('DOMContentLoaded', displaySavedCredentials);
