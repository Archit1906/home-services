# HomeConnect Local Run Guide

Follow these steps to set up and run the HomeConnect application on your local machine.

---

## 🛠️ Step-by-Step Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **MySQL Database Server** (running locally on port 3306)

---

### 2. Install Project Dependencies
Install all dependencies for the workspace, client, and server packages by executing the following command from the root folder:
```bash
npm run install:all
```

---

### 3. Setup and Seed the Database
1. Make sure your local MySQL instance is running.
2. In your MySQL shell or query client, create the database:
   ```sql
   CREATE DATABASE homeconnect;
   ```
3. Check `.env` in the root folder to confirm your database password is correct (e.g., `DB_PASS=051906`).
4. Seed the database with Indian mock names, cities, reviews, and coordinates:
   ```bash
   npm run seed
   ```

---

### 4. Start the Application
Start the frontend and backend servers concurrently:
```bash
npm run dev
```
- **Vite Frontend Client**: [http://localhost:5173](http://localhost:5173) (Open this link in your browser)
- **Express Backend Server**: [http://localhost:5000](http://localhost:5000)

*(Vite handles proxying automatically; any requests to `/api` or `/socket.io` are redirected to the backend server).*

---

## 🔑 Mock User Logins
All mock accounts are configured with the default password: **`password123`**.

| Account Type | Email Address | Password | Usage Context |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@homeconnect.com` | `password123` | Moderate worker approvals and duplicate profile flags |
| **Homeowners** | `homeowner1@example.com` to `homeowner8@example.com` | `password123` | Post jobs, inspect AI compatibility score match recommendations, hire |
| **Service Pros** | `worker1@example.com` to `worker20@example.com` | `password123` | Browse jobs feed, update calendar availability, view Kanban tracker |
