# Use Code Inspector to ensure our code is of high quality

* Status: Accepted
* Deciders: Entire group

## Context and Problem Statement

We want our code to be of high quality, meaning our functions are efficient, our code is concise and compact and easily readable, etc.

## Considered Options

* Codacy
* Code Climate
* Manual Inspection
* Code Inspector

## Decision Outcome

Chose option 4.

### Positive Consequences <!-- optional -->

* It automatially evvaluates our code every time we commit to our repository
* Easily integrated to GitHub, just type in the repo link to the web app
* Presents a clean evaluation of our code with nice visualizations
  * e.g. it shows pie charts of important statistics like the number of functions with over 40 lines, percentage of duplicated code, etc.

### Negative Consequences <!-- optional -->

* No notifications or alerts when the code breaks some quality rules
* Have to create our own system/schedule of when to look at the dashboard and how we react to the data it shows
