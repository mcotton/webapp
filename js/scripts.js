$(document).ready(function() {
	
	// global variables :(
	server = '/future/qliqserver'
	user_lat = null
	user_lng = null

	// Show the login modal
	if(!sessionStorage.getItem('user_id')) {
		$('#loginModal').modal({
			backdrop:	'static',
			keyboard:	false,
			show:		true
		})
	} else {
		user_id = sessionStorage.getItem('user_id')
		loadContentPane()	
		loadBadgesPane()
	}


	// Check for geolocation
	if ("geolocation" in navigator) {
		console.log('geolocation is available')
		navigator.geolocation.getCurrentPosition(function(position) {
			sessionStorage.setItem('lat', position.coords.latitude)
			sessionStorage.setItem('lng', position.coords.longitude)
			user_lat = sessionStorage.getItem('lat')
			user_lng = sessionStorage.getItem('lng')
			waitForGeolocation()	
		})
	} else {
		console.log('geolocation is not available')
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
						loadContentPane()
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
            	$('#social_pane').append('<li>' + data.data.events[i].third_person_message + '</li>')
                                                }
                                        })	
	}

	function loadBadgesPane() {
		// Load content for badges

		$.get(server + '/badges/' + user_id, function(data) {
			$('#badges_pane').html('')	    
			$('#badges_pane').append('<ul></ul>')
			console.log(data.data.badges.length)	    
            for(var i=0; i< data.data.badges.length; i++) {
            	$('#places_pane').append('<li>' + data.data.badges[i].name + '</li>')
            }
        })		

	}

	function waitForGeolocation() {

		// Load content for places
		$.get(server + '/places?lat=' + user_lat + '&lng=' + user_lng, function(data) {
			$('#places_pane').html('')
			$('#places_pane').append('<ul></ul>')
			for(var i=0; i< data.data.results.local.length; i++)  {
            	$('#places_pane').append('<li>' + data.data.results.local[i].address + '</li>')
                                                }
                                        })	
		// Load content for deals
		$('#deals_pane').html('')	    
	    
	    
    }

		


	
})
