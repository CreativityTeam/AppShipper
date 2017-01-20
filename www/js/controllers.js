angular.module('app.controllers', [])
  
.controller('orderListCtrl', function ($scope,$http, $stateParams, $state, API_ENDPOINT, AuthService,$ionicLoading, BgTrackingService, ShippingStatusService) {
    $scope.isShipping = false;
    var getListOrder = function(){
        $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner></ion-spinner>',
        });
        $http.get(API_ENDPOINT.url + '/api/orders/findAllOrder/').success(function(response){
            if(response.success){
                $ionicLoading.hide();
                $scope.listOrder = response.data.filter(function(elem){
                    if (!elem.shipper){
                        return true;
                    }
                    return false; 
                });
            }    
         });            
    }   

    var ioConnect = function(){        
        var ioServerUrl = API_ENDPOINT.root; 
        console.log(ioServerUrl);               
                    
        $scope.ioConnection = io.connect(ioServerUrl);                      
        $scope.ioConnection.on('status', function(data){            
            $ionicLoading.show({ template: 'New status update ' + data.order_id + ': ' + data.status, noBackdrop: true, duration: 2000 });
            $scope.listOrder.forEach(function(elem){                
                if (elem._id == data.order_id){                    
                    elem.shippingstatus = data.status;
                }
            })
        });                    
    }

    getListOrder();
    ioConnect();

    $scope.startTracking = function(order){        
        /*$ionicLoading.show({ template: 'Start tracking your location', noBackdrop: true, duration: 2000 });*/        
        $scope.orderInTracking = order._id;
        $scope.isShipping = true;
        BgTrackingService.start(order._id);
        var requestBody = {'id': order._id, 'status': 'shipping'};
        $http.put(API_ENDPOINT.url + '/api/orders/updatestatus', requestBody).then(function(response){                        
            console.log('Send status to server done');                        
        }, function(error){ 
            console.log('Send status to server failed');                       
            // $ionicLoading.show({ template: 'Error: ' + error.data + ' ' + error.status + ' ' + error.statusText, noBackdrop: true, duration: 2000 });
        });                
    }

    $scope.stopTracking = function(order){
        /*$ionicLoading.show({ template: 'Stop tracking your location', noBackdrop: true, duration: 2000 });*/
        $scope.isShipping = false;
        $scope.orderInTracking = null;
        BgTrackingService.stop(order._id);
        var requestBody = {'id': order._id, 'status': 'shipped'};
        $http.put(API_ENDPOINT.url + '/api/orders/updatestatus', requestBody).then(function(response){                        
            console.log('Send status to server done');                       
        }, function(error){          
            console.log('Send status to server failed');              
            //$ionicLoading.show({ template: 'Error: ' + error.data + ' ' + error.status + ' ' + error.statusText, noBackdrop: true, duration: 2000 });
        });        
    }

    $scope.$on("$destroy", function(){                    
        console.log('Controller DESTROYED') 
        $scope.ioConnection.disconnect();                           
    })
})
   
.controller('orderHistoryCtrl', function ($scope,$http, $stateParams, $state, API_ENDPOINT, AuthService,$ionicLoading,$cordovaPrinter,$interval) {
    var getListOrder = function($interval){
        // $interval(function(){
            console.log('Updating...');
            $http.get(API_ENDPOINT.url + '/api/orders/findinfobyshipper/' + $stateParams.idshipper).success(function(response){
                $ionicLoading.show({
                    template: '<p>Loading...</p><ion-spinner></ion-spinner>',
                });
                if(response.success){
                    $ionicLoading.hide();
                    $scope.listOrder = response.data;
                }    
            });
        // },1000)              
    }     

    $scope.print = function(idOrder) {
         if($cordovaPrinter.isAvailable()) {
                    $cordovaPrinter.print("http://www.nraboy.com");
                } else {
                    alert("Printing is not available on device");
                }
         /*$http.get(API_ENDPOINT.url + '/api/orders/findOrder/' + idOrder).success(function(response){
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>',
            });
            if(response.success){
                $ionicLoading.hide();
                $scope.Order = response.data;
                var html ="<h1><strong>ORDER" + $scope.Order._id +"</strong></h1>"; 
                html += "<p><strong>Time Order:" + $scope.Order.time_ordered + "</strong></p>";
                html += "<h2><strong>To</strong></h2>"
                html += "<p><strong>" + $scope.Order.location_ordered.address + "</strong></p>";
                html += "<p><strong>&nbsp;</strong></p>";
                html += "<table style='background-color: #ffa77a; height: 146px;' border='1px' width='449'>"  
                html += "<tbody><tr><td><h3><span style='color: #ffffff;'><strong>Name</strong></span></h3></td><td><h3><span style='color: #ffffff;'><strong>Quantity</strong></span></h3></td><td>"
                html += "<h3><span style='color: #ffffff;'><strong>Price Per Unit</strong></span></h3></td></tr><tr><td>"
                for(food in $scope.Order.foods){
                    html += "<h3>" + $scope.Order.foods[food].food_id.food_name + "</h3>"
                    html += "</td><td><h3>" + $scope.Order.foods[food].quantity + "</h3></td><td><h3> " + $scope.Order.foods[food].food_id.price + "</h3></td></tr>"
                }
                html += "<td colspan='2'><h3>&nbsp;</h3><h3>SUBTOTAL</h3></td><td><h3>" + ($scope.Order.total_price - $scope.Order.feeshipping)  + "</h3></td></tr>"
                html += "<tr><td colspan='2'><h3>SHIPPING</h3></td><td><h3>" + $scope.Order.feeshipping + "</h3></td></tr>"
                html += "<tr><td colspan='2'><h3>TOTAL</h3></td><td><h3>" + $scope.Order.total_price + "</h3></td></tr></tbody></table>"*
               
            }
        });*/      
    }
    getListOrder();
})
   
