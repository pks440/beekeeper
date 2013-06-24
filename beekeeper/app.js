$(function () {
    if (window.location.hash) {
        config.ownerID = window.location.hash.substring(1);
    } else {
        config.ownerID = prompt('Name: ');
        window.location.hash = config.ownerID;
    }

    // loading session
    if (localStorage[config.ownerID]) session = JSON.parse(localStorage[config.ownerID]);
    if (session.config) config = session.config;

    p2p.setup(config.ownerID);
    $('#ownerID').html(config.ownerID);

    for (friend in config.friends) {
        addFriendElement(friend);
        if (config.connectOnLoad) p2p.connect(friend);
    }

    $('#visualize').get(0).checked = config.visualizationEnabled;
    $('#speedSlider').attr('value', config.animationInterval);
});

window.onunload = window.onbeforeunload = function(e) {
    p2p.destroy();

    if (config.saveConfigToLocalStorage) localStorage[config.ownerID] = '{"config":' + JSON.stringify(config) + '}';
    // var storage = [];
    // storage.push((config.saveConfigToLocalStorage) ? ('"config":' + JSON.stringify(config)) : '');
    // storage.push((config.saveGraphToLocalStorage) ? ('"data":' + /*graph data*/) : '');
    // localStorage[config.ownerID] = '{' + storage.join() + '}';
}

// document.getElementById('files').addEventListener('change', loadFiles, false);

function loadFiles(files) {
    // add support for multiple files, and multiple seperate graphs
    var file = files[0];
    var reader = new FileReader();
    reader.readAsText(file);

    reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) {
            var content = evt.target.result;
            generateGraph(content);
        }
    };
}

function saveAsFile(filename, data) {
    // var format = format || 'text/plain';
    var blob = new Blob([data], { type: 'text/plain' });

    var file = document.createElement('a');
    file.download = filename;
    file.href = window.webkitURL.createObjectURL(blob);
    file.click();
}

function loadExperimentFile() {
    var src = prompt('Filename: ', 'experiment.js');
    src += '?' + Date.now();

    loadModule(src, function() { monitor('Experiment file loaded.'); });
}

function loadModule(src, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;

    script.onload = callback();

    document.getElementsByTagName("head")[0].appendChild(script);
}

function showLoadOptions() {
    $('#status-message').html('');
    $('#inputN3').show();
    $('#load').hide();
    $('#generate').show();
}

function hideLoadOptions() {
    $('#status-message').html('');
    $('#inputN3').hide();
    $('#generate').hide();
    $('#load').show();
}

function generateGraph(data) {
    if (config.visualizationEnabled) D3graph.newGraph('graph');

    rdfGraph.initialize();
    rdfGraph.loadFromN3String(data);

    // if (config.visualizationEnabled) {
    //     loadModule('visualization.js', function() {
    //         monitor('visualization.js loaded');
    //         D3graph.newGraph('graph');

    //         rdfGraph.initialize();
    //         rdfGraph.loadFromN3String(data);
    //     });
    // } else {
    //     rdfGraph.initialize();
    //     rdfGraph.loadFromN3String(data);
    // }
}

var m = (function() {

    window.events = {};

    var listen = function(evnt, fn) {
        if (!events[evnt]) { 
          events[evnt] = [];
        }

        events[evnt].push({ context: this, callback: fn });

        return this;
    };

    var ignore = function(evnt) {
        delete events[evnt];
    };

    var trigger = function(evnt) {
        var args;

        if (!events[evnt]) {
          return false;
        } 

        args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = events[evnt].length; i < l; i++) {

            var listener = events[evnt][i];
            listener.callback.apply(listener.context, args);
        }
        return this;
    };

    return {
        notify: trigger,
        when: listen,
        unsubscribe: ignore // removes all listeners
    };

})();

m.when('rdf:loaded', function(numOfTriples) { $('#status-message').html('graph loaded. (' + numOfTriples + ' triples)').attr('title', new Date().toLocaleString()); });

// m.when('rdf:loaded', function(data) {
//     console.log('nodesIndex:');
//     console.log(data.nodesIndex);
//     console.log('edgesIndex:');
//     console.log(data.edgesIndex);
//     console.log('nodes:');
//     console.log(data.nodes);
//     console.log('edges:');
//     console.log(data.edges);
//     // console.log('inferredEdges:');
//     // console.log(data.inferredEdges);
// });

m.when('swm:initialized', function() { 
    $('#init').hide();
    $('#nextStep').show();
    $('#animate').show();
    $('#run').show();
});

m.when('swm:sctsSentTo', function(scouts, receivers) {
    receivers.forEach(function(receiver) {
        monitor('sent ' + scouts.length + ' scout' + ((scouts.length == 1) ? '' : 's') + ' to ' + receiver + '.');
    });
});

