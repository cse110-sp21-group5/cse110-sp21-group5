// This is where we will write our JS

// select the <a> tags used for navigation at the top of the page
const dispBar = document.querySelectorAll('.nav a');
const newEntry = document.querySelector('[class=addEntry]');
const form = document.createElement('form');
const textArea = document.createElement('textarea');
textArea.focus();
let existingEntry = false;
form.append(textArea);
textArea.setAttribute('rows', 3);
textArea.setAttribute('cols', 50);
let tab;

/**
 * define a dictionary for month names and numbers 
 */
let dict = [];
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

for (key in dict) {
  dict[dict[key]] = key;
}

const request = indexedDB.open('daily', 1);
let db;
request.onerror = function (event) {
  console.log('Error opening IndexedDB');
};

request.onsuccess = function (event) {
  db = event.target.result;
  getAndShowEntries(db);
};

request.onerror = function (event) {
  console.error('IndexedDB erorr: ' + event.target.errorCode);
};

request.onupgradeneeded = function (event) {
  db = event.target.result;
  entries = db.createObjectStore('entries', { autoIncrement: true });
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
    tab = document.querySelector('.active').attributes['href'].value.substring(1);
    clearPage();
    const req = indexedDB.open(tab, 1);
    
    req.onerror = function (event) {
      console.log('Error opening IndexedDB');
    };

    req.onupgradeneeded = function (event) {
      db = event.target.result;
      db.createObjectStore('entries', { autoIncrement: true });
    };
    
    req.onsuccess = function (event) {
      db = event.target.result;
      getAndShowEntries(db);
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
function clearPage() {

  let sxn = document.querySelectorAll('section, hr');

  sxn.forEach(s => {
    s.remove();
  });
}

/**
 * Appends the created form to 'main' when "New Entry" is clicked
 * @function
 */

newEntry.addEventListener('click', () => {
  
  if (document.querySelector('section') === null) {
    document.querySelector('main').append(form);
  } else {
    document.querySelector('section').append(form);
  }

  if (form.querySelector('input') != null) {
    form.querySelector('input').remove();
  }

  if (db.name == 'future') {
    
    let dateIn = document.createElement('input');
    dateIn.type = 'date';
    form.append(dateIn);
  }

  textArea.focus();
  document.querySelector('.addEntry').remove();
  document.querySelector('main').append(newEntry);
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
 * Adds a new bullet to the current date and stores the data in the database (IndexedDB)
 */
function addEntry () {
  // Checks to see if the input is empty
  if (textArea.value.length === 1) {
    document.querySelector('form').remove();
    textArea.value = '';
    return;
  }

  if (db.name == 'daily') {

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
      //document.querySelector('main').append(section);
      addEntrytoDB(db, newEntryTitle, newEntryTitle.innerText);
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
        //document.querySelector('main').append(section);
        addEntrytoDB(db, newEntryTitle, newEntryTitle.innerText);
      }
    }
    newEntry.innerText = textArea.value;
    entryDiv.append(newEntry);
    section.append(entryDiv);
    document.querySelector('form').remove();
    textArea.value = '';

    addEntrytoDB(db, entryDiv, date);

  } else if (db.name == 'future') {

    let dateInput = form.querySelector('[type=date]').value; 
    let date = parseDateInput(dateInput);
    let month = extractMonth(date);

    const entryDiv = document.createElement('div');
    entryDiv.className = month;
    const newEntry = document.createElement('li');
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete';
    entryDiv.append(deleteButton);
    const sectionList = document.querySelectorAll('section');
    let sectionExists = false;
    let section;
    
    if (sectionList !== null) {
      sectionList.forEach(sec => {
        if (sec.className === month) {
          sectionExists = true;
          section = sec;
        }
      });
    }
    
    if (sectionExists === false) {

      section = document.createElement('section');
      section.className = month;
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
      newEntryTitle.innerText = month;
      section.append(newEntryTitle);
      //document.querySelector('main').append(section);
      addEntrytoDB(db, newEntryTitle, newEntryTitle.innerText);
    } else {
      
      let dateExists = false;

      const h3List = document.querySelectorAll('h3');
      h3List.forEach(h3 => {
        if (h3.innerText === month) {
          dateExists = true;
        }
      });

      if (dateExists === false) {
        const newEntryTitle = document.createElement('h3');
        newEntryTitle.innerText = month;
        section.append(newEntryTitle);
        //document.querySelector('main').append(section);
        addEntrytoDB(db, newEntryTitle, newEntryTitle.innerText);
      }
    }

    newEntry.innerText = textArea.value;
    entryDiv.append(newEntry);
    section.append(entryDiv);
    document.querySelector('form').remove();
    textArea.value = '';

    addEntrytoDB(db, entryDiv, date);
    
  }
}

/**
 * //parse dateInput (yyyy-mm-dd) to date (m/d/y)
 * @param {string} date in string format from the input box 
 */
function parseDateInput(dateInput) {

  let date = dateInput.substring(dateInput.indexOf('-') + 1);
  date = date.replace('-', '/');
  //remove 0 from months starting with 0
  if (date.charAt(0) == '0') {
    date = date.substring(1);
  }
  //remove 0 from days starting with 0
  if (date.charAt(date.indexOf('/') + 1) == '0') {
    date = date.substring(0, date.indexOf('/') + 1) + date.substring(date.indexOf('/') + 2);
  }
  return date.concat('/' + dateInput.substring(0, dateInput.indexOf('-')));
}

/**
 * Retrieves the entries of the database and shows the entries on the screen
 * @param  database The database that will be used to display entries
 */
function getAndShowEntries (database) {
  const transaction = database.transaction(['entries'], 'readonly');
  const objStore = transaction.objectStore('entries');
  const request1 = objStore.openCursor();
  const entries = [];
  request1.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor !== null) {
      //console.log(cursor.value);
      entries.push(cursor.value);
      //console.log(entries.length);
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

  if (textArea.value.length === 1) {
    document.querySelector('form').remove();
    textArea.value = '';
    return;
  }

  if (db.name === 'daily') {
    entries.forEach((entry) => {

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
          document.querySelector('main').insertBefore(document.createElement('hr'), sec);
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

  } else if (db.name === 'future') {
    
    entries.forEach((entry) => {
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete';
      
      const entryDiv = document.createElement('div');      
      entryDiv.className = entry.date;
      entryDiv.append(deleteButton);
      
      const sectionList = document.querySelectorAll('section');
      let section;
      let sectionExists = false;

      if (sectionList !== null) {
        sectionList.forEach(sec => {
          if (sec.className === extractMonth(entry.date)) {
            sectionExists = true;
            section = sec;
          }
        });
      }

      if (sectionExists === false) {
        section = document.createElement('section');
        section.className = entry.date;
        const sec = document.querySelector('section');

        document.querySelector('main').append(section);
        document.querySelector('main').append(document.createElement('hr'));

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

  } else {
    console.error('this tab is not yet supported');
  } 
}

/**
 * Takes a date in string form and returns the string name of the month it is in 
 * @param {string} date a m/d/y date in string form   
 */
function extractMonth(date) {

  month = Number(date.substring(0, date.indexOf('/')));

  return dict[month];
}

/**
 * Adds the given entry to the database
 * @param  database The database that entries will be added to
 * @param {Object} entry The entry that will be added to the database
 * @param {string} day The day the entry was made
 */
function addEntrytoDB (database, entry, day) {
  let transaction;
  let objStore;
  const entryText = entry.innerText;
  const entryObject = { content: entryText, date: day };

  let date; 
  if (form.querySelector('input')) {
    date = parseDateInput(form.querySelector('input').value);
  }

  if (database.name === 'daily') {
    transaction = database.transaction(['entries'], 'readwrite');
    objStore = transaction.objectStore('entries');
    objStore.add(entryObject);  
  } else if (database.name == 'future') {
    
    console.log("placing");

    if (day.indexOf('/') == -1) {
      //if we're inserting a month header 

      let lastKey = 0; 
      let placed = false;

      transaction = database.transaction(['entries'], 'readwrite');
      objStore = transaction.objectStore('entries');

      const request1 = objStore.openCursor();
      request1.onsuccess = function (event) {

        let cursor = event.target.result;
        if (cursor) {
          if (isLaterThan(date, cursor.value.date) == -1) {
            //insert a new month header 
            let newKey = lastKey + ((cursor.key - lastKey) / 2);
            objStore.add({content: extractMonth(date), date: extractMonth(date)}, newKey);
            console.log("placed1");
            placed = true; 
            return;
          }

          lastKey = cursor.key;
          cursor.continue();
        } else {
          objStore.add({content: extractMonth(date), date: extractMonth(date)});
          console.log("end1");
        }
      };
      
      /*if (placed == false) {
        objStore.add({content: extractMonth(date), date: extractMonth(date)});
        console.log("end1");
      }*/
    } else {
      //we're inserting a full entry, not a month header 
      let lastKey = 0; 
      let placed = false;

      transaction = database.transaction(['entries'], 'readwrite');
      objStore = transaction.objectStore('entries');

      const request1 = objStore.openCursor();
      request1.onsuccess = function (event) {

        let cursor = event.target.result;
        if (cursor) {        
          if (isLaterThan(date, cursor.value.date) == -1) {
            let newKey = lastKey + 0.000001;
            objStore.add({content: entryText, date: date}, newKey);
            console.log("placed2");
            placed = true; 
            return;
          } 
          
          lastKey = cursor.key;
          cursor.continue();
        } else {
          objStore.add({content: entryText, date: date});
          console.log("end2");
        }
      };
    }
  }
  
  transaction.oncomplete = function () {
    console.log('Data entered into database');
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
function isLaterThan(d1, d2) {

  if (d1 == d2) {
    return 0;
  } 

  if (d1.indexOf('/') == -1 && d2.indexOf('/') == -1) {

    if (dict[d1] > dict[d2]) {
      return 1;
    } 
    if (dict[d1] < dict[d2]) {
      return -1;
    }
  }

  if (d1.indexOf('/') == -1) {
    
    let month = extractMonth(d2);
    if (month == d1) {
      return 0;
    }
    if (dict[month] > dict[d1]) {
      return 1;
    }
    if (dict[month] < dict[d1]) {
      return -1;
    }
  }

  if (d2.indexOf('/') == -1) {
    
    let month = extractMonth(d1);
    if (month == d2) {
      return 0;
    }
    if (dict[month] > dict[d2]) {
      return 1;
    }
    if (dict[month] < dict[d2]) {
      return -1;
    }
  }

  let year1 = d1.substring(d1.lastIndexOf('/'));
  let year2 = d2.substring(d2.lastIndexOf('/'));

  if (year1 > year2) {
    return 1;
  } else if (year1 < year2) {
    return -1
  }

  let month1 = d1.substring(0, d1.indexOf('/'));
  let month2 = d2.substring(0, d2.indexOf('/'));

  if (month1 > month2) {
    return 1;
  } else if (month1 < month2) {
    return -1;
  }

  let day1 = d1.substring(d1.indexOf('/') + 1, d1.lastIndexOf('/'));
  let day2 = d2.substring(d2.indexOf('/') + 1, d2.lastIndexOf('/'));

  if (day1 > day2) {
    return 1;
  } else if (day1 < day2) {
    return -1;
  }

  console.error('date comparison error ' + d1 + " " + d2);
  return 0;
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
    console.log(divElement);
    const content = divElement.innerText;
    const date = divElement.className;
    // Remove element from IndexedDB
    const transaction = db.transaction(['entries'], 'readwrite');
    const objStore = transaction.objectStore('entries');
    const request1 = objStore.openCursor();
    
    let sectionParent = divElement.parentNode;
    console.log(sectionParent.querySelectorAll('div').length);
    
    request1.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor === null) {        
        return;
      }
      if (cursor.value.content === content && cursor.value.date === date) {
        objStore.delete(cursor.key); // Delete appropriate element from DB
        divElement.remove(); // Delete div element from page
        
        removeHeader(sectionParent);

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
        textBox.remove();
        divElement.append(editedEntry);
        existingEntry = false;
        // Update appropriate entry in DB
        updateDB(editedEntry.innerText, oldContent, day);
      }
    });
  }
});

/**
 * Checks to see if a header line needs to be removed from the database and display and does so 
 * 
 */
function removeHeader(sectionParent) {
  
  //remove header line from page and database if it is now empty
  if (sectionParent.querySelectorAll('div').length == 0) {
          
    console.log('removing ' + sectionParent)

    let dateRemove = sectionParent.className;

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
 */
function updateDB (entry, oldContent, day) {
  const bullet = entry;
  const transaction = db.transaction(['entries'], 'readwrite');
  const objStore = transaction.objectStore('entries');
  const request1 = objStore.openCursor();
  const newContent = { content: bullet, date: day };
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
