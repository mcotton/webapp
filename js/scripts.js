$(document).ready(function() {
	
	// global variables :(
	user_id = ''

	// Show the login modal
	$('#loginModal').modal({
		backdrop:	'static',
		keyboard:	false,
		show:		true
		})
		
	// Login form queries the API
	// and closes the box if successful
	$('#loginbutton').click(function() {
		$.post('/qliqserver/login', {
									'username': $('#loginUser').val(), 
									'password':$('#loginPass').val()
									}, function(data) {
 
                        user_id = data.data.user.id
                        $('#loginModal').modal('hide')
                    })
	})
                    
    // Once they've made it throught the login modal
    // We can use the user_id and start fetching
    // user data to fill these panes
    $('#loginModal').on('hidden', function() {
		// Load content for social
		$.get('/qliqserver/feed', function(data) {
			$('#social_pane').html('')	    
			$('#social_pane').append('<ul></ul>')
            for(var i=0; i< data.data.unread; i++) {
            	$('#social_pane').append('<li>' + data.data.events[i].third_person_message + '</li>')
                                                }
                                        })	
		// Load content for places
		$('#places_pane').html('')	    
		
		// Load content for deals
		$('#deals_pane').html('')	    
	    
	    
    })

		


	
})
