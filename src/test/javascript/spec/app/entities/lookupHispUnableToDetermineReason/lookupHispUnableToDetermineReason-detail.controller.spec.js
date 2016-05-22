'use strict';

describe('Controller Tests', function() {

    describe('LookupHispUnableToDetermineReason Detail Controller', function() {
        var $scope, $rootScope;
        var MockEntity, MockLookupHispUnableToDetermineReason;
        var createController;

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            MockEntity = jasmine.createSpy('MockEntity');
            MockLookupHispUnableToDetermineReason = jasmine.createSpy('MockLookupHispUnableToDetermineReason');


            var locals = {
                '$scope': $scope,
                '$rootScope': $rootScope,
                'entity': MockEntity ,
                'LookupHispUnableToDetermineReason': MockLookupHispUnableToDetermineReason
            };
            createController = function() {
                $injector.get('$controller')("LookupHispUnableToDetermineReasonDetailController", locals);
            };
        }));


        describe('Root Scope Listening', function() {
            it('Unregisters root scope listener upon scope destruction', function() {
                var eventType = 'apqdApp:lookupHispUnableToDetermineReasonUpdate';

                createController();
                expect($rootScope.$$listenerCount[eventType]).toEqual(1);

                $scope.$destroy();
                expect($rootScope.$$listenerCount[eventType]).toBeUndefined();
            });
        });
    });

});
