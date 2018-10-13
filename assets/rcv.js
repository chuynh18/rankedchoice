"use strict";

// ===============================================================================
// try/catch block for createBallotBox eliminateCandidate method, with catch block break statement?
// ===============================================================================

// ballot factory function that accepts votes (array of natural numbers) as an argument
// the length of votes is the number of candidates that you're voting for
// and the order of the elements is the preference e.g. votes === [4, 2, 1, 0, 3] means there are five candidates
// first choice is candidate #4, second is candidate #2, 3rd choice is candidate #1, and so on
const createBallot = function(votes) {
   // votes array contains the unmodified ballot - this is a private variable
   const ballot = votes;

   // ballot object to be returned by createBallot factory function
   const self = {
      // returns the unmodified ballot - this is a "getter" for the ballot array
      // since I never defined a setter, you can think of ballot as being private and immutable
      returnVotes: function() {
         return ballot;
      },
   };

   return self;
}

// ballot box factory function
const createBallotBox = function() {
   // holds ballot objects in a private variable
   const ballotBox = [];

   // holds eliminated candidates
   const eliminatedCandidates = [];
   
   // private method that iterates through the ballotBox and tallies up the votes
   // placeNumber is the desired place of the candidate
   // e.g. placeNumber === 0 returns the first place candidate, 1 returns the runner-up, etc.
   const tallyVotes = function(placeNumber) {
      const result = {};

      if (typeof placeNumber === "undefined") {
         // code for defaulting to 0 lives in returnCandidate method of createBallot factory
         // warning lives here so that it doesn't spam inside a for loop
         console.log("Warning:  argument placeNumber is undefined; defaulting to 0.");
      }
   
      // iterate through ballotBox and tally up the votes by using the returnCandidate method
      // and then storing the returned value inside the result object
      for (let i = 0; i < ballotBox.length; i++) {
         const currentBallot = ballotBox[i].returnVotes();
         const modifiedBallot = [];

         for (let j = 0; j < currentBallot.length; j++) {
            if (eliminatedCandidates.indexOf(currentBallot[j]) === -1) {
               modifiedBallot[modifiedBallot.length] = currentBallot[j];
            }
         }

         if (typeof result[modifiedBallot[placeNumber]] === "undefined") {
            result[modifiedBallot[placeNumber]] = 1;
         } else {
            result[modifiedBallot[placeNumber]]++;
         }
      }

      return result;
   }

   // private method that eliminates a specific candidate on all ballots in ballotBox
   const eliminateCandidate = function(candidateNumber) {
      if (typeof candidateNumber === "undefined") {
         throw new Error("argument candidateNumber is undefined.");
      } else {
         eliminatedCandidates[eliminatedCandidates.length] = candidateNumber;
      }
   }

   const self = {
      // ballotBox getter
      getBallotBox: function() {
         return ballotBox;
      },

      // empties ballotBox (in effect resetting the state of the RCV site)
      resetBallotBox: function() {
         ballotBox.length = 0;
      },

      // returns the number of ballots in ballotBox
      getNumBallots: function() {
         return ballotBox.length;
      },

      // runs RCV algorithm and returns complete election results
      computeRCV: function() {
         const winThreshold = this.getNumBallots()/2;
         let winnerExists = false;
         let round = 0;
         const electionResults = {};
         
         while (!winnerExists) {
            let minNumofVotes = winThreshold;
            const losingCandidate = [];

            // store results of current round into electionResults object
            electionResults["round"+round] = tallyVotes(0);

            // determine existence and identity of overall winner
            const electionResultsKeys = Object.keys(electionResults["round"+round]);
            for (let i = 0; i < electionResultsKeys.length; i++) {
               if (electionResults["round"+round][electionResultsKeys[i]] > winThreshold) {
                  winnerExists = true;
                  electionResults.winner = Number(electionResultsKeys[i]);
                  this.resetEliminatedCandidates();
                  return electionResults;
               }
            }

            // determine last place candidate(s)
            for (let i = 0; i < Object.keys(electionResults["round"+round]).length; i++) {
               if (minNumofVotes > electionResults["round"+round][i]) {
                  minNumofVotes = electionResults["round"+round][i];
                  losingCandidate.length = 0;
                  losingCandidate[losingCandidate.length] = i;
               } else if (minNumofVotes === electionResults["round"+round][i]) {
                  losingCandidate[losingCandidate.length] = i;
               }
            }

            // handle ties for last place
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
               electionResults["round"+round].eliminatedThisRound = loser;
            } else {
               eliminateCandidate(losingCandidate[0]);
               electionResults["round"+round].eliminatedThisRound = losingCandidate[0];
            }

            round++;
         }
      },

      // adds one user-defined ballot (remember, votes is an array - see comment above createBallot factory function)
      addOneBallot: function(votes) {
         ballotBox[ballotBox.length] = createBallot(votes);
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
         ballotBox[ballotBox.length] = createBallot(ballot);
      },

      // adds numBallots number of randomized ballots, each with numCandidates number of candidates
      addMultipleRandomBallots: function(numBallots, numCandidates) {
         for (let i = 0; i < numBallots; i++) {
            this.addRandomBallot(numCandidates);
         }
      },

      resetEliminatedCandidates: function() {
         eliminatedCandidates.length = 0;
      },

      // console.log all ballots in ballotBox
      debugEnumerateVotes: function(force) {

         // not useful to console.log out too many things - in fact the threshold is probably well below 1000
         // also gating this for performance reasons, don't want you to shoot yourself in the foot and lock up your browser
         if (ballotBox.length > 1000 && !force) {
            console.log('Warning:  ballotBox.length > 1000; not displaying contents of ballotBox for performance and practical reasons.  To force display, call "debugEnumerateVotes(true)".');
         } else if (ballotBox.length === 0) {
            console.log("ballotBox.length === 0 (i.e. ballotBox is empty!)");
         } else {
            for (let i = 0; i < ballotBox.length; i++) {
               console.log(ballotBox[i].returnVotes());
            }
         }
      }
   }

   return self;
}

// create ballot box object as "box"
const box = createBallotBox();