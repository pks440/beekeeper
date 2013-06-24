var D3graph = (function () {

	var width, height;
	var svg, force;
	var nodes, links;
	var path, circle;

	function setup(id) {
		width = 600; //1280 or window.innerWidth - 40
		height = 550; //window.innerHeight - 70

		svg = d3.select('#' + id)
			.append('svg')
			.attr('width', width)
			.attr('height', height);

		nodes = [];
		links = [];
		lastNodeId = 0;

		force = d3.layout.force()
			.nodes(nodes)
			.links(links)
			.size([width, height])
			.linkDistance(100) // .distance(100)
			.charge(-500);

		svg.append('svg:defs')
			.append('svg:marker')
				.attr('id', 'arrow')
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 18)
				.attr('markerWidth', 8)
				.attr('markerHeight', 8)
				.attr('orient', 'auto')
			.append('svg:path')
				.attr('class', 'marker')
				.attr('d', 'M0,-5L10,0L0,5');

		path = svg.append('svg:g').selectAll('g.pgroup');
		circle = svg.append('svg:g').selectAll('g.cgroup');

		force.on('tick', function() {
			path.selectAll('path')
				.attr('d', function(d) {
					return 'M' + d.source.x + ',' + d.source.y + 'L' + d.target.x + ',' + d.target.y;
				});
				// .attr('x1', function(d) { return d.source.x; })
				// .attr('y1', function(d) { return d.source.y; })
				// .attr('x2', function(d) { return d.target.x; })
				// .attr('y2', function(d) { return d.target.y; });

			path.selectAll('text').attr('transform', function(d) {
				return "translate(" + (d.source.x + d.target.x) / 2 + "," + (d.source.y + d.target.y) / 2 + ")";
			});

			circle.attr('transform', function(d) {
				return 'translate(' + d.x + ',' + d.y + ')';
			});
		});

		m.notify('vis:loaded', svg);
	}

	function restart() {
		path = path.data(links);

		var pg = path.enter().append('svg:g').attr('class', 'pgroup');

		pg.append('svg:path')
			.attr('class', 'link')
			.style('marker-end', (config.showMarkers) ? 'url(#arrow)' : '')
			.classed('inferred', function(d) { return d.inferred; });

		pg.append('svg:text')
			.attr('dx', 0)
			.attr('dy', 0)
			.attr('class', 'id label')
			.text(function(d) { return d.label; })
			.on('mouseover', function(d) { d3.select(this).text(d.id); })
			.on('mouseout', function(d) { d3.select(this).text(d.label); });

		path.exit().remove();

		circle = circle.data(nodes, function(d) { return d.id; });

		var cg = circle.enter().append('svg:g').attr('class', 'cgroup').call(force.drag);

		cg.append('svg:circle')
			.attr('class', 'node')
			.attr('id', function(d) { return utils.validId(d.id); })
			.attr('r', function(d) { return (d.linkTarget) ? 9 : 6; });

		cg.append('svg:text')
			.attr('x', 0)
			.attr('y', -18)
			.attr('class', 'id label')
			.text(function(d) { return d.label; })
			.on('mouseover', function(d) { d3.select(this).text(d.id); })
			.on('mouseout', function(d) { d3.select(this).text(d.label); });

		cg.append('svg:text')
			.attr('x', 0)
			.attr('y', 20)
			.attr('class', function(d) { return (d.linkTarget) ? 'id label RDFlinkTarget' : 'id label'})
			.text(function(d) { return (d.linkTarget && config.hostedBy[utils.getBase(d.id)]) ? config.hostedBy[utils.getBase(d.id)].join(', ') : ''; });

		circle.exit().remove();

		force.start();

		m.notify('vis:updated', svg);
	}

	return {

		newGraph: function(id) { // initialize: function() {
			$('#' + id).html('');
			setup(id);
		},

		newNode: function(id, RDFlinkTarget) {
			var x = Math.floor(Math.random() * (500 - 460 + 1)) + 460;
			var y = Math.floor(Math.random() * (270 - 220 + 1)) + 220;
			var label = utils.getHash(id);
			var linkTarget = (RDFlinkTarget) ? true : false;
			var node = {id: id, label: label, linkTarget: linkTarget, x: x, y: y};
			nodes.push(node);

			restart();

			m.notify('vis:nodeNew', node);
		},

		newLink: function(sourceId, id, targetId, inferred) {
			var source = target = null;
			for (var i = 0, len = nodes.length; i < len; i++) {
				if (nodes[i].id == sourceId) source = nodes[i];
				if (nodes[i].id == targetId) target = nodes[i];
				if (source && target) break;
			}
			var label = utils.getHash(id);
			var link = {source: source, id: id, label: label, target: target, inferred: inferred};
			links.push(link);

			restart();

			m.notify('vis:linkNew', link);
		},

		styleNode: function(node, className) {
			// var selectedNode;
			// selectedNode = nodes.filter(function(l) {
			// 	return (l.id === node);
			// })[0];
			var node = d3.select('#' + utils.validId(node)).classed(className, true);

			m.notify('vis:nodeSel', node);
		},

		unstyleNode: function(node, className) {
			var node = d3.select('#' + utils.validId(node)).classed(className, false);

			m.notify('vis:nodeUnsel', node);
		}

	};

})(); // import D3

var swarmVis = (function () {

	var swarm;

	function init(id) {
		swarm = $('#' + id + ' svg').append('svg:g');
	}

	return {

		initialize: init,

		newScout: function(scout) {
			// swarm.append('svg:circle')
			// 	.attr('class', 'bee')
			// 	.attr('id', scout.id)
			// 	.attr('r', 2)
			// 	.attr('x', getNodeLocation(scout.location))
			// 	.attr('y', getNodeLocation(scout.location));
		},

		newForager: function(forager) {

		},

		newNurseBee: function(nurseBee) {

		},

		moveScout: function(scout) {
			// swarm.select('id': scout.id)
			// 	.attr('x', getNodeLocation(scout.location))
			// 	.attr('y', getNodeLocation(scout.location));
		},

		moveForager: function(forager) {

		},

		moveNurseBee: function(nurseBee) {

		},

		removeScout: function(scout) {

		},

		removeForager: function(forager) {

		},

		removeNurseBee: function(nurseBee) {

		},

	};

})(); // import D3