define(['angular'], function(angular) {
  var ngModule = angular.module('cockpit.nightmode', []);

  ngModule.config(['ViewsProvider', function(ViewsProvider) {
    ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.action', {
      id: 'cockpit.nightmode',
      template: '<a class="btn btn-default btn-toolbar" ng-click="startNight()" tooltip="Activate Nightmode" tooltip-placement="left">&#x1F319;&#xFE0E;</a>',
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

  const font = document.createElement('link');
  font.setAttribute('href', "https://fonts.googleapis.com/css?family=Iceland");
  font.setAttribute('rel', 'stylesheet');

  document.head.appendChild(nightModeScript);
  document.head.appendChild(THREE);
  document.head.appendChild(font);

  window.speechSynthesis.getVoices();

  return ngModule;
});
