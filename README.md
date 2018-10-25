# Ranked Choice Voting

## Meta

The structure and contents of this README will change as development progresses.

## Introduction

This is intended to be an interactive educational site, explaining how Ranked Choice Voting works.  The exact shape and feel of the site is to be finalized, but we anticipate having a virtual ballot that users can fill out, then they can watch the RCV process at work "live".  That is, they can see how their ballot is tallied, with candidates they favored potentially being eliminated, and their backup candidates being considered.  They will also see vote counts as the RCV process progresses, and how eliminated candidates' votes are redistributed to surviving candidates.

## Practical info for the team - how to use the RCV logic

Currently, all the necessary RCV logic is complete enough to build a first-pass version of the site.  I'll walk you through the various methods available and how they can help us get to a minimum viable product.

### How to generate ballots manually

Use the box.addBallots(_numBallots_, _[ballot]_) method.
* _numBallots_ is a natural number (1, 2, 3...) representing how many ballots you wish to put into the ballot box.
* _[ballot]_ is an array of natural numbers starting from 0.  Its length is the number of candidates you wish to have exist, while the order of its elements are the order of preference for the candidates.
* As an example, calling `box.addBallots(1000, [0, 1, 2, 3]);` would add one thousand identical ballots to the ballot box that are voting for candidate 0 as the first choice, candidate 1 as the second choice, candidate 2 as the third choice, and candidate 3 as the fourth choice.
* It is possible to insert ballots of mixed lengths into the ballot box, and this will not cause any issues at all.

### How to generate ballots randomly

Use the box.addRandomBallots(_numBallots_, _numCandidates_) method.
* As with the manual method, _numBallots_ is a natural number (1, 2, 3...) representing how many ballots you wish to put into the ballot box.
* _numCandidates_ is a natural number representing the number of candidates you wish to have on the ballot.
* This method will always generate ballots that are permutations of [0, 1, 2, ..., n-2, n-1] for _numCandidates_ === n.

### How to view the current contents of the ballot box

Use the box.debugEnumerateVotes() method.  This will simply console.log out the value of the ballot box.

### How to reset the ballot box

Use the box.resetBallotBox() method.  This method is useful to call if we want to allow the user to rerun the RCV simulation.

### How to compute the results of Ranked Choice Voting

Use the box.runRCV() method.  This will take the current ballot box and compute the winner of the election.  The return value of this method is an object showing the results of each round of the RCV process.  Keys are of the format _round0_, _round1_, ... _roundN_.  There is also a _stats_ key that exposes info about the entire election, such as ballots casted, number of rounds taken to determine a winner, and the election winner.

All _round_ keys will have keys representing candidates that are still in the running.  All candidate keys in all rounds will have the following keys:
* _votes_, representing the number of votes the candidate has earned in that round.
* _percent_, representing the percent of the vote the candidate has obtained.

All _round_ keys except the final round will have an _eliminatedCandidate_ key, representing the candidate that obtained the fewest votes in that round (and thus is eliminated from future rounds).  The eliminated candidate's votes are redistributed to surviving candidates appropriately based on the preferences of the relevant ballots.

All _candidate_ keys in rounds other than _round0_ will contain the following key in addition to _votes_ and _percent_:
* _gain_, representing the number of votes the candidate gained from the candidate who was eliminated in the previous round.

The data in the object returned by box.runRCV() will be useful in generating the graphs to help illustrate how the RCV process works.  While additional data may be necessary, this should be all we need to make an interesting minimally viable product.