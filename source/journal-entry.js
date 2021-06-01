// <journal-entry> custom web component
class JournalEntry extends HTMLElement {
  constructor () {
    super();

    // templated HTML content
    const template = document.createElement('template');

    template.innerHTML = `
        <style>
            .entry {
                background-color: white;
                border-radius: 6px;
                list-style-type: none;
                margin-bottom: 30px;
                max-width: 700px;
                padding: 20px;
                width: 70%;
                margin: 20px auto;
                box-shadow: 0 2px 2px -2px rgba(0, 0, 0, 0.8);
            }
            @media (max-width: 500px) {
                .entry {
                    margin-left: 30px;
                }
            }
            .entry-audio {
                margin: 10px 0;
                width: 95%;
            }
            .entry-content {
                font-size: 20px;
                margin: 10px 0;
                text-indent: 30px;
            }
            .entry-date {
                color: rgb(163, 163, 163);
                font-size: 20px;
                margin-top: 3px;
                margin-bottom: 20px;
            }
            .entry-image {
                height: 100%;
                max-height: 350px;
                max-width: 550px;
            }
            .entry-title {
                margin-bottom: 5px;
                margin-top: 5px;
            }
        </style>
        <article class="entry">
            <h2 class="entry-title"></h2>
            <p class="entry-date"></p>
            <p class="entry-content"></p>
        </article>
        `;

    // create a shadow root for this web component
    this.attachShadow({ mode: 'open' });
    // attach cloned content of template to shadow DOM
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  /*
   * `get` binds a property to a function that will be called when that property is looked up
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
   */
  get entry () {
    return this.getAttribute('entry');
  }

  /*
   * `set` binds an object property to a function to be called when there is an attempt to set that property
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set
   */
  set entry (entry) {
    console.log();
    this.shadowRoot.querySelector('.entry-title').innerHTML = entry.title;
    this.shadowRoot.querySelector('.entry-date').innerHTML = entry.date;
    this.shadowRoot.querySelector('.entry-content').innerHTML = entry.content;

    this.setAttribute('entry', entry);
    document.body.appendChild(this);
  }
}

/*
 * Define a custom element for the JournalEntry web component,
 * where 'journal-entry' is the string that represents this element.
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
customElements.define('journal-entry', JournalEntry);

/**
 * JSON Format:
 * image and audio will only sometimes be there
 *
 * {
 *   title: 'foo',
 *   date: 'foo',
 *   content: 'foo',
 *   image: {
 *     src: 'foo.com/bar.jpg',
 *     alt: 'foo'
 *   },
 *   audio: 'foo.com/bar.mp3'
 * }
 */
