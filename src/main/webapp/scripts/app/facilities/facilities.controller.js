'use strict';

angular.module('apqdApp')
    .controller('FacilitiesController',
    ['$scope', '$state', '$log', '$q', 'leafletData', 'FacilityType', 'FacilityStatus', 'FosterFamilyAgenciesService', 'GeocoderService', 'chLayoutConfigFactory', '$uibModal',
    function ($scope, $state, $log, $q, leafletData, FacilityType, FacilityStatus, FosterFamilyAgenciesService, GeocoderService, chLayoutConfigFactory, $uibModal) {
        chLayoutConfigFactory.layoutConfigState.toggleBodyContentConfig();

        $scope.viewContainsCaBounds = false;
        $scope.caBounds = new L.LatLngBounds(new L.LatLng(32.53, -124.43), new L.LatLng(42, -114.13));

        $scope.ALL_TYPES_LABEL = 'All Types';
        $scope.ALL_STATUSES_LABEL = 'All Statuses';

        $scope.typesConfig = {
            showList: false,
            label: $scope.ALL_TYPES_LABEL
        };
        $scope.statusesConfig = {
            showList: false,
            label: $scope.ALL_STATUSES_LABEL
        };
        $scope.defaults = {
            zoomControlPosition: 'bottomright',
            scrollWheelZoom: true,
            maxZoom: 18
        };
        $scope.layers = {
            baselayers: {
                osm: {
                    name: 'Map',
                    type: 'xyz',
                    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                }
            },
            overlays: {
                agencies: {
                    name: "Agencies",
                    type: "markercluster",
                    visible: true
                },
                place: {
                    name: "Place",
                    type: "group",
                    visible: true
                }
            }
        };

        $scope.viewConfig = {presentation: 'list'};
        //$scope.center = {lat: 36.7428526, lng: -119.9913578, zoom: 13};
        $scope.center = {autoDiscover: true, zoom: 13};

        $scope.searchText = '';
        $scope.facilityTypes = FacilityType;
        $scope.facilityStatuses = FacilityStatus;

        var centerUnregister = $scope.$watch('center.autoDiscover', function(newValue) {
            if (!newValue) {
                $scope.currentLocation = $scope.getHomeLocation($scope.center);
                $scope.invalidateAgencies();

                centerUnregister();
            }
        });

        $scope.createLocations = function() {
            var locations = {};
            _.each($scope.agencies, function (agency) {
                locations['fn' + agency.facility_number] = {
                    layer: 'agencies',
                    lat: agency.location.coordinates[1],
                    lng: agency.location.coordinates[0],
                    message: '<div ng-include src="\'scripts/app/facilities/location-popup.html\'"></div>',
                    getMessageScope: function() {
                        var scope = $scope.$new();
                        scope.agency = agency;
                        scope.viewConfig = {presentation: 'popup'};
                        return scope;
                    },
                    icon: {
                        iconUrl: $scope.defineIcon(agency),
                        iconAnchor: [13, 13]
                    }
                };
            });
            if ($scope.currentLocation) {
                locations.current = $scope.currentLocation;
            }

            return locations;
        };

        $scope.updateLocations = function() {
            $scope.locations = $scope.createLocations();
        };

        $scope.defineIcon = function(agency) {
            return 'assets/images/icon_pin_'
                + _.find(FacilityType, {name: agency.facility_type}).label + '_'
                + _.find(FacilityStatus, {name: agency.facility_status}).color + '.png';
        };

        $scope.findLocationByAddress = function(address) {
            $log.debug('findLocationByAddress', address);
        };

        $scope.findAgenciesByTextQuery = function(event) {
            var keyCode = event.which || event.keyCode;
            if (keyCode === 13) {
                $scope.searchText = $scope.text;
            } else {
                return;
            }
            $scope.invalidateAgencies();
        };

        $scope.findAgenciesWithinBox = function(bounds) {
            $scope.text = $scope.searchText;

            var northEast = bounds._northEast;
            var southWest = bounds._southWest;
            var selectedStatuses = $scope.getSelected($scope.facilityStatuses);
            var selectedTypes = $scope.getSelected($scope.facilityTypes);
            var request = {
                bounds: {
                    northwest: {
                        latitude: northEast.lat,
                        longitude: southWest.lng
                    },
                    southeast: {
                        latitude: southWest.lat,
                        longitude: northEast.lng
                    }
                },
                text: $scope.searchText,
                statuses: selectedStatuses,
                types: selectedTypes
            };
            $log.debug('request', request);

            FosterFamilyAgenciesService.findAgenciesByFilter(request).then(
                function(agencies) {
                    $log.debug('agencies', agencies);
                    $scope.agencies = agencies;
                    $scope.updateLocations();
                },
                function(reason) {
                    $log.error('Failed to get agencies from findAgenciesByFilter', reason);
                }
            );
        };

        $scope.getHomeLocation = function (latLng, message) {
            if (!message) {
                message = 'You are here';
            }
            return {
                layer: 'place',
                lat: latLng.lat,
                lng: latLng.lng,
                //focus: true,
                message: message,
                icon: {
                    iconUrl: 'assets/images/icon_pin_home.png',
                    iconAnchor: [46, 46]
                }
            }
        };

        $scope.$on("leafletDirectiveMap.viewreset", function(event) {
            $log.debug(event.name);
            $scope.invalidateAgencies($scope.isDirty);
        });

        $scope.$on("leafletDirectiveMap.dragend", function(event) {
            $log.debug(event.name);
            $scope.invalidateAgencies($scope.isDirty);
        });

        $scope.$on("leafletDirectiveMap.resize", function(event) {
            $log.debug(event.name);
            $scope.invalidateAgencies($scope.isDirty);
        });

        $scope.isDirty = function(bounds) {
            if (bounds.contains($scope.caBounds)) {
                if ($scope.viewContainsCaBounds) {
                    return false;
                } else {
                    $scope.viewContainsCaBounds = true;
                }
            } else {
                $scope.viewContainsCaBounds = false;
            }
            return true;
        };

        $scope.invalidateAgencies = function(isDirty) {
            leafletData.getMap().then(function (map) {
                var bounds = map.getBounds();

                if (isDirty && !isDirty(bounds)) {
                    return;
                }
                $scope.findAgenciesWithinBox(bounds);
            }, function(reason) {
                $log.error("Cannot get map instance. ", reason)
            })
        };

        $scope.onSelectAddress = function (addressFeature) {
            $log.debug(addressFeature);
            var latLng = addressFeature.latlng;
            $scope.center.lat = latLng.lat;
            $scope.center.lng = latLng.lng;
            //$scope.center = {lat: latLng.lat, lng: latLng.lng, zoom:13};
            $scope.currentLocation = $scope.getHomeLocation($scope.center, addressFeature.feature.properties.label);
            $scope.invalidateAgencies();
        };

        $scope.updateTypesLabel = function() {
            $scope.updateDropDownLabel($scope.facilityTypes, $scope.typesConfig, $scope.ALL_TYPES_LABEL);
        };
        $scope.onTypeClick = function(type) {
            type.selected = !type.selected;
            $scope.updateTypesLabel();
            $scope.invalidateAgencies();
        };

        $scope.updateStatusesLabel = function() {
            $scope.updateDropDownLabel($scope.facilityStatuses, $scope.statusesConfig, $scope.ALL_STATUSES_LABEL);
        };
        $scope.onStatusClick = function(status) {
            status.selected = !status.selected;
            $scope.updateStatusesLabel();
            $scope.invalidateAgencies();
        };

        $scope.updateDropDownLabel = function(model, config, defaultValue) {
            var selected = $scope.getSelected(model);
            if (selected.length > 0) {
                config.label = selected.length + ' Selected';
            } else {
                config.label = defaultValue;
            }
        };

        $scope.getSelected = function(model) {
            return _.map(_.filter(model, {selected: true}), 'name');
        };

        $scope.addGeocoder = function () {
            if(!$scope.geocoder) {
                $scope.geocoder = GeocoderService.createGeocoder("geocoder", $scope.onSelectAddress)
            }
        };
        $scope.addGeocoder();

        $scope.toggleBodyContentConfig = chLayoutConfigFactory.layoutConfigState.toggleBodyContentConfig;
        $scope.$watch(function(){
            return chLayoutConfigFactory.layoutConfigState.isAsideVisible;
        }, function(newValue, oldValue) {
            $scope.isAsideVisible = chLayoutConfigFactory.layoutConfigState.isAsideVisible;
            $scope.isContentFullWidth = chLayoutConfigFactory.layoutConfigState.isContentFullWidth;
        });

        $scope.openDefaultAddressModal = function() {
            $uibModal.open({
                templateUrl: 'scripts/app/facilities/modal/default-address-dialog.html',
                controller: 'DefaultAddressModalCtrl',
                size: 'facilities-default-address',
                windowClass: 'ch-general-modal',
                resolve: {}
            });
        }
    }]);
