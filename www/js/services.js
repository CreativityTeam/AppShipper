angular.module('app.services', ['ionic'])

.constant('API_ENDPOINT',{
    url: 'http://localhost:3000/server'
})

.service('AuthService',function($q, $http,API_ENDPOINT){
    var token_local = "Create Toke Pls";
    var isAuthenticated = false;
    var authToken;

    var useToken = function(token){
        isAuthenticated = true;
        authToken = token;
    };

    var storeToken = function(token){
        window.localStorage.setItem(token_local,token);
        useToken(token);
    };

    var destroyToken = function(){
        authToken = undefined;
        isAuthenticated = false;
        window.localStorage.removeItem(token_local);
    };

    var register = function(user){
        return $q(function(resolve,reject){
            $http.post(API_ENDPOINT.url + '/api/users/register' , user).then(function(response){
                if(response.data.success){
                    storeToken(response.data.token);
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
                    resolve(response.data.msg);
                }else{
                    reject(response.data.msg);
                }
            });  
        })
    };

    var checkToken = function(){
        var token = window.localStorage.getItem(token_local);
        if(token){
            useToken(token);
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
    tokensave : function() {return authToken;},
    isAuthenticated: function() {return isAuthenticated;}
  };
})

.service('BgTrackingService',function($http, $ionicPlatform, $ionicLoading){
    this.start = function(){        
        var currentPlatform = ionic.Platform.platform();
        var currentPlatformVersion = ionic.Platform.version();        
        backgroundGeolocation.watchLocationMode(
            function (enabled) {
                if (enabled) {
                // location service are now enabled 
                // call backgroundGeolocation.start 
                // only if user already has expressed intent to start service 
                    alert('Location is now enabled');
                } else {
                // location service are now disabled or we don't have permission 
                // time to change UI to reflect that 
                    alert('Location is now disabled');
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
                var locationUrl = 'http://192.168.0.102:3000/server/api/orders/updateshiplocation/586e28470600b0151cb655c7';                  
                var backgroundGeolocation = window.backgroundGeolocation || window.backgroundGeoLocation || window.universalGeolocation;
                var callbackFn = function(location) {                                
                    $ionicLoading.show({ template: 'Your current location:  ' + location.latitude + ',' + location.longitude, noBackdrop: true, duration: 2000 });                        

                    // //For testing
                    // var requestBody = {'location_shipping': {"time": location.time, "latitude": location.latitude, "longitude": location.longitude}};            

                    //Real
                    var requestBody = {"time": location.time, "latitude": location.latitude, "longitude": location.longitude};            

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
                    $ionicLoading.show({ template: 'Service start successfully', noBackdrop: true, duration: 2000 });
                }, function(error){
                    $ionicLoading.show({ template: 'Service start failed ' + error, noBackdrop: true, duration: 2000 });
                });
            }
            else{
                // Location services are disabled                
                alert('Location is now disabled. Please go to location settings and enable it!');                                                        
            }
        });        
    }

    this.stop = function(){
        // If you wish to turn OFF background-tracking, call the #stop method. 
        backgroundGeolocation.stop(); 
    }
})

.service('LocationShippingData', function($timeout, $http, $ionicLoading){
    var getLocationUrl = 'http://192.168.0.102:3000/server/api/orders/getlocationshipping/586e28470600b0151cb655c7';
    this.getLocationShipping = function(){
        $ionicLoading.show({ template: 'Getting location...', noBackdrop: true, duration: 1000 });                        
        $timeout(function(){
            $http.get(getLocationUrl).then(function(response){                        
                $ionicLoading.show({ template: 'Current location: ' + response.data.point.latitude + ' ' + response.data.point.longitude, noBackdrop: true, duration: 1000 });                        
            }, function(error){                        
                $ionicLoading.show({ template: 'Error ' + error.data + ' ' + error.status + ' ' + error.statusText, noBackdrop: true, duration: 1000 });
            });
        },2000);
    }
})