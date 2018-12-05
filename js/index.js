"use strict";

angular.module("App",["ui.bootstrap"])
.factory("httpInterceptor", function () {
  return {
    request: function (config) {
      var cookieToken = localStorage.getItem("token");
      config.headers["Authorization"] = "Token token=" + cookieToken;
      return config
    }
  }
})
.config(function($httpProvider) {
  $httpProvider.interceptors.push("httpInterceptor");
})
.controller("HomeController",function($scope, $http){
  
	var apiRoot = "https://young-beyond-8772.herokuapp.com";
	var new_apiRoot= "https://tranquil-sands-87455.herokuapp.com";
  
	$scope.destination = {};
	$scope.travelersInfo=[];
  
  var getTravelers = function () {
    $http.get(new_apiRoot + "/travelers").then(function (res) {
      $scope.travelersInfo = res.data.results;
      $scope.travelerId = localStorage.getItem("travelerId");
      $scope.firstName = localStorage.getItem("firstName");
      $scope.activeTab = $scope.travelerId - 1;        
      $scope.loading = false;
      $scope.loggedIn = true;        
    }, function (error) {      
      console.log(error);
      $scope.showError = true;
      $scope.loading = false;        
    });
  }
  
  var patchDestinations = function (data) {
    $scope.loading = true;
    $http.patch(new_apiRoot + "/travelers/" + $scope.travelerId, data).then(function (res) {
      $scope.destination.new = "";
      $scope.showError = false;
      $scope.loading = false;
      $scope.travelersInfo[$scope.activeTab].destinations = res.data.results[0].destinations;
    }, function (error) {
      console.log(error);
      $scope.showError = true;
      $scope.loading = false;
    });
  }
  
  
  $scope.loginUser = function () {    
    $scope.loading = true;
    $http.post(new_apiRoot + "/auth",{name: $scope.username}).then(function (res) {      
      $scope.username = "";
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("travelerId", res.data.id);
      localStorage.setItem("firstName", res.data.name);      
      $scope.showError = false;
      $scope.cantFindUser = false;
      getTravelers();
    }, function (error) {
      console.log(error);
      if (error.status === 401) {
        $scope.cantFindUser = true;
      } else {
        $scope.showError = true;
      }
      $scope.loading = false;
    });    
  }

  $scope.changeVisited = function (index) {
    $scope.visited = $scope.travelersInfo[$scope.activeTab].destinations[index].visited;
    var destinationsArray = $scope.travelersInfo[$scope.activeTab].destinations;
    var destinationsObject = {"destinations": destinationsArray};
    patchDestinations(destinationsObject);    
  }
  
  $scope.addDestination = function (destination) {
    var destinationsArray = [];
    destinationsArray = $scope.travelersInfo[$scope.activeTab].destinations;
    var newDestination = [{"name": destination, "visited": false}];
    var newDestinations = newDestination.concat(destinationsArray);
    var destinationsObject = {"destinations": newDestinations};
    patchDestinations(destinationsObject);    
  }
  
  $scope.deleteDestination = function (index) {
    var destinationsArray = $scope.travelersInfo[$scope.activeTab].destinations;
    var newDestinations = destinationsArray.concat([]);
    newDestinations.splice(index, 1);    
    var destinationsObject = {"destinations": newDestinations};
    patchDestinations(destinationsObject);    
  }
  
  $scope.logout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("travelerId");
    localStorage.removeItem("firstName");
    $scope.loggedIn = false;
    $scope.showError = false;
    $scope.destination = {};
    $scope.travelerId = "";
    $scope.firstName ="";
  }
  
  if (localStorage.getItem("token")) {        
    getTravelers();
  } 

});