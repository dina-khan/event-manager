PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

--Storing bookings information
CREATE TABLE  IF NOT EXISTS bookings (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,--primary key

    booking_name TEXT, --attendee name
    booking_email TEXT, --attendee email

    booking_full_tickets INTEGER, --number of full price tickets booked
    booking_concession_tickets INTEGER, --number of concession price tickets booked

    event_id INTEGER, --booked event id

    --referencing the event id from the events table and setting it as a foreign key
    --if an event is deleted from the events table, the corresponding 
    --entries in the bookings table are also deleted through 'ON DELETE CASCADE'
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

--Storing events information
CREATE TABLE IF NOT EXISTS events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,--primary key

    event_title TEXT,--event title
    event_description TEXT,--event description
    event_date TEXT,--event date

    event_created TEXT,--event creation timestamp
    event_last_modified TEXT,--event last modified timestamp
    event_published TEXT,--event publication timestamp

    event_full_tickets_quantity INTEGER,--number of full price tickets remaining
    event_full_tickets_start_quantity INTEGER,--original number of full price tickets
    event_full_tickets_price REAL,--price of full price tickets

    event_concession_tickets_quantity INTEGER,--number of concession price tickets remaining
    event_concession_tickets_start_quantity INTEGER,--original number of concession price tickets
    event_concession_tickets_price REAL--price of concession price tickets
);

--Storing site settings
CREATE TABLE IF NOT EXISTS site_settings (
    site_settings_name TEXT , --site name
    site_settings_description TEXT --site description
);

--Setting a default site name and site description at the beginning
INSERT INTO site_settings (site_settings_name, site_settings_description) 
VALUES ('Site Name', 'Site Description');

COMMIT;
