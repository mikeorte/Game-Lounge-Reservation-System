document.addEventListener('DOMContentLoaded', function() {

    // User info variables
    var userReservationsList = document.getElementById('userReservations');
    var searchUserButton = document.getElementById('searchUserButton');
    var searchUserNameInput = document.getElementById('searchUserName');
    var userInfoSection = document.getElementById('userInfoSection');
    var showUserName = document.getElementById('showUserName');
    var showName = document.getElementById('showName');
    var showEmail = document.getElementById('showEmail');
    var showPhoneNumber = document.getElementById('showPhoneNumber');

    //Reservation variables
    var startTimeSelect = document.getElementById('startTime');
    var endTimeSelect = document.getElementById('endTime');
    var checkReservationButton = document.getElementById('checkReservationButton');
    var reservationStatusDiv = document.getElementById('reservationStatus');
    var reservationDateInput = document.getElementById('reservationDate');
    var reserveButton = document.getElementById('reserveButton');  
    var stationID;

    startTimeSelect.innerHTML += `<option value="" disabled selected>Select a start time</option>`;
    endTimeSelect.innerHTML += `<option value="" disabled selected>Select an end time</option>`;

    // Populate start time and end time dropdowns (increments of 30 minutes)
    for (var i = 8; i <= 20; i++) {
        for (var j = 0; j < 60; j += 30) {
            var timeString = i.toString().padStart(2, '0') + ':' + j.toString().padStart(2, '0');
            startTimeSelect.innerHTML += `<option value="${timeString}">${timeString}</option>`;
            endTimeSelect.innerHTML += `<option value="${timeString}">${timeString}</option>`;
        }
    }

    function fetchUserInfo(userName) {
        fetch(`/searchUser?userName=${userName}`)
            .then(response => response.json())
            .then(data => {
                if (data.userFound) {
                    showName.textContent = data.name;
                    showEmail.textContent = data.email;
                    showPhoneNumber.textContent = data.phoneNumber;

                    // Display user info section
                    userInfoSection.style.display = 'block';

                    // Clear user reservations list
                    userReservationsList.innerHTML = '';

                    // Populate user reservations
                    data.reservations.forEach(reservation => {
                        var listItem = document.createElement('li');
                        listItem.textContent = `Station ${reservation.stationID} | Duration: ${reservation.duration} minutes`;
                        userReservationsList.appendChild(listItem);
                    });
                } else {
                    // User not found
                    userInfoSection.style.display = 'block';
                    showUserName.textContent = 'User not found';
                }
            })
            .catch(error => console.error('Error:', error));
    }

    checkReservationButton.addEventListener('click', function() {
        var selectedDate = reservationDateInput.value;
        var selectedStartTime = startTimeSelect.value;
        var selectedEndTime = endTimeSelect.value;
    
        // Get the selected platform
        var selectedPlatform = document.querySelector('input[name="platform"]:checked');
        if (!selectedPlatform) {
            alert('Please select a platform (PC or Xbox).');
            return;
        }
    
        selectedPlatform = selectedPlatform.value;
    
        if (!selectedDate || !selectedStartTime || !selectedEndTime) {
            alert('Please select a date, start time, and end time.');
            return;
        }
        startTimeSelect.value = selectedStartTime;
        endTimeSelect.value = selectedEndTime;
        console.log(startTimeSelect.value);
        fetch(`/checkReservations?date=${selectedDate}&startTime=${selectedStartTime}&endTime=${selectedEndTime}`)
            .then(response => response.json())
            .then(data => {
                if (data.available) {
                    reservationStatusDiv.textContent = 'Available';
                    reserveButton.style.display = 'block';
                    // Get the first available station of the selected platform
                    fetch(`/getFirstAvailableStation/${selectedPlatform}`) 
                        .then(response => response.json())
                        .then(data => {
                            stationID = data.stationID;
                        })
                        .catch(error => console.error('Error fetching first available station:', error));
                } else {
                    reservationStatusDiv.textContent = 'Occupied. Please choose different times.';
                }
            })
            .catch(error => console.error('Error checking reservations:', error));
    });
    
    // Reserve button click event handler
    reserveButton.addEventListener('click', function() {
        var playerID = document.getElementById('userName');
        var reservationDateInput = document.getElementById('reservationDate');
        var startInput = document.getElementById('startTime');
        var endInput = document.getElementById('endTime');
        var selectedPlatform = document.querySelector('input[name="platform"]:checked');
    
        var reservationDate = reservationDateInput.value;
        var reservationStartTime = startInput.value;
        var reservationEndTime = endInput.value;
    
        if (!reservationDate || !reservationStartTime || !reservationEndTime || !selectedPlatform) {
            alert('Please select a date, start time, end time, and platform.');
            return;
        }
    
        var platform = selectedPlatform.value;

        // Send a POST request to reserve the station
        fetch('/reserveStationForUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: playerID, stationId: stationID, reservationDate, reservationStartTime, reservationEndTime, platform }), 
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                var message = `Reservation successful!\nStation ID: ${stationID}\nReservation Date: ${reservationDate}\nStart Time: ${reservationStartTime}\nEnd Time: ${reservationEndTime}\nPlatform: ${platform}\n`;
                alert(message);
    
                // Reset the input fields to empty strings
                reservationDateInput.value = ''; // Added line
                startInput.value = ''; // Updated line
                endInput.value = ''; // Updated line
            } else {
                alert('Error making reservation. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    searchUserButton.addEventListener('click', function() {
        var searchUserName = searchUserNameInput.value;

        // Search for user info
        fetchUserInfo(searchUserName);
    });
});
