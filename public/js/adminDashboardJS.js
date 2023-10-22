document.addEventListener('DOMContentLoaded', function() {

    // User info variables
    var userReservationsList = document.getElementById('userReservations');
    var searchUserButton = document.getElementById('searchUserButton');
    var searchUserNameInput = document.getElementById('searchUserName');
    var userInfoSection = document.getElementById('userInfoSection');
    var showName = document.getElementById('showName');
    var showEmail = document.getElementById('showEmail');
    var showPhoneNumber = document.getElementById('showPhoneNumber');

    // Reservation variables
    var startTimeSelect = document.getElementById('startTime');
    var endTimeSelect = document.getElementById('endTime');
    var checkReservationButton = document.getElementById('checkAndReserveButton');
    var reservationStatusDiv = document.getElementById('reservationStatus');
    var reservationDateInput = document.getElementById('reservationDate');
    var reserveButton = document.getElementById('reserveButton');

    // Populate start time and end time dropdowns (increments of 30 minutes)
    function populateTimeDropdowns() {
        // Add default option
        startTimeSelect.innerHTML = `<option value="">Select a time</option>`;
        endTimeSelect.innerHTML = `<option value="">Select a time</option>`;

        for (let i = 8; i <= 20; i++) {
            for (let j = 0; j < 60; j += 30) {
                const timeString = i.toString().padStart(2, '0') + ':' + j.toString().padStart(2, '0');
                startTimeSelect.innerHTML += `<option value="${timeString}">${timeString}</option>`;
                endTimeSelect.innerHTML += `<option value="${timeString}">${timeString}</option>`;
            }
        }
    }
    populateTimeDropdowns();

    searchUserButton.addEventListener('click', function() {
        var searchUserName = searchUserNameInput.value;

        // Search for user info
        fetchUserInfo(searchUserName);
    });

    function fetchUserInfo(userName) {
        document.getElementById('userNotFoundMessage').style.display = 'none';
    
        fetch(`/searchUser?userName=${userName}`)
            .then(response => response.json())
            .then(data => {
                if (data.userFound) {
                    showName.textContent = data.name;
                    showEmail.textContent = data.email;
                    showPhoneNumber.textContent = data.phoneNumber;
    
                    // Display user info section
                    userInfoSection.style.display = 'block';
                } else {
                    // User not found
                    userInfoSection.style.display = 'none'; // Hide user info section
    
                    // Show the error message
                    document.getElementById('userNotFoundMessage').style.display = 'block';
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
});
