// This is where we will write our JS

// select the <a> tags used for navigation at the top of the page
const dispBar = document.querySelectorAll('.nav a');
const newEntry = document.querySelector('[class=addEntry]');
const form = document.createElement('form');
const textArea = document.createElement('textarea');
const filter = document.querySelector('[name="filter"]');
const existingOptions = new Set();
// const months = document.querySelectorAll('.float-right');
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
 * Adds event listeners to all elements of the navigation bar selected in dispBar
 */
// create initial timeline
createTimeline();
for (let i = 0; i < dispBar.length; i++) {
  dispBar[i].addEventListener('click', function () {
    const currentTab = dispBar[i].innerText;
    clrActive();

    dispBar[i].classList.add('active');
    console.log(document.querySelector('.active').innerText);

    const tl = document.querySelector('.tl');
    if (tl) {
      tl.remove();
    }

    if (currentTab === 'Daily') {
      createTimeline();
    } else {
      // create respective timelines
      createFutureTime();
    }
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
  const date = new Date(2020, 9, 3).toLocaleDateString();
  const entryDiv = document.createElement('div');
  entryDiv.className = date;
  const newEntry = document.createElement('li');
  // create delete button
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete';
  entryDiv.append(deleteButton);
  // create flag button
  const flagButton = document.createElement('input');
  flagButton.type = 'checkbox';
  flagButton.className = 'flag';
  entryDiv.append(flagButton);
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
        if (cursor.value.tags) {
          for (let i = 0; i < cursor.value.tags.length; i++) {
            if ((cursor.value.tags[i] === tag) && (cursor.value.content !== cursor.value.date)) {
              entries.push(cursor.value);
            }
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
 * @param {boolean} flag The flag to add the entry to the "Important" log
 */
function addEntrytoDB (database, entry, day, tagList, flag = false) {
  const transaction = database.transaction(['entries'], 'readwrite');
  const objStore = transaction.objectStore('entries');
  const entryText = entry.innerText;
  const entryObject = { content: entryText, date: day, tags: tagList, flagged: flag };
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
    // create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete';
    entryDiv.className = entry.date;
    entryDiv.append(deleteButton);
    // create flag button
    const flagButton = document.createElement('input');
    flagButton.type = 'checkbox';
    flagButton.className = 'flag';
    // remember flagged status
    if (entry.flagged) {
      flagButton.checked = true;
    }
    entryDiv.append(flagButton);
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
 * Updates the flag of the entry in the DB. If flagged, adds entry to "Important" log.
 * Otherwise, removes entry from "Important" log.
 * @function
 */
function updateFlag (event, content) {
  const divElement = event.target.parentNode;
  const day = divElement.className;
  // update flag in DB
  let flag = false;
  if (event.target.checked) {
    flag = true;
    // add entry to important log
    // ... to-do
    console.log('mark as important!');
  } else {
    // remove entry from important log
    // ... to-do
    console.log('remove important flag');
  }
  const tagList = tagGet(event.target.parentNode.innerText);
  updateDB(content, content, day, tagList, flag);
}

/**
 * Checks to see if delete button clicked. If so, removes appropriate entry.
 * Otherwise checks to see if an entry was clicked. If so allows editing entry.
 * @function
 */
document.addEventListener('click', function (event) {
  const divElement = event.target.parentNode;
  const day = divElement.className;
  // check for click on timeline
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const isClickInside = timeline.contains(event.target);

    if (!isClickInside) {
      const content = document.querySelectorAll('.dropdown-content');
      for (let i = 0; i < content.length; i++) {
        content[i].style.display = 'none';
      }
      // add back any missing months
      // for (let i = 0; i < months.length; i++) {
      //   months[i].style.display = 'block';
      // }
    }
  }
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
        location.reload();
        return;
      }
      cursor.continue();
    };
  } else if (event.target.className === 'flag') {
    updateFlag(event, oldContent);
  } else if (event.target.parentNode.className !== 'tl' && divElement.tagName === 'DIV' && existingEntry === false) {
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
 * @param {boolean} flag The flag to add the entry to the "Important" log
 */
function updateDB (entry, oldContent, day, tagList, flag) {
  const bullet = entry;
  const transaction = db.transaction(['entries'], 'readwrite');
  const objStore = transaction.objectStore('entries');
  const request1 = objStore.openCursor();
  const newContent = { content: bullet, date: day, tags: tagList, flagged: flag };
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
}

/**
 * Function to get tags
 * @param {string} str String to get tags from
 */
function tagGet (str) {
  const separatedString = str.split('#')[1];
  if (separatedString === undefined) {
    return null;
  }
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
  if (tags === null) {
    return;
  }
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

/*
 * Begin process of laying out months (for daily log)
 */
function createTimeline () {
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

    monthClone.id = month;
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
        const entries = document.querySelectorAll('section');
        const checkDate = checkMonth + '/' + listItem.innerText + '/' + checkYear;
        console.log(checkDate);
        for (let index = 0; index < entries.length; index++) {
          if (entries[index].className === checkDate) {
            entries[index].scrollIntoView({ behavior: 'smooth' });
            break;
          }
          console.log('nav');
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

  // const isClickInside = timeline.contains(event.target);
  // if(!isClickInside)

  // const timeline = document.querySelector('.timeline');
  // document.addEventListener('click', event => {
  //   console.log(event.target);
  //   const isClickInside = timeline.contains(event.target);
  //   const content = document.querySelectorAll('.dropdown-content');
  //   if (!isClickInside) {
  //     for (let i = 0; i < content.length; i++) {
  //       content[i].style.display = 'none';
  //     }
  //   }
  // });

  // Experimental Scroll Event
  window.addEventListener('scroll', event => {
    const entries = document.querySelectorAll('section');

    let bolded = false; // Used to prevent other entries that are within the viewport getting their month bolded. Only looking for the first entry in the viewport
    let saveMonthText = null; // Used to the save the month to prevent other entries after the current with the same month overriding the bold text
    for (let i = 0; i < entries.length; i++) {
      const entryPos = entries[i].getBoundingClientRect();

      const monthText = document.getElementById(entries[i].className.substr(0, entries[i].className.indexOf('/')) - 1).querySelector('p');
      if (entryPos.top >= 0 && entryPos.left >= 0 && entryPos.bottom <= (window.innerHeight) && entryPos.right <= (window.innerWidth) && bolded === false) {
        saveMonthText = monthText;
        monthText.style.fontWeight = 'bolder';
        // monthText.style.textShadow = '1px 1px rgba(0, 0, 0, 0.8)';
        bolded = true;
      } else {
        if (monthText !== saveMonthText) {
          monthText.style.fontWeight = 'normal';
        }
      }
    }
  });

  // Hide all other months when a month is clicked
  /* const months = document.querySelectorAll('.float-right');
  let hide = 0; // check if months are hidden
  for (let index = 0; index < months.length; index++) {
    months[index].addEventListener('click', event => {
      if (hide === 0) {
      for (let i = 0; i < months.length; i++) {
        if (months[index] !== months[i]) {
          months[i].style.display = 'none'
        } else {
            months[i].style.display = 'block';
        }
      }
      hide = 1;
    } else {
      for (let i = 0; i < months.length; i++) {
          months[i].style.display = 'block';
      }
      hide = 0;
    }
    });
  } */
}

function createFutureTime () {
  console.log('running');
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
  let idx = 6;
  while (idx > 0) {
    const monthClone = monthTemp.content.firstElementChild.cloneNode(true);
    monthClone.firstElementChild.innerText = allMonths[month];
    console.log(allMonths[month]);

    monthClone.id = month;

    // Copy over values due to block scope
    const checkMonth = month + 1;
    const checkYear = date.getFullYear().toString();
    monthClone.querySelector('p').addEventListener('click', event => {
      const entries = document.querySelectorAll('section');
      const checkDate = checkMonth;
      console.log(checkDate);
      for (let index = 0; index < entries.length; index++) {
        if (entries[index].className === checkDate) {
          entries[index].scrollIntoView({ behavior: 'smooth' });
          break;
        }
        console.log('nav');
      }
    });

    timeClone.querySelector('ul').prepend(monthClone);
    month = month + 1;

    // Case of rolling back to last December
    if (month === 12) {
      month = 0;
      date.setFullYear(date.getFullYear() + 1);
    }
    idx = idx - 1;
  }

  document.querySelector('aside').appendChild(timeClone);

  // Experimental Scroll Event
  window.addEventListener('scroll', event => {
    const entries = document.querySelectorAll('section');

    let bolded = false; // Used to prevent other entries that are within the viewport getting their month bolded. Only looking for the first entry in the viewport
    let saveMonthText = null; // Used to the save the month to prevent other entries after the current with the same month overriding the bold text
    for (let i = 0; i < entries.length; i++) {
      const entryPos = entries[i].getBoundingClientRect();
      const monthText = document.getElementById(entries[i].className - 1).querySelector('p');
      if (entryPos.top >= 0 && entryPos.left >= 0 && entryPos.bottom <= (window.innerHeight) && entryPos.right <= (window.innerWidth) && bolded === false) {
        saveMonthText = monthText;
        monthText.style.fontWeight = 'bolder';
        bolded = true;
      } else {
        if (monthText !== saveMonthText) {
          monthText.style.fontWeight = 'normal';
        }
      }
    }
  });
}
