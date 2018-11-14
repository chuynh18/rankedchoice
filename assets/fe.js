"use strict";

const frontEndMethods = (function() {
   // really inelegant method of formatting large numbers with commas
   const addCommas = function(input) {
      let comma = false;
      let counter = 0;
      let reversedOutput = "";
      let output = "";

      if (input.length > 3) {
         comma = true;
      }

      for (let i = input.length-1; i >= 0; i--) {
         reversedOutput += input[i];
         counter++;

         if (counter % 3 === 0 && comma && i !== 0) {
            reversedOutput += ",";
         }
      }

      for (let i = reversedOutput.length-1; i >= 0; i--) {
         output += reversedOutput[i];
      }

      return output;
   }

   // public front end methods returned as immutable object
   return Object.freeze({
      showBallotBoxStats: function() {
         const ballots = box.getNumBallots().toString();
         const uniqueBallots = box.getNumUniqueBallots().toString();

         document.getElementById("boxState").innerHTML = `Ballot box contains a total of <strong>${addCommas(ballots)} ballots</strong> and <strong>${addCommas(uniqueBallots)} unique ballots</strong>.`;
      },

      createDefinedBallots: function() {
         // this is a thing of beauty (sarcasm)
         const ballot = document.getElementById("manualBallot").value.split(",").map(item => parseInt(item));
         const numBallots = parseInt(document.getElementById("numManualBallots").value);
         
         box.addBallots(numBallots, ballot, false, this.showBallotBoxStats.bind(frontEndMethods));
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
                  box.addRandomBallots(numBallots, numCandidates, this.showBallotBoxStats.bind(frontEndMethods));
               }
            } else {
               box.addRandomBallots(numBallots, numCandidates, this.showBallotBoxStats.bind(frontEndMethods));
            }
         }
         
      },

      renderRCV: function() {
         // save results of election
         const electionResults = box.runRCV();

         // hardcode round 0 for now
         const round0 = electionResults.round0.result;

         // ======= d3js stuff begins =======
         const svg = d3.select("svg")
            .attr("width", 640)
            .attr("height", 480)
            .attr("class", "bar-chart");

         const barChart = svg.selectAll("rect")
         // ======= end d3js stuff =======

         console.log(electionResults);
      }
   });
})();

// run this method once so page starts out by showing 0 ballots and 0 unique ballots
frontEndMethods.showBallotBoxStats();