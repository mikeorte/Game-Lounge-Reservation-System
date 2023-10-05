document.addEventListener('DOMContentLoaded', function() {

    // Elements
    var startTimeSelect = document.getElementById('startTime');
    var endTimeSelect = document.getElementById('endTime');
    var checkReservationButton = document.getElementById('checkReservationButton');
    var reservationStatusDiv = document.getElementById('reservationStatus');
    var reservationDateInput = document.getElementById('reservationDate');
    var reserveButton = document.getElementById('reserveButton');  
    var stationID;

    var playerID = sessionStorage.getItem('playerID');
    console.log("Player ID retrieved ",playerID); // Debugging statement
    
    // Fetch reservations for the currently logged-in user when the page loads
    if (playerID) {
        fetchUserReservations(playerID);
    }   

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
    
    function populateUserReservations(reservations) {
        var userReservationsList = document.getElementById('userReservations');
        userReservationsList.innerHTML = ''; // Clear the list before adding updated reservations
    
        reservations.forEach(reservation => {
            var reservationItem = document.createElement('li');
            reservationItem.textContent = `Date: ${new Date(reservation.reservationDate).toLocaleDateString()} | Station: ${reservation.stationID} | Start Time: ${reservation.startTime} | End Time: ${reservation.endTime}`;
    
            // Add a cancel button
            var cancelButton = document.createElement('button');
            cancelButton.classList.add('cancelButton'); // For CSS styling
            cancelButton.textContent = 'Cancel Reservation';
            cancelButton.addEventListener('click', function() {
                cancelReservation(reservation.reservationID, reservation.stationID);
            });
    
            reservationItem.appendChild(cancelButton);
            userReservationsList.appendChild(reservationItem);
        });
    }
    
    // Fetch user's reservations from the server
    function fetchUserReservations(playerID) {
        console.log("Fetching user reservations for player ID:", playerID);
        fetch(`/getUserReservations/${playerID}`)
            .then(response => response.json())
            .then(data => {
                populateUserReservations(data); // Call the function to populate reservations
            })
            .catch(error => console.error('Error fetching user reservations:', error));
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
        console.log("Reserve button clicked"); // Debugging statement
    
        var reservationDateInput = document.getElementById('reservationDate');
        var startInput = document.getElementById('startTime');
        var endInput = document.getElementById('endTime');
        var selectedPlatform = document.querySelector('input[name="platform"]:checked');
    
        console.log("Inputs retrieved"); // Debugging statement
    
        var reservationDate = reservationDateInput.value;
        var reservationStartTime = startInput.value;
        var reservationEndTime = endInput.value;
    
        if (!reservationDate || !reservationStartTime || !reservationEndTime || !selectedPlatform) {
            alert('Please select a date, start time, end time, and platform.');
            return;
        }
    
        console.log("Inputs validated"); // Debugging statement
    
        var platform = selectedPlatform.value;
    
        // Send a POST request to reserve the station
        fetch('/reserveStation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerID, stationId: stationID, reservationDate, reservationStartTime, reservationEndTime }), 
        })
        .then(response => response.json())
        .then(data => {
            console.log("Response received"); // Debugging statement
    
            if (data.success) {
                console.log("Reservation successful"); // Debugging statement
    
                var message = `Reservation successful!\nStation ID: ${stationID}\nReservation Date: ${reservationDate}\nStart Time: ${reservationStartTime}\nEnd Time: ${reservationEndTime}\nPlatform: ${platform}\n`;
                alert(message);
                // Update the reservations list dynamically
                fetchUserReservations(playerID);
    
                // Reset the input fields to empty strings
                reservationDateInput.value = '';
                startInput.value = '';
                endInput.value = '';
            } else {
                console.log("Error making reservation"); // Debugging statement
    
                alert('Error making reservation. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
    });
    
    // Function to handle reservation cancellation
    function cancelReservation(reservationID, stationID) {
        var confirmCancel = confirm("Are you sure you want to cancel this reservation?");
        
        if (confirmCancel) {
            // Send a request to cancel the reservation
            fetch('/cancelReservation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reservationID: reservationID, stationID: stationID }), // Include stationID here
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Reservation cancelled successfully!');
                    // Refresh the list of user reservations after cancellation
                    fetchUserReservations(playerID);
                } else {
                    alert('Error cancelling reservation. Please try again.');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }
});
