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

   // eliminatedCandidates is an array of candidates that have been eliminated during the RCV process
   const eliminatedCandidates = [];

   // ballot object to be returned by createBallot factory function
   const self = {
      // returns the unmodified ballot - this is a "getter" for the ballot array
      // since I never defined a setter, you can think of ballot as being private and immutable
      returnVotes: function() {
         return ballot;
      },

      // method to add an eliminated candidate to the eliminatedCandidates array
      addEliminatedCandidate: function(candidateNumber) {
         if (eliminatedCandidates.indexOf(candidateNumber) === -1) {
            eliminatedCandidates[eliminatedCandidates.length] = candidateNumber;
         } else {
            throw new Error(`argument candidateNumber ${candidateNumber} has already been eliminated.`);
         }
      },

      resetEliminatedCandidates: function() {
         eliminatedCandidates.length = 0;
      },

      // takes into account the eliminated candidates and returns the candidateNum+1 place candidate
      // that is, if candidateNum === 0, returns the current still-alive 1st place candidate
      // if candidateNum === 1, returns the current 2nd place still-alive candidate
      returnCandidate: function(candidateNum) {
         const modifiedVotes = [];
         const votes = this.returnVotes();

         // default candidateNum to 0
         if (typeof candidateNum === "undefined") {
            candidateNum = 0;
         }

         for (let i = 0; i < votes.length; i++) {
            let candidateEliminated = false;

            if (eliminatedCandidates.indexOf(votes[i]) !== -1) {
               candidateEliminated = true;
            }

            if (!candidateEliminated) {
               modifiedVotes[modifiedVotes.length] = votes[i];
            }
         }

         if (modifiedVotes.length > 0) {
            return modifiedVotes[candidateNum];
         }
      }
   };

   return self;
}

// ballot box factory function
const createBallotBox = function() {
   // holds ballot objects in a private variable
   const ballotBox = [];

   const self = {
      // ballotBox getter
      getBallotBox: function() {
         return ballotBox;
      },

      // ballotBox setter
      addToBallotBox: function(ballot) {
         ballotBox[ballotBox.length] = ballot;
      },

      // empties ballotBox (in effect resetting the state of the RCV site)
      resetBallotBox: function() {
         ballotBox.length = 0;
      },

      // returns the number of ballots in ballotBox
      getNumBallots: function() {
         return ballotBox.length;
      },

      // iterates through the ballotBox and tallies up the votes
      // placeNumber is the desired place of the candidate
      // e.g. placeNumber === 0 returns the first place candidate, 1 returns the runner-up, etc.
      tallyVotes: function(placeNumber) {
         const result = {};

         if (typeof placeNumber === "undefined") {
            // code for defaulting to 0 lives in returnCandidate method of createBallot factory
            // warning lives here so that it doesn't spam inside a for loop
            console.log("Warning:  argument placeNumber is undefined; defaulting to 0.");
         }

         // iterate through ballotBox and tally up the votes by using the returnCandidate method
         // and then storing the returned value inside the result object
         for (let i = 0; i < ballotBox.length; i++) {
            if (typeof result[ballotBox[i].returnCandidate(placeNumber)] === "undefined") {
               result[ballotBox[i].returnCandidate(placeNumber)] = 1;
            } else {
               result[ballotBox[i].returnCandidate(placeNumber)]++;
            }
         }

         return result;
      },

      // eliminates a specific candidate on all ballots in ballotBox
      eliminateCandidate: function(candidateNumber) {
         if (typeof candidateNumber === "undefined") {
            throw new Error("argument candidateNumber is undefined");
         } else {
            for (let i = 0; i < ballotBox.length; i++) {
               ballotBox[i].addEliminatedCandidate(candidateNumber);
            }
         }
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
            electionResults["round"+round] = this.tallyVotes(0);

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
               const tiebreaker = this.tallyVotes(1);
               let minTiebreakerVotes = tiebreaker[losingCandidate[0]];
               let loser = losingCandidate[0];

               for (let i = 1; i < losingCandidate.length; i++) {
                  if (minTiebreakerVotes > tiebreaker[losingCandidate[i]]) {
                     minTiebreakerVotes = tiebreaker[losingCandidate[i]];
                     loser = losingCandidate[i];
                  }
               }

               this.eliminateCandidate(loser);
               electionResults["round"+round].eliminatedThisRound = loser;
            } else {
               this.eliminateCandidate(losingCandidate[0]);
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
         for (let i = 0; i < ballotBox.length; i++) {
            ballotBox[i].resetEliminatedCandidates();
         }
      },

      // console.log all ballots in ballotBox
      debugEnumerateVotes: function(force) {

         // not useful to console.log out too many things - in fact the threshold is probably well below 1000
         // also gating this for performance reasons, don't want you to shoot yourself in the foot and lock up your browser
         if (ballotBox.length > 1000 && !force) {
            console.log('ballotBox.length > 1000; not displaying contents of ballotBox for performance and practical reasons.  To force display, call "debugEnumerateVotes(true)".');
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