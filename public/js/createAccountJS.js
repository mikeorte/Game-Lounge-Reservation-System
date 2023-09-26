document.addEventListener('DOMContentLoaded', function() {
    // Function to display a message
    function showMessage(message, elementId) {
        var element = document.getElementById(elementId);
        element.innerText = message;
    }

    // Display a welcome message after successful account creation
    var createAccountForm = document.getElementById('createAccountForm');

    createAccountForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        var name = document.getElementById('name').value;
        var email = document.getElementById('email').value;
        var phoneNumber = document.getElementById('phoneNumber').value;
        var username = document.getElementById('username2').value;
        var password = document.getElementById('password2').value;

        // Send a POST request to the server
        fetch('/createAccount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phoneNumber, username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('Account created successfully. Please log in.', 'createAccountMessage');
                // Remove the redirect code, as it's not needed
            } else {
                showMessage('Account creation failed.', 'createAccountMessage');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
