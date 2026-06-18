/**Routes used in attendee home page and attendee event page*/

const express = require('express');
const router = express.Router();


// Route for GET requests to the attendee home page.
// It retrieves published event information and site settings information.
// It passes the information to a template to render the attendee home page
router.get('/', (req, res, next) => {

    // query for selecting all published events information from the table 'events'
    const publishedEventsQuery = 'SELECT * FROM events WHERE event_published != 0';

    // query for selecting all information from the table 'site_settings'
    const siteSettingsQuery = 'SELECT * FROM site_settings';

    // executing the query to retrieve published events data
    global.db.all(publishedEventsQuery, (err, events) => {
        if (err) return next(err);

        // executing the query to retrieve site settings data
        global.db.get(siteSettingsQuery, (err, siteSettings) => {
            if (err) return next(err);

            // rendering the attendee home page by passing
            // published events data and site settings
            // to the attendee home page template
            res.render('attendee/home', {events, siteSettings});
        });
    });
});

// Route for GET requests to the attendee event page. 
// It retrieves event information according to the request id parameter.
// It passes the event information to a template to render the attendee event page.
// If there is no event corresponding to the request parameter id, 
// it redirects to the attendee home page.
router.get('/event/:id', (req, res, next) => {

    // query for selecting all information about the event from the events table
    const query = 'SELECT * FROM events WHERE event_id = ?';

    // executing the query to retrieve all information about the event
    // which has the same id as the request parameter id
    global.db.get(query, [req.params.id], (err, event) => {
        if (err) return next(err);

        // if there is an event corresponding to the request parameter id
        if (event)
        {
            // rendering the attendee event page by passing the
            // event information to the a template
            res.render('attendee/event', {event});
        }
        // if no event was found
        else
        {
            //redirecting to the attendee home page
            res.redirect('/attendee')
        }
    });
});

// Route for POST requests for the attendee booking form submission on the 
// attendee event page (corresponding to the request parameter id). 
// It updates remaining ticket quantities,
// stores booking information and redirects to the attendee home page.
router.post('/event/:id', (req, res, next) => {

    // Query for updating the remaining ticket quantities in the 'events' table 
    // for the event which has the same id as the request parameter id.
    // It deducts the number of booked full-price/concession tickets from the number of 
    // remaining full-price/concession tickets
    const remainingTicketsQuery = `
        UPDATE events
        SET 
        event_full_tickets_quantity = event_full_tickets_quantity - ?,
        event_concession_tickets_quantity = event_concession_tickets_quantity - ?
        WHERE 
        event_id = ?
    `;

    // Parameters for the query above
    const ticketParameters = [
        //number of booked full price tickets
        req.body.full_tickets_quantity, 
        //number of booked concession price tickets
        req.body.concession_tickets_quantity,
        //request parameter id (matching event)
        req.params.id
    ];

    // Query for inserting booking information into the bookings table 
    const insertBookingQuery = `
        INSERT INTO bookings 
        (event_id,
        booking_name, 
        booking_email, 
        booking_full_tickets, 
        booking_concession_tickets) 
        VALUES (?, ?, ?, ?, ?)
    `;

    // Parameters for the query above
    const bookingParameters = [
        //request parameter id (matching event)
        req.params.id, 
        //attendee name
        req.body.name, 
        //attendee email
        req.body.email, 
        //number of booked full price tickets
        req.body.full_tickets_quantity,
        //number of booked concession price tickets
        req.body.concession_tickets_quantity
    ];

    // executing the query to update the remaining number of tickets
    global.db.run(remainingTicketsQuery, ticketParameters,(err) => {
        if (err) return next(err);    

        // executing the query to insert the booking information
        global.db.run(insertBookingQuery,bookingParameters,(err) => {
            if (err) return next(err);

            // redirecting to the attendee home page
            res.redirect('/attendee')
        });
    });
});


module.exports = router;


