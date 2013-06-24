var swarm = (function(behavior) {

    // settings
    var foragerEnergy = behavior.foragerEnergy;

    var numOfScouts = 0,
        numOfForagers = 0,
        numOfNurseBees = 0;

    var scouts = [],
        foragers = [],
        nurseBees = [];

    var s = 0, f = 0, n = 0, cycle = 0;

    function Scout(id, owner, type, location) {
        this.id = id;
        this.owner = owner;
        this.type = type; // node
        this.isAt = location;

        m.notify('swm:sctInit', this);
    }

    Scout.prototype.move = behavior.scoutMove;
    Scout.prototype.foundSomething = behavior.scoutFoundSomething;

    function Forager(id, owner, triple, location) {
        this.id = id;
        this.owner = owner;
        this.triple = triple; // triple
        this.isAt = location;
        this.passedEdge;
        this.wasAt;
        this.energy = foragerEnergy;
        this.memory = [];

        m.notify('swm:fgrInit', this);
    }

    Forager.prototype.move = behavior.foragerMove;
    Forager.prototype.foundSomething = behavior.foragerFoundSomething;
    Forager.prototype.isExhausted = behavior.foragerIsExhausted;

    function NurseBee(type, location) {
        this.id = utils.guid();
        this.owner = config.ownerID;
        this.type = type; // type number
        this.isAt = location;
        this.passedEdge;
        this.wasAt;
        this.prevEdge;

        m.notify('swm:nrsInit', this);
    }

    NurseBee.prototype.move = behavior.nurseBeeMove;
    NurseBee.prototype.foundSomething = behavior.nurseBeeFoundSomething;

    function init() {
        initializeNurseBees();
        // initializeScouts();
        // initializeForagers();

        m.notify('swm:initialized', swarm);
    }

    function initScouts() {
        var ownScouts = [];
        var sortedNodes = rdfGraph.getSortedNodes();

        // for (var i = 0; i < 3; i++) {
        //     ownScouts.push(new Scout(sortedNodes[i], rdfGraph.getRandomNode()));
        // }

        for (var i = 0; i < 1; i++) {
            ownScouts.push({ 'id': utils.guid(), 'owner': config.ownerID, 'type': sortedNodes[i] });
        }

        // console.log(ownScouts);

        return ownScouts;
    }

    function initForagers(type, location) {
        ownForagers = [];

        // three different types of foragers
        var triples = [
            { 's': type, 'p': 'http://www.w3.org/2000/01/rdf-schema#subClassOf', 'o': undefined }
            // { 's': undefined, 'p': 'http://www.w3.org/2000/01/rdf-schema#subClassOf', 'o': type },
            // { 's': undefined, 'p': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'o': type }
        ];

        // triples.forEach(function(triple) {
        //     console.log('forager ' + numOfForagers + ' (' + type + '):');
        //     console.log(triple);

        //     ownForagers.push(new Forager(triple, location));
        //     numOfForagers++;
        // });

        triples.forEach(function(triple) {
            ownForagers.push({ 'id': utils.guid(), 'owner': config.ownerID, 'triple': triple, 'isAt': location });
        });

        return ownForagers;

        // for (triple in rdfGraph.edgesIndex[type]) { // TODO: cached?
        //     foragers[numOfForagers] = new Forager(triple, location);
            
        //     console.log('forager ' + numOfForagers + ' (' + type + '):');
        //     console.log(triple);
            
        //     numOfForagers++;
        // }
    }

    function initializeNurseBees() {
        var types = [
            'rdfs5',    // uuu rdfs:subPropertyOf vvv . && vvv rdfs:subPropertyOf xxx . > uuu rdfs:subPropertyOf xxx .
            'rdfs9',    // uuu rdfs:subClassOf xxx .    && vvv rdf:type uuu .           > vvv rdf:type xxx .
            'rdfs11'    // uuu rdfs:subClassOf vvv .    && vvv rdfs:subClassOf xxx .    > uuu rdfs:subClassOf xxx .
        ];

        types.forEach(function(type) {
            nurseBees.push(new NurseBee(type, rdfGraph.getRandomNode()));
            numOfNurseBees++;
        });
    }


    function initScout(scout) {
        var isAt;
        
        if (scout.isAt && rdfGraph.getNode(scout.isAt)) {
            isAt = rdfGraph.getNode(scout.isAt);
        } else {
            isAt = rdfGraph.getRandomNode();
        }

        scouts.push(new Scout(scout.id, scout.owner, scout.type, isAt));
        numOfScouts++;
    }

    function initForager(forager) {
        var isAt = rdfGraph.getNode(forager.isAt);

        foragers.push(new Forager(forager.id, forager.owner, forager.triple, isAt));
        numOfForagers++;
    }

    function forScoutsFrom(owner, fn) {
        for (var i = 0; i < numOfScouts; i++) {
            if (scouts[i].owner == owner) {
                fn(i);
                i--;
            }
        };
    }

    function forForagersFrom(owner, fn) {
        for (var i = 0; i < numOfForagers; i++) {
            if (foragers[i].owner == owner) {
                fn(i);
                i--;
            }
        };
    }

    function removeScout(index) {
        var scout = scouts.splice(index, 1);
        numOfScouts--;

        m.notify('swm:sctRemoved', scout[0]);
    }

    function removeForager(index) {
        var forager = foragers.splice(index, 1);
        numOfForagers--;

        m.notify('swm:fgrRemoved', forager[0]);
    }

    return {

        initialize: init,
        initializeScouts: initScouts,
        initializeForagers: initForagers,
        initializeScout: initScout,
        initializeForager: initForager,

        prepareScoutForMigrating: function(scout) {
            return [{ 'id': scout.id, 'owner': scout.owner, 'type': scout.type, 'isAt': scout.isAt.node }];
        },

        addScout: function(scout) {
            scouts.push(scout);
        },

        addForager: function(forager) {
            foragers.push(forager);
        },

        removeScoutsFrom: function(owner) {
            forScoutsFrom(owner, function(index) {
                removeScout(index);
            });
        },

        removeForagersFrom: function(owner) {
            forForagersFrom(owner, function(index) {
                removeForager(index);
            });
        },

        step: function() {
            if (s < numOfScouts) {
                // console.time('scouts');
                D3graph.unstyleNode(scouts[s].isAt.node, 'scout');
                if (scouts[s].move() == 'migrated') {
                    // remove ONLY if sending over successful (= not blocked etc.), maybe on listening to 'swm:sctReceived' response message?
                    removeScout(s);
                } else {
                    if (scouts[s].foundSomething()) {
                        //
                    }
                }

                s++;
                // console.timeEnd('scouts');
            } else if (f < numOfForagers) {
                // console.time('foragers');
                D3graph.unstyleNode(foragers[f].isAt.node, 'forager');
                foragers[f].move();
                if (foragers[f].foundSomething()) {

                }
                if (foragers[f].isExhausted()) {
                    removeForager(f);

                    // console.log('foragers left:');
                    // console.log(foragers);
                }

                f++;
                // console.timeEnd('foragers');
            } else if (n < numOfNurseBees) {
                // console.time('nurses');
                D3graph.unstyleNode(nurseBees[n].isAt.node, 'nurse');
                nurseBees[n].move();
                if (nurseBees[n].foundSomething()) {
                    //
                }

                n++;
                // console.timeEnd('nurses');
            } else {
                s = f = n = 0;
                this.step();
            }

            cycle++;
            m.notify('swm:cycleComplete', cycle);

        },

        run: function() {
            while (false) { // while not 'stop' called
                swarm.step();
            }
        },

        stop: function() {
            //
        }

    };

})(behavior);