const config = require('./config.js');
const express = require('express'); // Express framework
const session = require('express-session'); // Express Session
const mysql = require('mysql2'); // MySQL library
const path = require('path'); // Path module for working with file paths
const cors = require('cors'); //CORS (Cross-Origin Resource Sharing) allow server to accept requests from different origins (domains).

const app = express(); // Create an instance of the Express application
const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds 

app.use(cors());
app.use(express.json()); // Add this line to parse JSON requests

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true
}));

// This middleware is used to serve static files (like HTML, CSS, JavaScript) from a directory named "public" in the project.
app.use(express.static(path.join(__dirname, 'public')));

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

// Login page is the default
app.get('/', (request, response) => { //
  response.sendFile(path.join(__dirname, 'loginPage.html'));
});

const port = 3000; // Set the port number for the server

const debugging = true;

app.listen(port, () => {
  console.log(`Server is running!`); });

const dbConnection = mysql.createConnection(config.dbConfig);

dbConnection.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to the database!');
  }
});

const handleDatabaseError = (error, response) => {
  console.error('Error querying database:', error);
  response.status(500).send('Internal Server Error');
};

app.post('/login', (request, response) => {
  const username = request.body.username;
  const password = request.body.password;

  if (!username || !password) {
    response.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  dbConnection.query(
    'SELECT * FROM players WHERE username = ?',
    [username],
    (error, results, fields) => {
      if (error) {
        console.error('Error querying database:', error);
        response.status(500).send('Internal Server Error');
        return;
      }

      if (results.length > 0) {
        const hashedPassword = results[0].password;

        bcrypt.compare(password, hashedPassword, (err, result) => {
          if (err) {
            console.error('Error comparing passwords:', err);
            response.status(500).send('Internal Server Error');
            return;
          }

          if (result) {
            console.log('Login successful!');
            request.session.playerID = results[0].playerID;
            if (username === 'admin') {
              response.json({ success: true, playerID: results[0].playerID, isAdmin: true });
            } else {
              response.json({ success: true, playerID: results[0].playerID, isAdmin: false });
            }
          } else {
            console.log('Invalid username or password.');
            response.json({ success: false });
          }
        });
      } else {
        console.log('Invalid username or password.');
        response.json({ success: false });
      }
    }
  );
});

app.post('/createAccount', (request, response) => {
  const { name, email, phoneNumber, username, password } = request.body;

  if (!name || !email || !phoneNumber || !username || !password) {
    response.status(400).json({ error: 'All fields are required.' });
    return;
  }

  // Check if the username already exists
  dbConnection.query(
    'SELECT * FROM players WHERE username = ?',
    [username],
    (error, results, fields) => {
      if (error) {
        handleDatabaseError(error, response);
        return;
      }

      if (results.length > 0) {
        response.json({ success: false, error: 'Username already exists.' });
      } else {
        bcrypt.hash(password, saltRounds, (err, hash) => { 
          if (err) {
            handleDatabaseError(err, response);
            return;
          }

          dbConnection.query(
            'INSERT INTO players (name, email, phoneNumber, username, password) VALUES (?, ?, ?, ?, ?)',
            [name, email, phoneNumber, username, hash],
            (error, results, fields) => {
              if (error) {
                handleDatabaseError(error, response);
                return;
              }

              console.log('Account created successfully!');
              response.json({ success: true });
            }
          );
        });
      }
    }
  );
});

app.post('/forgotUsernameOrPassword', (request, response) => {
  const { email, phoneNumber } = request.body;

  if (!email || !phoneNumber) {
    response.status(400).json({ error: 'Email and phone number are required.' });
    return;
  }

  dbConnection.query(
    'SELECT * FROM players WHERE email = ? AND phoneNumber = ?',
    [email, phoneNumber],
    (error, results, fields) => {
      if (error) {
        handleDatabaseError(error, response);
        return;
      }

      if (results.length > 0) {
        const username = results[0].username;
        response.json({ success: true, username });
      } else {
        response.json({ success: false, message: 'User not found.' });
      }
    }
  );
});

app.post('/changePassword', (request, response) => {
  const { username, newPassword } = request.body;

  if (!username || !newPassword) {
    response.status(400).json({ error: 'Username and new password are required.' });
    return;
  }

  bcrypt.hash(newPassword, saltRounds, (err, hash) => {
    if (err) {
      handleDatabaseError(err, response);
      return;
    }

    dbConnection.query(
      'UPDATE players SET password = ? WHERE username = ?',
      [hash, username],
      (error, results, fields) => {
        if (error) {
          handleDatabaseError(error, response);
          return;
        }

        response.json({ success: true, message: 'Password updated successfully.' });
      }
    );
  });
});

app.get('/getUserReservations/:playerID', (request, response) => {
  const playerID = request.params.playerID;

  dbConnection.query(
    'SELECT reservationID, reservationDate, stationID, startTime, endTime FROM reservations WHERE playerID = ?',
    [playerID],
    (error, results, fields) => {
      if (error) {
        handleDatabaseError(error, response);
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

app.post('/cancelReservation', (request, response) => {
  const reservationID = request.body.reservationID;

  if (!reservationID) {
    response.status(400).json({ error: 'Reservation ID is required.' });
    return;
  }

  dbConnection.query(
      'DELETE FROM reservations WHERE reservationID = ?',
      [reservationID],
      (error, results, fields) => {
        if (error) {
          handleDatabaseError(error, response);
          return;
        }

        console.log('Reservation cancelled successfully!');
        response.json({ success: true });
      }
  );
});

app.post('/checkAndReserve', async (request, response) => {
  const date = request.body.date;
  const startTime = request.body.startTime;
  const endTime = request.body.endTime;
  const platform = request.body.platform;
  const playerID = request.body.playerID;

  if (debugging) {
    console.log(`Debugging: Received data from client:`, { date, startTime, endTime, platform });
  }

  if (!date || !startTime || !endTime || !platform || !playerID) {
    response.status(400).json({ error: 'All fields are required.' });
    return;
  }

  dbConnection.query(
    'SELECT stationID FROM gamingstations WHERE platform = ? AND stationID NOT IN (SELECT stationID FROM reservations WHERE reservationDate = ? AND NOT (endTime <= ? OR startTime >= ?)) LIMIT 1',
    [platform, date, startTime, endTime],
    async (error, results, fields) => {
      if (error) {
        handleDatabaseError(error, response);
        return;
      }

      if (results.length > 0) {
        const stationID = results[0].stationID;

        if (!stationID || !date || !startTime || !endTime || !playerID) {
          console.error('Invalid reservation data');
          response.status(400).send('Bad Request');
          return;
        }

        dbConnection.query(
          'INSERT INTO reservations (stationID, playerID, reservationDate, startTime, endTime) VALUES (?, ?, ?, ?, ?)',
          [stationID, playerID, date, startTime, endTime],
          (error, results, fields) => {
            if (error) {
              handleDatabaseError(error, response);
              return;
            }

            console.log('Reservation successful!');
            response.json({ success: true });
          }
      );
      } else {
        console.log(`No available ${platform} stations for the selected date and time.`);
        response.json({ success: false });
      }
    }
  );
});

app.get('/searchUser', (request, response) => {
  const searchUserName = request.query.userName;

  if (!searchUserName) {
    response.status(400).json({ error: 'User name is required for search.' });
    return;
  }

  dbConnection.query(
    'SELECT *, playerID FROM players WHERE userName = ?',
    [searchUserName],
    (error, results) => {
      if (error) {
        handleDatabaseError(error, response);
        return;
      }

      if (results.length > 0) {
        // User found, send back the user's information
        const user = results[0];
        response.json({ 
          userFound: true, 
          userName: user.userName, 
          name: user.name, 
          email: user.email, 
          phoneNumber: user.phoneNumber,
          reservations: user.reservations,
          playerID: user.playerID
        });
      } else {
        // User not found
        response.json({ userFound: false });
      }
    }
  );
});