var config = {
	
	ownerID: '',
	friends: {},

	monitorEnabled: true,
	visualizationEnabled: true

};

var typeURI = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    subClassOfURI = 'http://www.w3.org/2000/01/rdf-schema#subClassOf',
    subPropertyOfURI = 'http://www.w3.org/2000/01/rdf-schema#subPropertyOf',
    resourceURI = 'http://www.w3.org/2000/01/rdf-schema#Resource',
    classURI = 'http://www.w3.org/2000/01/rdf-schema#Class',
    literalURI = 'http://www.w3.org/2000/01/rdf-schema#Literal',
    datatypeURI = 'http://www.w3.org/2000/01/rdf-schema#Datatype';

var behavior = {

	// - number of scouts to initialize
	foragerEnergy: 3,

	initializeScouts: function() {
		//
	},

	initializeForagers: function(type, location) {
		//
	},

	initializeNurseBees: function() {
		//
	},

	scoutMove: function() {
		this.isAt = rdfGraph.getRandomEdgeFromNode(this.isAt).getOtherEnd(this.isAt);

		m.publish('scoutMove', this);
	},

	scoutFoundSomething: function(s) {
		if (this.type == this.isAt.node) {
			monitor('scout from ' + this.owner + ' found:', 'scout id: ' + this.id);
			monitor('&nbsp;&nbsp;' + utils.getHash(this.type), '', 'data');

			m.publish('scoutFound', this);
			return true;
		}
	},

	foragerMove: function() {
		this.wasAt = this.isAt;
		this.passedEdge = rdfGraph.getRandomEdgeFromNode(this.isAt)
		this.isAt = this.passedEdge.getOtherEnd(this.isAt);
		this.energy--;

		m.publish('foragerMove', this);
	},

	foragerFoundSomething: function() {
		// monitor('wasAt: ' + this.wasAt + ' triple.s: ' + this.triple.s);
		// monitor('passedEdge: ' + this.passedEdge.label + ' triple.p: ' + this.triple.p);
		if (this.wasAt == this.triple.s && this.passedEdge.label == this.triple.p) { // if passed by her triple
			var subject = utils.getHash(this.wasAt.node);
			var predicate = utils.getHash(this.passedEdge.label);
			var object = utils.getHash(this.isAt.node);

			monitor('forager from ' + this.owner + ' found:', 'forager id: ' + this.id);
			monitor('&nbsp;&nbsp;' + subject + ' ' + predicate + ' ' + object, '', 'data');

			this.memory = this.isAt.node;
			// this.energy++; // this.energy = workerEnergy;
			m.publish('foragerFound', this);
			return true;
		} else {
			return false;
		}

		// return (found something) ? true : false;
	},

	foragerIsExhausted: function() {
		if (this.energy < 1) {
			monitor('forager from ' + this.owner + ' is exhausted.', 'forager id: ' + this.id);

			m.publish('foragerExhausted', this);
			return true;
		} else {
			return false;
		}
	},

	nurseBeeMove: function() {
		this.prevEdge = this.passedEdge;
		this.wasAt = this.isAt;
		this.passedEdge = rdfGraph.getRandomEdgeFromNode(this.isAt)
		this.isAt = this.passedEdge.getOtherEnd(this.isAt);

		m.publish('nurseMove', this);
	},

	nurseBeeFoundSomething: function() {
		var found;

		switch (this.type) {
			case 0:
				if (this.prevEdge != null && this.prevEdge.label == subPropertyOfURI && this.passedEdge.label == subPropertyOfURI && this.prevEdge.target == this.passedEdge.source) {
					// add: this.prevEdge.source | subPropertyOfURI | this.passedEdge.target
					found = rdfGraph.newInferredEdge(this.prevEdge.source, subPropertyOfURI, this.passedEdge.target);
				}
				break;
			case 1:
				if (this.prevEdge != null && this.prevEdge.label == subClassOfURI && this.passedEdge.label == subClassOfURI && this.prevEdge.target == this.passedEdge.source) {
					// add: this.prevEdge.source | subClassOfURI | this.passedEdge.target
					found = rdfGraph.newInferredEdge(this.prevEdge.source, subClassOfURI, this.passedEdge.target);
				}
				break;
			case 2:
				if (this.prevEdge != null && this.prevEdge.label == subClassOfURI && this.passedEdge.label == typeURI && this.prevEdge.target == this.passedEdge.source) {
					// add: this.passedEdge.target | typeURI | this.prevEdge.source ?
					found = rdfGraph.newInferredEdge(this.passedEdge.target, typeURI, this.prevEdge.source);
				} else if (this.prevEdge != null && this.prevEdge.label == typeURI && this.passedEdge.label == subClassOfURI && this.prevEdge.target == this.passedEdge.source) {
					// add: this.prevEdge.source | typeURI | this.passedEdge.target
					found = rdfGraph.newInferredEdge(this.prevEdge.source, typeURI, this.passedEdge.target);
				}
				break;
			case 3:
				if (this.passedEdge != null && this.passedEdge.label == typeURI && this.isAt.node == classURI) {
					// add: this.wasAt | subClassOfURI | resourceURI
					// found = rdfGraph.newInferredEdge();
				}
				break;
			case 4:
				if (this.passedEdge != null && this.passedEdge.label == typeURI && this.isAt.node == datatypeURI) {
					// add: this.wasAt | subClassOfURI | literalURI
					// found = rdfGraph.newInferredEdge();
				}
				break;
			default:
				found = false;
		}

		if (found) {
			var subject = utils.getHash(found.source.node);
			var predicate = utils.getHash(found.label);
			var object = utils.getHash(found.target.node);

			monitor('nurse bee found:', 'nurse bee id: ' + this.id);
			monitor('&nbsp;&nbsp;' + subject + ' ' + predicate + ' ' + object, '', 'data');

			m.publish('nurseFound', found);
			return true;
		} else {
			return false;
		}
	}

};