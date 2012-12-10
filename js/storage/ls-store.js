var LocalStorageStore = function(successCallback, errorCallback) {

    this.saveItem = function(name, value) {
        window.localStorage.setItem(name, value);
	}
    this.getItem = function(name, value) {
		return window.localStorage.getItem(name) || value || null;
	}
	
    this.findByName = function(searchKey, callback) {
        var employees = JSON.parse(window.localStorage.getItem("employees"));
        var results = employees.filter(function(element) {
            //var fullName = element.firstName + " " + element.lastName;
            //return fullName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
			return JSON.stringify(element).toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
        });
        callLater(callback, results);
    }

    this.add = function(element) {
        var employees = JSON.parse(window.localStorage.getItem("employees"));
		employees.last = ((employees.last || employees.length) - 1) + 2;
		element.id = employees.last;
		employees.push(element);
		window.localStorage.setItem("employees", JSON.stringify(employees));
	}
	
    this.edit = function(element) {
        var employees = JSON.parse(window.localStorage.getItem("employees"));
        var id = element.id;
        var l = employees.length;
        for (var i=0; i < l; i++) {
            if (employees[i].id === id) {
                employees[i] = element;
				window.localStorage.setItem("employees", JSON.stringify(employees));				
                break;
            }
        }
	}
	
    this.findById = function(id, callback) {
        var employees = JSON.parse(window.localStorage.getItem("employees"));
        var employee = null;
        var l = employees.length;
        for (var i=0; i < l; i++) {
            if (employees[i].id === id) {
                employee = employees[i];
                break;
            }
        }
        callLater(callback, employee);
    }

    // Used to simulate async calls. This is done to provide a consistent interface with stores (like WebSqlStore)
    // that use async data access APIs
    var callLater = function(callback, data) {
        if (callback) {
            setTimeout(function() { callback(data); });
        }
    }

    var employees = [
		{"id": 1, "nickname": "Digicel Credit", "sku": "ddtu", "group":"Topup", "amount":"", "data" : ""},
		{"id": 2, "nickname": "Lime Credit", "sku": "ldtu", "group":"Topup", "amount":"", "data" : ""},
		{"id": 3, "nickname": "Digicel Bill", "sku": "digicel", "group":"Bill Payment", "amount":"", "data" : "", "customer" : " "},
		{"id": 4, "nickname": "JPS Bill", "sku": "jps", "group":"Bill Payment", "amount":"", "data" : "", "customer" : " "},
		{"id": 5, "nickname": "Flow Bill", "sku": "flow", "group":"Bill Payment", "amount":"", "data" : "", "customer" : " "},
		{"id": 6, "nickname": "NWC Bill", "sku": "nwc", "group":"Bill Payment", "amount":"", "data" : "", "customer" : " "}
    ];

	var existed = window.localStorage.getItem("employees");
	if(!existed) window.localStorage.setItem("employees", JSON.stringify(employees));

    callLater(successCallback, this);
}