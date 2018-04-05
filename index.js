define(['angular'], function(angular) {
  var ngModule = angular.module('cockpit.nightmode', []);

  ngModule.config(['ViewsProvider', function(ViewsProvider) {
    ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.action', {
      id: 'cockpit.nightmode',
      template: '<a class="btn btn-default btn-toolbar" ng-click="startNight()">&#x1F319;&#xFE0E;</a>',
      controller: ['$scope', function($scope) {
        $scope.startNight = () => {
          window.enterNightMode($scope.processData.$providers.local.bpmn20Xml.data.value.bpmn20Xml);
        };
      }]
    });
  }]);

  const nightModeScript = document.createElement('script');
  nightModeScript.setAttribute('type', 'module');
  nightModeScript.setAttribute('src', '/camunda/app/cockpit/scripts/nightmode/nightmode.js')

  const THREE = document.createElement('script');
  THREE.setAttribute('type', 'application/javascript');
  THREE.setAttribute('src', '/camunda/app/cockpit/scripts/nightmode/three.js');

  document.head.appendChild(nightModeScript);
  document.head.appendChild(THREE);

  return ngModule;
});

// import {
//   getNodeFurthestAwayFrom,
//   removeNodeFromGraph,
//   isNodeReachable
// } from "./levelgenerator.js";

// import "./bpmn2Level.js";

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
