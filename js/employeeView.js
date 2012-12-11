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
        this.el.on('click', '.kConfirm', $.proxy(self.confirm, self) );
        this.el.on('click', '.kBack', $.proxy(self.save, self) );
        this.el.on('click', '.editable', $.proxy(self.editMode, self) );
        this.el.on('focusout', '.editable', $.proxy(self.syncValue, self) );
        //this.el.on(touchEvent, '.kGo', function(e){ $(this).longClick( $.proxy(self.clone, self) ); });
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
			input.type = node.is('.text') ? 'text' : node.is('.tel') ? 'tel' : 'number';
			input.val( span.text());
			node.append(input);
		}
		
		span.text( input.val() );
		input[0].focus();
	};
	
	this.go = function(e) {
		console.log('kGo');
		var self = this;
		var cmd = model.group.toLowerCase() == 'topup' ? 'buy :pin :sku :amount :data' : 'pay :pin :sku :data :amount &customer';
		var req = null;
		
		cmd = cmd.replace(/(:|&)(\w+)/ig, function($0, $1, $2){ 
			var value = self.el.find('.' + $2 + ' span').text();
			value = value || model[$2] || app[$2] || ''; 
			value = value.replace(/\s+/g, '');
			
			if(!value && $1 == ':' && req == null) req = $2;
			return value;
		});
		
		if(req)
		{
			//var field = self.el.find('.' + req + ' span');
			req = self.el.find('.' + req).contents(':eq(0)').text();
			app.showAlert('Please enter ' + $.trim(req), 'Missing Required Field');
			return;
		}
		
		app.request({ x: cmd }, function(data){ 
			var text = data[0];
			var confirmer = /(confirm|code).*(\d{4,6})/ig.exec(text);
			
			if(confirmer && confirmer.length == 3)
			{
				self.el.find('.response').html( EmployeeView.confirmer({ text: text, code: confirmer[2]}) );
				self.el.find('ul').hide();
				self.el.find('.confirm')[0].focus();
			}
			else
			{
				app.showAlert(text, model.group + ' Response'); 
			}
		});
	};
	
	this.confirm = function(e) {
		console.log('kConfirm');
		var self = this;
		var code = self.el.find('.code').text();
		var confirmer = self.el.find('.confirm');
		var confirmCode = $.trim(confirmer.val());
		
		if(!confirmCode){ 
			app.showAlert('The confirmation code is required!', 'Confirm ' + model.group); 
			confirmer[0].focus(); 
			return; 
		}
		if(code != confirmCode){ 
			app.showAlert('The confirmation code does not match!', 'Confirm ' + model.group); 
			confirmer[0].focus(); 
			return; 
		}
		
		app.request({ x: code }, function(data){ 
			var text = data[0];
			app.showAlert(text, model.group + ' Response'); 
		});
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
EmployeeView.confirmer = Handlebars.compile($("#confirm-tpl").html());