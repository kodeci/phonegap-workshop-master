var app = {
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
		
		$(window).on('hashchange', $.proxy(this.route, this));
	},
	route: function() {
		var hash = window.location.hash;
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
	member: '8767993139',
	service: window.location.href.indexOf('kodeci') > 0 ? 'http://kodeci.dyndns.tv:8085/xodev/m.ashx' : 'https://cliqja.com/m.ashx',
	request: function(data, responder) {
		var self = this;
		data.nonce = self.nonce;
		
		$.ajax({type:'POST', url:self.service, data:data, crossDomain: true })
			.fail(function() { alert("error"); })
			.done(function(res) { console.log(res); })
			.done(function(response){
				var parts = response.split('\n');
				
				// if a new nonce is setup then save it and call the responder with the result parts
				if(parts[0] && parts[0].indexOf(self.member) == 0) {
					self.nonce = parts[0];
					if(responder) responder(parts);
				}
				else {
					// if you failed to automatically retrying login... then stop the app
					if(self.nonce = 'login' && data.retry){ self.showAlert('Error Associating the member', 'Please restart and try again'); return; }
					// if you retried and failed for whatever other reason... then dont continue retrying
					if(data.retry){ self.showAlert('Error on Retry', response); return; }
					// a nonce was not returned
					if(parts[0] && parts[0].indexOf(self.member) != 0){ self.showAlert('Request Failed', response); return; }
					
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
			self.store = me;
			self.route();
			self.request({ x: self.member });
		});
	}
};

app.initialize();