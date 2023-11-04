document.addEventListener('DOMContentLoaded', function() {

    // Function to display a message
    function showMessage(message, elementId) {
        const element = document.getElementById(elementId);
        element.innerText = message;
    }

    // Function to check if password meets minimum length

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data.success) {
                const redirectURL = data.isAdmin ? '/adminDashboard' : '/dashboardHome';
                setTimeout(function() {
                    window.location.href = redirectURL;
                }, 1300);
                showMessage(`Welcome, ${username}!`, 'helloMessage');
                sessionStorage.setItem('playerID', data.playerID);
            } else {
                showMessage('Invalid username or password.', 'helloMessage');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again later.', 'helloMessage');
        }
    });

    const showChangePasswordButton = function() {
        const changePasswordButton = document.getElementById('changePasswordButton');
        changePasswordButton.style.display = 'block';
    };

    const hideChangePasswordButton = function() {
        const changePasswordButton = document.getElementById('changePasswordButton');
        changePasswordButton.style.display = 'none';
    };

    const verifyInformation = async function(email, phoneNumber) {
        try {
            const response = await fetch('/forgotUsernameOrPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, phoneNumber }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const usernameDisplay = document.getElementById('usernameDisplay');
            const passwordChangeMessage = document.getElementById('passwordChangeMessage');

            if (data.success) {
                usernameDisplay.innerText = `Your username is: ${data.username}`;
                usernameDisplay.style.display = 'block';
                passwordChangeMessage.style.display = 'none';
                showChangePasswordButton();
                changePasswordDiv.style.display = 'block';

            } else {
                passwordChangeMessage.innerText = data.message;
                passwordChangeMessage.style.display = 'block';
                usernameDisplay.style.display = 'none';
                hideChangePasswordButton();
            }
        } catch (error) {
            console.error('Error:', error);
            hideChangePasswordButton();
        }
    };

    const changePassword = async function(username, newPassword) {
        try {
            // Check if password meets minimum length
            if (!validatePasswordLength(newPassword)) {
                const passwordChangeMessage = document.getElementById('passwordChangeMessage');
                passwordChangeMessage.innerText = 'Password must be at least 8 characters long.';
                passwordChangeMessage.style.display = 'block';
                return;
            }
    
            // Send a POST request to the server for changing password
            const response = await fetch('/changePassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, newPassword }),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
    
            if (data.success) {
                const passwordChangeMessage = document.getElementById('passwordChangeMessage');
                passwordChangeMessage.innerText = data.message;
                passwordChangeMessage.style.display = 'block';
                // ... (rest of the code)
            } else {
                const passwordChangeMessage = document.getElementById('passwordChangeMessage');
                passwordChangeMessage.innerText = data.error;
                passwordChangeMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const link = document.getElementById('forgotLink');
    link.addEventListener('click', function(event) {
        event.preventDefault();
        showEmailPhoneFields();
        hideChangePasswordButton();
    });

    const verifyInfoButton = document.getElementById('verifyInfo');
    verifyInfoButton.addEventListener('click', function(event) {
        event.preventDefault();
        const email = document.getElementById('email2').value;
        const phoneNumber = document.getElementById('phoneNumber2').value;
        verifyInformation(email, phoneNumber);
    });

    const changePasswordButton = document.getElementById('changePasswordButton');
    const changePasswordDiv = document.getElementById('changePasswordDiv');
    changePasswordButton.addEventListener('click', function(event) {
        event.preventDefault();
        const username = usernameDisplay.textContent.split(': ')[1];
        const newPassword = document.getElementById('newPassword').value;
        changePassword(username, newPassword);
    });

});