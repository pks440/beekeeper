var swarm = (function(behavior) {

    // settings
    var foragerEnergy = behavior.foragerEnergy;

    var numOfScouts = 0,
        numOfForagers = 0,
        numOfNurseBees = 0;

    var scouts = [],
        foragers = [],
        nurseBees = [];

    var s = 0, f = 0, n = 0;

    function Scout(id, owner, type, location) {
        this.id = id;
        this.owner = owner;
        this.type = type; // node
        this.isAt = location;

        m.publish('scoutInit', this);
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

        m.publish('foragerInit', this);
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

        m.publish('nurseInit', this);
    }

    NurseBee.prototype.move = behavior.nurseBeeMove;
    NurseBee.prototype.foundSomething = behavior.nurseBeeFoundSomething;

    function init() {
        initializeNurseBees();
        // initializeScouts();
        // initializeForagers();

        m.publish('swarmInit', swarm);
    }

    function initScouts() {
        var ownScouts = [];
        var sortedNodes = rdfGraph.getSortedNodes();

        // for (var i = 0; i < 3; i++) {
        //     ownScouts.push(new Scout(sortedNodes[i], rdfGraph.getRandomNode()));
        // }

        for (var i = 0; i < 3; i++) {
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
            ownForagers.push({ 'id': utils.guid(), 'owner': config.ownerID, 'triple': triple, 'location': location });
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
        for (var i = 0; i < 3; i++) {
            nurseBees.push(new NurseBee(i, rdfGraph.getRandomNode())); // new NurseBee(rdfGraph.getRandomNode().node, rdfGraph.getRandomNode())
            numOfNurseBees++;
        }
    }


    function initScout(id, owner, type) {
        scouts.push(new Scout(id, owner, type, rdfGraph.getRandomNode()));
        numOfScouts++;

        // console.log('# of scouts: ' + numOfScouts);
    }

    function initForager(id, owner, triple, location) {
        foragers.push(new Forager(id, owner, triple, rdfGraph.getNode(location)));
        numOfForagers++;

        // console.log('# of foragers: ' + numOfForagers);
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

        m.publish('scoutRemoved', scout[0]);
    }

    function removeForager(index) {
        var forager = foragers.splice(index, 1);
        numOfForagers--;

        m.publish('foragerRemoved', forager[0]);
    }

    return {

        initialize: init,
        initializeScouts: initScouts,
        initializeForagers: initForagers,
        initializeScout: initScout,
        initializeForager: initForager,

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
                console.time('scouts');
                // monitor('scout step' + '\n\nnumOfScouts: ' + numOfScouts + '\ns: ' + s);
                D3graph.unstyleNode(scouts[s].isAt.node, 'scout');
                scouts[s].move();
                if (scouts[s].foundSomething()) {
                    // ^TODO: ask owner for initializing and sending over helping foragers
                }

                s++;
                console.timeEnd('scouts');
            } else if (f < numOfForagers) {
                console.time('foragers');
                // monitor('forager step' + '\n\nnumOfForagers: ' + numOfForagers + '\nf: ' + f);
                D3graph.unstyleNode(foragers[f].isAt.node, 'forager');
                foragers[f].move();
                foragers[f].foundSomething();
                // if (foragers[f].foundSomething()) monitor('forager bee ' + f + ' found: ' + foragers[f].triple + '!');
                if (foragers[f].isExhausted()) {
                    removeForager(f);

                    // console.log('foragers left:');
                    // console.log(foragers);
                }

                f++;
                console.timeEnd('foragers');
            } else if (n < numOfNurseBees) {
                console.time('nurses');
                // monitor('nurse step' + '\n\nnumOfNurseBees: ' + numOfNurseBees + '\nn: ' + n);
                D3graph.unstyleNode(nurseBees[n].isAt.node, 'nurse');
                nurseBees[n].move();
                if (nurseBees[n].foundSomething()) {
                    // monitor('nurse bee ' + n + 'found: ' + nurseBees[n].type + '!');
                }

                n++;
                console.timeEnd('nurses');
            } else {
                s = f = n = 0;
                this.step();
            }

            m.publish('cycleComplete', this);

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

            // var j = 10;
            // while (j--) {
            //     for (var i = 0; i < numOfScouts; i++) {
            //         alert('scout step');
            //         // console.log(i);
            //         // console.log(scouts[i].isAt);
            //         // console.log(scouts[i]);
            //         D3graph.unfocusNode(scouts[i].isAt.node);
            //         scouts[i].move();
            //         D3graph.focusNode(scouts[i].isAt.node, 'red');
            //         if (scouts[i].foundSomething()) {
            //             // TODO: ask owner for initializing and sending over helping foragers
            //             initializeForagers(scouts[i].type, scouts[i].isAt);
            //             alert('scout ' + i + ' found: ' + scouts[i].type + '!');
            //         }
            //     }

            //     for (var i = 0; i < numOfForagers; i++) {
            //         alert('forager step');
            //         foragers[i].move();
            //         if (foragers[i].foundSomething()) alert('! forager bee ' + i + ' found: ' + foragers[i].triple + '!');
            //         if (foragers[i].isExhausted()) {
            //             alert('forager bee ' + i + ' is exhausted.');
            //             window.foragers = foragers;
            //             foragers.splice(i, 1);
            //             numOfForagers--;
            //             console.log(foragers);
            //         }
            //     }

            //     for (var i = 0; i < numOfNurseBees; i++) {
            //         alert('nurse step');
            //         nurseBees[i].move();
            //         if (nurseBees[i].foundSomething()) {
            //             alert('nurse bee ' + i + 'found: ' + nurseBees[i].type + '!');
            //         }
            //     }
            // }