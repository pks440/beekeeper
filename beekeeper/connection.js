var p2p = (function() {

	var peerjsAPIkey = 'bdnz2sap7go2bj4i';
    var peer;

    function handleConnection(c) {
        c.on('data', function(data) {
            m.publish('p2pData', data);
        });

        c.on('close', function() {
            m.publish('p2pClose', c);
        }); // TODO: accept new peer?
    }

    function eachSelectedConnection(fn) {
        for (peerId in config.friends) {
            if (config.friends[peerId]['selected']) {
                var conn = peer.connections[peerId].peerjs;
                fn(conn, $(this));
            }
        }

        // var selected = $('.selected');
        // selected.each(function() {
        //     var peerId = $(this).attr('id');
        //     var conn = peer.connections[peerId].peerjs;
        //     fn(conn, $(this));
        // });
    }

	return {

	    setup: function(id) {
	        peer = new Peer(id, { key: peerjsAPIkey });
            peer.on('open', function(id) {
                // own connection is ready

                m.publish('p2pOpen', id);
            });
            peer.on('connection', function(c) {
                // connection with other peer is ready
                handleConnection(c);

                m.publish('p2pConn', c);
            });
	    },

        connect: function(id) { // (id, callback)
            if (!peer.connections[id]) {
                var c = peer.connect(id);
                c.on('open', function() {
                    handleConnection(c);

                    m.publish('p2pOpen', id);

                    // typeof callback === 'function' && callback();
                });
            }
        },

        send: function(type, data, to) { // TODO: implement as one object argument: p2p.send({ 'type': someType, 'data': someData, 'to': someoneID })
            data = data || '';
            to = to || null;
            message = { 'type': type, 'sender': config.ownerID, 'message': data };

            if (to) {
                if (config.friends[to]['blockOut']) {
                    console.log('Outgoing message to ' + to + ' blocked.');
                } else {
                    if (peer.connections[to] && peer.connections[to].peerjs.open) peer.connections[to].peerjs.send(message);
        
                    console.log('sent to ' + to + ':');
                    console.log(message);
                }
            } else {
                eachSelectedConnection(function(c, $c) {
                    if (config.friends[c.peer]['blockOut']) {
                        console.log('Outgoing message to ' + c.peer + ' blocked.');
                    } else {
                        if (c.open) c.send(message); // && not 
        
                        console.log('sent to ' + c.peer + ':');
                        console.log(message);
                    }
                });
            }
        },

        close: function() {
            eachSelectedConnection(function(c, $c) {
                c.close();
            });
        },

        destroy: function() {
            if (!!peer && !peer.destroyed) {
                peer.destroy();
            }
        }

	};

})();