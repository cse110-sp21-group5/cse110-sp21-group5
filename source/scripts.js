// This is where we will write our JS

// select the <a> tags used for navigation at the top of the page
const dispBar = document.querySelectorAll('.nav a');
const newEntry = document.querySelector('[class=addEntry]');
const addEnt = newEntry;
const form = document.createElement('form');
const textArea = document.createElement('textarea');
const filter = document.querySelector('[name="filter"]');
const existingOptions = new Set();
textArea.focus();
let existingEntry = false;
form.append(textArea);
textArea.setAttribute('rows', 3);
textArea.setAttribute('cols', 50);
let tab;

// assume indexedDB is defined/available
/* global indexedDB */

/**
 * define a dictionary for month names and numbers
 */
const dict = [];
dict[1] = 'January';
dict[2] = 'February';
dict[3] = 'March';
dict[4] = 'April';
dict[5] = 'May';
dict[6] = 'June';
dict[7] = 'July';
dict[8] = 'August';
dict[9] = 'September';
dict[10] = 'October';
dict[11] = 'November';
dict[12] = 'December';

for (const key in dict) {
  dict[dict[key]] = Number(key);
}

const request = indexedDB.open('daily', 1);
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
  db.createObjectStore('entries', { autoIncrement: true });
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
// create initial timeline
createTimeline();
for (let i = 0; i < dispBar.length; i++) {
  dispBar[i].addEventListener('click', function () {
    clrActive();
    dispBar[i].classList.add('active');
    tab = document.querySelector('.active').attributes.href.value.substring(1);

    /* Create respective timeline based on tab change */
    const tl = document.querySelector('.tl');
    if (tl) {
      tl.remove();
    }

    if (tab === 'daily') {
      createTimeline();
      newEntry.style.display = 'inline';
    } else if (tab === 'future') {
      createFutureTime();
      newEntry.style.display = 'inline';
    } else if (tab === 'important') {
      newEntry.style.display = 'none';
    }

    clearPage();
    const req = indexedDB.open(tab, 1);
    existingOptions.clear();
    while (filter.firstChild) {
      filter.removeChild(filter.lastChild);
    }
    const opt = document.createElement('option');
    opt.value = 'date';
    opt.innerHTML = 'Date (Default)';
    filter.appendChild(opt);
    existingOptions.add(opt.value);
    req.onerror = function (event) {
      console.log('Error opening IndexedDB');
    };

    req.onupgradeneeded = function (event) {
      db = event.target.result;
      db.createObjectStore('entries', { autoIncrement: true });
    };
    req.onsuccess = function (event) {
      db = event.target.result;
      getAndShowEntries(db, 'date');
    };
    req.onerror = function (event) {
      console.error('IndexedDB erorr: ' + event.target.errorCode);
    };
  });
}

/**
 * @function
 * Clears the entries and header lines off of the page
 */
function clearPage () {
  const sxn = document.querySelectorAll('section, hr, br');

  sxn.forEach(s => {
    s.remove();
  });
}

/**
 * Appends the created form to 'main' when "New Entry" is clicked
 * @function
 */

