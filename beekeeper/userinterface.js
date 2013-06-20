$(function () {
    animationInterval = 1000;

    $('#load').click(function() {
        $('#status-message').html('');
        $('#inputN3').show();
        $('#load').hide();
        $('#generate').show();
    });

    $('#generate').click(function() {
        if ($('#visualize').is(':checked')) D3graph.newGraph('graph');

        $('#status-message').html('');
        $('#inputN3').hide();
        $('#generate').hide();
        $('#load').show();

        rdfGraph.initialize();
        rdfGraph.loadFromN3String($('#inputN3').val());
    });

    $('#do').click(function() {
        // $('#doData').val()
        // D3graph.newNode($('#doData').val());

        // p2p.send('requestNode', $('#doData').val());
    });

    $('#connect').click(function() {
        var id = $('#connectID').val();
        addFriend(id);
        p2p.connect(id);
        $('#connectID').val('');
    });

    $('#requestList').click(function() {
        p2p.send('requestNodesList');
    });

    $('#sendScouts').click(function() {
        sendScouts();
    });

    $('#init').click(function() {
        swarm.initialize();
    });

    $('#nextStep').click(function() {
        swarm.step();
    });

    $('#animate').click(function() {
        if ($(this).attr('value') == 'animate') {
            $(this).attr('value', 'pause');
            if (window.animate) window.clearInterval(animate);
            window.animate = window.setInterval(function() { swarm.step(); }, animationInterval);
        } else if ($(this).attr('value') == 'pause') {
            $(this).attr('value', 'animate');
            if (window.animate) window.clearInterval(animate);
        }
    });

    $('#run').click(function() {
        if ($(this).attr('value') == 'run') {
            $(this).attr('value', 'stop');
            config.monitorEnabled = false;
            // swarm.run();
            if (window.animate) window.clearInterval(animate);
            window.animate = window.setInterval(function() { swarm.step(); }, 10);
        } else if ($(this).attr('value') == 'stop') {
            $(this).attr('value', 'run');
            config.monitorEnabled = true;
            // swarm.stop();
            if (window.animate) window.clearInterval(animate);
        }
    });
});