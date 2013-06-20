$(function () {
    if (window.location.hash) {
        config.ownerID = window.location.hash.substring(1);
    } else {
        config.ownerID = prompt("Name: ");
    }
    p2p.setup(config.ownerID);
    $('#ownerID').html(config.ownerID);

});

window.onunload = window.onbeforeunload = function(e) {
    p2p.destroy();
}

var m = (function() {

    var events = {};

    var listen = function(evnt, fn) {

        if (!events[evnt]) { 
          events[evnt] = [];
        }

        events[evnt].push({ context: this, callback: fn });

        return this;
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
        publish: trigger,
        subscribe: listen
    };

})();

m.subscribe('RDFloaded', function(numOfTriples) { $('#status-message').html('graph loaded. (' + numOfTriples + ' triples)').attr('title', new Date().toLocaleString()); });

// m.subscribe('RDFloaded', function(data) {
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

m.subscribe('swarmInit', function() { 
    $('#init').hide();
    $('#nextStep').show();
    $('#animate').show();
    $('#run').show();
});

// m.subscribe('scoutInit', function(data) {
//     logger(data);
// });

// m.subscribe('foragerInit', function(data) {
//     logger(data);
// });

m.subscribe('scoutsSentTo', function(scouts, receivers) {
    receivers.forEach(function(receiver) {
        monitor('sent ' + scouts.length + ' scout' + ((scouts.length == 1) ? '' : 's') + ' to ' + receiver + '.');
    });
});

m.subscribe('foragersSentTo', function(foragers, receiver) {
    monitor('sent ' + foragers.length + ' forager' + ((foragers.length == 1) ? '' : 's') + ' to ' + receiver + '.');
});

m.subscribe('scoutFound', function(data) {
    // TODO: remove scout
    console.log('going to request foragers from: ' + data.owner);
    p2p.send('requestHelpForagers', data.type, data.owner); // = scout
});

m.subscribe('foragerFound', function(data) {
    console.log('going to send forager back to: ' + data.owner);
    p2p.send('returningForagers', data.memory, data.owner); // = forager
});

m.subscribe('scoutRemoved', function(data) {
    monitor('Removed scout from ' + data.owner + '.', 'scout id: ' + data.id);
});

m.subscribe('foragerRemoved', function(data) {
    monitor('Removed forager from ' + data.owner + '.', 'forager id: ' + data.id);
});

if (true) { // if visualization enabled
    m.subscribe('RDFnewNode', function(data) { D3graph.newNode(data.node) });
    m.subscribe('RDFnewEdge', function(data) { D3graph.newLink(data.source.node, data.label, data.target.node, false); });

    // m.subscribe('RDFloaded', swarmVis.initialize);

    // m.subscribe('scoutInit', swarmVis.newScout);
    // m.subscribe('foragerInit', swarmVis.newForager);

    // m.subscribe('scoutMove', swarmVis.moveScout);
    // m.subscribe('foragerMove', swarmVis.moveForager);

    m.subscribe('scoutMove', function(data) { D3graph.styleNode(data.isAt.node, 'scout'); });
    m.subscribe('foragerMove', function(data) { D3graph.styleNode(data.isAt.node, 'forager'); });
    m.subscribe('nurseMove', function(data) { D3graph.styleNode(data.isAt.node, 'nurse'); });

    m.subscribe('foragerExhausted', function(data) { D3graph.unstyleNode(data.isAt.node, 'forager'); });
}

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

