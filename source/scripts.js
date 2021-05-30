// This is where we will write our JS

// select the <a> tags used for navigation at the top of the page
const dispBar = document.querySelectorAll('.nav a');
const newEntry = document.querySelector('[class=addEntry]');
const form = document.createElement('form');
const textArea = document.createElement('textarea');
const filter = document.querySelector('[name="filter"]');
const existingOptions = new Set();
textArea.focus();
let existingEntry = false;
form.append(textArea);
textArea.setAttribute('rows', 3);
textArea.setAttribute('cols', 50);

const request = indexedDB.open('Daily', 1);
let db;
request.onerror = function (event) {
  console.log('Error opening IndexedDB');
};

request.onsuccess = function (event) {
  db = event.target.result;
  getAndShowEntries(db, filter.value);
};

request.onerror = function (event) {
  console.error('IndexedDB erorr: ' + event.target.errorCode);
};

request.onupgradeneeded = function (event) {
  db = event.target.result;
  /*
  if (document.querySelector('h3') !== null) {
    let date = document.querySelector('h3').innerHTML;
    if(!db.objectStoreNames.contains(date)) {
      db.createObjectStore(date, { autoIncrement: true});
    }
  }
  */
  const entries = db.createObjectStore('entries', { autoIncrement: true });
};

/**
 * Clears the active <a> tag
 */
function clrActive () {
  for (let i = 0; i < dispBar.length; i++) {
    dispBar[i].classList.remove('active');
  }
}

/**
 * @function
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
 * @function
 */

newEntry.addEventListener('click', () => {
  if (document.querySelector('section') === null) {
    document.querySelector('main').append(form);
    textArea.focus();
    document.querySelector('.addEntry').remove();
    document.querySelector('main').append(newEntry);
  } else {
    document.querySelector('section').append(form);
    textArea.focus();
    document.querySelector('.addEntry').remove();
    document.querySelector('main').append(newEntry);
  }
});

/**
 * @function
 * Make a new bullet when enter is pressed (rather than newline)
 */
textArea.addEventListener('keyup', function (event) {
  if (event.keyCode === 13) {
    addEntry();
  }
});

/**
 * Changes the journal entries displayed based on the filter selection
 */
filter.addEventListener('change', () => {
  document.querySelectorAll('section').forEach(e => e.remove());
  // clearing old entries from the page
  getAndShowEntries(db, filter.value);
});

/**
 * Adds a new bullet to the current date and stores the data in the database (IndexedDB)
 */
function addEntry () {
  // Checks to see if the input is empty
  if (textArea.value.length === 1) {
    document.querySelector('form').remove();
    textArea.value = '';
    return;
  }
  const listedTags = tagGet(textArea.value);
  filterPopulate(listedTags);
  const date = new Date().toLocaleDateString();
  const entryDiv = document.createElement('div');
  entryDiv.className = date;
  const newEntry = document.createElement('li');
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete';
  entryDiv.append(deleteButton);
  let dateExists = false;
  const sectionList = document.querySelectorAll('section');
  let sectionExists = false;
  let section;
  if (sectionList !== null) {
    sectionList.forEach(sec => {
      if (sec.className === date) {
        sectionExists = true;
        section = sec;
      }
    });
  }
  if (sectionExists === false) {
    section = document.createElement('section');
    section.className = date;
    const sec = document.querySelector('section');
    if (sec === null) {
      document.querySelector('main').append(section);
    } else {
      document.querySelector('main').insertBefore(section, sec);
    }
  }
  // Adds date on the first entry of the day
  if (document.querySelector('h3') === null) {
    const newEntryTitle = document.createElement('h3');
    newEntryTitle.innerText = date;
    section.append(newEntryTitle);
    // document.querySelector('main').append(section);
    addEntrytoDB(db, newEntryTitle, newEntryTitle.innerText, listedTags);
  } else {
    const h3List = document.querySelectorAll('h3');
    h3List.forEach(h3 => {
      if (h3.innerText === date) {
        dateExists = true;
      }
    });
    if (dateExists === false) {
      const newEntryTitle = document.createElement('h3');
      newEntryTitle.innerText = date;
      section.append(newEntryTitle);
      // document.querySelector('main').append(section);
      addEntrytoDB(db, newEntryTitle, newEntryTitle.innerText, listedTags);
    }
  }
  // Adds bullets, reset text area and delete the form
  newEntry.innerText = textArea.value;
  entryDiv.append(newEntry);
  section.append(entryDiv);
  document.querySelector('form').remove();
  textArea.value = '';
  addEntrytoDB(db, entryDiv, date, listedTags);
}

/**
 * Retrieves the entries of the database and shows the entries on the screen
 * @param  database The database that will be used to display entries
 * @param  tag The string tag associated with the entries to get from the DB
 */
function getAndShowEntries (database, tag) {
  const transaction = database.transaction(['entries'], 'readonly');
  const objStore = transaction.objectStore('entries');
  const request1 = objStore.openCursor();
  const entries = [];
  request1.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor !== null) {
      if (cursor.value.content !== cursor.value.date) {
        filterPopulate(cursor.value.tags);
      }
      if (tag === 'date') {
        entries.push(cursor.value);
      } else {
        if (cursor.value.content === cursor.value.date) {
          entries.push(cursor.value);
        }
        for (let i = 0; i < cursor.value.tags.length; i++) {
          if ((cursor.value.tags[i] === tag) && (cursor.value.content !== cursor.value.date)) {
            entries.push(cursor.value);
          }
        }
      }
      cursor.continue();
    } else {
      showEntries(entries);
    }
  };
}

