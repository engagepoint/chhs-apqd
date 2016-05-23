'use strict';

angular.module('apqdApp').controller('PlaceDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity', 'Place', 'LookupState', 'LookupCounty',
        function($scope, $stateParams, $uibModalInstance, entity, Place, LookupState, LookupCounty) {

        $scope.place = entity;
        $scope.lookupstates = LookupState.query();
        $scope.lookupcountys = LookupCounty.query();
        $scope.load = function(id) {
            Place.get({id : id}, function(result) {
                $scope.place = result;
            });
        };

        var onSaveSuccess = function (result) {
            $scope.$emit('apqdApp:placeUpdate', result);
            $uibModalInstance.close(result);
            $scope.isSaving = false;
        };

        var onSaveError = function (result) {
            $scope.isSaving = false;
        };

        $scope.save = function () {
            $scope.isSaving = true;
            if ($scope.place.id != null) {
                Place.update($scope.place, onSaveSuccess, onSaveError);
            } else {
                Place.save($scope.place, onSaveSuccess, onSaveError);
            }
        };

        $scope.clear = function() {
            $uibModalInstance.dismiss('cancel');
        };
}]);