m.when('swm:sctMigratedTo', function(scout, receiver) {
    monitor('scout from ' + scout.owner + ' migrated to ' + utils.getHash(scout.isAt.node) + ' at ' + receiver, 'scout id: ' + scout.id);
});

m.when('swm:frgsSentTo', function(foragers, receiver) {
    monitor('sent ' + foragers.length + ' forager' + ((foragers.length == 1) ? '' : 's') + ' to ' + receiver + '.');
});

m.when('swm:sctFound', function(data) {
    // connect to data.owner IF not already on friendslist (could be migrated via other peer)
    //  THEN send message first saying 'new peer connected, wants to send your scout back'.
    // TODO: remove scout
    p2p.connect(data.owner);

    console.log('going to request foragers from: ' + data.owner);
    p2p.send('requestHelpForagers', data.type, data.owner); // = scout
});

m.when('swm:fgrFound', function(data) {
    console.log('going to send forager back to: ' + data.owner);
    p2p.send('returningForagers', data.memory, data.owner); // = forager
});

m.when('swm:sctRemoved', function(data) {
    monitor('Removed scout from ' + data.owner + '.', 'scout id: ' + data.id);
});

m.when('swm:fgrRemoved', function(data) {
    monitor('Removed forager from ' + data.owner + '.', 'forager id: ' + data.id);
});

m.when('rdf:initialized', function(data) {
    if (config.visualizationEnabled) { // if visualization enabled
        m.when('rdf:nodeNew', function(data) { D3graph.newNode(data.node, data.RDFlinkTarget) });
        m.when('rdf:edgeNew', function(data) { D3graph.newLink(data.source.node, data.label, data.target.node, false); });
        m.when('rdf:inferredNew', function(data) { D3graph.newLink(data.source.node, data.label, data.target.node, true); });

        // m.when('rdf:loaded', swarmVis.initialize);

        // m.when('swm:sctInit', swarmVis.newScout);
        // m.when('swm:fgrInit', swarmVis.newForager);
        // m.when('swm:nrsInit', swarmVis.newNurseBee);

        // m.when('swm:sctMove', swarmVis.moveScout);
        // m.when('swm:fgrMove', swarmVis.moveForager);
        // m.when('swm:nrsMove', swarmVis.moveNurseBee);

        // m.when('swm:sctRemoved', swarmVis.removeScout);
        // m.when('swm:fgrRemoved', swarmVis.removeForager);
        // m.when('swm:nrsRemoved', swarmVis.removeNurseBee);

        m.when('swm:sctMove', function(data) { D3graph.styleNode(data.isAt.node, 'scout'); });
        m.when('swm:sctMigratedTo', function(scout, receiver) { D3graph.styleNode(scout.isAt.node, 'scout'); });
        m.when('swm:fgrMove', function(data) { D3graph.styleNode(data.isAt.node, 'forager'); });
        m.when('swm:nrsMove', function(data) { D3graph.styleNode(data.isAt.node, 'nurse'); });

        m.when('swm:sctRemoved', function(data) { D3graph.unstyleNode(data.isAt.node, 'scout'); });
        m.when('swm:fgrRemoved', function(data) { D3graph.unstyleNode(data.isAt.node, 'forager'); });
    }
});

function logger(data) {
    console.log(data);
}

function monitor(message, tooltip, type) {
    if (config.monitorEnabled) {
        tooltip = tooltip || '';
        type = type || '';
        var logger = $('#history');
        logger.append('<p class="' + type + '" title="' + tooltip + '">' + message + '</p>');
        logger.scrollTop(logger[0].scrollHeight);
    }
}

function addToHosts(uri) {
    if (config.hosts.indexOf(uri) == -1) {
        config.hosts.push(uri);
        monitor(uri + ' added to hosted datasets list.');
        return uri;
    } else {
        return null;
    }
}

function removeFromHosts(uri) {
    if (config.hosts.indexOf(uri) != -1) {
        config.hosts.splice(config.hosts.indexOf(uri), 1);
        monitor(uri + ' removed from hosted datasets list.');
        return uri;
    } else {
        return null;
    }
}

function addFriend(id) {
    if (!config.friends[id] && id != config.ownerID) {
        config.friends[id] = { 'hosts': [], 'selected': false, 'blockIn': false, 'blockOut': false };

        addFriendElement(id);
    }
}

