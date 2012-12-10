var EmployeeView = function(model) {
	
	this.render = function() {
		var viewModel = $.extend({ pin: app.pin ? "****" : false }, model);
		this.el.html(EmployeeView.template(viewModel));
		return this;
	};

	this.initialize = function() {
		var self = this;
		var touchEvent = document.documentElement.hasOwnProperty('ontouchstart') ? 'touchstart' : 'mousedown';
		
		this.el = $('<div/>');
        this.el.on('click', '.kGo', $.proxy(self.go, self) );
        this.el.on('click', '.kBack', $.proxy(self.save, self) );
        this.el.on('click', '.editable', $.proxy(self.editMode, self) );
        this.el.on('focusout', '.editable', $.proxy(self.syncValue, self) );
        this.el.on(touchEvent, '.kGo', function(e){ $(this).longClick( $.proxy(self.clone, self) ); });
	};

	this.syncValue = function(e) {
		console.log('sync-model');
		var node = $(e.currentTarget);
		var input = node.find('input');
		
		node.find('span').text(input.val());
		node.toggleClass('edit-mode');
	};
	
	this.editMode = function(e) {
		console.log('change-mode');
		var node = $(e.currentTarget);
		var input = node.find('input');
		var span = node.find('span');
		
		if(node.is('edit-mode')) return;
		
		node.addClass('edit-mode');
		
		if(input.length == 0){ 
			input = $('<input />');
			input.type = node.is('.text') ? 'text' : 'number';
			input.val( span.text());
			node.append(input);
		}
		
		span.text( input.val() );
		input[0].focus();
	};
	
	this.go = function(e) {
		console.log('kGo');
		var self = this;
		var cmd = model.group.toLowerCase() == 'topup' ? 'buy :pin :sku :amount :data' : 'pay :pin :sku :data :amount :customer';
		
		cmd = cmd.replace(/:(\w+)/ig, function($0, $1){ 
			var value = self.el.find('.' + $1 + ' span').text();
			value = value || model[$1] || app[$1] || ''; 
			return value.replace(/\s+/g, '');
		});
		
		//app.showAlert(cmd);
		
		app.request({ x: cmd }, function(data){ app.showAlert('' + data, 'Response'); });
	};
	
	this.save = function(e) {
		console.log('save');
		var id = this.el.find('.nickname span').text();
		
		if(id == "") return;
	
		var modified = false, cloned = false, val = null;
		for(i in model) { 
			val = this.el.find('.' + i + ' span').text() || model[i];
			if( val != model[i]){ 
				modified = true; 
				model[i] = val; 
				if(i == 'nickname') cloned = true;
			}
		}
		
		if(modified)
		{
			if(cloned) app.store.add( model );
			else app.store.edit( model );
		}
	};

	this.clone = function(e) {
		console.log('clone');
		
		var cloned = $.extend({}, model);
		for(i in cloned) cloned[i] = this.el.find('.' + i + ' span').text() || cloned[i];
		app.store.add( cloned );
	};

	this.initialize();
}
 
EmployeeView.template = Handlebars.compile($("#employee-tpl").html());