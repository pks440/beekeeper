var rdfGraph = (function() {

    var nodesIndex = {},
        edgesIndex = {},
        nodes = {},
        edges = {},
        inferredEdges = {};

    var numOfTriples = 0,
        numOfInferredTriples = 0

    function Node(node) {
        this.node = node;

        this.toString = function() {
          return node;
        }

        m.publish('RDFnewNode', this);
    }

    function Edge(source, label, target) {
        this.source = source;
        this.label = label;
        this.target = target;

        this.toString = function() {
          return source + ' ' + label + ' ' + target;
        }

        this.getOtherEnd = function(node) {
          return (node == source) ? target : source;
        }

        m.publish('RDFnewEdge', this);
    }

    function InferredEdge(source, label, target, steps) {
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

        m.publish('RDFnewInferred', this);
    }

    return {

        initialize: function() { // newGraph: function() {
            // ?
        },

        clearGraph: function() {
            nodesIndex = {};
            edgesIndex = {};
            nodes = {};
            edges = {};
            inferredEdges = {};
            numOfTriples = 0;

            m.publish('RDFcleared');
        },

        loadFromN3String: function(string) {
            var triples = N3parser.parse(string);
            // console.log(triples);
            numOfTriples = triples.length;

            for (var i = 0; i < numOfTriples; i++) {
                if (triples[i].o.type == 'literal') { continue; }

                var subject = this.newNode(triples[i].s.value) || this.getNode(triples[i].s.value);
                var object = this.newNode(triples[i].o.value) || this.getNode(triples[i].o.value);
                this.newEdge(subject, triples[i].p.value, object);            
            }

            m.publish('RDFloaded', numOfTriples);
        },

        loadFromWebStorage: function() {
            //

            // m.publish('RDFloaded', rdfGraph);
        },

        loadFromFile: function() {
            //

            // m.publish('RDFloaded', rdfGraph);
        },

        newNode: function(node) {
            if (typeof nodesIndex[node] == 'undefined') {
                nodesIndex[node] = new Node(node);
                nodes[node] = 1;

                return nodesIndex[node];
            } else {
                nodes[node]++;

                return null;
            }
        },

        newEdge: function(subject, predicate, object) {
            var edge = new Edge(subject, predicate, object);

            edges[edge.toString()] = edge;

            if (typeof edgesIndex[subject.node] == 'undefined')
                edgesIndex[subject.node] = {};
            edgesIndex[subject.node][edge.toString()] = edge;

            if (typeof edgesIndex[object.node] == 'undefined')
                edgesIndex[object.node] = {};
            edgesIndex[object.node][edge.toString()] = edge;

            return edge;
        },

        newInferredEdge: function(subject, predicate, object) {
            if (!edges[subject + ' ' + predicate + ' ' + object]) {
                var edge = new InferredEdge(subject, predicate, object);
                inferredEdges[edge.toString()] = 1;

                numOfInferredTriples++;
                numOfTriples++;

                console.log(inferredEdges);

                return this.newEdge(subject, predicate, object);
            } else {
                if (inferredEdges[subject + ' ' + predicate + ' ' + object]) {
                    inferredEdges[subject + ' ' + predicate + ' ' + object]++
                }

                return null;
            }
        },

        getNode: function(node) {
            if (nodesIndex[node]) {
                return nodesIndex[node];
            } else {
                return null;
            }        
        },

        getRandomNode: function() {
          var keys = Object.keys(nodes);
          // console.log(keys[Math.floor(keys.length * Math.random())]);
          return nodesIndex[keys[Math.floor(keys.length * Math.random())]];
        },

        getNodes: function() {
            return nodes;
        },

        getSortedNodes: function() {
            return Object.keys(nodes).sort(function(a,b) { return nodes[b] - nodes[a] });
        },

        getEdges: function(node) {
            return edgesIndex[node];
        },

        getRandomEdgeFromNode: function(node) {
            var edges = edgesIndex[node];
            var keys = Object.keys(edges);
            return edges[keys[Math.floor(keys.length * Math.random())]];
        }

    };

})();