function addFriendElement(id) {
    var friendElement = $('<div></div>').addClass('friend');
    var name = $('<span class="name" id="' + id + '"> ' + id + '</span>');
    var blockIn = $('<span class="option' + ((config.friends[id].blockIn) ? ' block' : '') + '">[block IN]</span>');
    var blockOut = $('<span class="option' + ((config.friends[id].blockOut) ? ' block' : '') + '">[block OUT]</span>');
    friendElement.append(name);
    friendElement.append(blockOut);
    friendElement.append(blockIn);
    $('#friendsList').append(friendElement);
    name.on('click', function() {
        if ($(this).hasClass('connected')) { 
            $(this).toggleClass('selected');
            config.friends[id]['selected'] = !config.friends[id]['selected'];
        } else {
            p2p.connect(id);
        }
    });
    blockIn.on('click', function() { $(this).toggleClass('block'); config.friends[id]['blockIn'] = !config.friends[id]['blockIn']; });
    blockOut.on('click', function() { $(this).toggleClass('block'); config.friends[id]['blockOut'] = !config.friends[id]['blockOut']; });
}

function removeFriend(id) {
    // ask for confirmation?
    if (config.friends[id]) {
        p2p.close(id);
        $('#' + id).parent().remove();
        delete config.friends[id];
    }

    //
    // if ($('.friendslist').length === 0) {
    //     $('.filler').show();
    // }
}

function forEachSelectedConnection(fn) {
    for (friend in config.friends) {
        if (config.friends[friend]['selected']) {
            console.log(friend);
        }
    }
    // var selected = $('.selected');
    // selected.each(function() {
    //     var peerId = $(this).attr('id');
    //     var conn = peer.connections[peerId].peerjs;
    //     fn(conn, $(this));
    // });
}

function selectAllFriends() {
    for (friend in config.friends) {
        config.friends[friend]['selected'] = true;
        $('.name').addClass('selected');
    }
}

function deselectAllFriends() {
    for (friend in config.friends) {
        config.friends[friend]['selected'] = false;
        $('.name').removeClass('selected');
    }
}

m.when('p2p:conn', function(data) {
    monitor(data.peer + ' has connected with you.');
    addFriend(data.peer);
    $('#' + data.peer).addClass('connected');
});

m.when('p2p:open', function(data) {
    if (data != config.ownerID) monitor('Connection opened with ' + data + '.');
    $('#' + data).addClass('connected');
});

m.when('p2p:close', function(data) {
    $('#' + data.peer).removeClass('connected').removeClass('selected');
    config.friends[data.peer]['selected'] = false;
    monitor('Lost connection with ' + data.peer + '.');

    swarm.removeScoutsFrom(data.peer);
    swarm.removeForagersFrom(data.peer);
});

m.when('p2p:data', processIncomingMessage);

var protocol = {
    'requestHostedDatasets': sendHostedDatasets,
    'hostedDatasets': addHostedDatasets,
    'requestNodesList': sendNodesList,
    'nodesList': addNodesList,
    'requestIdsForNode': sendIdsForNode,
    'friendIds': addFriends,
    'scouts': addForeignScouts,
    'foragers': addForeignForagers,
    'requestHelpForagers': sendForagers,
    'returningForagers': addTriplesFromReturnedForagers,
    'requestDenied': handleDeniedRequest
}

// TODO: extend
//      [send personal behavior functions] (when implementing configurable behavior through file/options)
//      [response to sent bees: too many/over my (total) limit]
//      [retrieve my bees]

function processIncomingMessage(data) {
    console.log('received from ' + data.sender + ':');
    console.log(data);

    if (config.friends[data.sender]['blockIn']) {
        p2p.send('requestDenied', 'Blocked.', data.sender);
        return;
    }

    if (protocol[data.type]) {
        protocol[data.type].call(undefined, data); // first arg: 'this', further args: args to function
    } else {
        // default
    }

    // switch (data.type) {
    //     case 'requestNodesList':
    //         // request for nodes list
    //         // message: '' (string)
    //         getPermissionForSendingNodesList(data.sender);
    //         break;
    //     case 'nodesList':
    //         // sent nodes list
    //         // message: nodesList (object)
    //         storeNodesList(data.sender, data.message);
    //         break;
    //     case 'requestNode':
    //         // request for id's of friends who have a specific node in their nodes list
    //         // message: node (string)
    //         sendFriendIdsForNode(data.sender, data.message);
    //         break;
    //     case 'friendIds':
    //         // sent friend id's
    //         // message: owner id's (array)
    //         addFriends(data.sender, data.message);
    //         break;
    //     case 'scouts':
    //         // received scouts
    //         // message: scout objects (array)
    //         addForeignScouts(data.sender, data.message);
    //         break;
    //     case 'foragers':
    //         // received foragers
    //         // message: forager objects (array)
    //         addForeignForagers(data.sender, data.message);
    //         break;
    //     case 'requestHelpForagers':
    //         // request by migrated scout for help from foragers
    //         // message: scout (object)
    //         sendForagers(data.sender, data.message);
    //         break;
    //     case 'returningForagers':
    //         // returned foragers (potentially with new triples)
    //         // message: forager objects (array)
    //         addTriplesFromReturnedForagers(data.sender, data.message);
    //         break;
    //     case 'requestDenied':
    //         // send request denied by receiving peer (e.g. blocked)
    //         // message: ?
    //         deniedRequest(data.sender, data.message);
    //         break;
    //     default:
    //         //
    // }
}


