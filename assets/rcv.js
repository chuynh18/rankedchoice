"use strict";

// ballot factory function
// accepts votes (array of natural numbers)
// number of elements in votes is how many "candidates" you're voting for
// order of elements is preference
// e.g. votes === [4, 2, 1, 0, 3] means there are five candidates with the first choice (index 0) being candidate 4
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
      returnCandidate: function(candidateNum) {
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
            return modifiedVotes[candidateNum];
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
      // iterates through the ballotBox and tallies up the votes
      // placeNumber is the desired place of the candidate
      // e.g. placeNumber === 0 returns the first place candidate, 1 returns the runner-up, etc.
      tallyVotes: function(placeNumber) {
         const result = {};

         for (let i = 0; i < this.ballotBox.length; i++) {
            if (typeof result[this.ballotBox[i].returnCandidate(placeNumber)] === "undefined") {
               result[this.ballotBox[i].returnCandidate(placeNumber)] = 1;
            } else {
               result[this.ballotBox[i].returnCandidate(placeNumber)]++;
            }
         }

         return result;
      },
      // eliminates a specific candidate on all ballots in ballotBox
      eliminateCandidate: function(candidateNumber) {
         for (let i = 0; i < this.ballotBox.length; i++) {
            this.ballotBox[i].addEliminatedCandidate(candidateNumber);
         }
      },
      // adds one user-defined ballot
      addOneBallot: function(votes) {
         this.ballotBox[this.ballotBox.length] = createBallot(votes);
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
         this.ballotBox[this.ballotBox.length] = createBallot(ballot);
      },
      // adds numBallots number of randomized ballots, each with numCandidates number of candidates
      addMultipleRandomBallots: function(numBallots, numCandidates) {
         for (let i = 0; i < numBallots; i++) {
            this.addRandomBallot(numCandidates);
         }
      },
      // console.log all ballots in ballotBox
      debugEnumerateVotes: function() {
         for (let i = 0; i < this.ballotBox.length; i++) {
            console.log(this.ballotBox[i].votes);
         }
      }
   }

   return box;
}

// create ballot box object as "box"
const box = createBallotBox();