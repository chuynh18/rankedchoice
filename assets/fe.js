"use strict";

const frontEndMethods = (function() {
   // inelegant method of formatting large numbers with commas
   const addCommas = function(input) {
      const inputLength = input.length;
      let output = "";

      for (let i = 0; i < inputLength; i++) {
         output += input[i];

         if (input.length > 3 && i !== inputLength - 1) {
            if (((inputLength - 2) % 3 === 0 && (i + 2) % 3 === 0) 
            || ((inputLength - 1) % 3 === 0 && (i % 3 === 0))
            || (inputLength % 3 === 0 && (i + 1) % 3 === 0 && i > 0)) {
               output += ",";
            }
         } 
      }

      return output;
   }

   // takes election results object from rcv.js and returns data in a useful format for d3js (array of objects)
   const formatElectionData = function(electionResults) {
      const output = [];

      const electionResultsRounds = Object.keys(electionResults).length - 1;

      for (let i = 0; i < electionResultsRounds; i++) {
         const oneRound = [];

         for (let candidate in electionResults[`round${i}`].result) {
            const candidateObject = {
               name: candidate,
               votes: electionResults[`round${i}`].result[candidate].votes,
               gain: 0
            };

            if (electionResults[`round${i}`].result[candidate].gain) {
               candidateObject.gain = electionResults[`round${i}`].result[candidate].gain;
            }

            candidateObject.votesFromLastRound = candidateObject.votes - candidateObject.gain;

            oneRound[oneRound.length] = candidateObject;
         }

         output[output.length] = oneRound;
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
         const d3ElectionResults = formatElectionData(box.runRCV());

         // hardcode round 0 for now
         const round0 = d3ElectionResults[0];

         // ======= d3js stuff begins =======
         const svg = d3.select("svg")
            .attr("width", 640)
            .attr("height", 480)
            .attr("class", "bar-chart");

         const barChart = svg.selectAll("rect")
         // ======= end d3js stuff =======

         console.log("Election results object returned by rcv.js:");
         console.log(electionResults);
         console.log("Reformatting the data for consumption by d3js:");
         console.log(d3ElectionResults);         
      }
   });
})();

// run this method once so page starts out by showing 0 ballots and 0 unique ballots
frontEndMethods.showBallotBoxStats();