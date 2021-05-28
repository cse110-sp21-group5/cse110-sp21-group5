// This is where we will write our JS

// select the <a> tags used for navigation at the top of the page
const dispBar = document.querySelectorAll('.nav a');
const newEntry = document.querySelector('[class=addEntry]');
const form = document.createElement('form');
const textArea = document.createElement('textarea');
const submit = document.createElement('input');
submit.setAttribute('type', 'submit');
form.append(submit);
form.append(textArea);
textArea.setAttribute('rows', 30);
textArea.setAttribute('cols', 100);

/**
 * Clears the active <a> tag
 */
function clrActive () {
  for (let i = 0; i < dispBar.length; i++) {
    dispBar[i].classList.remove('active');
  }
}

/**
 * Adds event listeners to all elements of the navigation bar selected in dispBar
 */
for (let i = 0; i < dispBar.length; i++) {
  dispBar[i].addEventListener('click', function () {
    clrActive();

    dispBar[i].classList.add('active');
  });
}

/**
 * Appends the created form to 'main' when "New Entry" is clicked
 */
newEntry.addEventListener('click', () => {
  document.querySelector('main').append(form);
});

submit.addEventListener('click', () => {

});

/**
 * Loads entries and renders them to index.html
 */
document.addEventListener('DOMContentLoaded', () => {
  const url = './sample-entries.json'; // SET URL

  fetch(url)
    .then(entries => entries.json())
    .then(entries => {
      entries.forEach((entry) => {
        console.log(entry);
        const newPost = document.createElement('journal-entry');
        newPost.entry = entry;
      });
    })
    .catch(error => {
      console.log(`%cresult of fetch is an error: \n"${error}"`, 'color: red');
    });
});

/*
 * Begin process of laying out months
 */
const allMonths = { 0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr', 4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug', 8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dec' };

const date = new Date();

let month = date.getMonth();

// Get timeline template
const timeTemp = document.getElementById('timeline');
const timeClone = timeTemp.content.firstElementChild.cloneNode(true);

// Set Year Header
const timeYear = timeClone.querySelector('h4');
timeYear.innerText = date.getFullYear();

// Get month template
const monthTemp = document.getElementById('month');

// Append month template to the timeline
let idx = 12;
while (idx > 0) {
  const monthClone = monthTemp.content.firstElementChild.cloneNode(true);
  monthClone.firstElementChild.innerText = allMonths[month];
  console.log(allMonths[month]);
  // Demo of applying months
  // Get total days in the current month
  const daysInMonth = new Date(date.getFullYear(), (month + 1) % 12, 0).getDate();

  // List out the days in the current month
  for (let i = 0; i < daysInMonth; i++) {
    const listItem = document.createElement('li');

    listItem.innerText = i + 1;

    // Copy over values due to block scope
    const checkMonth = month + 1;
    const checkYear = date.getFullYear().toString();
    // Event listener for navigating to certain day
    listItem.addEventListener('click', event => {
      const entries = document.querySelectorAll('journal-entry');
      const checkDate = checkMonth + '/' + listItem.innerText + '/' + checkYear;
      console.log(checkDate);
      for (let index = 0; index < entries.length; index++) {
        if (entries[index].shadowRoot.querySelector('.entry-date').innerText === checkDate) {
          entries[index].scrollIntoView({behavior: 'smooth'});
          console.log('nav');
        }
      }
    });

    // End navigating to certain day function

    monthClone.querySelector('ul').appendChild(listItem);
  }

  console.log(monthClone.querySelector('p').innerText);
  monthClone.querySelector('p').addEventListener('click', event => {
    if (monthClone.querySelector('div').style.display === 'none') {
      monthClone.querySelector('div').style.display = 'inline-block';
    } else {
      monthClone.querySelector('div').style.display = 'none';
    }
  });
  // end of demo

  console.log(timeClone.querySelector('ul'));
  timeClone.querySelector('ul').appendChild(monthClone);

  // month = (month + 1) % 12;
  month = month - 1;

  // Case of rolling back to last December
  if (month === -1) {
    month = 11;
    date.setFullYear(date.getFullYear() - 1);
  }
  idx = idx - 1;
}

document.querySelector('aside').appendChild(timeClone);

// Clicking outside the timeline will close all dropdowns - possible feature
const timeline = document.querySelector('.timeline');
document.addEventListener('click', event => {
  console.log(event.target);
  const isClickInside = timeline.contains(event.target);
  const content = document.querySelectorAll('.dropdown-content');
  if (!isClickInside) {
    for (let i = 0; i < content.length; i++) {
      content[i].style.display = 'none';
    }
  }
});
