"use strict";

const frontEndMethods = {
   showBallotBoxStats: function() {
      document.getElementById("boxState").textContent = `Ballot box contains ${box.getNumBallots()} ballots and ${box.getNumUniqueBallots()} unique ballots.`;
   },

   createDefinedBallots: function() {

   },

   createRandomBallots: function() {
      const numBallots = parseInt(document.getElementById("numRandomBallots").value);
      const numCandidates = parseInt(document.getElementById("numRandomCandidates").value);

      if (typeof numBallots !== "number" || typeof numCandidates !== "number") {
         throw new Error("numBallots and numCandidates must be valid numbers.");
      } else if (Number.isNaN(numBallots) || Number.isNaN(numCandidates)) {
         throw new Error("numBallots and numCandidates must be valid numbers.");
      } else {
         if ((numCandidates > 9 && numBallots > 1E6) || (numCandidates > 8 && numBallots > 1E7) || (numCandidates > 7 && numBallots > 7E8) || (numBallots > 3E9)) {
            const proceed = confirm("Warning: this operation may take a while.  Proceed?");

            if (proceed) {
               box.addRandomBallots(numBallots, numCandidates);
            }
         } else {
            box.addRandomBallots(numBallots, numCandidates);
         }
      }
      
   },

   renderRCV: function() {
      const results = box.runRCV();

      console.log(results);
   }
};

// suboptimal... but we'll take it for now
frontEndMethods.showBallotBoxStats();

setInterval(function() {
   frontEndMethods.showBallotBoxStats();
}, 1500);