document.addEventListener('DOMContentLoaded', function() {

    // Elements
    const startTimeSelect = document.getElementById('startTime');
    const endTimeSelect = document.getElementById('endTime');
    const checkAndReserveButton = document.getElementById('checkAndReserveButton');
    const reservationDateInput = document.getElementById('reservationDate');  
    const playerID = sessionStorage.getItem('playerID');
    const debugging = false; // Temporary debugging variable

    // Fetch reservations for the currently logged-in user when the page loads
    if (playerID) {
        fetchAndPopulateUserReservations(playerID);
    }

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

    // Combined function to fetch user's reservations from the server and populate them on the page
    async function fetchAndPopulateUserReservations(playerID) {
        if (!playerID) {
            console.error('No player ID found.');
            return;
        }
    
        if (debugging) {
            console.log("Fetching user reservations for player ID:", playerID);
        }
        
        try {
            const response = await fetch(`/getUserReservations/${playerID}`);
            if (!response.ok) {
                throw new Error('Error fetching user reservations');
            }
            const data = await response.json();
    
            const userReservationsList = document.getElementById('userReservations');
            userReservationsList.innerHTML = ''; // Clear the list before adding updated reservations
    
            data.forEach(reservation => {
                const reservationItem = document.createElement('li');
                reservationItem.textContent = `Date: ${new Date(reservation.reservationDate).toLocaleDateString()} | Station: ${reservation.stationID} | Start Time: ${reservation.startTime} | End Time: ${reservation.endTime}`;
    
                // Add a cancel button
                const cancelButton = document.createElement('button');
                cancelButton.classList.add('cancelButton');
                cancelButton.textContent = 'Cancel Reservation';
                cancelButton.addEventListener('click', function() {
                    cancelReservation(reservation.reservationID, reservation.stationID);
                });
    
                reservationItem.appendChild(cancelButton);
                userReservationsList.appendChild(reservationItem);
            });
    
        } catch (error) {
            console.error('Error fetching user reservations:', error);
        }
    }

    // Cancels Reservation (Button is generated when getting reservations)
    function cancelReservation(reservationID, stationID) {
        const confirmCancel = confirm("Are you sure you want to cancel this reservation?");
        
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
                    fetchAndPopulateUserReservations(playerID);
                } else {
                    alert('Error cancelling reservation. Please try again.');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }

    // Check and reservation button to make reservations
    checkAndReserveButton.addEventListener('click', async function() {
        const date = reservationDateInput.value;
        const startTime = startTimeSelect.value;
        const endTime = endTimeSelect.value;
        const platform = document.querySelector('input[name="platform"]:checked');
    
        if (!date || !startTime || !endTime || !platform) {
            alert('Please fill out all fields and select a platform.');
            return;
        }
    
        const platformValue = platform.value;
    
        try {
            const { success } = await checkAndReserve(date, startTime, endTime, platformValue, playerID);
    
            if (success) {
                alert(`${platformValue} Station reserved successfully!`);
                fetchAndPopulateUserReservations(playerID);
            } else {
                alert(`Error reserving ${platformValue} Station. Please try again.`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Function to check availability and reserve a station
    async function checkAndReserve(date, startTime, endTime, platform, playerID) {
        if (endTime <= startTime) {
            alert('End time must be after start time. Please adjust your selection.');
            return { success: false };
        }
        try {
            const requestData = { date, startTime, endTime, platform, playerID };
            if (debugging) {
                console.log(`Debugging: Request data sent to server:`, requestData);
            }
    
            const response = await fetch('/checkAndReserve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
    
            if (!response.ok) {
                throw new Error('Error reserving station');
            }
    
            const data = await response.json();
    
            if (debugging) {
                console.log(`Debugging: Server response:`, data);
            }
    
            return { success: data.success };
        } catch (error) {
            console.error('Error:', error);
            return { success: false };
        }
    }
});