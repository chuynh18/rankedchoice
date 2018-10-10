"use strict";

// ballot factory function
// accepts votes (array of natural numbers)
// number of elements in votes is how many "candidates" you're voting for
// order of elements is preference
// e.g. votes === [4, 2, 1, 0, 3] means there are five candidates with choice 1 being candidate 4
const createBallot = function(votes) {
   const ballot = {votes: votes};

   return ballot;
}

