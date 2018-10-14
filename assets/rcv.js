"use strict";

// ballot box factory function
const createBallotBox = function() {
   // holds ballots in a private variable
   let ballotBox = {};

   // holds eliminated candidates
   const eliminatedCandidates = [];
   
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
            result[modifiedBallot[placeNumber]] = ballotBox[ballots].count;
         } else {
            result[modifiedBallot[placeNumber]] += ballotBox[ballots].count;
         }
      }

      return result;
   }

   // private method that eliminates a specific candidate on all ballots in ballotBox
   const eliminateCandidate = function(candidateNumber) {
      if (typeof candidateNumber !== "number") {
         // explicit type coercion:  make sure typeof candidateNumber === "number"
         candidateNumber = Number(candidateNumber);

         console.log("Warning:  argument candidateNumber was not type number.  It has been coerced into a number, but unexpected behavior may occur.");
      }

      if (typeof candidateNumber === "undefined") {
         throw new Error("argument candidateNumber is undefined.");
      } else if (eliminatedCandidates.indexOf(candidateNumber) !== -1) {
         throw new Error(`candidate ${candidateNumber} has already been eliminated.`);
      } else {
         eliminatedCandidates[eliminatedCandidates.length] = candidateNumber;
      }
   }

   // ballot box object that will be returned; contains public methods that the view will call
   const self = {
      // ballotBox getter
      getBallotBox: function() {
         return ballotBox;
      },

      // empties ballotBox (in effect resetting the state of the RCV site)
      resetBallotBox: function() {
         ballotBox = {};
      },

      // returns the number of ballots in ballotBox
      getNumBallots: function() {
         let numBallots = 0;

         for (let ballots in ballotBox) {
            numBallots += ballotBox[ballots].count;
         }

         return numBallots;
      },

      // runs RCV algorithm and returns complete election results
      computeRCV: function() {
         const winThreshold = this.getNumBallots()/2;
         let winnerExists = false;
         let round = 0;
         const electionResults = {
            stats: {totalBallots: this.getNumBallots()}
         };
         
         while (!winnerExists) {
            let minNumofVotes = winThreshold;
            const losingCandidate = [];

            // store results of current round into electionResults object
            electionResults["round"+round] = tallyVotes(0);

            // determine existence and identity of overall winner
            for (let candidate in electionResults["round"+round]) {
               if (electionResults["round"+round][candidate] > winThreshold) {
                  winnerExists = true;
                  electionResults.stats.winner = Number(candidate);
                  electionResults.stats.lastRound = round;
                  electionResults.stats.roundsTaken = round + 1;
                  
                  // by resetting the state of eliminatedCandidates before returning,
                  // we ensure the perceived idempotence of the computeRCV method
                  this.resetEliminatedCandidates();
                  return electionResults;
               }
            }

            // determine last place candidate(s)
            for (let candidate in electionResults["round"+round]) {
               if (minNumofVotes > electionResults["round"+round][candidate]) {
                  minNumofVotes = electionResults["round"+round][candidate];
                  losingCandidate.length = 0;
                  losingCandidate[losingCandidate.length] = candidate;
               } else if (minNumofVotes === electionResults["round"+round][candidate]) {
                  losingCandidate[losingCandidate.length] = candidate;
               }
            }

            // show how much each candidate gained
            if (round !== 0) {
               electionResults["round"+round].gain = {};

               for (let candidate in electionResults["round"+round]) {
                  electionResults["round"+round].gain[candidate] = electionResults["round"+round][candidate] - electionResults["round"+(round-1)][candidate];
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
               eliminateCandidate(Number(losingCandidate[0]));
               electionResults["round"+round].eliminatedCandidate = Number(losingCandidate[0]);
            }

            round++;
         }
      },

      // adds one user-defined ballot (remember, votes is an array - see comment above createBallot factory function)
      addOneBallot: function(votes) {
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
               count: 1,
               array: votes
            };
         } else {
            ballotBox[keyName].count++;
         }
      },

      // adds numBallots number of user-defined ballots
      addMultipleBallots: function(numBallots, votes) {
         for (let i = 0; i < numBallots; i++) {
            this.addOneBallot(votes);
         }
      },

      // adds a randomized ballot for numCandidates number of candidates
      addRandomBallot: function(numCandidates) {
         const ballot = [];

         // fill ballot with appropriate number of candidates in counting order ([0, 1, 2 ...])
         for (let i = 0; i < numCandidates; i++) {
            ballot[ballot.length] = i;
         }

         // Fisher-Yates shuffle
         for (let i = numCandidates; i > 0; i--) {
            ballot[ballot.length-1] = ballot.splice(Math.floor(Math.random() * i), 1)[0]; // [0] because splice returns an array
         }

         // add scrambled ballot into ballotBox
         this.addOneBallot(ballot);
      },

      // adds numBallots number of randomized ballots, each with numCandidates number of candidates
      addMultipleRandomBallots: function(numBallots, numCandidates) {
         for (let i = 0; i < numBallots; i++) {
            this.addRandomBallot(numCandidates);
         }
      },

      // this arguably could be made a private method...  "I'll think about it." - Adam Jensen in Deus Ex:  Human Revolution
      resetEliminatedCandidates: function() {
         eliminatedCandidates.length = 0;
      },

      // console.log all ballots in ballotBox
      debugEnumerateVotes: function(force) {
         console.log(ballotBox);
      }
   }

   return self;
}

// create ballot box object as "box"
const box = createBallotBox();