/**
 * Adds the given entry to the database
 * @param  database The database that entries will be added to
 * @param {Object} entry The entry that will be added to the database
 * @param {string} day The day the entry was made
 * @param {Array} tagList List of tags associated with the entry
 */
function addEntrytoDB (database, entry, day, tagList) {
  const transaction = database.transaction(['entries'], 'readwrite');
  const objStore = transaction.objectStore('entries');
  const entryText = entry.innerText;
  const entryObject = { content: entryText, date: day, tags: tagList };
  objStore.add(entryObject);
  transaction.oncomplete = function () {
    console.log('Data entered into database');
  };
  transaction.onerror = function (event) {
    console.log('Error entering data into database' + event.target.errorCode);
  };
}

/**
 * Shows the given entries on the screen
 * Helper function for getAndShowEntries()
 * @param {Object[]} entries The list of entries that will be shown on the screen
 */
function showEntries (entries) {
  entries.forEach((entry) => {
    if (textArea.value.length === 1) {
      document.querySelector('form').remove();
      textArea.value = '';
      return;
    }
    const entryDiv = document.createElement('div');
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete';
    entryDiv.className = entry.date;
    entryDiv.append(deleteButton);
    const newEntry = document.createElement('li');
    const sectionList = document.querySelectorAll('section');
    let section;
    let sectionExists = false;
    if (sectionList !== null) {
      sectionList.forEach(sec => {
        if (sec.className === entry.date) {
          sectionExists = true;
          section = sec;
        }
      });
    }
    if (sectionExists === false) {
      section = document.createElement('section');
      section.className = entry.date;
      const sec = document.querySelector('section');
      if (sec === null) {
        document.querySelector('main').append(section);
      } else {
        document.querySelector('main').insertBefore(section, sec);
      }
    }
    if (entry.content === entry.date) {
      const dateTitle = document.createElement('h3');
      dateTitle.innerText = entry.date;
      section.append(dateTitle);
      return;
    }
    // Adds bullets, reset text area and delete the form
    newEntry.innerText = entry.content;
    entryDiv.append(newEntry);
    section.append(entryDiv);
    textArea.value = '';
  });
}

/**
 * Checks to see if delete button clicked. If so, removes appropriate entry.
 * Otherwise checks to see if an entry was clicked. If so allows editing entry.
 * @function
 */
document.addEventListener('click', function (event) {
  const divElement = event.target.parentNode;
  const day = divElement.className;
  let oldContent;
  if (divElement.querySelector('li') !== null) {
    oldContent = divElement.querySelector('li').innerText;
  }
  if (event.target.className === 'delete') {
    // Get the div element
    const divElement = event.target.parentNode;
    const content = divElement.innerText;
    const date = divElement.className;
    // Remove element from IndexedDB
    const transaction = db.transaction(['entries'], 'readwrite');
    const objStore = transaction.objectStore('entries');
    const request1 = objStore.openCursor();
    request1.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor === null) {
        return;
      }
      if (cursor.value.content === content && cursor.value.date === date) {
        objStore.delete(cursor.key); // Delete appropriate element from DB
        divElement.remove(); // Delete div element from page
        return;
      }
      cursor.continue();
    };
  } else if (divElement.tagName === 'DIV' && existingEntry === false) {
    existingEntry = true;
    const textBox = document.createElement('textarea');
    if (divElement.querySelector('li') !== null) {
      textBox.innerText = divElement.querySelector('li').innerText;
      divElement.querySelector('li').remove();
      divElement.append(textBox);
      textBox.focus();
      textBox.setSelectionRange(textBox.value.length, textBox.value.length);
    }
    const editedEntry = document.createElement('li');
    textBox.addEventListener('keyup', function (event) {
      if (event.keyCode === 13) {
        editedEntry.innerText = textBox.value;
        const editedTags = tagGet(editedEntry.innerText);
        textBox.remove();
        divElement.append(editedEntry);
        existingEntry = false;
        // Update appropriate entry in DB
        updateDB(editedEntry.innerText, oldContent, day, editedTags);
      }
    });
  }
});

/**
 * Updates the database, replacing oldContent with entry
 * @param {string} entry The new content of the entry
 * @param {string} oldContent The old content of the entry that will be replaced by "entry"
 * @param {string} day The date of the entry
 * @param {array} tagList List of tags for the entry.
 */
function updateDB (entry, oldContent, day, tagList) {
  const bullet = entry;
  const transaction = db.transaction(['entries'], 'readwrite');
  const objStore = transaction.objectStore('entries');
  const request1 = objStore.openCursor();
  const newContent = { content: bullet, date: day, tags: tagList };
  request1.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor === null) {
      return;
    }
    if (cursor.value.content === oldContent && cursor.value.date === day) {
      objStore.put(newContent, cursor.key); // Update appropriate element from DB
      return;
    }
    cursor.continue();
  };
}

/**
 * Loads entries and renders them to index.html
 */
/*
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
*/

/**
 * Function to capitalize first letter in a string (for tags)
 * @param {string} str String to capitalize.
 * @return Capitlized string.
 */
function capitalizeFirstLetter (str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Function to get tags
 * @param {string} str String to get tags from
 */
function tagGet (str) {
  const separatedString = str.split('#')[1];
  const removedSpaces = separatedString.split(' ').join('');
  const removedEnter = removedSpaces.split('\n').join('');
  const listedTags = removedEnter.split(',');
  return listedTags;
}

/**
 * Function to fill filter with new tags
 * @param {array} tags List of tags to populate filter.
 */
function filterPopulate (tags) {
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
}
