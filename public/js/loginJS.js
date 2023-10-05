document.addEventListener('DOMContentLoaded', function() {
    function showMessage(message, elementId) {
        var element = document.getElementById(elementId);
        element.innerText = message;
    }

    var loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

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
                if (data.isAdmin) {
                    setTimeout(function() {
                        window.location.href = '/adminDashboard';
                    }, 1500);
                } else {
                    setTimeout(function() {
                        window.location.href = '/dashboardHome';
                    }, 1500);
                }
                showMessage('Welcome, ' + username + '!', 'helloMessage');
                sessionStorage.setItem('playerID', data.playerID);
            } else {
                showMessage('Invalid username or password.', 'helloMessage');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
