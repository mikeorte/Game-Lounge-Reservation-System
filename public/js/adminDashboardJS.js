document.addEventListener('DOMContentLoaded', function() {
    
    // User info variables
    var searchUserButton = document.getElementById('searchUserButton');
    var searchUserNameInput = document.getElementById('searchUserName');
    var userInfoSection = document.getElementById('userInfoSection');
    var userMakeReservation = document.getElementById('reservationFormSection');
    var showName = document.getElementById('showName');
    var showEmail = document.getElementById('showEmail');
    var showPhoneNumber = document.getElementById('showPhoneNumber');
    let debugging = true; 

    // Reservation variables
    var startTimeSelect = document.getElementById('startTime');
    var endTimeSelect = document.getElementById('endTime');
    var checkAndReserveButton = document.getElementById('checkAndReserveButton');
    var reservationDateInput = document.getElementById('reservationDate');

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

    function cancelReservation(reservationID, stationID) {
        const confirmCancel = confirm("Are you sure you want to cancel this reservation?");

        if (confirmCancel) {
            // Send a request to cancel the reservation
            fetch('/cancelReservation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reservationID: reservationID, stationID: stationID }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Reservation cancelled successfully!');
                    // Refresh the list of user reservations after cancellation
                    fetchAndPopulateUserReservations(sessionStorage.getItem('playerID'));
                } else {
                    alert('Error cancelling reservation. Please try again.');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }

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
    
    function fetchUserInfo(userName) {
        document.getElementById('userNotFoundMessage').style.display = 'none';
        
    
        // Fetch user info and playerID
        fetch(`/searchUser?userName=${userName}`)
            .then(response => response.json())
            .then(data => {
                console.log('Debugging: User data received:', data); // Debug log
    
                if (data.userFound) {
                    showName.textContent = data.name;
                    showEmail.textContent = data.email;
                    showPhoneNumber.textContent = data.phoneNumber;
    
                    // Display user info section
                    userInfoSection.style.display = 'block';
                    userMakeReservation.style.display = 'block';
    
                    // Store playerID in sessionStorage
                    sessionStorage.setItem('playerID', data.playerID);
                    console.log(`Debugging: PlayerID stored in sessionStorage: ${data.playerID}`); // Debug log
    
                    // Fetch user reservations using playerID
                    fetchAndPopulateUserReservations(data.playerID);
                } else {
                    // User not found
                    userInfoSection.style.display = 'none'; // Hide user info section
                    userMakeReservation.style.display = 'none';
    
                    // Show the error message
                    document.getElementById('userNotFoundMessage').style.display = 'block';
                }
            })
            .catch(error => console.error('Error:', error));
    }

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
        const playerID = sessionStorage.getItem('playerID');
        console.log(`Debugging: PlayerID retrieved from sessionStorage: ${playerID}`); // Debug log
    
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

});
