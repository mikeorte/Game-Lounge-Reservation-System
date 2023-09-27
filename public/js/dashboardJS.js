document.addEventListener('DOMContentLoaded', function() {

    // Elements
    var userReservationsList = document.getElementById('userReservations');
    var stationDropdown = document.getElementById('stationID');
    var availableStationsList = document.getElementById('availableStations');
    var reserveButton = document.getElementById('reserveButton');

    var reservationTimeInput = document.getElementById('reservationTime');
    var currentTime = new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'});
    reservationTimeInput.setAttribute('min', currentTime);
    
    // Fetch availableStations from the server
    function updateAvailableStations() {
        var availableStationsSelect = document.getElementById('stationID');
        availableStationsSelect.innerHTML = ''; // Clear the options before adding updated options
    
        fetch('/getAvailableStations')
            .then(response => response.json())
            .then(data => {
                var availableStationsDropdown = document.getElementById('availableStations');
                availableStationsDropdown.innerHTML = ''; // Clear the dropdown before adding updated options
    
                data.forEach(station => {
                    var option = document.createElement('option');
                    option.value = station.stationsID;
                    option.textContent = `Station ${station.stationsID} - ${station.type}`;
                    availableStationsSelect.appendChild(option);
    
                    // Also add the station to the available stations dropdown
                    var dropdownOption = document.createElement('option');
                    dropdownOption.value = station.stationsID;
                    dropdownOption.textContent = `Station ${station.stationsID} - ${station.type}`;
                    availableStationsDropdown.appendChild(dropdownOption);
                });
            })
            .catch(error => console.error('Error fetching available stations:', error));
    }    

    // Fetch user's reservations from the server
    function fetchUserReservations(playerID) {
        fetch(`/getUserReservations/${playerID}`)
            .then(response => response.json())
            .then(data => {
                var userReservationsList = document.getElementById('userReservations');
                userReservationsList.innerHTML = ''; // Clear the list before adding updated reservations
    
                data.forEach(reservation => {
                    var reservationItem = document.createElement('li');
                    reservationItem.textContent = `Station ${reservation.stationID} | Duration: ${reservation.duration} minutes`;
    
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
                updateAvailableStations(); // After updating reservations, also update available stations
            })
            .catch(error => console.error('Error fetching user reservations:', error));
    }
    
    // Reserve button click event handler
    reserveButton.addEventListener('click', function() {
        var availableStationsSelect = document.getElementById('stationID');
        var reservationTimeInput = document.getElementById('reservationTime');
        var durationInput = document.getElementById('duration');
    
        var stationID = availableStationsSelect.value;
        var reservationTime = reservationTimeInput.value;
        var duration = durationInput.value;
    
        // Check if reservationTime is empty
        if (!reservationTime) {
            alert('Please select a reservation time.');
            return; // Exit the function if reservationTime is empty
        }
    
        // Get playerID from sessionStorage
        var playerID = sessionStorage.getItem('playerID');
    
        // Send a POST request to reserve the station
        fetch('/reserveStation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: playerID, stationId: stationID, reservationTime, duration }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                var message = `Reservation successful!\nStation ID: ${stationID}\nReservation Time: ${reservationTime}\nDuration: ${duration} minutes`;
                alert(message);
    
                // Update the available stations list after a successful reservation
                updateAvailableStations();
    
                // Update the reservations list dynamically
                fetchUserReservations(playerID);
    
                // Reset the time input to an empty string
                reservationTimeInput.value = '';
            } else {
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
    

    // Get playerID from sessionStorage
    var playerID = sessionStorage.getItem('playerID');

    // Fetch reservations for the currently logged-in user when the page loads
    if (playerID) {
        fetchUserReservations(playerID);
    }

});
