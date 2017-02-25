angular.module('app.services', ['ionic'])

.constant('API_ENDPOINT', {
    root: 'http://192.168.1.7:3000/',
    url: 'http://192.168.1.7:3000/server'     
})

.service('AuthService',function($q, $http,API_ENDPOINT){
    var token_local = "Create Toke Pls";
    var isAuthenticated = false;
    var authToken;
    var userSaveID;
    var userlogedID = "Nhatdev";

    var useToken = function(token){
        isAuthenticated = true;
        authToken = token;
    };

     var useInfor = function(userNotSave){
        window.localStorage.getItem(userlogedID);
        userSaveID = userNotSave;
    };

    var storeToken = function(token){
        window.localStorage.setItem(token_local,token);
        useToken(token);
    };

    var storeID = function(userID){
        window.localStorage.setItem(userlogedID,userID);
        useInfor(userID);
    };

    var destroyToken = function(){
        authToken = undefined;
        userSaveID = undefined;
        isAuthenticated = false;
        window.localStorage.removeItem(token_local);
        window.localStorage.removeItem(userlogedID);
    };

    var register = function(user){
        return $q(function(resolve,reject){
            $http.post(API_ENDPOINT.url + '/api/users/register' , user).then(function(response){
                if(response.data.success){
                    storeToken(response.data.token);
                    $http.get(API_ENDPOINT.url + '/api/users/findone/' + response.data.token).success(function(response){
                        if(response.success){
                            storeID(response.data._id);
                        }
                    });
                    resolve(response.data.msg);
                }else{
                    reject(response.data.msg);
                }
            });
        });
    };

    var login = function(user){
        return $q(function(resolve,reject){
            $http.post(API_ENDPOINT.url + '/api/users/login' , user).then(function(response){
                if(response.data.success){
                    storeToken(response.data.token);
                    $http.get(API_ENDPOINT.url + '/api/users/findone/' + response.data.token).success(function(response){
                        if(response.success){
                            storeID(response.data._id);
                        }
                    });
                    resolve(response.data.msg);
                }else{
                    reject(response.data.msg);
                }
            });  
        })
    };

    var checkToken = function(){
        var token = window.localStorage.getItem(token_local);
        var userInfomarionID = window.localStorage.getItem(userlogedID);
        if(token){
            useToken(token);
            useInfor(userInfomarionID)
        }
    };

    checkToken();
    
    var logout = function(){
        destroyToken();
    };

  return {
    login: login,
    register: register,
    logout: logout,
    setToken : function(token) { return storeToken(token);},
    userInforIdSave : function() { return userSaveID},
    tokensave : function() {return authToken;},
    isAuthenticated: function() {return isAuthenticated;}
  };
})

.service('ShippingStatusService',function($http,API_ENDPOINT){
    this.shipping = function(orderId){
        var requestBody = {'status': 'shipping'};
        $http.put(API_ENDPOINT.url + '/api/orders/updatestatus/' + orderId, requestBody).then(function(response){                        
            // $ionicLoading.show({ template: 'Send location data to server successfully!', noBackdrop: true, duration: 2000 });                        
        }, function(error){                        
            // $ionicLoading.show({ template: 'Error: ' + error.data + ' ' + error.status + ' ' + error.statusText, noBackdrop: true, duration: 2000 });
        });
    }

    this.shipped = function(orderId){
        var requestBody = {'status': 'shipped'};
        $http.put(API_ENDPOINT.url + '/api/orders/updatestatus/' + orderId, requestBody).then(function(response){                        
            //$ionicLoading.show({ template: 'Send location data to server successfully!', noBackdrop: true, duration: 2000 });                        
        }, function(error){                        
            //$ionicLoading.show({ template: 'Error: ' + error.data + ' ' + error.status + ' ' + error.statusText, noBackdrop: true, duration: 2000 });
        });
    }
})

.service('BgTrackingService',function($http, $ionicPlatform, $ionicLoading, API_ENDPOINT){
    this.start = function(orderId){        
        var currentPlatform = ionic.Platform.platform();
        var currentPlatformVersion = ionic.Platform.version();        
        backgroundGeolocation.watchLocationMode(
            function (enabled) {
                if (enabled) {
                // location service are now enabled 
                // call backgroundGeolocation.start 
                // only if user already has expressed intent to start service 
                    alert('Location is now enabled. Tracking is ready!');
                } else {
                // location service are now disabled or we don't have permission 
                // time to change UI to reflect that 
                    alert('Tracking not work because location is now disabled. Please go to Settings to turn it on!');
                }
            },
            function (error) {
                console.log('Error watching location mode. Error:' + error);
            }
        );

        backgroundGeolocation.isLocationEnabled(function(enabled){
            if (enabled){
                var locationTestUrl = 'https://lit-plains-83504.herokuapp.com/locations';
                //This is temporarily for testing
                // var locationUrl = 'https://lit-plains-83504.herokuapp.com/testlocations';
                //Real                
                // var locationUrl = API_ENDPOINT.url + '/api/orders/updateshiplocation/' + orderId;
                var locationUrl = API_ENDPOINT.url + '/api/orders/updateshiplocation';                              
                var backgroundGeolocation = window.backgroundGeolocation || window.backgroundGeoLocation || window.universalGeolocation;
                var callbackFn = function(location) {                                
                    $ionicLoading.show({ template: 'Your current location:  ' + location.latitude + ',' + location.longitude, noBackdrop: true, duration: 1000 });                        

                    // //For testing
                    // var requestBody = {'location_shipping': {"time": location.time, "latitude": location.latitude, "longitude": location.longitude}};            

                    //Real
                    var requestBody = {"time": location.time, "latitude": location.latitude, "longitude": location.longitude, "id": orderId};            

                    // Do your HTTP request here to POST location to your server. 
                    $http.put(locationUrl, requestBody).then(function(response){                        
                        $ionicLoading.show({ template: 'Send location data to server successfully!', noBackdrop: true, duration: 2000 });                        
                    }, function(error){                        
                        $ionicLoading.show({ template: 'Error: ' + error.data + ' ' + error.status + ' ' + error.statusText, noBackdrop: true, duration: 2000 });
                    }); 
                    
                    /*
                    IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
                    and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
                    IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
                    */
                    backgroundGeolocation.finish();
                };

                var failureFn = function(error) {
                    alert('BackgroundGeolocation error');
                };
                
                // BackgroundGeolocation is highly configurable. See platform specific configuration options 
                backgroundGeolocation.configure(callbackFn, failureFn, {         
                    debug: true,   
                    desiredAccuracy: 10,
                    stationaryRadius: 20,
                    distanceFilter: 30,
                    // url: locationTestUrl,            
                    maxLocations: 1000,
                    // Android only section 
                    locationProvider: backgroundGeolocation.provider.ANDROID_ACTIVITY_PROVIDER,
                    interval: 60000,
                    fastestInterval: 5000,
                    activitiesInterval: 10000,
                    notificationTitle: 'Background tracking',
                    notificationText: 'enabled'
                });

                // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app. 
                backgroundGeolocation.start(function(){                    
                    $ionicLoading.show({ template: 'Service start successfully', noBackdrop: true, duration: 1000 });
                }, function(error){
                    $ionicLoading.show({ template: 'Service start failed ' + error, noBackdrop: true, duration: 1000 });
                });
            }
            else{
                // Location services are disabled                
                alert('Location is now disabled. Please go to location settings and enable it!');                                                        
            }
        });        
    }

    this.stop = function(orderId){
        // If you wish to turn OFF background-tracking, call the #stop method. 
        backgroundGeolocation.stop(); 
    }
})