// This is where we will write our JS

//select the <a> tags used for navigation at the top of the page
let dispBar = document.querySelectorAll(".nav a");
let newEntry = document.querySelector('[class=addEntry]');
let form = document.createElement('form');

let textArea = document.createElement('textarea');
let submit = document.createElement('input');

submit.setAttribute('type','submit');
form.append(submit);
form.append(textArea);
textArea.setAttribute('rows',30);
textArea.setAttribute('cols',100);

/**
 * Clears the active <a> tag in the top navigation bar 
 */
function clrActive() {
    for (let i = 0; i < dispBar.length; i++) {
        dispBar[i].classList.remove("active");
    }
}

//keep track of the "New Entry" button
let submitButton = document.querySelector('.addEntry');

/**
 * Get the string form of the current date 
 */
function stringDate() {

  //get the current day, month, and year
  d = new Date();
  let currDay = d.getDate();
  let currMonth = d.getMonth() + 1;
  let currYear = d.getFullYear();

  //stringify the date 
  return currMonth + '/' + currDay + '/' + currYear;
}

/**
 * place the button that submits a new entry to the correct place 
 * The correct place is the bottom of the section for today's bullets, or the top of the page if there are no entries today
 */
function moveSubmitButton() {

  //remove the button if it's there
  if (document.querySelector('.addEntry')) {
    document.querySelector('.addEntry').remove();
  }

  //create an array of strings representing the dates for which we have entries 
  let dates = [];
  let dateElems = document.querySelectorAll('.dateLine');

  dateElems.forEach(elem => {

    dates.push(elem.innerText);
  });

  let currDate = stringDate();

  //check where we should put the "submit" button
  if (dates.indexOf(currDate) != -1) {
    
    document.querySelector('#entryArea').insertBefore(submitButton, document.querySelector('hr'));
    document.querySelector('#entryArea').insertBefore(document.createElement('br'), document.querySelector('hr'));

  } else {

    document.querySelector('main').appendChild(submitButton);
  }

}

/**
 * Updates the log the user is viewing (daily, future, recap custom)
 */
function updateLogView() {

  //grab the string corresponding to the 'href' atribute of the selected nav bar link 
  const newView = document.querySelector('.nav .active').attributes['href'].value;

  //clear all the elements off of the page to be replaced
  if (document.querySelector('#entryArea') != null) {
    document.querySelector('#entryArea').innerHTML = "";
  }

  /*
  document.querySelectorAll('journal-entry').forEach(elem => elem.remove());
  document.querySelectorAll('.dateLine').forEach(elem => elem.remove());
  document.querySelectorAll('hr').forEach(elem => elem.remove());
  document.querySelectorAll('br').forEach(elem => elem.remove());
  */

  //set the URL to fetch from 
  const url = './sample-entries.json'; 

  fetch(url)
    .then(entries => entries.json())
    .then(entries => {

      let logType = "";

      //decide which view to render to 
      switch (newView) {
        case '#daily':

          logType = 'daily';

          //sort entries by time, most recent first 
          entries.sort(function(a, b) {

            return b.time - a.time;
          });
          
          break;

        case '#future':

          logType = 'future';

          //sort entries by time, most recent last 
          entries.sort(function(a, b) {

            return a.time - b.time;
          });

          break;

        case '#recap':

          logType = 'recap';

          //sort entries by time, most recent first 
          entries.sort(function(a, b) {

            return b.time - a.time;
          });

          break;

        case '#custom':
          
          logType = 'custom';

          //sort entries by time, most recent first 
          entries.sort(function(a, b) {

            return b.time - a.time;
          });

          break;

        default:
          console.log("error in updateLogView: active menu item is " + newView);
      }

      let currDate = "";

      let drawLine = false;

      entries.forEach((entry) => {

        //ignore all but the correct log items
        if (entry.log != logType) {
          
          //note: I wanted to use continue here, but that causes an error. The internet recommended this and it works.
          return;
        }

        //if we run into a new date, render a header for it 
        if (entry.date != currDate) {
          
          let newDate = document.createElement('h2');
          newDate.innerText = entry.date;
          newDate.classList = 'dateLine'
          currDate = entry.date;
          document.querySelector('#entryArea').appendChild(newDate);          

          if (drawLine) {

            //create a horizontal line and line break and append before the date
            document.querySelector('#entryArea').insertBefore(document.createElement('hr'), newDate);
            document.querySelector('#entryArea').insertBefore(document.createElement('br'), newDate);
          } else {
            drawLine = true;
          }
        }
        
        //render the entry
        const newPost = document.createElement('journal-entry');
        newPost.entry = entry;
        //remove the date 
        newPost.shadowRoot.querySelector('.entry-date').remove();

      });
      
      moveSubmitButton();

    })
    .catch(error => {
      console.log(`%cresult of fetch is an error: \n"${error}"`, 'color: red');
    });
}

/**
 * Adds event listeners to all elements of the navigation bar selected in dispBar
 */
for (let i = 0; i < dispBar.length; i++) {
    
    dispBar[i].addEventListener('click', function() {
        
        clrActive();
        
        dispBar[i].classList.add("active");

        updateLogView();
    });
}

/**
 * Appends the created form to 'main' when "New Entry" is clicked
 */
newEntry.addEventListener('click', () => {
    document.querySelector('main').append(form);
  });


submit.addEventListener('click',() => {

});

updateLogView();