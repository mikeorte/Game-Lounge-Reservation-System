document.addEventListener('DOMContentLoaded', function() {

    // Function to display a message
    function showMessage(message, elementId) {
        const element = document.getElementById(elementId);
        element.innerText = message;
    }

    // Get the login form element
    const loginForm = document.getElementById('loginForm');

    // Add event listener for form submission
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Get username and password from form inputs
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // Send a POST request to the server for login
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            // Check if response is not ok
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // If login is successful
            if (data.success) {
                // Determine the redirect URL based on user role
                const redirectURL = data.isAdmin ? '/adminDashboard' : '/dashboardHome';
                // Redirect the user
                setTimeout(function() {
                    window.location.href = redirectURL;
                }, 1300);
                // Show welcome message
                showMessage(`Welcome, ${username}!`, 'helloMessage');
                // Store playerID in session storage
                sessionStorage.setItem('playerID', data.playerID);
            } else {
                // Show error message for invalid credentials
                showMessage('Invalid username or password.', 'helloMessage');
            }
        } catch (error) {
            // Log and display an error message if any unexpected error occurs
            console.error('Error:', error);
            showMessage('An error occurred. Please try again later.', 'helloMessage');
        }
    });
});
