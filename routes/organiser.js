/**Routes used in organiser home page, organiser edit event page 
 * and organiser site settings page */

const express = require('express');
const router = express.Router();


// Route for GET requests to the organiser home page.
// It retrieves published and draft events information seperately.
// It also stores booking information for each published event.
// It passes the information to a template to render the organiser home page.
router.get('/', (req, res, next) => {

    // query for selecting all information from the table 'site_settings'
    const siteSettingsQuery = 'SELECT * FROM site_settings';

    // query for selecting all published events information from the table 'events'
    const publishedEventsQuery = 'SELECT * FROM events WHERE event_published != 0';

    // query for selecting all draft events information from the table 'events'
    const draftEventsQuery = 'SELECT * FROM events WHERE event_published = 0';

    // executing the query to retrieve site settings data
    global.db.get(siteSettingsQuery, (err, siteSettings) => {
        if (err) return next(err);

        // executing the query to retrieve published events information
        global.db.all(publishedEventsQuery, (err, publishedEvents) => {
            if (err) return next(err);

            // executing the query to retrieve draft events information
            global.db.all(draftEventsQuery, (err, draftEvents) => {
                if (err) return next(err);

                // Storing booking information for each published event
                Promise.all(publishedEvents.map(publishedEvent => {
                    return new Promise((resolve, reject) => {

                        // query for selecting all booking information for the event
                        // according to the published event id
                        const bookingsQuery = `SELECT * FROM bookings WHERE event_id = ?;`;

                        // executing the query to retrieve booking information
                        global.db.all(bookingsQuery, [publishedEvent.event_id], (err, bookings) => {
                            if (err) return reject(err);

                            // storing booking information
                            publishedEvent.bookings = bookings;
                            resolve();
                        });

                    });
                }))
                // after storing booking information for all published events
                .then(() => {
                    // rendering the organiser home page by passing
                    // site settings, published events data and draft events data
                    // to the organiser home page template
                    res.render('organiser/home', {siteSettings, publishedEvents, draftEvents});
                })
            });
        });
    });
});

// Route for GET requests to the organiser edit event page. 
// It retrieves event information according to the request id parameter,
// and passes it to a template to render the organiser edit event page.
// If there is no event corresponding to the request parameter id, 
// it redirects to the organiser home page.
router.get('/edit/:id', (req, res, next) => {

    // query for selecting all information about the event with id
    // matching request parameter id
    const query = `SELECT * FROM events WHERE event_id = ?`;

    // executing the query to get all information about the event
    global.db.get(query, [req.params.id], (err, event) => {
        if (err) return next(err);

        // if there is an event corresponding to the request parameter id
        if (event)
        {
            // rendering the organiser edit event page by passing the
            // event information to the organiser edit event page template
            res.render('organiser/editEvent', {event});
        }
        // if no event was found
        else
        {
            //redirecting to the organiser home page
            res.redirect('/organiser')
        }
    });
});

// Route for POST requests for the organiser edit event form submission on the 
// organiser edit event page (event corresponding to the request parameter id) 
// It updates the event information and redirects to the organiser home page.
router.post('/edit/:id', (req, res, next) => {

    // This query updates information in the events table for 
    // the event which has the same id as the request parameter id.
    // It sets the event title, description and date to the input values.
    // It sets the total number of each type of ticket (full price and concession)  
    // accordng to the form input. It sets the remaining number of each ticket 
    // to the original number initially. 
    // It sets the last modified time to the current UTC timestamp 'CURRENT_TIMESTAMP'
    const eventInformationQuery = `
        UPDATE events SET
        event_title = ?, 
        event_description = ?, 
        event_date = ?, 
        event_full_tickets_quantity = ?, 
        event_full_tickets_start_quantity = ?, 
        event_full_tickets_price = ?, 
        event_concession_tickets_quantity = ?, 
        event_concession_tickets_start_quantity = ?, 
        event_concession_tickets_price = ?,
        event_last_modified = CURRENT_TIMESTAMP 
        WHERE event_id = ?`;

    // Parameters for the query above
    const eventInformation = [
        //event title
        req.body.title,
        //event description
        req.body.description,
        //event date
        req.body.date,

        //number of remaining full price tickets
        req.body.event_full_tickets_quantity,
        //total number of full price tickets
        //(initially same as remaining full price tickets)
        req.body.event_full_tickets_quantity,
        //price of full price tickets
        req.body.event_full_tickets_price,

        //number of remaining concession tickets
        req.body.event_concession_tickets_quantity,
        //total number of concession tickets
        //(initially same as remaining concession tickets)
        req.body.event_concession_tickets_quantity,
        //price of concession tickets
        req.body.event_concession_tickets_price,

        //request parameter id (matching event)
        req.params.id
    ];

    // executing the query to update the event information
    global.db.run(eventInformationQuery, eventInformation, err => {
        if (err) return next(err);

        // redirecting to the organiser home page
        res.redirect('/organiser');
    });
});

