var width, height, colors;
var svg, vis;
var nodes, lastNodeId, links;
var force;
var path, circle;
var selected_node, selected_link, mousedown_link, mousedown_node, mouseup_node;
var zoomSetting = false;

function newD3graph() {
  $('#D3graph').html('');
  setup();
}

function setup() {
  // set up SVG for D3
  width  = 1280;
  height = 500;
  colors = d3.scale.category10();

  svg = d3.select('#D3graph')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // set up initial nodes and links
  //  - nodes are known by 'id', not by index in array.
  //  - reflexive edges are indicated on the node (as a bold black circle).
  //  - links are always source < target; edge directions are set by 'left' and 'right'.
  nodes = [];
  lastNodeId = 0;
  links = [];

  // init D3 force layout
  force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(150)
    .charge(-500)
    .on('tick', tick);

  // define arrow markers for graph links
  svg.append('svg:defs').append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 6)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#000');

  svg.append('svg:defs').append('svg:marker')
      .attr('id', 'start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 4)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M10,-5L0,0L10,5')
      .attr('fill', '#000');

  // DRAG LINE

  vis = svg.append('svg:g')
    .call(d3.behavior.zoom().on('zoom', rescale))
    .on("dblclick.zoom", null);

  vis.append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'grey');

  // handles to link and node element groups
  path = vis.append('svg:g').selectAll('path');
  circle = vis.append('svg:g').selectAll('g');

  // mouse event vars
  selected_node = null;
  selected_link = null;
  mousedown_link = null;
  mousedown_node = null;
  mouseup_node = null;

  start();
}
setup();

// rescale g
function rescale() {
  if (zoomSetting == true) {
    trans=d3.event.translate;
    scale=d3.event.scale;

    vis.attr("transform",
        "translate(" + trans + ")"
        + " scale(" + scale + ")");
  }
}

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers
  path.selectAll('path').attr('d', function(d) {
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = d.left ? 17 : 12,
        targetPadding = d.right ? 17 : 12,
        sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });

  path.selectAll('text').attr('transform', function(d) {
    var x = (d.target.x < d.source.x) ? d.target.x : d.source.x;
    var y = (d.target.y < d.source.y) ? d.target.y : d.source.y;
    return 'translate(' + (x + (Math.abs(d.target.x - d.source.x)/2)) + ',' + (y + (Math.abs(d.target.y - d.source.y)/2)) + ')';
  });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}

// update graph (called when needed)
function restart() {
  // path (link) group
  path = path.data(links);

  // update existing links
  path.classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


  // add new links
  var group = path.enter().append('svg:g').attr('class', 'glink');
  group.append('svg:path')
    .attr('class', 'link')
    .classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
    // .on("mouseover", function (d) { d3.select(this).attr('stroke','red'); })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select link
      mousedown_link = d;
      if(mousedown_link === selected_link) selected_link = null;
      else selected_link = mousedown_link;
      selected_node = null;
      restart();
    });

  group.append('svg:text')
      .attr('text-anchor', 'middle')
      .attr('dx', 0)
      .attr('dy', 0)
      .attr('class', 'id lid')
      .text(function(d) { return d.label; })
      .on('mouseover', function(d) { console.log(d3.select(this)); d3.select(this).style('opacity', 0.1); })
      .on('mouseout', function(d) { d3.select(this).style('opacity', 1); });

  // remove old links
  path.exit().remove();


  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
    .classed('reflexive', function(d) { return d.reflexive; });

  // add new nodes
  var g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', 12)
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
    .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
    .classed('reflexive', function(d) { return d.reflexive; })
    .on('mouseover', function(d) {
      if(!mousedown_node || d === mousedown_node) return;
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');
    })
    .on('mouseout', function(d) {
      if(!mousedown_node || d === mousedown_node) return;
      // unenlarge target node
      d3.select(this).attr('transform', '');
    })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select node
      mousedown_node = d;
      if(mousedown_node === selected_node) selected_node = null;
      else selected_node = mousedown_node;
      selected_link = null;

      // DRAG LINE

      restart();
    })
    .on('mouseup', function(d) {
      if(!mousedown_node) return;

      // DRAG LINE

      // check for drag-to-self
      mouseup_node = d;
      if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

      // unenlarge target node
      d3.select(this).attr('transform', '');

      // add link to graph (update if exists)
      // NB: links are strictly source < target; arrows separately specified by booleans
      var source, target, direction;
      if(mousedown_node.id < mouseup_node.id) {
        source = mousedown_node;
        target = mouseup_node;
        direction = 'right';
      } else {
        source = mouseup_node;
        target = mousedown_node;
        direction = 'left';
      }

      var link;
      link = links.filter(function(l) {
        return (l.source === source && l.target === target);
      })[0];

      if(link) {
        link[direction] = true;
      } else {
        link = {source: source, target: target, left: false, right: false};
        link[direction] = true;
        links.push(link);
      }

      // select new link
      selected_link = link;
      selected_node = null;
      restart();
    });

  // show node IDs
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', -18)
      .attr('class', 'id nid')
      .text(function(d) { return d.id; });

  // remove old nodes
  circle.exit().remove();

  // set the graph in motion
  force.start();
}

