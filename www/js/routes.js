angular.module('app.routes', ['ionicUIRouter'])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('tabsController.orderList', {
    url: '/orderlist',
    views: {
      'tab1': {
        templateUrl: 'templates/orderList.html',
        controller: 'orderListCtrl'
      }
    }
  })

  .state('tabsController.orderHistory', {
    url: '/ordierhist',
    views: {
      'tab2': {
        templateUrl: 'templates/orderHistory.html',
        controller: 'orderHistoryCtrl'
      }
    }
  })

  .state('tabsController.profile', {
    url: '/profile',
    views: {
      'tab2': {
        templateUrl: 'templates/profile.html',
        controller: 'profileCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  /* 
    The IonicUIRouter.js UI-Router Modification is being used for this route.
    To navigate to this route, do NOT use a URL. Instead use one of the following:
      1) Using the ui-sref HTML attribute:
        ui-sref='tabsController.order1'
      2) Using $state.go programatically:
        $state.go('tabsController.order1');
    This allows your app to figure out which Tab to open this page in on the fly.
    If you're setting a Tabs default page or modifying the .otherwise for your app and
    must use a URL, use one of the following:
      /page1/tab1/orderdetail
      /page1/tab2/orderdetail
  */
  .state('tabsController.order1', {
    url: '/orderdetail/:idorder',
    views: {
      'tab1': {
        templateUrl: 'templates/order1.html',
        controller: 'order1Ctrl'
      },
      'tab2': {
        templateUrl: 'templates/order1.html',
        controller: 'order1Ctrl'
      }
    }
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('signup', {
    url: '/Signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

$urlRouterProvider.otherwise('/page1/orderlist')

  

})

.run(function($rootScope,$state,AuthService,$window){
    $rootScope.$on('$stateChangeStart',function(event,next,nextParams,fromState){
        if(!AuthService.isAuthenticated()){
            if(next.name != 'login' && next.name != 'signup'){
                event.preventDefault();
                $state.go('login');
            };
        }
    });
})