// Route for GET requests when the create new event link
// on the organiser home page is pressed. 
// It creates a new entry in the events table,
// and inserts values into the timestamp fields
// (published, created, last modified)
// It gets the id of the new event and redirects 
// to its edit page, which contains a form to fill out other event fields.
router.get('/create', (req, res, next) => {

    // This query creates a new event in the 'events' table.
    // It sets the published field to 0, to indicate that
    // the event has not been published. It sets the created and last
    // modified fields to the current UTC timestamp CURRENT_TIMESTAMP.
    // It returns the id of the new event, which will be used to redirect
    // to the new event's edit page
    const createEventQuery = `
        INSERT INTO events 
        (event_published, 
        event_created,
        event_last_modified) 
        VALUES 
        (0, 
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP) 
        RETURNING 
        event_id`;

    // executing the query to create a new event, insert
    // timestamp information and retrieve the new event's id
    global.db.get(createEventQuery, (err,event) => {
        if (err) return next(err);

        // redirecting to the edit page for the new event based on its id
        res.redirect(`/organiser/edit/${event.event_id}`);
    });
});

// Route for POST requests when an event delete button is pressed.
// It deletes the event corresponding to the request parameter id.
// Then, it redirects to the organiser home page.
router.post('/delete/:id', (req, res, next) => {

    // Query for deleting the event in the 'events' table 
    // which has the same id as the request parameter id.
    const query = 'DELETE FROM events WHERE event_id = ?';

    global.db.run(query, req.params.id, function (err) {
        if (err) return next(err);

        // redirecting to the organiser home page
        res.redirect('/organiser');
    });
});

// Route for POST requests when an event publish button is pressed 
// (event corresponding to the request parameter id)
// It updates the event's published timestamp from 0 to 
// the current UTC timestamp, indicating that the event is published.
// Then, it redirects to the organiser home page.
router.post('/publish/:id', (req, res, next) => {

    // Query for updating the event published timestamp in the 'events' table 
    // for the event which has the same id as the request parameter id.
    // It sets the published timestamp to the current UTC timestamp CURRENT_TIMESTAMP
    const query = "UPDATE events SET event_published = CURRENT_TIMESTAMP WHERE event_id = ?";

    // executing the query to set the published timestamp
    global.db.run(query, req.params.id, function (err) {
        if (err) return next(err);

        // redirecting to the organiser home page
        res.redirect('/organiser');
    });
});

// Route for POST requests when an event unpublish button is pressed 
// (event corresponding to the request parameter id)
// It updates the event's published timestamp to 0 
// indicating that the event is not published.
// It also deletes all bookings for the event.
// Additionally, it resets the remaining number of 
// tickets to the original number of tickets.
// Then, it redirects to the organiser home page.
router.post('/unpublish/:id', (req, res, next) => {

    // Query for updating the event published timestamp in the 'events' table 
    // for the event which has the same id as the request parameter id.
    // It sets the published timestamp to 0 to indicate that the event is not published.
    const unpublishQuery = 'UPDATE events SET event_published = 0 WHERE event_id = ?';

    // Query for deleting entries in the 'bookings' table, 
    // for the event which has the same id as the request parameter id.
    const deleteBookingsQuery = 'DELETE FROM bookings WHERE event_id = ?';

    // Query for updating the remaining ticket quantities in the 'events' table 
    // for the event which has the same id as the request parameter id.
    // For full price tickets and concession tickets, it resets the 
    // quanitites to the origninal ticket quantities.
    const resetTicketsQuery = `
        UPDATE events SET 
        event_full_tickets_quantity = event_full_tickets_start_quantity,
        event_concession_tickets_quantity = event_concession_tickets_start_quantity
        WHERE event_id = ?
    `;
    
    // executing the query to set the event published timestamp to 0
    global.db.get(unpublishQuery, req.params.id, (err, event) => {
        if (err) return next(err);

        // executing the query to delete bookings corresponding to the event
        global.db.run(deleteBookingsQuery, req.params.id, err => {
            if (err) return next(err);

            // executing the query to reset the remaining ticket quantities to 
            // original ticket quanitities
            global.db.run(resetTicketsQuery, req.params.id, err => {
                if (err) return next(err);

                // redirecting to the organiser home page
                res.redirect('/organiser');
            });
        });
    });
});


// Route for GET requests to the organiser site settings page
// It retrieves current site settings information and passes them
// to a template to render the organiser site settings page.
router.get('/site-settings', (req, res, next) => {

    // query for selecting all information from the table 'site_settings'
    const query = 'SELECT * FROM site_settings';

    // executing the query to retrieve site settings information
    global.db.get(query, (err, siteSettings) => {
        if (err) return next(err);

        // Rendering the organiser site settings page by 
        // passing the current site settings to a template
        res.render('organiser/settings', {siteSettings});
    });
});

// Route for POST requests for the organiser site settings 
// form submission on the organiser site settings page.
// It updates the site settings according to the input.
// Then, it redirects to the organiser home page.
router.post('/site-settings', (req, res, next) => {

    // Query for updating the site settings information
    // in the table 'site_settings' to the input values
    const query = `
        UPDATE site_settings 
        SET site_settings_name = ?,
        site_settings_description = ?
    `;

    // Executing the query, passing parameters of input site name and description
    global.db.run(query, [req.body.name, req.body.description], function (err) {
        if (err) return next(err);

        // Redirecting to the organiser home page
        res.redirect('/organiser');
    });
});


module.exports = router;
