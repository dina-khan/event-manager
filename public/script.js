// This function is called when the attendee presses the submit
// button for the event booking form. 
// If no tickets are selected, the function returns false and the form
// is not submitted. 
function checkTickets() {
  // If the quantity of both full price tickets and concession tickets is 0
  if (Number(document.getElementById('full_tickets_quantity').value) === 0 && 
  Number(document.getElementById('concession_tickets_quantity').value) === 0) {
    alert('No tickets booked');
    //returning false so the form is not submitted
    return false; 
  }
  alert('Tickets booked');
  //returning true so the form is submitted
  return true;
}
