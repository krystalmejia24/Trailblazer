'use strict';

// Boundaries controller
angular.module('boundaries').controller('BoundariesController', ['$scope',
                                                              '$stateParams',
                                                              '$rootScope',
                                                              '$location',
                                                              'Authentication',
                                                              'Boundaries',
                                                              '$state',
                                                              'leafletData',
  function ($scope, $stateParams, $rootScope, $location, Authentication, Boundaries, $state, leafletData) {
    $scope.authentication = Authentication;
    console.log($stateParams.boundaryId);
    $scope.loading = true;
    /*
      Map logic
    */
    if($state.current.name === 'boundaries.view') {
      var boundaryFeature = $stateParams.boundaryFeature;
      var boundaryId = $stateParams.boundaryId;
      var center = $stateParams.center;

      $scope.b_maname = boundaryFeature.properties.MANAME;
      $scope.b_mgrinst = boundaryFeature.properties.MGRINST;
      $scope.b_owner = boundaryFeature.properties.OWNER;
      $scope.b_ma_website = boundaryFeature.properties.MA_WEBSITE;
      $scope.b_manager = boundaryFeature.properties.MANAGER;
      $scope.b_ownertypes = boundaryFeature.properties.OWNERTYPES;
      $scope.b_area = boundaryFeature.properties.AREA;
      $scope.b_totacres = boundaryFeature.properties.TOTACRES;
      if(boundaryFeature.properties.DESC2 !== 'ZZ'){
          $scope.b_desc = boundaryFeature.properties.DESC1 + boundaryFeature.properties.DESC2;
      }
      else if (boundaryFeature.properties.DESC1 !== 'ZZ'){
          $scope.b_desc = boundaryFeature.properties.DESC1;
      } 
      else {
          $scope.b_desc = 'No description available. ';
      }

    //reroute because we came here from somewhere other than home page
      if (boundaryFeature === null && boundaryId !== null){
        $state.go('home');
        //boundaryFeature = $scope.findOne();
        //console.log(boundaryFeature);
      }

      var mapboxTile = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'meangurlz.cd22205e',
        accessToken: 'pk.eyJ1IjoibWVhbmd1cmx6IiwiYSI6ImNpa2g1cnF4YjAxNGx2dGttcGFmcm5nc3MifQ.ftvskKymYXv1VfqJPU9tnQ'
      });

      $scope.map = null;

      leafletData.getMap('boundary').then(function(map) {
        mapboxTile.addTo(map);
        $scope.map = map;
        var firstMarker = $stateParams.boundaryFeature.geometry.coordinates[0];
        console.log(firstMarker);
        var secondMarker = $stateParams.boundaryFeature.geometry.coordinates[$stateParams.boundaryFeature.geometry.coordinates.length - 1];
        console.log(secondMarker);
        var group = new L.featureGroup([firstMarker, secondMarker]);
        //$scope.map.fitBounds(group.getBounds());
        //$scope.map.fitBounds(group.getBounds());
      });
      
      var setZoom = function(){

        if($stateParams.boundaryFeature.properties.TOTACRES >= 10000){
           return 12;
        }
        else if ($stateParams.boundaryFeature.properties.TOTACRES >= 5000){
           return 13;
        }
        else if ($stateParams.boundaryFeature.properties.TOTACRES >= 2500){
           return 14;
        }
        else {
           return 15;
        }


      };
      angular.extend($scope, {
        alachua: {
          lat: center.lat,
          lng: center.lng,
          zoom: setZoom()
        },
        controls: {
          fullscreen: {
            position: 'topleft'
          }
        },
        geojson: {
          data: boundaryFeature,
          style: {
            
                  color: '#8AAAB5', 'weight' : 2
          
            
          }
        }, 
        tiles: mapboxTile
      });

     $scope.showChildren = function(item){
        item.active = !item.active;
      };
      
      $scope.boundary_items = [
          {
              name: 'Managing Information',
              subItems: [
                  { desc: 'Managing Institution:' },
                  { name: $scope.b_mgrinst },
                  { desc: 'Manager:' },
                  { name: $scope.b_manager },
                  { desc: 'Manager Website:' },
                  { name: $scope.b_ma_website }
              ]
          },
          {
              name: 'Owner Information',
              subItems: [
                  { desc: 'Owner:' },
                  { name: $scope.b_owner },
                  { desc: 'Owner Type:' },
                  { name: $scope.b_ownertypes }
              ]
          },
          {
              name: 'Property Sizing',
              subItems: [
                  { desc: 'Area:' },
                  { name: $scope.b_area },
                  { desc: 'Total Acres:' },
                  { name: $scope.b_totacres }
              ]
          },
          {
              name: 'About',
              subItems: [
                  { desc: 'Description:' },
                  { name: $scope.b_desc }
              ]
          }
      ];



    }
    //end of boundary map log
    
    /*
      Admin logic
    */
    else {

    // Create new Boundary
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'boundaryForm');

        return false;
      }

      // Create new  Boundary object
      var boundary = new Boundaries({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      boundary.$save(function (response) {
        $location.path('boundaries/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Boundary
    $scope.remove = function (boundary) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (boundary) {
          boundary.$remove();

          for (var i in $scope.boundaries) {
            if ($scope.boundaries[i] === boundary) {
              $scope.boundaries.splice(i, 1);
            }
          }
        } else {
          $scope.boundaries.$remove(function () {
            $state.go('boundaries.list');
          });
        }
      }
    };

    // Update existing Boundary
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'boundaryForm');

        return false;
      }

      var boundary = $scope.boundary;
      console.log(boundary);

      boundary.$update(function () {
        $state.go('boundaries.list' , {
          boundaryId: boundary._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Boundaries
    $scope.find = function () {
      Boundaries.query().$promise.then(function (res) {
        $scope.boundaries = res;
        $scope.loading = false;
      });
    };

    // Find existing Boundary
    $scope.findOne = function () {
      angular.extend($scope, {
          preview: {
                lat: 29.671316,
                lng: -82.327766,
                zoom: 10
          }
      });

      Boundaries.get({ boundaryId: $stateParams.boundaryId })
        .$promise.then(function (res) {
            $scope.boundary = res;
            console.log($scope.boundary);
            var previewData = $scope.boundary.geometry;
            
            angular.extend($scope, {
              geojson: {
                data: previewData,
                style: {
                  color: 'green'
                }
              }
            });
         $scope.loading = false;
      });
    };

    $scope.showContent = function($fileContent){
      $scope.content = $fileContent;
      var previewData = JSON.parse($scope.content);
      angular.extend($scope, {
        center: {
            lat: 29.671316,
            lng: -82.327766,
            zoom: 10
        },
        geojson: {
          data: previewData,
          style: {
            color: 'red'
          }
        }
      });
    };
  }
}
]);

