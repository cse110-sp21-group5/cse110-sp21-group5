# Storing data locally using indexeddb

* Status: Accepted
* Deciders: Entire group

## Context and Problem Statement

We need to store data that users enter into the bullet journal persistently between use sessions. What infrastructure should we use to do this?

## Considered Options

* Cloud database (Firebase/Cloud Firestore)
* Local storage in browser (indexeddb)

## Decision Outcome

Chose option 2.

### Positive Consequences <!-- optional -->

* Reduces the burden on the user of having to create some credentials to access their data.
* Increases privacy because their data will not be accessible by us. 
* A data breach would only affect an individual user and not the entire user base.

### Negative Consequences <!-- optional -->

* Does not allow users to use the bullet journal across browsers or platforms.
