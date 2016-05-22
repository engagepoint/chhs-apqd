'use strict';

angular.module('intakeApp')
    .factory('LookupCounty', function ($resource, DateUtils) {
        return $resource('api/lookupCountys/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    });