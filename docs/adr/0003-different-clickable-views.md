# Adding Clickable Tabs at the Top to change Journals while Mainting Single Page Style

* Status: Accepted
* Deciders: Entire group

## Context and Problem Statement

How should we implement the multiple different journals while keeping the single page style? Should we just have one long running journal? How can we keep single page integrity with a multi-page design?

## Considered Options

* Long-running page
* Different pages instead of single-page design
* Different tabs on same page

## Decision Outcome

Chose option 3 because it makes it the easiest for navigation and for user use, very straightforward and very visible on the page.

### Positive Consequences <!-- optional -->

* Easy navigation, makes the most sense for our time constraints and our designs.

### Negative Consequences <!-- optional -->

* Could run into trouble implementing the different pages and how we load content into the different tabs, each one has to have the associated journal entries so have to differentiate those in our javascript.
