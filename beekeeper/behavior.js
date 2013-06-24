var typeURI = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    subClassOfURI = 'http://www.w3.org/2000/01/rdf-schema#subClassOf',
    subPropertyOfURI = 'http://www.w3.org/2000/01/rdf-schema#subPropertyOf',
    resourceURI = 'http://www.w3.org/2000/01/rdf-schema#Resource',
    classURI = 'http://www.w3.org/2000/01/rdf-schema#Class',
    literalURI = 'http://www.w3.org/2000/01/rdf-schema#Literal',
    datatypeURI = 'http://www.w3.org/2000/01/rdf-schema#Datatype'
    sameAsURI = 'http://www.w3.org/2002/07/owl#sameAs';

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
		var edge = rdfGraph.getRandomEdgeFromNode(this.isAt);
		var target = edge.getOtherEnd(this.isAt);

		var moveType = 'moved';

		if (edge.label != sameAsURI) {
			this.isAt = target;
			m.notify('swm:sctMove', this);
		} else {
			var base = utils.getBase(target.node);

			if (config.linksetsEnabled && config.hostedBy[base] && config.hostedBy[base].indexOf(this.owner) == -1 && $('#' + config.hostedBy[base][0]).hasClass('connected')) { // && config.hosts.indexOf(base) == -1
				this.isAt = target;
				// send scout to peer that hosts target dataset
				var scout = swarm.prepareScoutForMigrating(this);
				p2p.send('scouts', scout, config.hostedBy[base][0]); // or config.hostedBy[base][random]

				m.notify('swm:sctMigratedTo', this, config.hostedBy[base][0]); // or m.notify('swm:sctsSentTo', this, config.hostedBy[base][0]);
				// or implement removing and sending of scout at 'scoutMigrated' listener

				moveType = 'migrated';
			} else {
				console.log('sameAs relation found, but no known hoster of the target');
				this.isAt = target;
				m.notify('swm:sctMove', this);
			}
		}

		return moveType;
	},

	scoutFoundSomething: function() {
		if (this.type == this.isAt.node) {
			monitor('scout from ' + this.owner + ' found:', 'scout id: ' + this.id);
			monitor('&nbsp;&nbsp;' + utils.getHash(this.type), '', 'data');

			m.notify('swm:sctFound', this);
			return true;
		} else {
			return false;
		}
	},

	foragerMove: function() {
		this.wasAt = this.isAt;
		this.passedEdge = rdfGraph.getRandomEdgeFromNode(this.isAt)
		this.isAt = this.passedEdge.getOtherEnd(this.isAt);
		this.energy--;

		m.notify('swm:fgrMove', this);
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
			m.notify('swm:fgrFound', this);
			return true;
		} else {
			return false;
		}

		// return (found something) ? true : false;
	},

	foragerIsExhausted: function() {
		if (this.energy < 1) {
			monitor('forager from ' + this.owner + ' is exhausted.', 'forager id: ' + this.id);

			m.notify('swm:fgrExhausted', this);
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

		m.notify('swm:nrsMove', this);
	},

	nurseBeeFoundSomething: function() {
		var found;

		switch (this.type) {
			case 'rdfs5':  // uuu rdfs:subPropertyOf vvv . && vvv rdfs:subPropertyOf xxx . > uuu rdfs:subPropertyOf xxx .
				if (this.prevEdge != null && this.prevEdge.label == subPropertyOfURI && this.passedEdge.label == subPropertyOfURI) {
					if (this.prevEdge.target == this.passedEdge.source) {
						found = rdfGraph.newInferredEdge(this.prevEdge.source, subPropertyOfURI, this.passedEdge.target, 'rdfs');
					} else if (this.prevEdge.source == this.passedEdge.target) {
						found = rdfGraph.newInferredEdge(this.passedEdge.source, subPropertyOfURI, this.prevEdge.target, 'rdfs');
					}
				}
				break;
			case 'rdfs11': // uuu rdfs:subClassOf vvv .    && vvv rdfs:subClassOf xxx .    > uuu rdfs:subClassOf xxx .
				if (this.prevEdge != null && this.prevEdge.label == subClassOfURI && this.passedEdge.label == subClassOfURI) {
					if (this.prevEdge.target == this.passedEdge.source) {
						found = rdfGraph.newInferredEdge(this.prevEdge.source, subClassOfURI, this.passedEdge.target, 'rdfs');
					} else if (this.prevEdge.source == this.passedEdge.target) {
						found = rdfGraph.newInferredEdge(this.passedEdge.source, subClassOfURI, this.prevEdge.target, 'rdfs');
					}
				}
				break;
			case 'rdfs9':  // uuu rdfs:subClassOf xxx .    && vvv rdf:type uuu .           > vvv rdf:type xxx .
				if (this.prevEdge != null && this.prevEdge.label == subClassOfURI && this.passedEdge.label == typeURI && this.prevEdge.source == this.passedEdge.target) {
					found = rdfGraph.newInferredEdge(this.passedEdge.source, typeURI, this.prevEdge.target, 'rdf');
				} else if (this.prevEdge != null && this.prevEdge.label == typeURI && this.passedEdge.label == subClassOfURI && this.prevEdge.target == this.passedEdge.source) {
					found = rdfGraph.newInferredEdge(this.prevEdge.source, typeURI, this.passedEdge.target, 'rdf');
				}
				break;
			case 'rdfs8':
				if (this.passedEdge != null && this.passedEdge.label == typeURI && this.isAt.node == classURI) {
					// add: this.wasAt | subClassOfURI | resourceURI
					// *	first add (if not exists) resourceURI node to graph
					// found = rdfGraph.newInferredEdge(this.wasAt.node, subClassOfURI, resourceURI, 'rdfs');
				}
				break;
			case 'rdfs13':
				if (this.passedEdge != null && this.passedEdge.label == typeURI && this.isAt.node == datatypeURI) {
					// add: this.wasAt | subClassOfURI | literalURI
					// *	first add (if not exists) literalURI node to graph
					// found = rdfGraph.newInferredEdge(this.wasAt.node, subClassOfURI, literalURI, 'rdfs');
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

			m.notify('swm:nrsFound', found);
			return true;
		} else {
			return false;
		}
	}

};

// found = matches(this,
// 	{ 'prevEdge': subClassOfURI, 'passedEdge': subClassOfURI, 'prevEdge.target': this.passedEdge.source },
// 	{ 'source': this.prevEdge.source, 'label': subClassOfURI, 'target': this.passedEdge.target, 'type': 'rdfs' });

function matches(context, pattern, result) {
	/*
		pattern:
			prevEdge.source
			prevEdge
			prevEdge.target
			passedEdge.source
			passedEdge
			passedEdge.target
			wasAt
			isAt
	*/
	for (item in pattern) {
		if (context[item] && context[item] != pattern[item]) return null;
	}

	return rdfGraph.newInferredEdge(result.source, result.label, result.target, result.type);
}