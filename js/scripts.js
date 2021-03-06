$(document).ready(function() {
    
    // global variables :(
    server = '/v1.2/qliqserver'

    user = {
        id: '',
        fullname: '',
        username: '',
        password: '',
        lat: null,
        lng: null
    }


    $('#login-link').click(function() {
        $('#loginModal').modal({
            keyboard:   false,
            show:       true
        })
    })

    if(!sessionStorage.getItem('user.id')) {
    } else {
        user.id = sessionStorage.getItem('user.id')
    }


    // Check for geolocation
    if ("geolocation" in navigator) {
        console.log('geolocation is available')
        navigator.geolocation.getCurrentPosition(function(position) {
            sessionStorage.setItem('lat', position.coords.latitude)
            sessionStorage.setItem('lng', position.coords.longitude)
            user.lat = sessionStorage.getItem('lat')
            user.lng = sessionStorage.getItem('lng')
            amplify.publish('geolocation_changed')
        })
    } else {
        console.log('geolocation is not available, using default')
        user.lat = '29.43288'
        user.lng = '-98.500389999999996'
        amplify.publish('geolocation_changed')
    }
       

    // Get credentials from login form and try to login
    $('#loginbutton').click(function() {
        user.username = $('#loginUser').val()
        user.password = $('#loginPass').val()
        $.post(server + '/login', user, function(data) {
            user.id = data.data.user.id
            user.fullname = data.data.user.full_name
            sessionStorage.setItem('user_id', user.id)
            $('#loginModal').modal('hide')
            amplify.publish('user_loggedin')
        })
    
    })

    $('.change_location').click(function() {
        var index = $('.change_location').index(this)
        switch(index) {
            case 0:
                user.lat = '29.6256999999999984'    
                user.lng = '-98.4958599999999933'  
                amplify.publish('geolocation_changed')
                break
           case 1:
                user.lat = '29.4328900000000004'    
                user.lng = '-98.5003899999999959'  
                amplify.publish('geolocation_changed')
                break
           case 2:
                user.lat = '29.7900500000000008'    
                user.lng = '-98.7296300000000002'  
                amplify.publish('geolocation_changed')
                break
           default:
                // Don't want to do anything with it right now
                break
        }
    })

}) //document.ready
  
               
    // Once they've made it throught the login modal
    // We can use the user.id and start fetching
    // user data to fill these panes
    function loadFeedPane() {
        // Load content for social
        $.get(server + '/feed', function(data) {
            $('#social_pane').html('')      
            $('#social_pane').append('<table class="table"></table>')
            for(var i=0; i< data.data.events.length; i++) {
                $('#social_pane table').append('<tr><td>' + data.data.events[i].third_person_message + '</tr></tr>')
                                                }
                                        })  
    }

    function loadBadgesPane() {
        // Load content for badges

        $.get(server + '/badges/' + user.id, function(data) {
            $('#badges_pane').html('') 
            $('#badges_pane').append('<table class="table"></table>')     
            for(var i=0; i< data.data.badges.length; i++) {
                if(data.data.badges[i].won)  {
                    $('#badges_pane table').append('<tr><td>' + data.data.badges[i].name + '</td></tr>>')
                }
            }
        })      

    }

    function waitForGeolocation() {

        // Load content for places
        $.get(server + '/places?lat=' + user.lat + '&lng=' + user.lng, function(data) {
            loadDealsPane(data)
            $('#places_pane').html('')
            $('#places_pane').append('<table class="table" id="favorite_places">Favorite</table>')
            $('#places_pane').append('<table class="table" id="recommended_places">Recommended</table>')
            $('#places_pane').append('<table class="table" id="local_places">Local</table>')
            loadFeaturedPlaces(data.data.results)
            for(var i=0; i< data.data.results.local.length; i++)  {
                    $('#local_places').append('<tr><td>' + data.data.results.local[i].name + '</td></tr>')
			}
            for(var i=0; i< data.data.results.recommended.length; i++)  {
                    $('#recommended_places').append('<tr><td>' + data.data.results.recommended[i].name + '</td></tr>')
			}
            for(var i=0; i< data.data.results.favorites.length; i++)  {
                    $('#favorite_places').append('<tr><td>' + data.data.results.favorites[i].name + '</td></tr>')
			}
        })
    }

   function loadFeaturedPlaces(data) {
      lst = []
      icons = $('.thumbnail')
      for(var i=0; i< data.favorites.length; i++) {
          lst.push(data.favorites[i])
      }
      for(var i=0; i< data.recommended.length; i++) {
          lst.push(data.recommended[i])
      }
      for(var i=0; i< data.local.length; i++) {
          lst.push(data.local[i])
      }
      for(var i=0; i< lst.length; i++) {
         if(i < 6) {
            icons[i].children[1].innerHTML = lst[i].name
            icons[i].children[2].innerHTML = lst[i].street_1
         } 
      }
       
   }

   function loadDealsPane(data) { 
       // Load content for deals
       $('#deals_pane').html('')
       $('#deals_pane').append('<table class="table"></table>')
       $('#deals_pane table').append('<thead><tr><td>Description</td><td>QPoints</td></tr></thead>')
            for(var i=0; i< data.data.results.local.length; i++)  {
                $.get(server + '/public/deals/' + data.data.results.local[i].business_id, function(data) {
                    for(var i=0; i<data.data.deals.length; i++) {
                        $('#deals_pane table').append('<tr><td>' + data.data.deals[i].data.text + ' </td><td> ' + data.data.deals[i].data.qpoint_cost + '</td></tr>')
                	}
                })
            }
    }

   function loadFriendsPane() { 
       // Load content for friends
           $.get(server + '/friends/' + user.id, function(data) {
                if(data.data.friends.length > 0) {
                    $('#friends_pane').html('')
                    $('#friends_pane').append('<table class="table"></table>')
				}
                for(var i=0; i<data.data.friends.length; i++) {
                    $('#friends_pane table').append('<tr><td style="width: 40px;"><img src=' + data.data.friends[i].image_url + '></td><td>' + data.data.friends[i].first_name + ' ' +data.data.friends[i].last_name + '</td></tr>')
               	}
           })
       }
    
        
   function loadHistoryPane() { 
       // Load content for friends
           $.get(server + '/history/' + user.id, function(data) {
                if(data.data.events.length > 0) {
                    $('#history_pane').html('')
                    $('#history_pane').append('<table class="table"></table>')
				}
                for(var i=0; i<data.data.events.length; i++) {
                    $('#history_pane table').append('<tr><td>' + data.data.events[i].first_person_message + '</td></tr>')
               	}
           })
       }


   function renderThumbnails(data) {
   // populate the thumbnails at the top of the screen
   


   }


// pub/sub

amplify.subscribe('user_loggedin', function(){
        console.log('amplify caught a user_loggedin event')
        loadFeedPane()
        loadBadgesPane()
        loadFriendsPane()
        loadHistoryPane()
})

amplify.subscribe('geolocation_changed', function() {
        console.log('amplify caught a geolocation_changed event')
        waitForGeolocation()
        renderThumbnails()

}) 






