$(document).ready(function() {
    
    // global variables :(
    server = '/v1.2/qliqserver'
    user_lat = null
    user_lng = null

    // Show the login modal
    if(!sessionStorage.getItem('user_id')) {
        $('#loginModal').modal({
            backdrop:   'static',
            keyboard:   false,
            show:       true
        })
    } else {
        user_id = sessionStorage.getItem('user_id')
        amplify.publish('user_loggedin')
        //loadContentPane()   
        //loadBadgesPane()
        //loadFriendsPane()
        //loadHistoryPane()
    }


    // Check for geolocation
    if ("geolocation" in navigator) {
        console.log('geolocation is available')
        navigator.geolocation.getCurrentPosition(function(position) {
            sessionStorage.setItem('lat', position.coords.latitude)
            sessionStorage.setItem('lng', position.coords.longitude)
            user_lat = sessionStorage.getItem('lat')
            user_lng = sessionStorage.getItem('lng')
            amplify.publish('geolocation_changed')
        })
    } else {
        console.log('geolocation is not available, using default')
        user_lat = '29.43288'
        user_lng = '-98.500389999999996'
        amplify.publish('geolocation_changed')
    }
        
    // Login form queries the API
    // and closes the box if successful
    $('#loginbutton').click(function() {
        $.post(server + '/login', {
                                    'username': $('#loginUser').val(), 
                                    'password':$('#loginPass').val()
                                    }, function(data) {
 
                        sessionStorage.setItem('user_id', data.data.user.id)
                        $('#loginModal').modal('hide')
                        amplify.publish('user_loggedin')
                    })
    })

    $('#change_location1').click(function() {
        user_lat = '29.6256999999999984'    
        user_lng = '-98.4958599999999933'  
        amplify.publish('geolocation_changed')
    })
   
    $('#change_location2').click(function() {
        user_lat = '29.4328900000000004'    
        user_lng = '-98.5003899999999959'  
        amplify.publish('geolocation_changed')
    })

    $('#change_location3').click(function() {
        user_lat = '29.7900500000000008'    
        user_lng = '-98.7296300000000002'  
        amplify.publish('geolocation_changed')
    })
})
                 
    // Once they've made it throught the login modal
    // We can use the user_id and start fetching
    // user data to fill these panes
    function loadContentPane() {
        // Load content for social
        $.get(server + '/feed', function(data) {
            $('#social_pane').html('')      
            $('#social_pane').append('<ul></ul>')
            for(var i=0; i< data.data.events.length; i++) {
                $('#social_pane ul').append('<li>' + data.data.events[i].third_person_message + '</li>')
                                                }
                                        })  
    }

    function loadBadgesPane() {
        // Load content for badges

        $.get(server + '/badges/' + user_id, function(data) {
        //  $('#badges_pane').html('')      
        //  $('#badges_pane').append('<ul id="won_true">Unlocked Badges</ul>')
        //  $('#badges_pane').append('<ul id="won_false">Locked Badges</ul>')
        //  console.log(data.data.badges.length)        
            for(var i=0; i< data.data.badges.length; i++) {
        if(data.data.badges[i].won)  {
            $('#won_true').append('<li>' + data.data.badges[i].name + '</li>')
        } else {
            $('#won_false').append('<li>' + data.data.badges[i].name + '</li>')
        }
            }
        })      

    }

    function waitForGeolocation() {

        // Load content for places
        $.get(server + '/places?lat=' + user_lat + '&lng=' + user_lng, function(data) {
            loadDealsPane(data)
            $('#places_pane').html('')
            $('#places_pane').append('<ul id="local_places">Local</ul>')
            $('#places_pane').append('<ul id="recommended_places">Recommended</ul>')
            $('#places_pane').append('<ul id="favorite_places">Favorite</ul>')
            for(var i=0; i< data.data.results.local.length; i++)  {
                $.get(server + '/location/' + data.data.results.local[i].location_id, function(data) {
                    $('#local_places').append('<li>' + data.data.location.name + ' - ' + data.data.location.street_1 + '</li>')
                })
			}
            for(var i=0; i< data.data.results.recommended.length; i++)  {
                $.get(server + '/location/' + data.data.results.recommended[i].location_id, function(data) {
                    $('#recommended_places').append('<li>' + data.data.location.name + ' - ' + data.data.location.street_1 + '</li>')
                })
			}
            for(var i=0; i< data.data.results.favorites.length; i++)  {
                $.get(server + '/location/' + data.data.results.favorites[i].location_id, function(data) {
                    $('#favorite_places').append('<li>' + data.data.location.name + ' - ' + data.data.location.street_1 + '</li>')
                })
			}
        })
    }

   function loadDealsPane(data) { 
       // Load content for deals
       $('#deals_pane').html('')
       $('#deals_pane').append('<ul></ul>')
            for(var i=0; i< data.data.results.local.length; i++)  {
                $.get(server + '/public/deals/' + data.data.results.local[i].location_id, function(data) {
                    for(var i=0; i<data.data.deals.length; i++) {
                        $('#deals_pane ul').append('<li>' + data.data.deals[i].text + ' - ' + data.data.deals[i].qpoint_cost + '</li>')
                	}
                })
            }
    }

   function loadFriendsPane() { 
       // Load content for friends
           $.get(server + '/friends/' + user_id, function(data) {
                if(data.data.friends.length > 0) {
                    $('#friends_pane').html('')
                    $('#friends_pane').append('<ul></ul>')
				}
                for(var i=0; i<data.data.friends.length; i++) {
                    $('#friends_pane ul').append('<li>' + data.data.friends[i].first_name + ' ' +data.data.friends[i].last_name + '</li>')
               	}
           })
       }
    
        
   function loadHistoryPane() { 
       // Load content for friends
           $.get(server + '/history/' + user_id, function(data) {
				//console.log(data.data.events.length)
                if(data.data.events.length > 0) {
                    $('#history_pane').html('')
                    $('#history_pane').append('<ul></ul>')
				}
                for(var i=0; i<data.data.events.length; i++) {
                    $('#history_pane ul').append('<li>' + data.data.events[i].first_person_message + '</li>')
               	}
           })
       }


amplify.subscribe('geolocation_changed', function() {
        console.log('amplify caught a geolocation_changed event')
        waitForGeolocation()
        loadContentPane()
        loadFriendsPane()
        loadBadgesPane()
        loadHistoryPane()  
}) 


amplify.subscribe('user_loggedin', function(){
        console.log('amplify caught a user_loggedin event')
        loadContentPane()
        loadBadgesPane()
        loadFriendsPane()
})




