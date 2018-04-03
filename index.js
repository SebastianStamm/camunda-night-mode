import {
  getNodeFurthestAwayFrom,
  removeNodeFromGraph,
  isNodeReachable
} from "./levelgenerator.js";

import "./bpmn2Level.js";

// (async () => {
//   const graph = await (await fetch('./graph.json')).json();

//   const start = 0;
//   const goal = getNodeFurthestAwayFrom(graph, start);

//   let subGoal = goal;
//   let subGraph = graph;

//   const keyLocations = {};

//   let i = 0;
//   while (isNodeReachable(subGraph, start, subGoal) && i < 100) {
//     const keyRoom = getNodeFurthestAwayFrom(subGraph, start, subGoal);
//     subGraph = removeNodeFromGraph(subGraph, subGoal);

//     keyLocations[subGoal] = keyRoom;

//     subGoal = keyRoom;
//     i++;
//   }

//   // console.log('player should go from', start, 'to', goal);
//   // console.log(keyLocations);
// })();