newEntry.addEventListener('click', () => {
  if (document.querySelector('section') === null && db.name === 'daily') {
    document.querySelector('main').append(form);
  } else if (db.name === 'daily') {
    if (document.querySelector('h3').textContent === new Date().toLocaleDateString()) {
      document.querySelector('section').append(form);
    } else {
      document.querySelector('section').prepend(form);
    }
  }

  if (form.querySelector('input') != null) {
    form.querySelector('input').remove();
  }

  // add form for future
  if (db.name === 'future') {
    const dateIn = document.createElement('input');
    dateIn.type = 'date';
    form.append(dateIn);
    if (document.querySelector('section') !== null) {
      document.querySelector('section').prepend(form);
    } else {
      document.querySelector('main').append(form);
    }
  }

  textArea.focus();
  document.querySelector('.addEntry').remove();
  if (db.name === 'daily') {
    if (document.querySelector('section') === null) {
      document.querySelector('main').append(newEntry);
    } else {
      document.querySelector('section').append(newEntry);
    }
  } else if (db.name === 'future') {
    if (document.querySelector('section') === null) {
      document.querySelector('main').append(newEntry);
    } else {
      document.querySelector('section').prepend(newEntry);
    }
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
  clearPage();
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
    if (document.querySelector('section') === null) {
      document.querySelector('main').append(addEnt);
    } else if (db.name === 'daily') {
      document.querySelector('section').append(addEnt);
    } else {
      document.querySelector('section').prepend(addEnt);
    }
    return;
  }

  let dateInput;
  if (form.querySelector('[type=date]')) {
    dateInput = form.querySelector('[type=date]').value;
    if (dateInput === '') {
      console.error('Please enter a date!');
      return;
    }
  }
  let date;
  if (db.name === 'daily' || db.name === 'important') {
    date = new Date().toLocaleDateString();
  } else if (db.name === 'future') {
    date = parseDateInput(dateInput);
  }
  const monthYear = extractMonthYear(date);
  const listedTags = tagGet(textArea.value);
  filterPopulate(listedTags);
  const newEntry = document.createElement('li');
  // create delete button
  const entryDiv = document.createElement('div');
  // all log types will have class of specific date
  entryDiv.className = date;
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete';
  entryDiv.append(deleteButton);

  // create flag button
  const flagLabel = document.createElement('label');
  const flagText = document.createElement('span');
  flagText.innerHTML = '!';
  flagText.className = 'flagText';
  const flagButton = document.createElement('input');
  flagButton.type = 'checkbox';
  flagButton.className = 'flag';
  // the important log has the flag checked by default
  if (db.name === 'important') {
    flagButton.checked = true;
  }
  flagLabel.append(flagButton);
  flagLabel.append(flagText);
  entryDiv.append(flagLabel);

  const sectionList = document.querySelectorAll('section');
  let sectionExists = false;
  let section;
  if (sectionList !== null) {
    sectionList.forEach(sec => {
      if (((db.name === 'daily' || db.name === 'important') && sec.className === date) || (db.name === 'future' && sec.className === monthYear)) {
        sectionExists = true;
        section = sec;
      }
    });
  }

  if (sectionExists === false) {
    section = document.createElement('section');
    if (db.name === 'daily' || db.name === 'important') {
      section.className = date;
    } else if (db.name === 'future') {
      section.className = monthYear;
    }
    const sec = document.querySelector('section');
    if (sec === null) {
      document.querySelector('main').append(section);
    } else {
      if (db.name === 'daily') {
        document.querySelector('main').insertBefore(section, sec);
      } else if (db.name === 'future') {
        const sxns = document.querySelectorAll('section');
        let index = 0;
        while (index < sxns.length && isLaterThan(section.className, sxns[index].className) === 1) {
          index++;
        }
        if (index === sxns.length) {
          document.querySelector('main').append(section);
        } else {
          document.querySelector('main').insertBefore(section, sxns[index]);
        }
      }
    }
    const newEntryTitle = document.createElement('h3');
    if (db.name === 'daily') {
      newEntryTitle.innerText = date;
    } else if (db.name === 'future') {
      newEntryTitle.innerText = monthYear;
    }
    section.append(newEntryTitle);
    // document.querySelector('main').append(section);
    addEntrytoDB(db, newEntryTitle, newEntryTitle.innerText, listedTags);
  }

  newEntry.innerText = textArea.value;
  entryDiv.append(newEntry);
  section.append(entryDiv);
  if (db.name === 'daily') {
    section.append(addEnt);
  }
  document.querySelector('form').remove();
  textArea.value = '';

  if (db.name === 'important') {
    addEntrytoDB(db, entryDiv, date, listedTags, true);
  } else {
    addEntrytoDB(db, entryDiv, date, listedTags);
  }
}

/**
 * //parse dateInput (yyyy-mm-dd) to date (m/d/y)
 * @param {string} date in string format from the input box
 */
function parseDateInput (dateInput) {
  let date = dateInput.substring(dateInput.indexOf('-') + 1);
  date = date.replace('-', '/');
  // remove 0 from months starting with 0
  if (date.charAt(0) === '0') {
    date = date.substring(1);
  }
  // remove 0 from days starting with 0
  if (date.charAt(date.indexOf('/') + 1) === '0') {
    date = date.substring(0, date.indexOf('/') + 1) + date.substring(date.indexOf('/') + 2);
  }
  return date.concat('/' + dateInput.substring(0, dateInput.indexOf('-')));
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
        // add all tags of current entry to the filter
      }
      if (tag === 'date') {
        entries.push(cursor.value);
        // if filter is date, push regardless of tags
      } else {
        if (cursor.value.content === cursor.value.date) {
          entries.push(cursor.value);
          // if it is a date, push it regardless
        }
        if (cursor.value.tags) {
          for (let i = 0; i < cursor.value.tags.length; i++) {
            if ((cursor.value.tags[i] === tag) && (cursor.value.content !== cursor.value.date)) {
              entries.push(cursor.value);
              // check if the entry has a tag equal to the current filter, push if so
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
 * Shows the given entries on the screen
 * Helper function for getAndShowEntries()
 * @param {Object[]} entries The list of entries that will be shown on the screen
 */
function showEntries (entries) {
  clearPage();
  if (document.querySelector(['.addEntry']) === null) {
    const s = document.querySelector('section');
    if (s !== null) {
      document.querySelector('main').insertBefore(newEntry, s);
    } else {
      document.querySelector('main').append(newEntry);
    }
  }
  if (textArea.value.length === 1) {
    document.querySelector('form').remove();
    textArea.value = '';
    return;
  }

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
    entryDiv.append(deleteButton);
    entryDiv.className = entry.date;

    // create flag button
    const flagLabel = document.createElement('label');
    const flagText = document.createElement('span');
    flagText.innerHTML = '!';
    flagText.className = 'flagText';
    const flagButton = document.createElement('input');
    flagButton.type = 'checkbox';
    flagButton.className = 'flag';
    // remember flagged status
    if (entry.flagged) {
      flagButton.checked = true;
    }
    flagLabel.append(flagButton);
    flagLabel.append(flagText);
    entryDiv.append(flagLabel);

    const sectionList = document.querySelectorAll('section');
    let section;
    let sectionExists = false;

    if (sectionList !== null) {
      sectionList.forEach(sec => {
        if (((db.name === 'daily' || db.name === 'important') && sec.className === entry.date) || (db.name === 'future' && sec.className === extractMonthYear(entry.date))) {
          sectionExists = true;
          section = sec;
        }
      });
    }
    if (sectionExists === false) {
      section = document.createElement('section');
      section.className = entry.date;
      const sec = document.querySelector('section');

      if (db.name === 'daily') {
        if (sec === null) {
          document.querySelector('main').append(section);
        } else {
          document.querySelector('main').insertBefore(section, sec);
          // document.querySelector('main').insertBefore(document.createElement('hr'), sec);
        }
      } else if (db.name === 'future' || db.name === 'important') {
        document.querySelector('main').append(section);
        // document.querySelector('main').append(document.createElement('hr'));
        // document.querySelector('main').appendChild(document.createElement('br'));
      }
    }

    if (entry.content === entry.date) {
      const dateTitle = document.createElement('h3');
      dateTitle.innerText = entry.date;
      section.append(dateTitle);
      return;
    }

    // Adds bullets, reset text area and delete the form
    const newEntry = document.createElement('li');
    newEntry.innerText = entry.content;
    entryDiv.append(newEntry);
    section.append(entryDiv);
    textArea.value = '';
  });
}

/**
 * Takes a date in string form and returns the string name of the month it is in
 * @param {string} date a m/d/y date in string form
 * @return {string} the name of the month from the given date
 */
function extractMonth (date) {
  if (date === undefined) {
    return;
  }
  const month = Number(date.substring(0, date.indexOf('/')));

  return dict[month];
}

/**
 * Takes a date in string form and returns the string name of the month it is in
 * @param {string} date a m/d/y date in string form
 * @return {string} the name of the month and the year of the given date
 */
function extractMonthYear (date) {
  if (date === undefined) {
    return;
  }
  const month = dict[Number(date.substring(0, date.indexOf('/')))];

  const year = date.substring(date.lastIndexOf('/') + 1);

  return month + ' ' + year;
}

/**
 * Adds the given entry to the database
 * @param  database The database that entries will be added to
 * @param {Object} entry The entry that will be added to the database
 * @param {string} day The day the entry was made
 * @param {array} tagList The list of tags associated with an entry
 * @param {boolean} flag The flag to add the entry to the "Important" log
 */
function addEntrytoDB (database, entry, day, tagList, flag = false, callback = undefined) {
  let transaction;
  let objStore;
  let entryText = entry.innerText;
  // ignore the flag button text, just get the entry's text
  if (flag === true) {
    // li/the entry is the last child of div
    entryText = entry.lastChild.innerText;
  }
  const entryObject = { content: entryText, date: day, tags: tagList, flagged: flag };

  let date;
  if (form.querySelector('input')) {
    date = parseDateInput(form.querySelector('input').value);
    if (date === '/') {
      return;
    }
  }
  if (database.name === 'daily') {
    transaction = database.transaction(['entries'], 'readwrite');
    objStore = transaction.objectStore('entries');
    objStore.add(entryObject);
  } else if (database.name === 'future') {
    console.log('placing');

    if (day.indexOf('/') === -1) {
      // if we're inserting a month header

      let lastKey = 0;

      transaction = database.transaction(['entries'], 'readwrite');
      objStore = transaction.objectStore('entries');

      const request1 = objStore.openCursor();
      request1.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
          if (isLaterThan(date, cursor.value.date) === -1) {
            // insert a new month header
            const newKey = lastKey + ((cursor.key - lastKey) / 2);
            objStore.add({ content: extractMonthYear(date), date: extractMonthYear(date), tags: tagList }, newKey);
            return;
          }

          lastKey = cursor.key;
          cursor.continue();
        } else {
          objStore.add({ content: extractMonthYear(date), date: extractMonthYear(date), tags: tagList });
        }
      };
    } else {
      // we're inserting a full entry, not a month header
      let lastKey = 0;

      transaction = database.transaction(['entries'], 'readwrite');
      objStore = transaction.objectStore('entries');

      const request1 = objStore.openCursor();
      request1.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
          if (isLaterThan(date, cursor.value.date) === -1) {
            const newKey = lastKey + 0.000001;
            objStore.add({ content: entryText, date: date, tags: tagList }, newKey);
            return;
          }
          lastKey = cursor.key;
          cursor.continue();
        } else {
          objStore.add({ content: entryText, date: date, tags: tagList });
        }
      };
    }
  } else if (database.name === 'important') {
    let lastKey = 0;

    transaction = database.transaction(['entries'], 'readwrite');
    objStore = transaction.objectStore('entries');

    const request1 = objStore.openCursor();
    request1.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        if (isLaterThan(day, cursor.value.date) === -1) {
          let newKey = lastKey + 0.000001;
          if (entryText === day) {
            newKey = lastKey + ((cursor.key - lastKey) / 2);
          }
          objStore.add(entryObject, newKey);
          return;
        }

        lastKey = cursor.key;
        cursor.continue();
      } else {
        objStore.add(entryObject);
      }
    };
  }
  transaction.oncomplete = function () {
    console.log('Data entered into database');
    if (callback !== undefined) {
      callback();
    }
  };
  transaction.onerror = function (event) {
    console.log('Error entering data into database' + event.target.errorCode);
  };
}

