# Use semistandard js for our code style  

* Status: Accepted
* Deciders: Entire group

## Context and Problem Statement

We want to have a set coding style for our project so that it will be easier to read and get used to. What style should we use and how to we enforce it?

## Considered Options

* StandardJS enforced manually
* StandardJS enforced automatically
* SemistandardJS enforced manually
* SemistandardJS enforced automatically via StandardJS Plugin on VSCode

## Decision Outcome

Chose option 4.

### Positive Consequences <!-- optional -->

* It is automatically enforced in the IDE
* Brings automatic style enforcement
* Workload for ensuring our code meets style guidelines is distributed between each developer
* Each developer only responsible for ensuring their own code meets style guidelines

### Negative Consequences <!-- optional -->

* At least one team member prefers not using the semicolon in the standard
* Limits freedom to choose whether we take one or another route with our style (also one of the benefits)
