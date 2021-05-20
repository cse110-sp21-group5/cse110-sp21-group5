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

/**
 * Adds event listeners to all elements of the navigation bar selected in dispBar
 */
for (let i = 0; i < dispBar.length; i++) {
    
    dispBar[i].addEventListener('click', function() {
        
        clrActive();
        
        dispBar[i].classList.add("active");
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
        
        if (entry != entries[0]) {
          const hLine = document.createElement('hr');
          document.querySelector('body').insertBefore(hLine, newPost);
        }
      });
    })
    .catch(error => {
      console.log(`%cresult of fetch is an error: \n"${error}"`, 'color: red');
    });
});
