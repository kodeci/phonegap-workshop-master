var EmployeeView = function(employee) {

	this.render = function() {
		this.el.html(EmployeeView.template(employee));
		return this;
	};

	this.initialize = function() {
		this.el = $('<div/>');
        this.el.on('click', '.kGo', this.go);
	};

	this.go = function(e) {
		console.log('kGo');
		app.request({ x: 'i b' }, function(data){ app.showAlert('Response', '' + data); });
		e.preventDefault();
		e.stopPropagation();
		return false;
	};

	this.initialize();
}
 
EmployeeView.template = Handlebars.compile($("#employee-tpl").html());