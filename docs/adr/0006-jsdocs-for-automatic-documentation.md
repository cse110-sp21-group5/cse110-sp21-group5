# Automatically creating documentation use JSDocs   

* Status: Accepted
* Deciders: Entire group

## Context and Problem Statement

We want to create developer documentation for posterity, i.e. people who enter the project and need to figure out what functions are available and what the do. How should we create this documentation?

## Considered Options

* Documentation in code, i.e. leave comments above each function with a complete description. Then, manually compile a list of all functions and where to find their descriptions.
* JSDocs, i.e. add JSDocs style comments above each method and let it compile the documentation automatically

## Decision Outcome

Chose option 2.

### Positive Consequences <!-- optional -->

* Reduces the burden on the developer of having to add documentation to the centralized document manually.
* Saves time.
* Is simple to use, just add a specific type of comment at the top of each function. 
* Quick learning curve because many of us have used already JavaDocs which is almost identical.

### Negative Consequences <!-- optional -->

* Limits us to the documentation style that JSDocs creates, see the documentation section to see what this looks like
