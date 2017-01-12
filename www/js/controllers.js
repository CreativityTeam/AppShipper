angular.module('app.controllers', [])
  
.controller('orderListCtrl', function ($scope, $stateParams) {


})
   
.controller('orderHistoryCtrl', function ($scope, $stateParams) {


})
   
.controller('profileCtrl',function ($scope, $stateParams,$state, AuthService) {

    $scope.logout = function(){
        AuthService.logout();
        $state.go('login');
    };
})
      
.controller('order1Ctrl', function ($scope, $stateParams) {


})
   
.controller('loginCtrl',function ($scope, $stateParams,$state, AuthService,$ionicPopup,$ionicLoading) {

    $scope.user = {
        username: '',
        password: ''
    };
    $scope.login = function(){
        if($scope.user.username == "" || $scope.user.password == "") {
            var alertPopup = $ionicPopup.alert({
                title: 'Login Exception',
                template: "Username Or Password Are Missing"
            });    
        }else{
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>',
            });
            AuthService.login($scope.user).then(function(msg){
                $ionicLoading.hide();
                $state.go("tabsController.orderList");  
            },function(errMsg){
                var alertPopup = $ionicPopup.alert({
                    title: 'Login Exception',
                    template: errMsg
                });
                $ionicLoading.hide();
            });
        }
    };
})
   
.controller('signupCtrl',function ($scope, $stateParams,$state,AuthService,$ionicPopup,$ionicLoading) {
    $scope.newUser = {
        email: '',
        firstname: '',
        lastname : '',
        password : '',
        password2: '',
        role : 'shipper'
    };

    $scope.register = function(){
        if($scope.newUser.email == "" || $scope.newUser.firstname == "" || $scope.newUser.lastname == "" || $scope.newUser.password == "" || $scope.newUser.password2 == ""){
            var alertPopup = $ionicPopup.alert({
                title: 'SignUp Exception',
                template: "Some fields Are Missing!!"
            });    
        }else if($scope.newUser.password != $scope.newUser.password2){
            var alertPopup = $ionicPopup.alert({
                title: 'SignUp Exception',
                template: "Your password does not match!!"
            });  
        }else{
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>',
            });
            AuthService.register($scope.newUser).then(function(msg){
                $ionicLoading.hide();
                $state.go("tabsController.food");  
            },function(errMsg){
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Sign-Up Exception',
                    template: errMsg
                });   
            });    
        }
    }; 
})
 