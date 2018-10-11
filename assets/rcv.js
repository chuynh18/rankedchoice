"use strict";

// ballot factory function
// accepts votes (array of natural numbers)
// number of elements in votes is how many "candidates" you're voting for
// order of elements is preference
// e.g. votes === [4, 2, 1, 0, 3] means there are five candidates with choice 1 being candidate 4
const createBallot = function(votes) {
   const ballot = {
      // votes holds the unmodified ballot
      votes: votes,
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
      // takes into account the eliminated candidates and returns the candidate that this ballot is currently voting for
      returnCurrentCandidate: function() {
         const modifiedVotes = [];

         for (let i = 0; i < this.votes.length; i++) {
            let candidateEliminated = false;

            for (let j = 0; j < this.eliminatedCandidates.length; j++) {
               if (this.votes[i] === this.eliminatedCandidates[j]) {
                  candidateEliminated = true;
                  break;
               }
            }

            if (!candidateEliminated) {
               modifiedVotes[modifiedVotes.length] = this.votes[i];
            }
         }

         if (modifiedVotes.length > 0) {
            return modifiedVotes[0];
         }
      }
   };

   return ballot;
}

// ballot box factory function
const createBallotBox = function() {
   const box = {
      // holds ballots
      ballotBox: [],
      tallyVotes: function() {
         const result = {};

         for (let i = 0; i < this.ballotBox.length; i++) {
            if (typeof result[this.ballotBox[i].returnCurrentCandidate()] === "undefined") {
               result[this.ballotBox[i].returnCurrentCandidate()] = 1;
            } else {
               result[this.ballotBox[i].returnCurrentCandidate()]++;
            }
         }

         return result;
      },
      addOneBallot: function(votes) {
         this.ballotBox[this.ballotBox.length] = createBallot(votes);
      },
      addMultipleBallots: function(numBallots, votes) {
         for (let i = 0; i < numBallots; i++) {
            this.addOneBallot(votes);
         }
      },
      addRandomBallot: function(numCandidates) {
         const ballot = [];

         for (let i = 0; i < numCandidates; i++) {
            ballot[ballot.length] = i;
         }
      }
   }

   return box;
}

const box = createBallotBox();