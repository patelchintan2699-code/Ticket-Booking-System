
  # Ticket Booking System

  This is a code bundle for Ticket Booking System. The original project is available at https://www.figma.com/design/gJQCo1GYhwiPk7E1ko5ddZ/Ticket-Booking-System.

  ## Running the code

  Run `npm i` to install the dependencies.

  Start the backend server: `npm run server` (or `npm start`).

  Seed the database with sample events, users and contacts: `npm run seed`.

  Run `npm run dev` to start the frontend development server.

  Login (seeded users):
  - alice@example.com / password123  (user)
  - bob@example.com / password123    (user)
  - admin@example.com / adminpass    (admin)

  The API now supports JWT login at `POST /api/login` which returns `{ user, token }` and `GET /api/me` to fetch the authenticated profile (send `Authorization: Bearer <token>`).
  