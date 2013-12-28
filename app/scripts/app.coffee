'use strict'
###
 * @ngdoc directive
 * @name rfx.directive:rAutogrow
 * @element textarea
 * @function
 *
 * @description
 * Resize textarea automatically to the size of its text content.
 *
 * @example
   <example module="rfx">
     <file name="index.html">
         <textarea ng-model="text" r-autogrow class="input-block-level"></textarea>
         <pre>{{text}}</pre>
     </file>
   </example>
###
angular.module('angularCmsApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  #'cms.Templates'
])
  .config ($routeProvider) ->
    
    routeResolver = 
      # I will cause a 1 second delay
      delay: ($q, $timeout) ->
        delay = $q.defer()
        $timeout delay.resolve, 1000
        delay.promise

    $routeProvider
      .when '/',
        templateUrl: 'views/main.html'
        controller: 'MainCtrl'
      .when '/docs',
        templateUrl: 'views/docs.html'
        controller: 'DocsCtrl'
      .when '/admin',
        templateUrl: 'views/admin.html'
        controller: 'AdminCtrl'
      .when '/login',
        templateUrl: 'views/login.html'
        controller: 'LoginCtrl'
      .when '/profile',
        templateUrl: 'views/profile.html'
        controller: 'ProfileCtrl'
      .otherwise
        redirectTo: '/'
