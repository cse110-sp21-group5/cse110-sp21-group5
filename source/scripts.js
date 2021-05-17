// This is where we will write our JS

// select the <a> tags used for navigation at the top of the page
let dispBar = document.querySelectorAll(".nav a");
let newEntry = document.querySelector('[class=addEntry]');
let form = document.createElement('form');
let textArea = document.createElement('textarea');
let submit = document.createElement('input');
submit.setAttribute('type','button');
form.append(submit);
form.append(textArea);
textArea.setAttribute('rows', 30);
textArea.setAttribute('cols', 50);

/**
 * Clears the active <a> tag
 */
function clrActive () {
  for (let i = 0; i < dispBar.length; i++) {
    dispBar[i].classList.remove("active");
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

submit.addEventListener('click', addEntry);

// Make a new bullet when enter is pressed (rather than newline)
textArea.addEventListener('keyup', function (event) {
  if (event.keyCode === 13) {
    submit.click();
  }
});

/**
 * Loads entries and renders them to index.html  
 */
document.addEventListener('DOMContentLoaded', () => {
  let url = "./sample-entries.json"  // SET URL 
  fetch(url)
    .then(entries => entries.json())
    .then(entries => {
      entries.forEach((entry) => {
        console.log(entry);
        let newPost;

        newPost = document.createElement('journal-entry');
        newPost.entry = entry;
      });
    })
    .catch(error => {
      console.log(`%cresult of fetch is an error: \n"${error}"`, 'color: red');
    });
});

/**
 * Adds a new bullet on the given date and stores the data in the database
 * @function
 */
function addEntry () {
  // Checks to see if the input is empty
  if (textArea.value.length === 1) {
    document.querySelector('form').remove();
    textArea.value = '';
    return;
  }
  let date = new Date().toLocaleDateString();
  let newEntry = document.createElement('li');

  // Adds date on the first entry of the day
  if (document.querySelector('h3') === null || document.querySelector('h3').innerHTML !== date) {
    let newEntryTitle = document.createElement('h3');
    newEntryTitle.innerHTML = date;
    document.querySelector('main').append(newEntryTitle);
  }

  // Adds bullets, reset text area and delete the form
  newEntry.innerHTML = textArea.value;
  document.querySelector('main').append(newEntry);
  document.querySelector('form').remove();
  textArea.value = '';
}
