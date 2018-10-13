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
      const ballotBoxKeys = Object.keys(ballotBox);

      if (typeof placeNumber === "undefined") {
         console.log("Warning:  argument placeNumber is undefined; defaulting to 0.");
      }

      // iterate through ballotBox and tally up the votes
      for (let i = 0; i < ballotBoxKeys.length; i++) {
         const currentBallot = ballotBox[ballotBoxKeys[i]].array;
         const modifiedBallot = [];

         for (let j = 0; j < currentBallot.length; j++) {
            if (eliminatedCandidates.indexOf(currentBallot[j]) === -1) {
               modifiedBallot[modifiedBallot.length] = currentBallot[j];
            }
         }

         if (typeof result[modifiedBallot[placeNumber]] === "undefined") {
            result[modifiedBallot[placeNumber]] = ballotBox[ballotBoxKeys[i]].count;
         } else {
            result[modifiedBallot[placeNumber]] += ballotBox[ballotBoxKeys[i]].count;
         }
      }

      return result;
   }

   // private method that eliminates a specific candidate on all ballots in ballotBox
   const eliminateCandidate = function(candidateNumber) {
      if (typeof candidateNumber === "undefined") {
         throw new Error("argument candidateNumber is undefined.");
      } else if (eliminatedCandidates.indexOf(candidateNumber) !== -1) {
         throw new Error(`candidate ${candidateNumber} has already been eliminated.`);
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
         ballotBox = {};
      },

      // returns the number of ballots in ballotBox
      getNumBallots: function() {
         let numBallots = 0;
         const ballotBoxKeys = Object.keys(ballotBox);

         for (let i = 0; i < ballotBoxKeys.length; i++) {
            numBallots += ballotBox[ballotBoxKeys[i]].count;
         }

         return numBallots;
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
            for (let i = 0; i < electionResultsKeys.length; i++) {
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