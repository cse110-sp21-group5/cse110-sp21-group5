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

let date = new Date();

let month = date.getMonth();

for (let i = 0; i < 12; i++) {
  let textMonth = document.createElement('p');
  
  textMonth.addEventListener('click', event => {
    console.log('Clicked' + textMonth.innerText);
    let entries = document.querySelectorAll('journal-entry');

    /*for (let idx = 0; idx < entries.length; idx++) {
      if ( entries[idx].shadowRoot.entry.date == textMonth) {

        break;
      }
    }*/
  });

  textMonth.innerText = allMonths[month];
  document.querySelector('aside').appendChild(textMonth);
  
  month = (month + 1) % 12;
}