.controller('profileCtrl',function ($scope,$http, $stateParams, $state, API_ENDPOINT, AuthService,$ionicLoading) {
    $scope.isEdit = true;
    $scope.labelButton = "Edit Profile";
    var getinfo = function(){
        if(AuthService.isAuthenticated()){
                $http.get(API_ENDPOINT.url + '/api/users/findone/' + AuthService.tokensave()).success(function(response){
                if(response.success){
                    $scope.user = response.data;
                    $http.get(API_ENDPOINT.url + '/api/orders/findinfobyshipper/' + $scope.user._id).success(function(response){
                        if(response.success){
                            $scope.countOrder = response.data.length;
                        }
                    });   
                }
            });
        }
    };

    getinfo();

    $scope.logout = function(){
        AuthService.logout();
        $state.go('login');
    };

    $scope.enableEdit = function(){
        $scope.isEdit = false;   
    }
    $scope.cancelEdit = function(){
       $scope.isEdit = true; 
    }
    $scope.updateUser = function(id) {
        $http.put(API_ENDPOINT.url + '/api/users/update/' + id, $scope.user).success(function(response){
             $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>',
            });
            if(response.success){
                $ionicLoading.hide();
                $scope.isEdit = true;
            }    
         });      
    };
})
             
.controller('order1Ctrl', function ($scope,$http, $stateParams, $state, API_ENDPOINT, AuthService,$ionicLoading,NgMap,NavigatorGeolocation) {   
    var getInfor = function(){
        $http.get(API_ENDPOINT.url + '/api/orders/findOrder/' + $stateParams.idorder).success(function(response){
            $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>',
            });
            if(response.success){
                $ionicLoading.hide();
                $scope.Order = response.data;
                $scope.lat = $scope.Order.location_ordered.point.latitude
                $scope.lng = $scope.Order.location_ordered.point.longitude
            }    
         });      
    } 
    getInfor();
})
   
.controller('loginCtrl',function ($scope, $stateParams,$state,API_ENDPOINT, AuthService,$ionicPopup,$ionicLoading,$cordovaOauth,$http) {
    $scope.loginFace = function(){
        $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>',
        });
        $cordovaOauth.facebook("1878320485734515", ["email", "public_profile"], {redirect_uri: "http://localhost/callback"}).then(function(result){
            displayData($http, result.access_token);
        },  function(error){
            alert("Error: " + error);
        });

        function displayData($http, access_token)
        {
            $http.get("https://graph.facebook.com/v2.2/me", {params: {access_token: access_token, fields: "id,name,gender,email,picture", format: "json" }}).then(function(result) {
                 $http.post(API_ENDPOINT.url + '/api/users/createFace', result.data).success(function(response){
                        if(response.success){
                            $ionicLoading.hide();
                            AuthService.setToken(response.token);
                            $state.go("tabsController.orderList");
                        }
                    });       
            }, function(error) {
                alert("Error: " + error);
            });
        }
    };
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
                $$state.go("tabsController.orderList");  
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
 