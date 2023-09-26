document.addEventListener('DOMContentLoaded', function() {
    // Function to display a message
    function showMessage(message, elementId) {
        var element = document.getElementById(elementId);
        element.innerText = message;
    }

    // Function to set playerID in sessionStorage
    function setPlayerID(playerID) {
        sessionStorage.setItem('playerID', playerID);
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
            if (data.success) {
                setPlayerID(data.playerID); // Store playerID in sessionStorage
                showMessage('Welcome, ' + username + '!', 'helloMessage');
                setTimeout(function(){
                    window.location.href = '/dashboardHome'; // Redirect to dashboardPage
                }, 1500); // Redirect after 1.5 seconds
            } else {
                showMessage('Invalid username or password.', 'helloMessage');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
