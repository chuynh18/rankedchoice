"use strict";

const ballotBox = {};

const methods = {
   addBallot: function(votes) {
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
      this.addBallot(ballot);
   },

   // adds numBallots number of randomized ballots, each with numCandidates number of candidates
   addRandomBallots: function(numBallots, numCandidates) {
      for (let i = 0; i < numBallots; i++) {
         this.addRandomBallot(numCandidates);
      }
   }
};

self.addEventListener('message', function(e) {
   var data = e.data;

   methods.addRandomBallots(data.numBallots, data.numCandidates);

   self.postMessage(ballotBox);
   self.close();

 }, false);