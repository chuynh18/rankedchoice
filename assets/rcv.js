"use strict";

// ballot box factory function
const createBallotBox = function() {
   // holds ballots in a private variable
   let ballotBox = {};

   // holds eliminated candidates
   const eliminatedCandidates = [];

   // method to get timestamp in millis
   const getTime = function() {
      const date = new Date();
      return date.getTime();
   }

   // variable to store permutations that heapsPermute builds
   const heapsPermuteResult = [];
   
   // private method that iterates through the ballotBox and tallies up the votes
   // placeNumber is the desired place of the candidate
   // e.g. placeNumber === 0 returns the first place candidate, 1 returns the runner-up, etc.
   const tallyVotes = function(placeNumber) {
      const result = {};

      if (typeof placeNumber === "undefined") {
         console.log("Warning:  argument placeNumber is undefined; defaulting to 0.");
      }

      // iterate through ballotBox and tally up the votes
      for (let ballots in ballotBox) {
         const currentBallot = ballotBox[ballots].array;
         const modifiedBallot = [];

         // ensure we don't count eliminated candidates
         for (let j = 0; j < currentBallot.length; j++) {
            if (eliminatedCandidates.indexOf(currentBallot[j]) === -1) {
               modifiedBallot[modifiedBallot.length] = currentBallot[j];
            }
         }

         // this is where we actually count votes
         if (typeof result[modifiedBallot[placeNumber]] === "undefined") {
            result[modifiedBallot[placeNumber]] = {votes: ballotBox[ballots].count};
         } else {
            result[modifiedBallot[placeNumber]].votes += ballotBox[ballots].count;
         }
      }

      return result;
   }

   // private method that eliminates a specific candidate on all ballots in ballotBox
   const eliminateCandidate = function(candidateNumber) {
      if (typeof candidateNumber !== "number") {
         // explicit type coercion:  make sure typeof candidateNumber === "number".  unary + is equivalent to Number()
         candidateNumber = +(candidateNumber);

         console.log("Warning:  type of argument candidateNumber is not number.  It has been coerced into a number, but unexpected behavior may occur.");
      }

      if (typeof candidateNumber === "undefined") {
         throw new Error("argument candidateNumber is undefined.");
      } else if (eliminatedCandidates.indexOf(candidateNumber) !== -1) {
         throw new Error(`candidate ${candidateNumber} has already been eliminated.`);
      } else {
         eliminatedCandidates[eliminatedCandidates.length] = candidateNumber;
      }
   }

   // resets the eliminatedCandidates array to []
   const resetEliminatedCandidates = function() {
      eliminatedCandidates.length = 0;
   }

   // merge ballot objects
   const mergeBallots = function(anotherBox) {
      if (typeof anotherBox !== "object") {
         throw new Error("argument is not an object");
      } else {
         for (let ballot in anotherBox) {
            if (typeof ballotBox[ballot] === "undefined") {
               ballotBox[ballot] = anotherBox[ballot];
            } else {
               ballotBox[ballot].count += anotherBox[ballot].count;
            }
         }
      }
   }

   // help keep code DRY
   const getNumBallotsInObj = function(obj) {
      let count = 0;

      for (let keys in obj) {
         count += obj[keys].count;
      }

      return count;
   }

   // generates an array containing numbers from 0 to n-1
   const buildArray = function(n) {
      const output = [];

      for (let i = 0; i < n; i++) {
         output[output.length] = i;
      }

      return output;
   }

   // ballot box object that will be returned; contains public methods that the view will call
   const self = {
      // empties ballotBox (in effect resetting the state of the RCV site)
      resetBallotBox: function() {
         ballotBox = {};
      },

      // returns the number of ballots in ballotBox
      getNumBallots: function() {
         return getNumBallotsInObj(ballotBox);
      },

      // returns the number of unique ballots in ballotBox
      getNumUniqueBallots: function() {
         return Object.keys(ballotBox).length;
      },

      // runs RCV algorithm and returns complete election results
      runRCV: function() {
         const numBallots = this.getNumBallots();
         const winThreshold = numBallots/2;
         let winnerExists = false;
         let round = 0;
         const electionResults = {
            stats: {totalBallots: numBallots}
         };

         if (numBallots === 0) {
            throw new Error("No ballots present in ballot box.");
         }
         
         // WARNING:  be careful when iterating over electionResults.roundN objects.
         // at the end of the while loop, eliminatedCandidate is appended to the roundN object.
         // the eliminatedCandidate key is very different than the candidate keys
         // generally, take care to iterate over the roundN object instead of roundN-1
         // this is because roundN will likely not have the eliminatedCandidate key yet.
         while (!winnerExists) {
            let minNumofVotes = winThreshold;
            const losingCandidate = [];

            // store results of current round into electionResults object
            electionResults["round"+round] = tallyVotes(0);

            // expose fraction of vote
            for (let candidate in electionResults["round"+round]) {
               // toPrecision(6) to hide floating point artifacts.
               electionResults["round"+round][candidate].percent = +((100 * (electionResults["round"+round][candidate].votes / electionResults.stats.totalBallots)).toPrecision(6));
            }

            // show how much each candidate gained
            if (round !== 0) {

               for (let candidate in electionResults["round"+round]) {
                  electionResults["round"+round][candidate].gain = electionResults["round"+round][candidate].votes - electionResults["round"+(round-1)][candidate].votes;
               }
            }

            // determine existence and identity of overall winner
            for (let candidate in electionResults["round"+round]) {
               if (electionResults["round"+round][candidate].votes > winThreshold) {
                  winnerExists = true;
                  electionResults.stats.winner = +(candidate);
                  electionResults.stats.lastRound = round;
                  electionResults.stats.roundsTaken = round + 1;
                  
                  // by resetting the state of eliminatedCandidates before returning,
                  // we ensure the perceived idempotence of the runRCV method
                  resetEliminatedCandidates();
                  return electionResults;
               }
            }

            // determine last place candidate(s)
            for (let candidate in electionResults["round"+round]) {
               if (minNumofVotes > electionResults["round"+round][candidate].votes) {
                  minNumofVotes = electionResults["round"+round][candidate].votes;
                  losingCandidate.length = 0;
                  losingCandidate[losingCandidate.length] = +candidate; // gotcha!  candidate is a key name, so it's a string.  coercing it back to a number
               } else if (minNumofVotes === electionResults["round"+round][candidate].votes) {
                  losingCandidate[losingCandidate.length] = +candidate; // same as above
               }
            }

            // handle ties for last place
            // opportunity to make the code more robust by handling repeated ties
            if (losingCandidate.length > 1) {
               const tiebreaker = tallyVotes(1);
               let minTiebreakerVotes = tiebreaker[losingCandidate[0]];
               let loser = losingCandidate[0];

               for (let i = 1; i < losingCandidate.length; i++) {
                  if (minTiebreakerVotes > tiebreaker[losingCandidate[i]]) {
                     minTiebreakerVotes = tiebreaker[losingCandidate[i]];
                     loser = losingCandidate[i];
                  }
               }

               eliminateCandidate(loser);
               electionResults["round"+round].eliminatedCandidate = loser;
            } else {
               eliminateCandidate(losingCandidate[0]);
               electionResults["round"+round].eliminatedCandidate = losingCandidate[0];
            }

            round++;
         }
      },

      // adds numBallots number of user-defined ballots
      addBallots: function(numBallots, votes, suppress) {
         if (typeof votes === "undefined") {
            throw new Error("argument is undefined (expected an array)");
         } else if (!Array.isArray(votes)) {
            throw new Error("argument is not an array.");
         }

         let keyName = "";

         for (let i = 0; i < votes.length - 1; i++) {
            keyName += `${votes[i]}-`;
         }
         keyName += votes[votes.length - 1];

         // conditionally adds a ballot object to the ballot box if that ballot has not yet been added
         // otherwise, it increments the count for that ballot
         if (typeof ballotBox[keyName] === "undefined") {
            ballotBox[keyName] = {
               count: numBallots,
               array: votes
            };
         } else {
            ballotBox[keyName].count += numBallots;
         }

         // suppress "Ballots added." message because other methods use addBallots
         if (!suppress) {
            console.log("Ballots added.");
         }
      },

      // adds one user-defined ballot (remember, votes is an array - see comment above createBallot factory function)
      addBallot: function(votes) {
         this.addBallots(1, votes, true);
         console.log("Ballot added.");
      },

      // adds a randomized ballot for numCandidates number of candidates
      addRandomBallot: function(numCandidates, suppress) {
         const ballot = buildArray(numCandidates);

         // Fisher-Yates shuffle
         for (let i = numCandidates; i > 0; i--) {
            ballot[ballot.length-1] = ballot.splice(Math.floor(Math.random() * i), 1)[0]; // [0] because splice returns an array
         }

         // add scrambled ballot into ballotBox
         this.addBallots(1, ballot, true);

         // optionally suppress this console.log statement because addRandomBallotsLegacy runs this method in a for loop
         if (!suppress) {
            console.log("Ballot added.");
         }
      },

      // thanks to:  http://dsernst.com/2014/12/14/heaps-permutation-algorithm-in-javascript/
      heapsPermute: function (array, n) {

         const swap = function (array, pos1, pos2) {
            [ array[pos1], array[pos2] ] = [ array[pos2], array[pos1] ];
         };
      
         n = n || array.length; // set n default to array.length
      
         if (n === 1) {
            heapsPermuteResult[heapsPermuteResult.length] = [...array];
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
      
         return heapsPermuteResult;
      },

      // same as addRandomBallotsLegacy, but work is done inside a web worker
      // legacy method is called by this method if web worker support is not detected
      addRandomBallots: function(numBallots, numCandidates, threads) {
         const startTime = getTime();

         // a two-dimensional array holding all permutations of possible ballots
         let permutations;

         // generate permutations on main thread, pass permutations array to worker threads
         if (numCandidates <= 7) {
            // clean heapsPermuteResult before running heapsPermute
            heapsPermuteResult.length = 0;

            permutations = this.heapsPermute(buildArray(numCandidates));
            console.log(`Permutations generated in ${getTime() - startTime} milliseconds.`);

            // try to use a sane number of threads if no explicit value was assigned
            if (typeof threads !== "number") {
               if (numBallots < 1E7) {
                  threads = 1; // because 1 thread is actually faster for this number of ballots and candidates
               } else {
                  threads = navigator.hardwareConcurrency || 4;
               }
            }
         
         // for 8 and 9 candidates, it's still faster to pre-generate permutations, but it's faster to have the worker threads do the generation
         } else if (numCandidates === 8 || numCandidates === 9) {
            // permutations array is large, so rather than copying it, let's have all worker threads generate it instead
            permutations = true;
            console.log("Building permutations locally on each worker thread.");

            // try to use a sane number of threads if no explicit value was assigned
            if (typeof threads !== "number") {
               if (numBallots < 1E7) {
                  threads = 1; // because 1 thread is actually faster for this number of ballots and candidates
               } else {
                  threads = navigator.hardwareConcurrency || 4;
               }
            }
            
         // for 10 or more candidates, it's faster to just brute force generate ballots one by one
         // but don't generate too many ballots!  only generate a few million at most.
         } else {
            permutations = null;

            // try to use a sane number of threads if no explicit value was assigned
            if (typeof threads !== "number") {
               if (numBallots < 1E5) {
                  threads = 1;
               } else {
                  threads = navigator.hardwareConcurrency || 4;
               }
            }
         }

         // figure out how many ballots each thread needs to be responsible for
         const ballotsPerThread = Math.floor(numBallots / threads);
         const remainder = numBallots % threads;
         const bigBallot = ballotsPerThread + remainder;
         const worker = [];
         const endTime = [];

         // dole out work to threads (web workers)
         if (window.Worker) {
            for (let i = 0; i < threads; i++) {

               worker[i] = new Worker("assets/rcvWorker.js");

               // event listener that listens for the message coming from the web workers when they finish
               worker[i].addEventListener('message', function(e) {
                  mergeBallots(e.data);
                  console.log(`Thread ${i} added ${getNumBallotsInObj(e.data)} ballots.`);

                  // get true end time, even when multithreaded
                  endTime[endTime.length] = getTime();

                  if (endTime.length === threads) {
                     let trueEndTime = endTime[0];

                     for (let i = 1; i < endTime.length; i++) {
                        if (trueEndTime < endTime[i]) {
                           trueEndTime = endTime[i];
                        }
                     }

                     console.log(`Operation completed in ${trueEndTime - startTime} milliseconds.`);
                  }

               }, false);
      
               // Thread zero may be responsible for a tiny number of extra ballots in case numBallots % threads !== 0
               if (i === 0) {
                  console.log(`Thread ${i} starting work:  creating ${bigBallot} ballots.`);

                  worker[i].postMessage({
                     numBallots: bigBallot,
                     numCandidates: numCandidates,
                     ballotPossibilities: permutations
                  });
               } else {
                  console.log(`Thread ${i} starting work:  creating ${ballotsPerThread} ballots.`);

                  worker[i].postMessage({
                     numBallots: ballotsPerThread,
                     numCandidates: numCandidates,
                     ballotPossibilities: permutations
                  });
               }
            }
         } else {
            console.log("Warning:  No web worker support detected, adding random ballots using legacy method running on main JS thread.");
            this.addRandomBallotsLegacy(numBallots, numCandidates);
         }
      },

      // adds numBallots number of randomized ballots, each with numCandidates number of candidates
      addRandomBallotsLegacy: function(numBallots, numCandidates) {
         const startTime = getTime();

         for (let i = 0; i < numBallots; i++) {
            this.addRandomBallot(numCandidates, true);
         }

         const endTime = getTime();

         console.log(`Ballots added.  Operation took ${endTime - startTime} milliseconds.`);
      },

      // console.log all ballots in ballotBox
      debugEnumerateVotes: function(force) {
         if (Object.keys(ballotBox).length > 1E3 && !force) {
            console.log("Warning:  ballotBox has over 1000 unique ballots.  Displaying these ballots may cause your browser to freeze.  Run debugEnumerateVotes(true) to force display.");
         } else {
            console.log(ballotBox);
         }
      }
   }

   return self;
}

// create ballot box object as "box"
const box = createBallotBox();