/**
 * Checks to see if one date is later than another. Returns 1 if d1 is later, -1 if d2 is later, or 0 if they are equal.
 * @param {string} d1
 * @param {string} d2
 */
function isLaterThan (d1, d2) {
  if (d1 === d2) {
    return 0;
  }

  if (d1.indexOf('/') === -1 && d2.indexOf('/') === -1) {
    const y1 = Number(d1.substring(d1.indexOf(' ') + 1));
    const y2 = Number(d2.substring(d2.indexOf(' ') + 1));
    if (y1 > y2) {
      return 1;
    } else if (y1 < y2) {
      return -1;
    }

    const m1 = dict[d1.substring(0, d1.indexOf(' '))];
    const m2 = dict[d2.substring(0, d2.indexOf(' '))];

    if (m1 > m2) {
      return 1;
    } else if (m1 < m2) {
      return -1;
    }
  }

  if (d1.indexOf('/') === -1) {
    const y1 = Number(d1.substring(d1.indexOf(' ') + 1));
    const y2 = Number(d2.substring(d2.lastIndexOf('/') + 1));
    if (y1 > y2) {
      return 1;
    } else if (y1 < y2) {
      return -1;
    }

    const m1 = dict[d1.substring(0, d1.indexOf(' '))];
    const m2 = dict[extractMonth(d2)];

    if (m1 > m2) {
      return 1;
    }
    if (m1 < m2) {
      return -1;
    }

    return 0;
  }

  if (d2.indexOf('/') === -1) {
    const y1 = Number(d1.substring(d1.lastIndexOf('/') + 1));
    const y2 = Number(d2.substring(d2.indexOf(' ') + 1));
    if (y1 > y2) {
      return 1;
    } else if (y1 < y2) {
      return -1;
    }

    const m1 = dict[extractMonth(d1)];
    const m2 = dict[d2.substring(0, d2.indexOf(' '))];

    if (m1 > m2) {
      return 1;
    }
    if (m1 < m2) {
      return -1;
    }

    return 0;
  }

  const year1 = Number(d1.substring(d1.lastIndexOf('/') + 1));
  const year2 = Number(d2.substring(d2.lastIndexOf('/') + 1));

  if (year1 > year2) {
    return 1;
  } else if (year1 < year2) {
    return -1;
  }

  const month1 = Number(d1.substring(0, d1.indexOf('/')));
  const month2 = Number(d2.substring(0, d2.indexOf('/')));

  if (month1 > month2) {
    return 1;
  } else if (month1 < month2) {
    return -1;
  }

  const day1 = Number(d1.substring(d1.indexOf('/') + 1, d1.lastIndexOf('/')));
  const day2 = Number(d2.substring(d2.indexOf('/') + 1, d2.lastIndexOf('/')));

  if (day1 > day2) {
    return 1;
  } else if (day1 < day2) {
    return -1;
  }

  console.error('date comparison error ' + d1 + ' ' + d2);
  return 0;
}

