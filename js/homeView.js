(function($) {
    $.fn.longClick = function(callback, timeout) {
		console.log('longstart');
		timeout = timeout || 400;
		var me = $(this).parent();
		var timer = setTimeout(function() { 
				console.log('longclick'); 
				timer = 0; // kill the clearer
				callback(); 
				me.one('click', function(e){ 
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
				});
			}, 
			timeout);
		
		var clearer = function() { 
			if(!timer) return; 
			console.log('longcancel'); 
			clearTimeout(timer); 
			return false; 
		};
		
		$(document).one('mouseup', clearer).one('touchend', clearer).one('mousemove', clearer).one('scroll', clearer);
		
		return false;
    };

})(jQuery);

var HomeView = function(store) {
 
    this.initialize = function() {
		var self = this;
        // Define a div wrapper for the view. The div wrapper is used to attach events.
        this.el = $('<div/>');
        this.el.on('keyup', '.search-key', this.findByName);
        this.el.on('focusout', '.pin', this.storePin);
        this.el.on('change', '.member', this.storeMember);
		
		setTimeout(function(){ self.findByName(); });
    };
	
	this.render = function() {
		app.member = store.getItem('member', '');
		//app.pin = store.getItem('pin', '');
		
		this.el.html(HomeView.template(app));
		return this;
	};
	
	this.storeMember = function(e) {
		store.saveItem('member', $(e.target).val());
	};
	
	this.storePin = function(e) {
		app.pin = $(e.target).val();
		//store.saveItem('pin', $(e.target).val());
	};
	
	this.findByName = function() {
		store.findByName($('.search-key').val(), function(employees) {
			$('.employee-list').html(HomeView.liTemplate(employees));
			if (self.iscroll) {
				console.log('Refresh iScroll');
				self.iscroll.refresh();
			} else {
				console.log('New iScroll');
				self.iscroll = new iScroll($('.scroll', self.el)[0], {hScrollbar: false, vScrollbar: false });
			}
		});
	}; 

    this.initialize(); 
}
 
HomeView.template = Handlebars.compile($("#home-tpl").html());
HomeView.liTemplate = Handlebars.compile($("#employee-li-tpl").html());
