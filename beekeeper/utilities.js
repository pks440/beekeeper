var utils = (function() {

	return {
		
		guid: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8); return v.toString(16);	});
		},

		getHash: function(string) {
			return string.slice(string.lastIndexOf('#') + 1); //.split('#').pop();
		},

		validId: function(string) {
			return 'n' + string.replace(/[^a-z0-9]/gi, ''); // just remove whitespace: replace(/ /g,'')
		}

	};

})();