# Use Jest to create/run unit tests

* Status: Accepted
* Deciders: Entire group

## Context and Problem Statement

We want to unit test our code often, preferably every time we modify it. How should we perform unit testing?

## Considered Options

* Make unit tests and run them manually whenever we decide to unit test
* Jest
* Tape
* Ava
* Cypress
* Mocha and Chai

## Decision Outcome

Chose option 2, Jest.

### Positive Consequences <!-- optional -->

* It is easy to integrate to our repository
* Runs each time we commit code
* Easy to use once it is set up and we know where to place unit test code

### Negative Consequences <!-- optional -->

* We still have to write the unit tests in order to get it to work
* Still somewhat of a learning curve to figure out where to place the tests and how to add it to our repo