/** Updates the flag of the entry in the DB. If flagged, adds entry to "Important" log.
 * Otherwise, removes entry from "Important" log.
 * @function
 */
function updateFlag (event, fromDelete = false) {
  let checkbox = event.target;
  let divElement = event.target.parentNode.parentNode;
  if (fromDelete) {
    divElement = event.target.parentNode;
    checkbox = divElement.querySelector('.flag');
    // force checkbox to be unchecked to mimic unchecking behavior
    checkbox.checked = false;
  }
  const tagList = tagGet(divElement.innerText);
  const content = divElement.querySelector('li').innerText;
  const day = divElement.className;
  // update flag in DB
  let flag = false;
  if (checkbox.checked) {
    flag = true;
    if (db.name !== 'important') {
      // add entry to important log
      // migrates daily or future -> important (creates copy)
      const req = indexedDB.open('important', 1);
      // init object store if not created
      req.onupgradeneeded = function (event) {
        const thisDB = event.target.result;
        thisDB.createObjectStore('entries', { autoIncrement: true });
      };
      req.onsuccess = function (event) {
        const newDB = event.target.result;
        // search the DB if it has the date header yet
        let headerExists = false;
        const transaction = newDB.transaction(['entries'], 'readwrite');
        const objStore = transaction.objectStore('entries');
        const request1 = objStore.openCursor();
        request1.onsuccess = function (event) {
          const cursor = event.target.result;
          if (cursor === null) {
            return;
          }
          if (cursor.value.content === day && cursor.value.date === day) {
            headerExists = true;
            return;
          }
          cursor.continue();
        };
        transaction.oncomplete = function () {
          if (!headerExists) {
            const newEntryTitle = document.createElement('h3');
            newEntryTitle.innerText = day;
            addEntrytoDB(newDB, newEntryTitle, newEntryTitle.innerText, null);
          }
          addEntrytoDB(newDB, divElement, day, tagList, flag, function after () {
            newDB.close();
          });
        };
      };
    }
    console.log('mark as important!');
  } else {
    // remove entry from important log
    if (db.name === 'important') {
      // wait until entry fully removed, then change the corresponding log entry's flag
      removeEntryFromDB(divElement, content, undefined, function after () {
        // check both logs to see which one the entry came from
        const reqDaily = indexedDB.open('daily');
        reqDaily.onsuccess = function (event) {
          const newDB = event.target.result;
          // uncheck in that log
          updateDB(content, content, day, tagList, flag, newDB);
        };
        // causes errors
        const reqFuture = indexedDB.open('future');
        // init object store if not created
        reqFuture.onupgradeneeded = function (event) {
          const thisDB = event.target.result;
          thisDB.createObjectStore('entries', { autoIncrement: true });
        };
        reqFuture.onsuccess = function (event) {
          const newDB = event.target.result;
          // uncheck in that log
          updateDB(content, content, day, tagList, flag, newDB);
        };
      });
    } else {
      const req = indexedDB.open('important');
      // init object store if not created
      req.onupgradeneeded = function (event) {
        const thisDB = event.target.result;
        thisDB.createObjectStore('entries', { autoIncrement: true });
      };
      req.onsuccess = function (event) {
        const newDB = event.target.result;
        removeEntryFromDB(divElement, content, newDB);
      };
    }
    console.log('remove important flag');
  }
  updateDB(content, content, day, tagList, flag);
}

