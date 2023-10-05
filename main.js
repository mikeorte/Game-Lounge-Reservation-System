const express = require('express'); // Express framework
const session = require('express-session'); // Express Session
const mysql = require('mysql2'); // MySQL library
const path = require('path'); // Path module for working with file paths
const cors = require('cors'); //CORS (Cross-Origin Resource Sharing) allow server to accept requests from different origins (domains).

const app = express(); // Create an instance of the Express application

app.use(cors());
app.use(express.json()); // Add this line to parse JSON requests

app.use(session({
  secret: 'secretSession', // This should be a long random string, used to sign the session ID cookie
  resave: false,
  saveUninitialized: true
}));

// This middleware is used to serve static files (like HTML, CSS, JavaScript) from a directory named "public" in the project.
app.use(express.static(path.join(__dirname, 'public')));

// This sets up a route that responds to GET requests to "/dashboardHome". When a request is made to this URL, 
// it sends back the content of the file "dashboardHome.html" located in the same directory as this script.
app.get('/dashboardHome', (request, response) => {
  const isAdmin = request.query.isAdmin;
  
  if (isAdmin === 'true') {
      response.sendFile(path.join(__dirname, 'adminDashboard.html'));
  } else {
      response.sendFile(path.join(__dirname, 'dashboardHome.html'));
  }
});

app.get('/adminDashboard', (request, response) => {
  response.sendFile(path.join(__dirname, 'adminDashboard.html'));
});

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'loginPage.html'));
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
        request.session.playerID = results[0].playerID; // Store playerID in session
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

app.get('/getFirstAvailableStation/:platform', (request, response) => {
  const platform = request.params.platform;

  dbConnection.query(
      'SELECT * FROM gamingstations WHERE platform = ? ORDER BY stationID LIMIT 1',
      [platform],
      (error, results, fields) => {
          if (error) {
              console.error('Error querying database:', error);
              response.status(500).send('Internal Server Error');
              return;
          }

          const firstAvailableStation = results[0];
          if (firstAvailableStation) {
              response.json({ stationID: firstAvailableStation.stationID });
          } else {
              response.json({ stationID: null });
          }
      }
  );
});

app.get('/getUserReservations/:playerID', (request, response) => {
  const playerID = request.params.playerID;

  dbConnection.query(
    'SELECT reservationID, reservationDate, stationID, startTime, endTime FROM reservations WHERE playerID = ?',
    [playerID],
    (error, results, fields) => {
      if (error) {
        console.error('Error querying database:', error);
        response.status(500).send('Internal Server Error');
        return;
      }

      const reservations = results.map(result => {
        return {
          reservationID: result.reservationID,
          reservationDate: result.reservationDate,
          stationID: result.stationID,
          startTime: result.startTime,
          endTime: result.endTime
        };
      });

      response.json(reservations);
    }
  );
});

app.post('/reserveStation', (request, response) => {
  const playerID = request.session.playerID; // Retrieve playerID from session
  const stationId = request.body.stationId;
  const reservationDate = request.body.reservationDate;
  const startTime = request.body.reservationStartTime;
  const endTime = request.body.reservationEndTime; // Assuming endTime is provided

  dbConnection.query(
    'INSERT INTO reservations (stationID, playerID, reservationDate, startTime, endTime) VALUES (?, ?, ?, ?, ?)',
    [stationId, playerID, reservationDate, startTime, endTime],
    (error, results, fields) => {
      if (error) {
        console.error('Error inserting into database:', error);
        response.status(500).send('Internal Server Error');
      } else {
        response.json({ success: true });
      }
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

          console.log('Reservation cancelled successfully!');
          response.json({ success: true });
      }
  );
});

app.get('/getAllUserReservations', (request, response) => {
  dbConnection.query(
    'SELECT * FROM reservations',
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

app.post('/reserveStationForUser', (request, response) => {
  const playerID = request.body.playerID; // Retrieve playerID from session
  const stationId = request.body.stationId;
  const reservationDate = request.body.reservationDate;
  const startTime = request.body.reservationStartTime;
  const endTime = request.body.reservationEndTime; // Assuming endTime is provided

  dbConnection.query(
    'INSERT INTO reservations (stationID, playerID, reservationDate, startTime, endTime) VALUES (?, ?, ?, ?, ?)',
    [stationId, playerID, reservationDate, startTime, endTime],
    (error, results, fields) => {
      if (error) {
        console.error('Error inserting into database:', error);
        response.status(500).send('Internal Server Error');
        return;
      }

      // After successfully inserting the reservation, update the availability of the station
      dbConnection.query(
        'UPDATE gamingstations SET availability = 0 WHERE stationID = ?',
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

app.get('/checkReservations', (req, res) => {
  const selectedDate = req.query.date;
  const selectedStartTime = req.query.startTime;
  const selectedEndTime = req.query.endTime;

  // Convert the selected times to Date objects for comparison
  const startDateTime = new Date(`${selectedDate}T${selectedStartTime}`);
  const endDateTime = new Date(`${selectedDate}T${selectedEndTime}`);

  // Query the database to check for conflicting reservations
  dbConnection.query(
      'SELECT * FROM reservations WHERE reservationDate = ? AND ? < endTime AND ? > startTime',
      [selectedDate, endDateTime, startDateTime],
      (error, results, fields) => {
          if (error) {
              console.error('Error querying database:', error);
              res.status(500).send('Internal Server Error');
              return;
          }

          // If there are any results, it means there are conflicting reservations
          const reservationAvailable = results.length === 0;

          res.json({ available: reservationAvailable });
      }
  );
});

app.get('/searchUser', (req, res) => {
  const searchUserName = req.query.userName;

  dbConnection.query(
    'SELECT * FROM players WHERE userName = ?',
    [searchUserName],
    (error, results) => {
      if (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      if (results.length > 0) {
        // User found, send back the user's information
        const user = results[0];
        res.json({ 
          userFound: true, 
          userName: user.userName, 
          name: user.name, 
          email: user.email, 
          phoneNumber: user.phoneNumber,
          reservations: user.reservations 
        });
      } else {
        // User not found
        res.json({ userFound: false });
      }
    }
  );
});

