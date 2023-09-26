# **Project Title:** Game Lounge Reservation System

### **Overview**

- **Objective:** Create a system where players can reserve gaming stations at a local game lounge.
- **Components:** Gaming Stations, Players, Reservation System.

### **Database (mySQL) = DONE**

- **Tables:**
    - **Players:** Contains player information (Player ID, Name, Email, Username, Password).
    - **Gaming Stations:** Contains information about gaming stations (Station ID, Type, Availability).
    - **Reservations:** Links players with gaming stations(Reservation ID, Station ID, Player ID, Reservation Time, Duration).

### **Frontend (HTML, React, TypeScript)**

- **Player Interface:**
    - **Login/Signup Page:** Allows players to create an account or log in.
    - **Dashboard:** Displays available gaming stations and allows players to make reservations.
    - **Profile Page:** Allows players to view and manage their reservations.

### **Backend (Node, TypeScript)**

- **API Endpoints:**
    - **Authentication:** Handles player login and signup. DONE
    - **Fetch Gaming Stations:** Retrieves information about available gaming stations.
    - **Create Reservation:** Allows players to reserve a gaming station.
    - **Manage Reservations:** Allows players to view, modify, or cancel reservations.

### **Example User Flow**

1. **Player logs in** or signs up through the frontend interface.
2. **Player views available gaming stations** and selects one to reserve.
3. **Reservation request is sent** to the backend, which checks availability in the mySQL database.
4. **Reservation is confirmed,** and the player receives a confirmation message.
5. **Player can view and manage reservations** through their profile page.