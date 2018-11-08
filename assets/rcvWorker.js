"use strict";

const ballotBox = {};

// factorial function
const factorial = function(n) {
   for (let i = n - 1; i > 1; i--) {
      n *= i;
   }

   return n;
}

// generates an array containing numbers from 0 to n-1
const buildArray = function(n) {
   const output = [];

   for (let i = 0; i < n; i++) {
      output[output.length] = i;
   }

   return output;
}

// used to generate random ballots - faster if numCandidates is high (~9 and up or so?)
// works by generating individual ballots and putting them into the ballot box
const methods = {
   addBallot: function(votes) {
      if (typeof votes === "undefined") {
         throw new Error("argument is undefined (expected an array)");
      } else if (!Array.isArray(votes)) {
         throw new Error("argument is not an array.");
      }

      let keyName = votes.join("-");

      // conditionally adds a ballot object to the ballot box if that ballot has not yet been added
      // otherwise, it increments the count for that ballot
      if (typeof ballotBox[keyName] === "undefined") {
         ballotBox[keyName] = {
            count: 1,
            array: votes
         };
      } else {
         ballotBox[keyName].count++;
      }
   },

   // adds a randomized ballot for numCandidates number of candidates
   addRandomBallot: function(numCandidates) {
      const ballot = buildArray(numCandidates);

      // Fisher-Yates shuffle
      for (let i = numCandidates; i > 0; i--) {
         ballot[ballot.length-1] = ballot.splice(Math.floor(Math.random() * i), 1)[0]; // [0] because splice returns an array
      }

      // add scrambled ballot into ballotBox
      this.addBallot(ballot);
   },

   // adds numBallots number of randomized ballots, each with numCandidates number of candidates
   addRandomBallots: function(numBallots, numCandidates) {
      for (let i = 0; i < numBallots; i++) {
         this.addRandomBallot(numCandidates);
      }
   }
};

// also used to generate random ballots, WAAAAAAAAY faster for low numbers of candidates
// creates a ballot box with all ballot possibilities pre-represented
// then generates random numbers between 0 to (numCandidate! - 1) in order to generate random ballots
// because it has to pre-generate all ballot possibilities, there is too much upfront work when numCandidates is large
// pardon the messy code, I just wanted to get this working
const alternateMethods = {
   // holds result of heapsPermute
   result: [],

   // thanks to:  http://dsernst.com/2014/12/14/heaps-permutation-algorithm-in-javascript/
   heapsPermute: function (array, n) {

      const swap = function (array, pos1, pos2) {
         [ array[pos1], array[pos2] ] = [ array[pos2], array[pos1] ];
      };
   
      n = n || array.length; // set n default to array.length
   
      if (n === 1) {
         this.result[this.result.length] = [...array];
      } else {
         for (let i = 1; i <= n; i += 1) {
            let j;
   
            this.heapsPermute(array, n - 1);
   
            if (n % 2) {
               j = 1;
            } else {
               j = i;
            }
   
            swap(array, j - 1, n - 1); // -1 to account for javascript zero-indexing
         }
      }
   
      return this.result;
   },

   buildObject: function(input) {
      for (let i = 0; i < input.length; i++) {
         ballotBox[i] = {
            count: 0,
            array: input[i]
         }
      }
   },

   generateBallots: function(numBallots, ballotPossibilities, numCandidates) {
      for (let i = 0; i < numBallots; i++) {
         ballotBox[Math.floor(Math.random() * ballotPossibilities)].count++;
      }

      // rename keys to fix bug when generating random ballots for differing numbers of candidates
      for (let key in ballotBox) {
         ballotBox[`${numCandidates}-${key}`] = ballotBox[key];
         delete ballotBox[key];
      }
   }
};

// the part that actually listens for messages coming from the main thread (rcv.js) and kicks off the work
self.addEventListener('message', function(e) {
   const data = e.data;

   // if data.ballotPossibilities is null, use brute force method of random ballot generation
   if (!data.ballotPossibilities) {
      // generate the random ballots - faster for higher numbers of candidates
      methods.addRandomBallots(data.numBallots, data.numCandidates);
   
   // if data.ballotPossibilities === true, pregenerate ballot permutations on the worker thread, then do random number generation
   } else if (data.ballotPossibilities === true) {
      const permutations = alternateMethods.heapsPermute(buildArray(data.numCandidates));
      alternateMethods.buildObject(permutations);
      alternateMethods.generateBallots(data.numBallots, factorial(data.numCandidates), data.numCandidates);

   // otherwise, data.ballotPossibilities is a 2D array of ballot permutations; no need to generate ballot permutations on the worker threads
   } else {
      // generate random ballots - INSANELY faster for low numbers of candidates
      alternateMethods.buildObject(data.ballotPossibilities);
      alternateMethods.generateBallots(data.numBallots, factorial(data.numCandidates), data.numCandidates);
   }

   self.postMessage(ballotBox);
   self.close(); // web workers clean up after themselves by terminating
}, false);