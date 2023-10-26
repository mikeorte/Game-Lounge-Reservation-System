document.addEventListener('DOMContentLoaded', function() {
    // Function to display a message
    function showMessage(message, elementId) {
        const element = document.getElementById(elementId);
        element.textContent = message;
    }

    // Get the form element
    const createAccountForm = document.getElementById('createAccountForm');

    // Add event listener for form submission
    createAccountForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form submission

        // Get values from form fields
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const username = document.getElementById('username2').value;
        const password = document.getElementById('password2').value;

        try {
            // Send a POST request to the server
            const response = await fetch('/createAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, phoneNumber, username, password }),
            });

            if (!response.ok) {
                // If response is not ok, throw an error
                throw new Error('Failed to create account. Please try again later.');
            }

            // Parse the response data as JSON
            const data = await response.json();

            if (data.success) {
                // If account creation is successful, display success message
                showMessage('Account created successfully. Please log in.', 'createAccountMessage');
            } else {
                // If account creation fails, display failure message
                showMessage('Account creation failed.', 'createAccountMessage');
            }
        } catch (error) {
            // Catch any errors that occur during the fetch or processing of response
            console.error('Error:', error);
        }
    });
});