function removeEntryFromDB (divElement, oldContent, newDB, callback = undefined) {
  // restrict db to this scope
  let thisDB = db;
  // Get the div element
  const date = divElement.className;
  console.log(date);
  // Use this specific DB to remove from, not the current one
  if (newDB !== undefined) {
    thisDB = newDB;
  }
  // Remove element from IndexedDB
  const transaction = thisDB.transaction(['entries'], 'readwrite');
  const objStore = transaction.objectStore('entries');
  const request1 = objStore.openCursor();
  const sectionParent = divElement.parentNode;
  request1.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor === null) {
      return;
    }
    if (cursor.value.content === oldContent && cursor.value.date === date) {
      const fullDate = cursor.value.date;
      console.log('delete key pressed');
      objStore.delete(cursor.key); // Delete appropriate element from DB
      divElement.remove(); // Delete div element from page
      removeHeader(sectionParent, newDB, fullDate);
      existingOptions.clear();
      while (filter.firstChild) {
        filter.removeChild(filter.lastChild);
      }
      const opt = document.createElement('option');
      opt.value = 'date';
      opt.innerHTML = 'Date (Default)';
      filter.appendChild(opt);
      existingOptions.add(opt.value);
      // clears all tags from the filter and adds the default date only
      document.querySelectorAll('section').forEach(e => e.remove());
      if (newDB !== undefined) {
        // finished with the new db
        thisDB.close();
      }
      getAndShowEntries(db, filter.value);
      return;
    }
    cursor.continue();
  };
  transaction.oncomplete = function () {
    // execute any callback functions now
    if (callback !== undefined) {
      callback();
    }
  };
}