function fade(opacity) {
  alert('');
  return function(g, i) {
    svg.selectAll("g.glink text")
        .filter(function(d) {
          return d.source.id != i && d.target.id != i;
        })
      .transition()
        .style("opacity", opacity);
  };
}

function mousedown() {
  // newNode(Math.random());
}

function newNode(id) {
  // prevent I-bar on drag
  //d3.event.preventDefault();
  
  // because :active only works in WebKit?
  svg.classed('active', true);

  if(mousedown_node || mousedown_link) return; // d3.event.ctrlKey || 

  // insert new node at point
  var x = Math.floor(Math.random() * (500 - 460 + 1)) + 460;
  var y = Math.floor(Math.random() * (270 - 220 + 1)) + 220;
  var point = [x,y],
      node = {id: id, reflexive: false};
  node.x = point[0];
  node.y = point[1];
  nodes.push(node);

  restart();
}

function newEdge(sourceId, label, targetId, linkSelection) {
    // get the source and target objects from their id
    var length = nodes.length;
    var matched = 0;
    for(var i = 0; i < length; i++) {
        if (nodes[i].id == sourceId) {
            source = nodes[i];
            matched++;
        }
        if (nodes[i].id == targetId) {
            target = nodes[i];
            matched++;
        }
        if (matched == 2) {
            break;
        }
    }

    var link;
    link = links.filter(function(l) {
      return (l.source === source && l.target === target);
    })[0];

    if(link) {
      link[direction] = true;
    } else {
      link = {source: source, label: label, target: target, left: false, right: false};
      direction = 'right';
      link[direction] = true;
      links.push(link);
    }

    // select new link
    if (linkSelection) selected_link = link;
    selected_node = null;
    restart();
}

function mousemove() {
  if(!mousedown_node) return;

  // DRAG LINE

  restart();
}

function mouseup() {
  if(mousedown_node) {
    // DRAG LINE
  }

  // because :active only works in WebKit?
  svg.classed('active', false);

  // clear mouse event vars
  resetMouseVars();
}

function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source === node || l.target === node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}

// only respond once per keydown
var lastKeyDown = -1;

function keydown() {
  // d3.event.preventDefault();

  if(lastKeyDown !== -1) return;
  lastKeyDown = d3.event.keyCode;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle.call(force.drag);
    svg.classed('ctrl', true);
  }

  // KEYPRESS EVENTS

}

function keyup() {
  lastKeyDown = -1;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle
      .on('mousedown.drag', null)
      .on('touchstart.drag', null);
    svg.classed('ctrl', false);
  }
}

function start() {
  // app starts here
  svg.on('mousedown', mousedown)
    .on('mousemove', mousemove)
    .on('mouseup', mouseup);
  d3.select(window)
    .on('keydown', keydown)
    .on('keyup', keyup);
  restart();
}

// $('.glink').on('click', function (e) {
//   alert('');
//   fade(0.5);
// });