function addFriend(id) {
    if (!config.friends[id]) {
        config.friends[id] = { 'selected': false, 'blockIn': false, 'blockOut': false };

        var friendElement = $('<div></div>').addClass('friend');
        var name = $('<span class="name" id="' + id + '"> ' + id + '</span>');
        var blockIn = $('<span> [block IN] </span>');
        var blockOut = $('<span> [block OUT] </span>');
        friendElement.append(name);
        friendElement.append(blockIn);
        friendElement.append(blockOut);
        $('#friendsList').append(friendElement);
        name.on('click', function() {
            if ($(this).hasClass('connected')) { $(this).toggleClass('selected'); config.friends[id]['selected'] = !config.friends[id]['selected']; }
        });
        blockIn.on('click', function() { $(this).toggleClass('block'); config.friends[id]['blockIn'] = !config.friends[id]['blockIn']; });
        blockOut.on('click', function() { $(this).toggleClass('block'); config.friends[id]['blockOut'] = !config.friends[id]['blockOut']; });
    }
}

function removeFriend(id) {
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
    }
}

function deselectAllFriends() {
    for (friend in config.friends) {
        config.friends[friend]['selected'] = false;
    }
}

m.subscribe('p2pConn', function(data) {
    monitor(data.peer + ' has connected with you.');
    addFriend(data.peer); // TODO: bug / adds friend everytime when sending - solved?
    $('#' + data.peer).addClass('connected');
});

m.subscribe('p2pOpen', function(data) {
    if (data != config.ownerID) monitor('Connection opened with ' + data + '.');
    $('#' + data).addClass('connected');
});

m.subscribe('p2pClose', function(data) {
    $('#' + data.peer).removeClass('connected').removeClass('selected');
    monitor('Lost connection with ' + data.peer + '.');

    swarm.removeScoutsFrom(data.peer);
    swarm.removeForagersFrom(data.peer);
});

m.subscribe('p2pData', processIncomingMessage);

var protocol = {
    'requestNodesList': getPermissionForSendingNodesList,
    'nodesList': storeNodesList,
    'requestNode': sendFriendIdsForNode,
    'friendIds': addFriends,
    'scouts': addForeignScouts,
    'foragers': addForeignForagers,
    'requestHelpForagers': sendForagers,
    'returningForagers': addTriplesFromReturnedForagers,
    'requestDenied': deniedRequest
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
function getPermissionForSendingNodesList(data) {
    var accept = confirm('Share your nodes list with ' + data.sender + '?');
    if (accept && rdfGraph) {
        monitor('Sent my nodes list to ' + data.sender + '.');
        p2p.send('nodesList', rdfGraph.getNodes(), data.sender); // TODO: only most important ones (e.g. 10)?
    } else {
        // p2p.send('requestDenied', '', data.sender); ?
    }
}

nodesLists = {};

function storeNodesList(data) {
    monitor('Received nodes list from ' + data.sender + '.');
    console.log('received nodeslists:');
    console.log(data.message);
    // $('#' + data.sender).css('color','green'); ?
    nodesLists[data.sender] = data.message;
}

function sendFriendIdsForNode(data) {
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
        swarm.initializeScout(data.message[scout].id, data.message[scout].owner, data.message[scout].type);
    };
}

function addForeignForagers(data) {
    monitor('Received ' + data.message.length + ' forager' + ((data.message.length == 1) ? '' : 's') + ' from ' + data.sender + '.');

    for (forager in data.message) {
        swarm.initializeForager(data.message[forager].id, data.message[forager].owner, data.message[forager].triple, data.message[forager].location);
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

    m.publish('scoutsSentTo', scouts, receivers);
}

function sendForagers(data) {
    monitor('scout at ' + data.sender + ' found:');
    monitor('&nbsp;&nbsp;' + data.message, '', 'data');

    var foragers = swarm.initializeForagers(data.message, data.message);
    p2p.send('foragers', foragers, data.sender);

    m.publish('foragersSentTo', foragers, data.sender);
}

function addTriplesFromReturnedForagers(data) {
    monitor('forager returned from ' + data.sender + ', found:');
    monitor('&nbsp;&nbsp;' + data.message, '', 'data');
    // TODO: add found triple to graph
}

function deniedRequest(data) {
    console.log('Request denied by ' + data.sender + '.'); // include ready to use 'why denied message' ?
}