/**
 * Checks to see if delete button clicked. If so, removes appropriate entry.
 * Otherwise checks to see if an entry was clicked. If so allows editing entry.
 * @function
 */
document.addEventListener('click', function (event) {
  const divElement = event.target.parentNode;
  let day;
  if (divElement !== null) {
    day = divElement.className;
  }

  // check for click on outside or inside timeline to close dropdown
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const isClickInside = timeline.contains(event.target);

    if (!isClickInside) {
      const content = document.querySelectorAll('.dropdown-content');
      for (let i = 0; i < content.length; i++) {
        content[i].style.display = 'none';
      }
    }
  }
  let oldContent;
  if (divElement !== null && divElement.querySelector('li') !== null) {
    oldContent = divElement.querySelector('li').innerText;
  }
  if (event.target.className === 'delete') {
    removeEntryFromDB(divElement, oldContent, undefined);
    // update respective log's flag, else also remove from important DB
    if (db.name === 'important') {
      updateFlag(event, true);
    } else {
      const req = indexedDB.open('important');
      req.onsuccess = function (event) {
        const newDB = event.target.result;
        // remove the entry
        removeEntryFromDB(divElement, oldContent, newDB);
      };
    }
  } else if (event.target.className === 'flag') {
    updateFlag(event);
  } else if (event.target.parentNode !== null && event.target.parentNode.className !== 'tl' && divElement.tagName === 'DIV' && divElement.parentNode.tagName === 'SECTION' && existingEntry === false && document.querySelector('textArea') === null) {
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
 * Checks to see if a header line needs to be removed from the database
 * and display and does so.
 * Any function calling this which passes in a defined newDB must close the newDB.
 */
function removeHeader (sectionParent, newDB = undefined, fullDate = '') {
  // remove header line from other database that is not being shown right now
  if (newDB !== undefined) {
    console.log('checking to remove remote header ' + sectionParent);
    const dateRemove = fullDate;
    // Remove element from IndexedDB
    const transaction = newDB.transaction(['entries'], 'readwrite');
    const objStore = transaction.objectStore('entries');
    // remaining number of entries with same date
    const requestRemainingEntries = objStore.openCursor();
    let headerKey = 0;
    requestRemainingEntries.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor === null) {
        // reached the end without finding remaining entries
        objStore.delete(headerKey);
        return;
      }
      if (cursor.value.content === dateRemove && cursor.value.date === dateRemove) {
        headerKey = cursor.key;
      } else if (cursor.value.date === dateRemove) {
        // found a remaining entry, stop searching, don't remove header
        return;
      }
      cursor.continue();
    };
    // the newDB is guaranteed to close by the calling function
  }
  // remove header line from page and database if it is now empty
  if (sectionParent.querySelectorAll('div').length === 0) {
    console.log('removing ' + sectionParent);

    const dateRemove = sectionParent.className;

    // Remove element from IndexedDB
    const transaction = db.transaction(['entries'], 'readwrite');
    const objStore = transaction.objectStore('entries');
    const request1 = objStore.openCursor();
    request1.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor === null) {
        return;
      }
      if (cursor.value.content === dateRemove && cursor.value.date === dateRemove) {
        objStore.delete(cursor.key); // Delete appropriate element from DB
        return;
      }
      cursor.continue();
    };

    sectionParent.remove();
  }
}

