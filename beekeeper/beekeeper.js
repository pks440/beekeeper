$(function () {
    var typeRel = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
    var subclassRel = 'http://www.w3.org/2000/01/rdf-schema#subClassOf';
    var subpropertyRel = 'http://www.w3.org/2000/01/rdf-schema#subPropertyOf';

    var rdfGraph;
    var numOfTriples;
    var numOfInferredTriples;

    function generateGraph() {
        newD3graph();
        rdfGraph = new graph();
        rdfGraph.loadFromN3String($('#inputN3').val());

        $('#status-message').html('graph loaded. (' + numOfTriples + ' triples)').attr('title', new Date().toUTCString());
    }

    // settings
    var numOfRuns = 10;
    var numOfIterations = 1000;
    var linkStyleBehaviour = 'transparent';

    // MAIN
    function run() {
        numOfInferredTriples = 0;
        // var ants = [];
        // var numberOfAnts = 1;
        // for (var i = 0; i < numberOfAnts; i++) {
        //   ants[i] = new ant(rdfGraph);
        //   alert('ant created.');
        // }
        ants1 = new ant(rdfGraph, $('#beast-type').val());

        for (var run = 0; run < numOfRuns; run++) {
            // for (var i = 0; i < numberOfAnts; i++) {
            //   ants[i].setLocation(rdfGraph.getRandomNode());
            // }
            ants1.setLocation(rdfGraph.getRandomNode());
            for (var i = 0; i < numOfIterations; i++) {
              // for (var i = 0; i < numberOfAnts; i++) {
              //   ants[i].doSomething();
              // }
              ants1.doSomething();
            }
        }

        $('#status-message').html('ready! (' + numOfInferredTriples + ' new triple' + ((numOfInferredTriples != 1) ? 's' : '') + ')').attr('title', new Date().toUTCString());;

        rdfGraph.printResult();
    }

    // GRAPH NODE
    function graphNode(node) {
        this.node = node;
        this.toString = function() {
          return node;
        }
    }

    // GRAPH EDGE
    function graphEdge(source, label, target) {
        this.source = source;
        this.label = label;
        this.target = target;

        this.toString = function() {
          return source + ' ' + label + ' ' + target;
        }

        this.getOtherEnd = function(node) {
          return (node == source) ? target : source;
        }
    }

    // INFERRED EDGE
    function inferredEdge(source, label, target, steps) {
        this.source = source;
        this.label = label;
        this.target = target;
        this.steps = steps;

        this.toString = function() {
          return source + ' ' + label + ' ' + target;
        }

        function getSteps() {
            return steps;
        }
    }

    // GRAPH
    function graph() {
        this.nodesIndex = {};
        this.edgesIndex = {};
        this.nodes = {};
        this.edges = {};
        this.inferredEdges = {};

        this.loadFromN3String = function(string) {
            var triples = N3parser.parse(string);
            // console.log(triples);
            numOfTriples = triples.length;

            var i;
            var length = triples.length;
            for (i = 0; i < length; i++) {
                if (triples[i].o.type == 'literal') { continue; }

                var subject = this.getGraphNode(triples[i].s.value);
                var object = this.getGraphNode(triples[i].o.value);

                // D3 GRAPH
                newEdge(triples[i].s.value, triples[i].p, triples[i].o.value, false);

                var edge = new graphEdge(subject, triples[i].p, object);
                this.edges[edge.toString()] = edge;

                if (typeof this.edgesIndex[subject.node] == 'undefined')
                    this.edgesIndex[subject.node] = {};
                this.edgesIndex[subject.node][edge.toString()] = edge;

                if (typeof this.edgesIndex[object.node] == 'undefined')
                    this.edgesIndex[object.node] = {};
                this.edgesIndex[object.node][edge.toString()] = edge;
            }
            // console.log('nodesIndex:');
            // console.log(this.nodesIndex);
            // console.log('edgesIndex:');
            // console.log(this.edgesIndex);
            // console.log('nodes:');
            // console.log(this.nodes);
            // console.log('edges:');
            // console.log(this.edges);
            console.log('inferredEdges:');
            console.log(this.inferredEdges);
        }

        this.getGraphNode = function(node) {
            if (typeof this.nodesIndex[node] == 'undefined') {
                var rdfGraphNode = new graphNode(node);
                this.nodesIndex[node] = rdfGraphNode;
                this.nodes[node] = true;

                // D3 GRAPH
                newNode(node);
            }

            return this.nodesIndex[node];
        }

        this.getRandomNode = function() {
          var keys = Object.keys(this.nodes);
          // console.log(keys[Math.floor(keys.length * Math.random())]);
          return keys[Math.floor(keys.length * Math.random())];
        }
        
        this.getEdges = function(node) {
          // console.log('edges at location:');
          // console.log(this.edgesIndex[node]);
          return this.edgesIndex[node];
        }

        this.addInferredEdge = function(source, label, target, steps) {
          var edge = new inferredEdge(source, label, target, steps);
          var count = 0;
          if (typeof this.inferredEdges[edge.toString()] == 'undefined') {
            // D3 GRAPH
            newEdge(source, label, target, true);

            numOfInferredTriples++;
          } else {
            count = this.inferredEdges[edge.toString()];
          }
          this.inferredEdges[edge.toString()] = count + 1;
        }

        // function getEdgeDegree(node)
        //   return size of edgesIndex[node]
        
        this.printResult = function() {
          console.log('Done.\ninferredEdges:');
          console.log(this.inferredEdges);
        }
    }

    // ANT
    function ant(rdfGraph, type) {
        this.rdfGraph = rdfGraph;
        this.type = type;
        this.at;
        this.lastEdge = null;

        this.setLocation = function(node) {
            this.at = node;
        }

        this.doSomething = function() {
            // alert(this.at);
            var edges = rdfGraph.getEdges(this.at);
            var keys = Object.keys(edges);
            var edge = edges[keys[Math.floor(keys.length * Math.random())]];
            // alert('step from:\n' + this.at + '\n\nto:\n' + edge.getOtherEnd(this.at));

            if (this.lastEdge != null) {
                if (this.type == 'rdfs5') {
                    if (this.lastEdge.label == subpropertyRel && edge.label == subpropertyRel
                          && this.lastEdge.source == edge.target) {
                        var steps = [];
                        steps.push(this.lastEdge.source);
                        rdfGraph.addInferredEdge(edge.source, subpropertyRel, this.lastEdge.target, steps);
                    }
                }
                if (this.type == 'rdfs9') {
                    if (this.lastEdge.label == subclassRel && edge.label == typeRel
                          && this.lastEdge.source == edge.target) {
                        var steps = [];
                        steps.push(this.lastEdge.source);
                        rdfGraph.addInferredEdge(edge.source, typeRel, this.lastEdge.target, steps);
                    }
                    if (this.lastEdge.label == typeRel && edge.label == subclassRel
                          && this.lastEdge.target == edge.source) {
                        var steps = [];
                        steps.push(this.lastEdge.target);
                        rdfGraph.addInferredEdge(this.lastEdge.source, typeRel, edge.target, steps);
                    }
                }
                if (this.type == 'rdfs11') {
                    if (this.lastEdge.label == subclassRel && edge.label == subclassRel
                          && this.lastEdge.source == edge.target) {
                        var steps = [];
                        steps.push(this.lastEdge.source);
                        rdfGraph.addInferredEdge(edge.source, subclassRel, this.lastEdge.target, steps);
                    }
                }
            }

            this.at = edge.getOtherEnd(this.at);
            this.lastEdge = edge;
        }
    }

    $('#load').click(function() {
        $('#status-message').html('');
        $('#inputN3').show();
        $('#load').hide();
        $('#generate').show();
    });
    $('#generate').click(function() {
        $('#status-message').html('');
        $('#inputN3').hide();
        $('#generate').hide();
        $('#load').show();

        generateGraph();
    });
    $('#run').click(function() {
        $('#status-message').html('');
        run();
    });

    $('#inserttype').click(function() {
        insertAtCursor(' <' + typeRel + '> ');
    });

    $('#insertsubclass').click(function() {
        insertAtCursor(' <' + subclassRel + '> ');
    });

    $('#insertsubproperty').click(function() {
        insertAtCursor(' <' + subpropertyRel + '> ');
    });

    $('#setsettings').click(function() {
        $('#settingspanel').toggle();
    });

    $('#setruns').change(function() {
        numOfRuns = $(this).val();
    });

    $('#setiterations').change(function() {
        numOfIterations = $(this).val();
    });

    $('#link-behaviour').change(function() {
        linkStyleBehaviour = $(this).val();

        if (linkStyleBehaviour == 'transparent') $('text.lid').css('opacity', 0.1);
        if (linkStyleBehaviour == 'opaque') $('text.lid').css('opacity', 1);
    });

    $('#setzoom').change(function() {
        if ($(this).is(':checked')) {
          zoomSetting = true;
        } else {
          zoomSetting = false;
        }
    });

    $('.glink').on('click', function() {
        $(this).css('opacity', 1);
    }, function() {
        $(this).css('opacity', 0.1);
    });

    function insertAtCursor(text) {   
        var field = document.getElementById('inputN3');

        if (document.selection) {
          var range = document.selection.createRange();

          if (!range || range.parentElement() != field) {
              field.focus();
              range = field.createTextRange();
              range.collapse(false);
          }
          range.text = text;
          range.collapse(false);
          range.select();
      } else {
          field.focus();
          var val = field.value;
          var selStart = field.selectionStart;
          var caretPos = selStart + text.length;
          field.value = val.slice(0, selStart) + text + val.slice(field.selectionEnd);
          field.setSelectionRange(caretPos, caretPos);
      }
    }
});