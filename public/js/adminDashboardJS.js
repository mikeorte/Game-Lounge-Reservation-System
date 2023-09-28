document.addEventListener('DOMContentLoaded', function() {

    // Elements
    var availableStationsList = document.getElementById('availableStations');
    var userReservationsList = document.getElementById('userReservations');
    var userNameInput = document.getElementById('userName');
    var stationIDInput = document.getElementById('stationID');
    var reservationTimeInput = document.getElementById('reservationTime');
    var durationInput = document.getElementById('duration');
    var makeReservationButton = document.getElementById('makeReservationButton');

    function updateAvailableStations() {
        availableStationsList.innerHTML = ''; // Clear the list before adding updated options

        fetch('/getAvailableStations')
            .then(response => response.json())
            .then(data => {
                data.forEach(station => {
                    var listItem = document.createElement('li');
                    listItem.textContent = `Station ${station.stationsID} - ${station.type}`;
                    availableStationsList.appendChild(listItem);
                });
            })
            .catch(error => console.error('Error fetching available stations:', error));
    }

    function fetchUserReservations() {
        userReservationsList.innerHTML = ''; // Clear the list before adding updated reservations

        fetch('/getAllUserReservations')
            .then(response => response.json())
            .then(data => {
                data.forEach(reservation => {
                    var listItem = document.createElement('li');
                    listItem.textContent = `User: ${reservation.userName} | Station ${reservation.stationID} | Duration: ${reservation.duration} minutes`;
                    userReservationsList.appendChild(listItem);
                });
            })
            .catch(error => console.error('Error fetching user reservations:', error));
    }

    makeReservationButton.addEventListener('click', function() {
        var userName = userNameInput.value;
        var stationID = stationIDInput.value;
        var reservationTime = reservationTimeInput.value;
        var duration = durationInput.value;

        // Send a POST request to make a reservation for the user
        fetch('/makeReservationForUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName, stationID, reservationTime, duration }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Reservation made successfully!');
                // After a successful reservation, update the available stations list and user reservations
                updateAvailableStations();
                fetchUserReservations();
            } else {
                alert('Error making reservation. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // Fetch available stations and user reservations when the page loads
    updateAvailableStations();
    fetchUserReservations();

});