/**
 * Updates the database, replacing oldContent with entry
 * @param {string} entry The new content of the entry
 * @param {string} oldContent The old content of the entry that will be replaced by "entry"
 * @param {string} day The date of the entry
 * @param {array} tagList List of tags for the entry.
 * @param {boolean} flag The flag to add the entry to the "Important" log
 */
function updateDB (entry, oldContent, day, tagList, flag = false, newDB = undefined) {
  // restrict db to this scope
  let thisDB = db;
  const bullet = entry;
  // Use this specific DB to remove from, not the current one
  if (newDB !== undefined) {
    thisDB = newDB;
  }
  const transaction = thisDB.transaction(['entries'], 'readwrite');
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
  transaction.oncomplete = function () {
    if (newDB !== undefined) {
      // finished with the new db
      thisDB.close();
    }
  };
}

/**
 * Function to capitalize first letter in a string (for tags)
 * @param {string} str String to capitalize.
 * @return {string} Capitlized string.
 */
function capitalizeFirstLetter (str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Function to get tags
 * @param {string} str String to get tags from
 * @return {array} array of the tags.
 */
function tagGet (str) {
  const separatedString = str.split('#')[1];
  if (separatedString === undefined) {
    return null;
    // if the string has no tags then returns null array
  }
  const removedSpaces = separatedString.split(' ').join('');
  const removedEnter = removedSpaces.split('\n').join('');
  // removes whitespace and the enter character at the end
  const listedTags = removedEnter.split(',');
  // splits the tags into an array based on comma separation
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
  if (tags === undefined) {
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

/**
 * Lays out the timeline in terms of the last 12 months (starting from the current month) for the daily log.
 */
function createTimeline () {
  const allMonths = { 0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr', 4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug', 8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dec' };
  const validBold = {}; // approves highlighting of timeline based on month and year
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
    // console.log(allMonths[month]);

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
        // console.log(checkDate);
        for (let index = 0; index < entries.length; index++) {
          if (entries[index].className === checkDate) {
            entries[index].scrollIntoView({ behavior: 'smooth' });
            break;
          }
          // console.log('nav');
        }
      });

      // End navigating to certain day function

      monthClone.querySelector('ul').appendChild(listItem);
    }

    // console.log(monthClone.querySelector('p').innerText);
    monthClone.querySelector('p').addEventListener('click', event => {
      if (monthClone.querySelector('div').style.display === 'none') {
        monthClone.querySelector('div').style.display = 'inline-block';
      } else {
        monthClone.querySelector('div').style.display = 'none';
      }
    });
    // end of demo

    // console.log(timeClone.querySelector('ul'));
    timeClone.querySelector('ul').appendChild(monthClone);
    validBold[month + 1] = date.getFullYear();
    month = month - 1;

    // Case of rolling back to last December
    if (month === -1) {
      month = 11;
      date.setFullYear(date.getFullYear() - 1);
    }
    idx = idx - 1;
  }

  document.querySelector('aside').appendChild(timeClone);
  // console.log(validBold);
  // Scroll Event marking month position
  window.addEventListener('scroll', event => {
    const entries = document.querySelectorAll('section');

    let scrollCheck = false; // Used to check if the month is within the timeline in terms of the year
    let bolded = false; // Used to prevent other entries that are within the viewport getting their month bolded. Only looking for the first entry in the viewport
    let saveMonthText = null; // Used to the save the month to prevent other entries after the current with the same month overriding the bold text
    for (let i = 0; i < entries.length; i++) {
      const entryPos = entries[i].getBoundingClientRect();

      try {
        const monthText = document.getElementById(entries[i].className.substr(0, entries[i].className.indexOf('/')) - 1).querySelector('p'); // Month text on timeline
        // console.log(entries[i].className.substring(entries[i].className.lastIndexOf('/') + 1, entries[i].className.length));
        if ((validBold[entries[i].className.substring(0, entries[i].className.indexOf('/'))]) === Number(entries[i].className.substring(entries[i].className.lastIndexOf('/') + 1, entries[i].className.length))) {
          scrollCheck = true;
        } else {
          scrollCheck = false;
        }
        if (entryPos.top >= 0 && entryPos.left >= 0 && entryPos.bottom <= (window.innerHeight) && entryPos.right <= (window.innerWidth) && bolded === false && scrollCheck) {
          saveMonthText = monthText;
          monthText.style.fontWeight = 'bolder';
          bolded = true;
        } else {
          if (monthText !== saveMonthText) {
            monthText.style.fontWeight = 'normal';
          }
        }
      } catch (error) {
        // console.error(error);
      }
    }
  });
}

