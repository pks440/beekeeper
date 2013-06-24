var rdfGraph = (function() {

    var nodesIndex = {},
        edgesIndex = {},
        nodes = {},
        edges = {},
        inferredEdges = {};

    var numOfTriples = 0,
        numOfInferredTriples = 0

    function Node(node, type, RDFlinkTarget) {
        this.node = node;
        this.type = type;
        this.RDFlinkTarget = RDFlinkTarget;

        m.notify('rdf:nodeNew', this);
    }

    Node.prototype.toString = function() { return this.node; };

    function Edge(source, label, target, type) {
        this.source = source;
        this.label = label;
        this.target = target;
        this.type = type;

        m.notify('rdf:edgeNew', this);
    }

    Edge.prototype.toString = function() { return this.source + ' ' + this.label + ' ' + this.target; };
    Edge.prototype.getOtherEnd = function(node) { return (node == this.source) ? this.target : this.source; };

    function InferredEdge(source, label, target, steps, type) {
        this.source = source;
        this.label = label;
        this.target = target;
        this.steps = steps;
        this.type = type;

        m.notify('rdf:inferredNew', this);
    }

    InferredEdge.prototype.toString = function() { return this.source + ' ' + this.label + ' ' + this.target; };
    InferredEdge.prototype.getSteps = function() { return this.steps; };

    return {

        initialize: function() { // newGraph: function() {
            // ?
            m.notify('rdf:initialized', rdfGraph);
        },

        clearGraph: function() {
            nodesIndex = {};
            edgesIndex = {};
            nodes = {};
            edges = {};
            inferredEdges = {};
            numOfTriples = 0;

            m.notify('rdf:cleared');
        },

        loadFromN3String: function(string) {
            var triples = N3parser.parse(string);
            // console.log(triples);
            numOfTriples = triples.length;

            for (var i = 0; i < numOfTriples; i++) {
                if (triples[i].o.type == 'literal') { continue; }

                var linkTarget = (triples[i].p.value == sameAsURI);

                var subject = this.newNode(triples[i].s.value, triples[i].s.type) || this.getNode(triples[i].s.value);
                var object = this.newNode(triples[i].o.value, triples[i].o.type, linkTarget) || this.getNode(triples[i].o.value);

                this.newEdge(subject, triples[i].p.value, object, triples[i].p.type);
            }

            m.notify('rdf:loaded', numOfTriples);
        },

        loadFromString: function(string, format) {
            //
            if (format == 'n3') this.parseN3(string);

            // m.notify('rdf:loaded', rdfGraph);
        },

        loadFromWebStorage: function(data, format) {
            //
            if (format == 'n3') this.parseN3(data);

            // m.notify('rdf:loaded', rdfGraph);
        },

        loadFromFile: function(file, format) {
            // 
            if (format == 'n3') this.parseN3(file);

            // m.notify('rdf:loaded', rdfGraph);
        },

        parseN3: function(data) {

        },

        saveToFile: function() {
            var data = [], triple = null, source = '', target = '';

            window.edges = edges;
            for (edge in edges) {
                triple = edges[edge];

                source = '<' + triple.source.node + '>';
                if (triple.source.type == 'blank')
                    source = triple.source.node;

                target = '<' + triple.target.node + '>';
                if (triple.target.type == 'blank')
                    target = triple.target.node;
                if (triple.target.type == 'literal')
                    target = '"' + triple.target.node + '"';

                data.push(source + ' <' + triple.label  + '> ' + target + ' .');
            }

            data = data.join('\n');
            var filename = prompt('Filename: ', 'export.nt');
            saveAsFile(filename, data);
        },

        newNode: function(node, type, RDFlinkTarget) {
            if (typeof nodesIndex[node] == 'undefined') {
                nodesIndex[node] = new Node(node, type, RDFlinkTarget);
                nodes[node] = 1;

                return nodesIndex[node];
            } else {
                nodes[node]++;

                return null;
            }
        },

        newEdge: function(subject, predicate, object, type) {
            var edge = new Edge(subject, predicate, object, type);

            edges[edge.toString()] = edge;

            if (typeof edgesIndex[subject.node] == 'undefined')
                edgesIndex[subject.node] = {};
            edgesIndex[subject.node][edge.toString()] = edge;

            if (typeof edgesIndex[object.node] == 'undefined')
                edgesIndex[object.node] = {};
            edgesIndex[object.node][edge.toString()] = edge;

            return edge;
        },

        newInferredEdge: function(subject, predicate, object, type) {
            if (!edges[subject + ' ' + predicate + ' ' + object]) {
                var edge = new InferredEdge(subject, predicate, object, '[steps]', type);
                inferredEdges[edge.toString()] = 1;

                numOfInferredTriples++;
                numOfTriples++;

                // console.log(inferredEdges);

                return edge; //this.newEdge(subject, predicate, object, type);
            } else {
                if (inferredEdges[subject + ' ' + predicate + ' ' + object]) {
                    inferredEdges[subject + ' ' + predicate + ' ' + object]++;
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

        getRDFSedges: function(node) {
            //
        },

        getLinkEdges: function(node) {
            var linkEdges = [];
            var edges = edgesIndex[node];
            for (edge in edges) {
                if (edge.label == sameAsURI) linkEdges.push(edge);
            }
            return linkEdges;
        },

        getRandomEdgeFromNode: function(node) {
            var edges = edgesIndex[node];
            var keys = Object.keys(edges);
            return edges[keys[Math.floor(keys.length * Math.random())]];
        }

    };

})();