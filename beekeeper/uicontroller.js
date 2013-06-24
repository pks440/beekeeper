$(function () {
    $('#load').click(function() {
        showLoadOptions();
    });

    $('#generate').click(function() {
        hideLoadOptions();
        generateGraph($('#inputN3').val());
    });

    $('#file').click(function() {
        var file = $('#input').get(0).files[0];
        loadFile(file);
    });

    $('#saveFile').click(function() {
        rdfGraph.saveToFile();
    });

    $('#loadExperiment').click(function() {
        loadExperimentFile();
        $('#loadExperiment').hide();
        $('#saveExperiment').show();
    });

    $('#saveExperiment').click(function() {
        var filename = prompt('Filename: ', 'experiment_data.txt');
        var data = makeExport();
        saveAsFile(filename, data);
    });

    $('#visualize').click(function() {
        config.visualizationEnabled = $(this).is(':checked');
    });


    $('#do').click(function() {
        // $('#doData').val()
        // D3graph.newNode($('#doData').val());

        // p2p.send('requestIdsForNode', $('#doData').val());

        // addToHosts($('#doData').val());
        // removeFromHosts($('#doData').val());

        // saveAsFile($('#doData').val(), 'Some content\non multiple lines.');
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

    $('#requestHostedDatasets').click(function() {
        p2p.send('requestHostedDatasets');
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
            $('#run').hide();
            $('.animationSpeed').show();
            $(this).attr('value', 'pause');
            if (window.animate) window.clearInterval(animate);
            window.animate = window.setInterval(function() { swarm.step(); }, config.animationInterval);
        } else if ($(this).attr('value') == 'pause') {
            $(this).attr('value', 'animate');
            $('.animationSpeed').hide();
            $('#run').show();
            if (window.animate) window.clearInterval(animate);
        }
    });

    $('#speedSlider').mouseup(function(){
        config.animationInterval = this.value;

        if (window.animate) {
            window.clearInterval(animate);
            window.animate = window.setInterval(function() { swarm.step(); }, config.animationInterval);
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