// TODO: in seperate 'actions' file?
function sendHostedDatasets(data) {
    var accept = confirm('Share which datasets you host with ' + data.sender + '?');
    if (accept && config.hosts) {
        monitor('Send information about my hosted datasets to ' + data.sender + '.');
        p2p.send('hostedDatasets', config.hosts, data.sender);
    } else {
        // p2p.send('requestDenied', '', data.sender); ?
    }
}

function addHostedDatasets(data) {
    monitor('Received information about hosted datasets from ' + data.sender + '.');
    console.log('received hosted datasets list:');
    console.log(data.message);
    config.friends[data.sender]['hosts'] = data.message;

    for (dataset in data.message) {
        if (config.hostedBy[data.message[dataset]] && config.hostedBy[data.message[dataset]].indexOf(data.sender) == -1) {
            config.hostedBy[data.message[dataset]].push(data.sender);
        } else {
            config.hostedBy[data.message[dataset]] = [data.sender];
        }
    };
}

function sendNodesList(data) {
    var accept = confirm('Share your nodes list with ' + data.sender + '?');
    if (accept && rdfGraph) {
        monitor('Sent my nodes list to ' + data.sender + '.');
        p2p.send('nodesList', rdfGraph.getNodes(), data.sender); // TODO: only most important ones (e.g. 10)?
    } else {
        // p2p.send('requestDenied', '', data.sender); ?
    }
}

nodesLists = {};

function addNodesList(data) {
    monitor('Received nodes list from ' + data.sender + '.');
    console.log('received nodeslists:');
    console.log(data.message);
    // $('#' + data.sender).css('color','green'); ?
    nodesLists[data.sender] = data.message;
}

function sendIdsForNode(data) {
    if (Object.keys(nodesLists).length != 0) {
        var friendIds = { 'node': data.message, 'ids': {} };
        for (friend in nodesLists) {
            if (friend != data.sender && Object.keys(nodesLists[friend]).indexOf(data.message)) { friendIds['ids'][friend] = nodesLists[friend][data.message]; }
        }
        p2p.send('friendIds', friendIds, data.sender);
    }
}

function addFriends(data) {
    for (id in data.message['ids']) {
        monitor(id + ' has ' + data.message['ids'][id] + ' triple' + ((data.message['ids'][id] == 1) ? '' : 's') + ' with ' + data.message['node']);
    };
    // do something with received friend IDs
    // maybe connect to IDs and/or immediately send them scouts for the node (used for requesting these IDs)
}

function addForeignScouts(data) {
    monitor('Received ' + data.message.length + ' scout' + ((data.message.length == 1) ? '' : 's') + ' from ' + data.sender + '.');

    for (scout in data.message) {
        swarm.initializeScout(data.message[scout]);
    };
}

function addForeignForagers(data) {
    monitor('Received ' + data.message.length + ' forager' + ((data.message.length == 1) ? '' : 's') + ' from ' + data.sender + '.');

    for (forager in data.message) {
        swarm.initializeForager(data.message[forager]);
    };
}

function sendScouts() {
    var scouts = swarm.initializeScouts();
    p2p.send('scouts', scouts);

    var receivers = [];
    for (friend in config.friends) {
        if (config.friends[friend]['selected']) {
            receivers.push(friend);
        }
    } // TODO: still hack, properly implement p2p.send() returning array of friend IDs

    m.notify('swm:sctsSentTo', scouts, receivers);
}

function sendForagers(data) {
    monitor('scout at ' + data.sender + ' found:');
    monitor('&nbsp;&nbsp;' + data.message, '', 'data');

    var foragers = swarm.initializeForagers(data.message, data.message);
    p2p.send('foragers', foragers, data.sender);

    m.notify('swm:fgrsSentTo', foragers, data.sender);
}

function addTriplesFromReturnedForagers(data) {
    monitor('forager returned from ' + data.sender + ', found:');
    monitor('&nbsp;&nbsp;' + data.message, '', 'data');
    // TODO: add found triple to graph
}

function handleDeniedRequest(data) {
    console.log('Request denied by ' + data.sender + '.'); // include ready to use 'why denied message' ?
}