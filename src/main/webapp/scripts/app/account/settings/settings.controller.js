'use strict';

angular.module('apqdApp')
    .controller('SettingsController',
    function ($scope, Principal, Auth, Language, $translate, uibCustomDatepickerConfig, DateUtils, lookupGender,
     Place) {
        $scope.dateOptions = uibCustomDatepickerConfig;
        $scope.success = null;
        $scope.error = null;

        /**
         * Store the "settings account" in a separate variable, and not in the shared "account" variable.
         */
        $scope.copyAccount = function (account) {
            return angular.extend({}, account);
        };

        Principal.identity().then(function(account) {
            if (_.isNil(account.place)) {
                Place.save({streetName: ''}, function(place) {
                        $scope.settingsAccount = $scope.copyAccount(account);
                        $scope.settingsAccount.place = place;
                        Auth.updateAccount($scope.settingsAccount);
                    }
                );
            } else {
                 $scope.settingsAccount = $scope.copyAccount(account);
            }
        });

        $scope.save = function () {
            Auth.updateAccount($scope.settingsAccount).then(function() {
                $scope.error = null;
                $scope.success = 'OK';
                Place.update($scope.settingsAccount.place).$promise.then(function() {
                    Principal.identity(true).then(function(account) {
                        $scope.settingsAccount = $scope.copyAccount(account);
                    });
                });
                Language.getCurrent().then(function(current) {
                    if ($scope.settingsAccount.langKey !== current) {
                        $translate.use($scope.settingsAccount.langKey);
                    }
                });
            }).catch(function() {
                $scope.success = null;
                $scope.error = 'ERROR';
            });
        };

        $scope.lookupGender = lookupGender;
    });
