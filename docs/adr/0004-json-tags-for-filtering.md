# Adding JSON attribute for the tags

* Status: Accepted
* Deciders: Entire group

## Context and Problem Statement

How should we implement the tags functionality for filtering?

## Considered Options

* nested key-value pairings
* array of tags
* set group of tags with buttons to click to add

## Decision Outcome

Chose option 2 because it allows for the most flexibility and appears to make the most sense for our product.

### Positive Consequences <!-- optional -->

* Easy to use in code, allows for unlimited options, also pretty easy to use functionality-wise.

### Negative Consequences <!-- optional -->

* Could end up not being used by the user. Could end up taking a long time to load entries if lots of entries and lots of tag.
