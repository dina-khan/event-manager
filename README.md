# Event Manager App

> A full-stack event management web application with separate organiser and attendee interfaces, built with Node.js, Express, SQLite and EJS templating.

**Tech Stack:** Node.js · Express.js · SQLite · EJS · HTML · CSS · JavaScript

🎬 **[Video Demo](https://drive.google.com/file/d/1m425b-uHj_1EwIDiUG_DVbUU8Ez_HXH_/view?usp=sharing)** 

 📄 **[View Report](docs/report.pdf)**

---

## Features

**Organiser** - create, edit, publish, unpublish and delete events; view booking details per event via a dropdown menu; manage site name and description via a settings page

**Attendee** - browse published events sorted by date; book tickets (full price and concession) via a form with client-side validation

**Ticket System** - remaining ticket quantities tracked dynamically in the database; deducted on booking, reset on unpublish

**Persistent Data** - SQLite database with three tables (events, bookings, site settings); bookings cascade-delete when an event is deleted

---

## Project Structure

```
├── public/
│   ├── main.css          # Styling
│   └── script.js         # Client-side form validation
├── routes/
│   ├── attendee.js       # Attendee routes
│   └── organiser.js      # Organiser routes
├── views/
│   ├── home.ejs          # Main home page
│   ├── attendee/
│   │   ├── home.ejs      # Attendee home page
│   │   └── event.ejs     # Attendee event page
│   └── organiser/
│       ├── home.ejs      # Organiser home page
│       ├── editEvent.ejs # Organiser edit event page
│       └── settings.ejs  # Organiser site settings page
├── db_schema.sql         # Database schema
└── index.js              # Entry point
```

---

## How to Run

Requires Node.js.

```bash
npm install
npm run build-db        # Mac/Linux
npm run build-db-win    # Windows
npm run start
```

Then open `http://localhost:3000` in your browser.

---

## Architecture

Three-tier architecture - presentation tier (EJS templates), application tier (Express routes), data tier (SQLite). Full ER diagram and architecture diagram in the report.
