# Use a Single Scrolling Page to Contain the entire App

## Context and Problem Statement

We want the app to be easy to see and navigate through to minimize the time required to figure out how to use it.
How can we present the app?

## Considered Options

* [Single Flat Page] - Everything is visible on a single scrolling page (with tabs that change the displayed data for showing different ways of organizing the bullets)
* [Pop-up windows] – Take up less space on an initial launch page, user can click on e.g. a date and a popup window comes up overtop to let them type
* [Multiple Pages] - Use a new page for each way of organizing bullets, typing in a bullet, etc.
* 
## Decision Outcome

Chosen option: "Single Flat Page", because

* Having everything on one page makes it easier to navigate and difficult to get lost...there are only 2 ways to move, up and down.
* This fits with our minimalist theme.
* It reduces cognitive load by not requiring users to remember the way they took to get to a specific page. Decreasing cognitive demand fits with our goal of helping users become more efficient and focused.
* It does not require loading new pages, this is good for people who need a responsive app but have difficulties with internet speed/connectivity.

## Drawbacks
* Can get out of hand if there are too many bullets requiring a long scroll distance
    - How we address this: Scroll bar on the side to navigate by month/year, possible division of bullets into multiple pages (e.g. 100 per page)
