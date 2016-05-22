'use strict';

angular.module('apqdApp')
    .controller('MainNavController', function ($scope, $rootScope, $location, $state, Auth, Principal, ENV, VoiceAssistantService) {
        $scope.isAuthenticated = Principal.isAuthenticated;
        $scope.$state = $state;
        $scope.inProduction = ENV === 'prod';

        $scope.logout = function () {
            Auth.logout();
            $state.go('home');
        };

        Principal.identity().then(function(account) {
            $scope.account = account;
        });

        $scope.triggerVoiceAssistant = VoiceAssistantService.triggerVoiceAssistant;
        $scope.isVoiceAssistantActive = VoiceAssistantService.isVoiceAssistantActive;
    });
