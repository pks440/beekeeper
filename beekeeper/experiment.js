var d = {};
d.nurseFound = [];

m.when('swm:nrsFound', function(data) {
	d.nurseFound.push(data.toString());
});

m.when('swm:cycleComplete', function(data) {
	d.cycles = data;
});

function makeExport() {
	// build export for file
	return d.nurseFound.join('\n') + '\nnumber of cycles: ' + d.cycles;
}