/**
 * Lays out the timeline in terms of the next 6 months (starting from the current month) for the future log.
 */
function createFutureTime () {
  // console.log('running');
  const allMonths = { 0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr', 4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug', 8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dec' };
  const allMonthsRev = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 };
  const date = new Date();
  const validBold = {}; // approves highlighting of timeline based on month and year
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
    // console.log(allMonths[month]);

    monthClone.id = month;

    // Copy over values due to block scope
    const checkMonth = month + 1;
    monthClone.querySelector('p').addEventListener('click', event => {
      const entries = document.querySelectorAll('section');
      const checkDate = checkMonth;
      const checkYear = date.getFullYear();
      // console.log(checkDate);
      for (let index = 0; index < entries.length; index++) {
        if (allMonthsRev[entries[index].className.substring(0, entries[index].className.indexOf(' '))] === checkDate && checkYear === Number(entries[index].className.substring(entries[index].className.indexOf(' ') + 1, entries[index].className.length))) {
          entries[index].scrollIntoView({ behavior: 'smooth' });
          break;
        }
        // console.log('nav');
      }
    });

    timeClone.querySelector('ul').appendChild(monthClone);
    month = month + 1;

    // Case of going to next year
    if (month === 12) {
      month = 0;
      date.setFullYear(date.getFullYear() + 1);
    }
    idx = idx - 1;
  }

  // Keep track of the next 6 months and their respective years
  const tempDate = new Date();
  let tempMonth = tempDate.getMonth() + 1;
  for (let i = 0; i < 6; i++) {
    // Case of going to next year
    if (tempMonth === 12) {
      tempMonth = 0;
      tempDate.setFullYear(tempDate.getFullYear() + 1);
    }
    validBold[tempMonth] = tempDate.getFullYear();
    tempMonth = tempMonth + 1;
  }

  document.querySelector('aside').appendChild(timeClone);

  // Scroll Event marking month position
  window.addEventListener('scroll', event => {
    const entries = document.querySelectorAll('section');

    let bolded = false; // Used to prevent other entries that are within the viewport getting their month bolded. Only looking for the first entry in the viewport
    let saveMonthText = null; // Used to the save the month to prevent other entries after the current with the same month overriding the bold text
    let scrollCheck = false; // Used to check if the month is within the timeline in terms of the year
    for (let i = 0; i < entries.length; i++) {
      const entryPos = entries[i].getBoundingClientRect();

      try {
        const monthText = document.getElementById(allMonthsRev[entries[i].className.substring(0, entries[i].className.indexOf(' '))] - 1).querySelector('p'); // Month text on timeline
        // console.log(typeof validBold[allMonthsRev[entries[i].className.substring(0, entries[i].className.indexOf(' '))]].toString());
        // console.log(typeof (entries[i].className.substring(entries[i].className.indexOf(' ') + 1, entries[i].className.length)));
        // Check if the year of that entry month is a valid month to highlight
        if ((validBold[allMonthsRev[entries[i].className.substring(0, entries[i].className.indexOf(' '))]]).toString() === (entries[i].className.substring(entries[i].className.indexOf(' ') + 1, entries[i].className.length))) {
          scrollCheck = true;
        } else {
          scrollCheck = false;
        }
        if (entryPos.top >= 0 && entryPos.left >= 0 && entryPos.bottom <= (window.innerHeight) && entryPos.right <= (window.innerWidth) && bolded === false && scrollCheck) {
          saveMonthText = monthText;
          monthText.style.fontWeight = 'bolder';
          bolded = true;
        } else {
          if (monthText !== saveMonthText) {
            monthText.style.fontWeight = 'normal';
          }
        }
      } catch (error) {
        // console.error(error);
      }
    }
  });
}
