const express = require('express'); // Express framework
const mysql = require('mysql2'); // MySQL library
const path = require('path'); // Path module for working with file paths
const cors = require('cors'); //CORS (Cross-Origin Resource Sharing) allow server to accept requests from different origins (domains).

const app = express(); // Create an instance of the Express application

app.use(cors());
app.use(express.json()); // Add this line to parse JSON requests

// This middleware is used to serve static files (like HTML, CSS, JavaScript) from a directory named "public" in the project.
app.use(express.static(path.join(__dirname, 'public')));

// This sets up a route that responds to GET requests to "/dashboardHome". When a request is made to this URL, 
// it sends back the content of the file "dashboardHome.html" located in the same directory as this script.
app.get('/dashboardHome', (request, response) => {
  const isAdmin = sessionStorage.getItem('isAdmin');
  console.log(isAdmin);
  if (isAdmin === 'true') { // Check if user is admin
    console.log("Inside of isAdmin===true");
      response.redirect('/adminDashboard.html'); // Redirect to admin dashboard
  } else {
      response.sendFile(path.join(__dirname, 'dashboardHome.html'));
  }
});

app.get('/adminDashboard', (request, response) => {
  console.log('Admin Dashboard route accessed');
  response.sendFile(path.join(__dirname, 'adminDashboard.html'));
});


// Login page is the default
app.get('/', (request, response) => { //
  response.sendFile(path.join(__dirname, 'loginPage.html'));
});

const port = 3000; // Set the port number for the server

app.listen(port, () => {
  console.log(`Server is running!`);
});

const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '4314',
  database: 'mydb'
});

dbConnection.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to the database!');
  }
});

app.post('/login', (request, response) => {
  const username = request.body.username;
  const password = request.body.password;

  dbConnection.query(
    'SELECT * FROM players WHERE username = ? AND password = ?',
    [username, password],
    (error, results, fields) => {
      if (error) {
        console.error('Error querying database:', error);
        response.status(500).send('Internal Server Error');
        return;
      }

      if (results.length > 0) {
        console.log('Login successful!');
        if (username === 'admin') {
          response.json({ success: true, playerID: results[0].playerID, isAdmin: true });
        } else {
          response.json({ success: true, playerID: results[0].playerID, isAdmin: false });
        }
      } else {
        console.log('Invalid username or password.');
        response.json({ success: false });
      }
    }
  );
});

app.post('/createAccount', (request, response) => {
  const { name, email, phone, username, password } = request.body;

  dbConnection.query(
      'INSERT INTO players (name, email, phoneNumber, username, password) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, username, password],
      (error, results, fields) => {
          if (error) {
              console.error('Error inserting into database:', error);
              response.status(500).send('Internal Server Error');
              return;
          }

          console.log('Account created successfully!');
          response.redirect('/dashboardHome'); 
      }
  );
});

app.get('/getAvailableStations', (request, response) => {
  dbConnection.query(
    'SELECT * FROM gamingstations WHERE availability = 1',
    (error, results, fields) => {
      if (error) {
        console.error('Error querying database:', error);
        response.status(500).send('Internal Server Error');
        return;
      }

      response.json(results); // Send the list of available stations as JSON
    }
  );
});

app.get('/getUserReservations/:playerID', (request, response) => {
  const playerID = request.params.playerID;

  dbConnection.query(
      'SELECT * FROM reservations WHERE playerID = ?',
      [playerID],
      (error, results, fields) => {
          if (error) {
              console.error('Error querying database:', error);
              response.status(500).send('Internal Server Error');
              return;
          }

          response.json(results); // Send the list of user reservations as JSON
      }
  );
});

app.post('/reserveStation', (request, response) => {
  const playerName = request.body.name;
  const stationId = request.body.stationId;
  const reservationTime = request.body.reservationTime;
  const duration = request.body.duration;

  dbConnection.query(
      'INSERT INTO reservations (stationID, playerID, reservationTime, duration) VALUES (?, ?, ?, ?)',
      [stationId, playerName, reservationTime, duration],
      (error, results, fields) => {
          if (error) {
              console.error('Error inserting into database:', error);
              response.status(500).send('Internal Server Error');
              return;
          }

          // After successfully inserting the reservation, update the availability of the station
          dbConnection.query(
              'UPDATE gamingstations SET availability = 0 WHERE stationsID = ?',
              [stationId],
              (error, results, fields) => {
                  if (error) {
                      console.error('Error updating availability:', error);
                      response.status(500).send('Internal Server Error');
                      return;
                  }

                  console.log('Reservation successful!');
                  response.json({ success: true });
              }
          );
      }
  );
});

app.post('/updateAvailability', (request, response) => {
  const stationId = request.body.stationId;
  const availability = request.body.availability;

  dbConnection.query(
      'UPDATE gamingstations SET availability = ? WHERE stationsID = ?',
      [availability, stationId],
      (error, results, fields) => {
          if (error) {
              console.error('Error updating availability:', error);
              response.status(500).send('Internal Server Error');
              return;
          }

          console.log('Availability updated successfully!');
          response.json({ success: true });
      }
  );
});

app.post('/cancelReservation', (request, response) => {
  const reservationID = request.body.reservationID;

  dbConnection.query(
      'DELETE FROM reservations WHERE reservationID = ?',
      [reservationID],
      (error, results, fields) => {
          if (error) {
              console.error('Error deleting reservation:', error);
              response.status(500).send('Internal Server Error');
              return;
          }

          // Update availability after cancellation
          const stationID = request.body.stationID; // Assuming you have stationID in your request

          dbConnection.query(
              'UPDATE gamingstations SET availability = 1 WHERE stationsID = ?',
              [stationID],
              (error, results, fields) => {
                  if (error) {
                      console.error('Error updating availability:', error);
                      response.status(500).send('Internal Server Error');
                      return;
                  }

                  console.log('Reservation cancelled successfully and station made available!');
                  response.json({ success: true });
              }
          );
      }
  );
});

