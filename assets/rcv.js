"use strict";

// ===============================================================================
// to-do:  create a ballotBox method to run one round of ranked choice voting
// that means it has to tally up the votes (done)
// return the winner if one candidate has over 50% votes (NOT done)
// else, eliminate the candidate with the fewest votes (NOT done)
// if there is a tie for fewest votes, it should handle tiebreaking by looking at 2nd, 3rd choice etc. (NOT done)
// then it should eliminate the proper candidate (done - eliminate specific candidate method) and return the new vote tallies (done)

// try/catch block for createBallotBox eliminateCandidate method, with catch block break statement?
// ===============================================================================

// ballot factory function that accepts votes (array of natural numbers) as an argument
// the length of votes is the number of candidates that you're voting for
// and the order of the elements is the preference e.g. votes === [4, 2, 1, 0, 3] means there are five candidates
// first choice is candidate #4, second is candidate #2, 3rd choice is candidate #1, and so on
const createBallot = function(votes) {
   // votes array contains the unmodified ballot - this is a private variable
   const ballot = votes;

   const self = {
      // returns the unmodified ballot - this is a "getter" for the ballot array
      // since I never defined a setter, you can think of ballot as being private and immutable
      returnVotes: function() {
         return ballot;
      },
      // eliminatedCandidates is an array of candidates that have been eliminated during the RCV process
      eliminatedCandidates: [],
      // method to add an eliminated candidate to the eliminatedCandidates array
      addEliminatedCandidate: function(candidateNumber) {
         if (this.eliminatedCandidates.indexOf(candidateNumber) === -1) {
            this.eliminatedCandidates[this.eliminatedCandidates.length] = candidateNumber;
         } else {
            throw new Error(`Error: candidateNumber ${candidateNumber} has already been eliminated.`);
         }
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

            if (this.eliminatedCandidates.indexOf(votes[i]) !== -1) {
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
            console.log("Warning:  placeNumber is undefined; defaulting to 0");
         }

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
            throw new Error("Error:  candidateNumber is undefined");
         } else {
            for (let i = 0; i < ballotBox.length; i++) {
               ballotBox[i].addEliminatedCandidate(candidateNumber);
            }
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

         // fill ballot with appropriate number of candidates in counting order
         for (let i = 0; i < numCandidates; i++) {
            ballot[ballot.length] = i;
         }

         // scramble the ballot
         for (let i = numCandidates; i > 0; i--) {
            ballot[ballot.length-1] = ballot.splice(Math.floor(Math.random() * i), 1)[0];
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
      // console.log all ballots in ballotBox
      debugEnumerateVotes: function() {
         for (let i = 0; i < ballotBox.length; i++) {
            console.log(ballotBox[i].returnVotes());
         }
      }
   }

   return self;
}

// create ballot box object as "box"
const box = createBallotBox();