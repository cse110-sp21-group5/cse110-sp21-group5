// This is where we will write our JS

// select the <a> tags used for navigation at the top of the page
const dispBar = document.querySelectorAll('.nav a');
const newEntry = document.querySelector('[class=addEntry]');
const form = document.createElement('form');
const textArea = document.createElement('textarea');
const submit = document.createElement('input');
const filter = document.querySelector('[name="filter"]');
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
 * Changes the journal entries displayed based on the filter selection
 */
filter.addEventListener('change', () => {
  const url = './sample-entries.json';
  document.querySelectorAll('journal-entry').forEach(e => e.remove());
  // clearing old entries from the page
  fetch(url)
    .then(entries => entries.json())
    .then(entries => {
      entries.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
      // sorting entries before displaying
      if (filter.value !== 'date') {
        // checks that the current value in the filter isn't date
        const filtered = entries.filter(function (entry) {
          for (let i = 0; i < entry.tags.length; i++) {
            if (entry.tags[i] === filter.value) {
              return entry;
              // checks the current entry, if it has a tag that matches
              // the current filter value, adds it to the filtered array
            }
          }
          return null;
          // if tag doesn't match, returns nothing
        });
        filtered.forEach((entry) => {
          const newPost = document.createElement('journal-entry');
          // goes through the filtered array, adding new elements for each entry
          newPost.entry = entry;
        });
      } else {
        // if the filter value actually is date
        entries.forEach((entry) => {
          const newPost = document.createElement('journal-entry');
          // just adds all of the entries in the entries object, no need to filter
          newPost.entry = entry;
        });
      }
    })
    .catch(error => {
      console.log(`%cresult of fetch is an error: \n"${error}"`, 'color: red');
    });
});

/**
 * Loads entries and renders them to index.html
 */
document.addEventListener('DOMContentLoaded', () => {
  const url = './sample-entries.json'; // SET URL
  const existingOptions = new Set();
  // creating a set to keep track of options we already have in filter dropdown
  fetch(url)
    .then(entries => entries.json())
    .then(entries => {
      entries.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
      // sorting entries on arrival to page by date
      entries.forEach((entry) => {
        console.log(entry);
        const newPost = document.createElement('journal-entry');
        newPost.entry = entry;
        const tags = entry.tags;
        // getting the tags array for a specific entry
        for (let i = 0; i < tags.length; i++) {
          // loop through the tags array for specific entry
          const opt = document.createElement('option');
          opt.value = tags[i];
          opt.innerHTML = capitalizeFirstLetter(tags[i]);
          // create a new option with the value of the tag, and set
          // the innerHTML to display the tag capitalized
          if (!existingOptions.has(opt.value)) {
            filter.appendChild(opt);
            existingOptions.add(opt.value);
            // if it doesn't exist in the existing set, add it to the filter
            // then add it to the set after
          }
        }
      });
    })
    .catch(error => {
      console.log(`%cresult of fetch is an error: \n"${error}"`, 'color: red');
    });
});

/**
 * Function to capitalize first letter in a string (for tags)
 * @Param String to capitalize.
 * @return Capitlized string.
 */
function capitalizeFirstLetter (str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
