document.addEventListener('DOMContentLoaded', function() {
    // Function to display a message
    function showMessage(message, elementId) {
      var element = document.getElementById(elementId);
      element.innerText = message;
    }
  
    // Display a welcome message after successful login
    var loginForm = document.getElementById('loginForm');
  
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
    
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
    
        // Send a POST request to the server
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Received response from server:', data); // Log the response from server
            if (data.success) {
                if (data.isAdmin) {
                    console.log('User is an admin'); // Log if user is an admin
                    window.location.href = '/adminDashboard.html'; // Redirect to admin dashboard
                } else {
                    setPlayerID(data.playerID); // Store playerID in sessionStorage
                    showMessage('Welcome, ' + username + '!', 'helloMessage');
                    setTimeout(function(){
                        window.location.href = '/dashboardHome'; // Redirect after 1.5 seconds
                    }, 1500); // Redirect after 1.5 seconds
                }
            } else {
                showMessage('Invalid username or password.', 'helloMessage');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
    
    
  });
  