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
 * Changes the value of the filter based on the option selected
 * Changes the journal entries displayed based on the filter selection
 */
filter.addEventListener('change', () => {
  const url = './sample-entries.json';
  document.querySelectorAll('journal-entry').forEach(e => e.remove());
  fetch(url)
    .then(entries => entries.json())
    .then(entries => {
      entries.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
      if (filter.value !== 'date') {
        const filtered = entries.filter(function (entry) {
          for (let i = 0; i < entry.tags.length; i++) {
            if (entry.tags[i] === filter.value) {
              return entry;
            }
          }
          return null;
        });
        filtered.forEach((entry) => {
          console.log(entry);
          const newPost = document.createElement('journal-entry');
          newPost.entry = entry;
        });
      } else {
        entries.forEach((entry) => {
          console.log(entry);
          const newPost = document.createElement('journal-entry');
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

  fetch(url)
    .then(entries => entries.json())
    .then(entries => {
      entries.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
      entries.forEach((entry) => {
        console.log(entry);
        const newPost = document.createElement('journal-entry');
        newPost.entry = entry;
        const tags = entry.tags;
        const existingOptions = [];
        for (const option of filter.options) {
          existingOptions.push(option.value);
        }
        for (let i = 0; i < tags.length; i++) {
          const opt = document.createElement('option');
          opt.value = tags[i];
          opt.innerHTML = capitalizeFirstLetter(tags[i]);
          if (!existingOptions.includes(opt.value)) {
            filter.appendChild(opt);
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
 */
function capitalizeFirstLetter (str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
