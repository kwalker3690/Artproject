angular.module('dangerousWrenchApp')
  .factory('userServices', function ($http,$window,$location,$rootScope) {
    //fb.AsyncInit gets called by the SDK library automagically when we insantiate it
    $window.fbAsyncInit = function() {
      FB.init({
        appId      : '817757534922398',
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.1' // use version 2.1
      });
    };
    var userServices = {
      username: null,
      goToLikes: function(){
        FB.getLoginStatus(function(response){
          console.log('inside FB.getLoginSTatus')

          if(response.status === 'connected'){
            var userID = JSON.stringify({username: response.authResponse.userID});
            console.log('path: /homepage'+ response.authResponse.userID)
            //before sending to likes page, set userName to userID
            userServices.userName = response.authResponse.userID;
            console.log('userServices.userName: '+userServices.userName);
            $location.path('/homepage/'+response.authResponse.userID)
          }
        });
      },
      goToRecs: function(){
        FB.getLoginStatus(function(response){
          if(response.status === 'connected'){
            $location.path('/recommendation');
          }
        })
      },

      goToRec: function(){
        FB.getLoginStatus(function(response){
          console.log('inside FB.getLoginSTatus')
          var userID = JSON.stringify({username: response.authResponse.userID});
          if(response.status === 'connected'){
            console.log('path: /homepage'+ response.authResponse.userID)
            //before sending to likes page, set userName to userID
            userServices.userName = response.authResponse.userID;
            console.log('userServices.userName: '+userServices.userName);
            $location.path('/recommendation')
          }
        });
      },

      // generateUserLikes: function() {
      //   console.log('inside generateUserLikes')
      //   FB.getLoginStatus(function(response){
      //     var username = JSON.stringify({username: response.authResponse.userID});
      //       console.log('username is: '+username);
      //     return $http({
      //       method: 'POST',
      //       url: '/generateUserLikes',
      //       data: username
      //     })
      //   })
      // },

      generateUserLikes: function(username, limit) {
        console.log('username',username,typeof username);
        var user = JSON.stringify({username: username});
        console.log('inside generateUserLikes',user)
        return $http({
          method: 'POST',
          url: '/generateUserLikes',
          data: user
        })
      },

      generateArtistRecommendations: function(username, limit) {
        var data = JSON.stringify({username: username, limit: limit});
        console.log('dddd', data);
        return $http({
          method: 'POST',
          url: '/generateArtistRecommendations',
          data: data
        })
      },

      generateRandomRecommendations: function(username, limit) {
        //before you grab username, u need to call FB.getLoginStatus(func(resp){}) and
        //set username to be response.authResponse.userID
        var data = JSON.stringify({username: username, limit: limit});
                console.log('eee', data)

        return $http({
          method: 'POST',
          url: '/generateRandomRecommendations',
          data: data
        })
      },

      grabUserID: function(){
        // alert(!!userServices.userName)
        return userServices.userName;
      },
      /////////////////////////////////////
      //Facebook Authentication
      /////////////////////////////////////
      statusChangeCallback: function(response){
        console.log('statusChangeCallback');
        console.log('response:',response);
        // The response object is returned with a status field that lets the app
        // know the current login status of the person.
        if (response.status === 'connected'){
          console.log('your userID is: '+response.authResponse.userID);
          userServices.testAPI();
          localStorage.setItem("userName", response.authResponse.userID);
          console.log('userName = '+localStorage.getItem('userName'))
          $location.path('/recommendation')
          ////////////////////////////////////////////////////////////
          //This is what gets called after the user logs in. This is subject to change.
          var userID = JSON.stringify({username: response.authResponse.userID});
          $http({
            method: 'POST',
            url: '/loginSignup',
            data: userID
          })
          console.log('your userID is ' + response.authResponse.userID)
          userServices.userName = response.authResponse.userID;
          ////////////////////////////////////////////////////////////
        } else if(response.status === 'not_authorized'){
          // The person is logged into Facebook, but not your app.
          document.getElementById('status').innerHTML = 'Please log ' + 'into this app.';
          FB.login(function(response){
            FB.getLoginStatus(function(response){
              console.log('checking status again')
              userServices.statusChangeCallback(response);
            });
          });
        } else {
          // The person is not logged into Facebook, so we're not sure if they are logged into this app or not.
          document.getElementById('status').innerHTML = 'Please log '+'into Facebook.';
          FB.login(function(response){
            console.log(response.status ==='connected')
            if(response.status === 'connected'){
              console.log('take me to rec page')
              localStorage.setItem("userName", response.authResponse.userID);
              userServices.username = true
              $rootScope.$apply(function() {

                      $location.path("/recommendation");
                      console.log($location.path());
                    });
            } else {
              console.log('try again')
            }
          });
        }
      },

      isLoggedIn: function() {
        FB.getLoginStatus(function(response){
          console.log('inside FB.getLoginSTatus', response)
          if (response.status === 'connected') {
            return true
          } else {
            return false;
          }
        });
      },

      //This function is called when someone finishes with the Login Button.
      checkLoginState: function(){
        console.log('inside checklogin State')
        FB.getLoginStatus(function(response){
          console.log('inside FB.getLoginSTatus')
          userServices.statusChangeCallback(response);
        });
      },
      logout: function(){
        console.log('loggin out')
        FB.logout();
        //might not be necessary
        localStorage.setItem('userName',null)
      },
      //Controller will have to call this to initialize Facebook's Javacsript SDK
      // fbAsyncInit: function(){
      //   FB.init({
      //     appId      : '817757534922398',
      //     cookie     : true,  // enable cookies to allow the server to access
      //                         // the session
      //     xfbml      : true,  // parse social plugins on this page
      //     version    : 'v2.1' // use version 2.1
      //   });
      // },

      //very simple test of the Graph API after login is successful. See the statusChangeCallback()
      //for when this call is made.
      testAPI: function(){
        console.log('Welcome! Fetching your information...');
        FB.api('/me',function(response){
          console.log('Successful login for: ' + response.name);
        });
      }

    }

    return userServices;
  });
