if(!console) console = { log : function(){} };

var app = {
    showFailure: function (message, title) {
		setTimeout(function(){ app.showAlert(message, title); });
		return false;
	},
    showAlert: function (message, title) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    },
	registerEvents: function() {
		var self = this;
		// Check of browser supports touch events...
		if (document.documentElement.hasOwnProperty('ontouchstart')) {
			// ... if yes: register touch event listener to change the "selected" state of the item
			$('body').on('touchstart', 'a', function(event) {
				$(event.target).addClass('tappable-active');
			});
			$('body').on('touchend', 'a', function(event) {
				$(event.target).removeClass('tappable-active');
			});
		} else {
			// ... if not: register mouse events instead
			$('body').on('mousedown', 'a', function(event) {
				$(event.target).addClass('tappable-active');
			});
			$('body').on('mouseup', 'a', function(event) {
				$(event.target).removeClass('tappable-active');
			});
		}
		
        $('body').on('click', '.editable', $.proxy(self.editMode, self) );
		$(window).on('hashchange', $.proxy(this.route, this));
	},
	editMode: function() {
		
	},
	route: function() {
		var hash = window.location.hash;
		$('input:focus').each( function(){ this.blur(); });
		if (!hash) {
			$('body').html(new HomeView(this.store).render().el);
			return;
		}
		var match = hash.match(app.detailsURL);
		if (match) {
			this.store.findById(Number(match[1]), function(employee) {
				$('body').html(new EmployeeView(employee).render().el);
			});
		}
	},
	nonce: 'login',
	member: '',
	pin:'',
	service: window.location.href.indexOf('kodeci') > 0 ? 'http://kodeci.dyndns.tv:8085/xodev/m.ashx' : 'https://cliqja.com/m.ashx',
	request: function(data, responder) {
		var self = this;
		data.nonce = self.nonce;
		
		$.ajax({type:'POST', url:self.service, data:data, crossDomain: true })
			.fail(function(e) { self.showFailure(e, "Error"); })
			//.done(function(res) { console.log(res); })
			.done(function(response){
				var parts = response.split('\n');
				// the new nonce should be the first item... remove it
				var newNonce = parts.shift();
				
				// if a new nonce is setup then save it and call the responder with the result parts
				if(newNonce && newNonce.indexOf(self.member) == 0) {
					self.nonce = newNonce;
					if(responder) responder(parts);
				}
				else {
					// if you failed to automatically retrying login... then stop the app
					if(self.nonce == 'login' && data.retry){ return self.showFailure('Error Associating the member', 'Please restart and try again'); }
					
					// if you retried and failed for whatever other reason... then dont continue retrying
					if(data.retry){ return self.showFailure(parts, 'Error on Retry'); }
					
					// a nonce was not returned
					if(newNonce && newNonce.indexOf(self.member) != 0){  return self.showFailure(response, 'Request Failed'); }
					
					// try logging in automatically and retrying the request if successful
					self.nonce = 'login';				
					self.request({ x: self.member, retry:true }, function(){ 
						/* can show the response temporarily before requesting again */ 
						data.retry = true;
						self.request(data, responder);
					});
				}
			});
	},
	initialize: function() {
		var self = this;
		this.detailsURL = /^#employees\/(\d{1,})/;
		this.registerEvents();
		this.store = new LocalStorageStore(function(me) {
			// route to the desired activity at startup
			self.route();
			
			// if the member is known log them in...			
			if(app.member) self.request({ x: self.member });
		});
	}
};

Handlebars.registerHelper('cssise', function(val) {
  return val ? val.toString().replace(/\s/,'').toLowerCase() : '';
});

app.initialize();