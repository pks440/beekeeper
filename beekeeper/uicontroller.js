$(function () {
    $('#showOptions').click(function() {
        $('#loadscreen').show();
    });

    $('#hideOptions').click(function(){
        $('#loadscreen').hide();
    });

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

    $('#skipOptions').click(function() {
        config.skipLoadScreen = $(this).is(':checked');
    });

    $('#connectOnLoad').click(function() {
        config.connectOnLoad = $(this).is(':checked');
    });

    $('#requestDatasetsOnLoad').click(function() {
        config.requestDatasetsOnLoad = $(this).is(':checked');
    });

    $('#configlocalstorage').click(function() {
        config.saveConfigToLocalStorage = $(this).is(':checked');
    });

    $('#graphlocalstorage').click(function() {
        config.saveGraphToLocalStorage = $(this).is(':checked');
    });

    $('#linksetsEnabled').click(function() {
        config.linksetsEnabled = $(this).is(':checked');
    });

    $('#monitorEnabled').click(function() {
        setMonitorEnabled($(this).is(':checked'));
    });

    $('#visEnabled').click(function() {
        config.visualizationEnabled = $(this).is(':checked');
        
        $('.visOption').attr('disabled', !config.visualizationEnabled);
    });

    $('#showLabels').click(function() {
        config.showLabels = $(this).is(':checked');
    });

    $('#showMarkers').click(function() {
        config.showMarkers = $(this).is(':checked');
    });

    $('#staticGraph').click(function() {
        config.staticGraph = $(this).is(':checked');
    });

    $('#staticGraphIterations').on('change', function() {
        config.staticGraphIterations = $(this).val();
    });

    $('#do').click(function() {
        // $('#doData').val()
        // D3graph.newNode($('#doData').val());

        // p2p.send('requestIdsForNode', $('#doData').val());

        // addToHosts($('#doData').val());
        // removeFromHosts($('#doData').val());

        // saveAsFile($('#doData').val(), 'Some content\non multiple lines.');
    });

    $('#addDataset').click(function() {
        if ($('#dataset').val() != '') {
            addToHosts($('#dataset').val());
        }
    });

    $('#removeDataset').click(function() {
        if ($('#dataset').val() != '') {
            removeFromHosts($('#dataset').val());
        }
    });

    $('#currentDatasets').click(function() {
        var datasets = config.hosts.join('\n');
        if (datasets == '') datasets = '(no datasets)';
        alert('Hosted Datasets:\n' + datasets);
        console.log(config.hosts);
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

    $('#step').click(function() {
        swarm.step();
    });

    $('#animate').click(function() {
        if ($(this).attr('value') == 'animate') {
            $('#step').hide();
            $('#run').hide();
            $('.animationSpeed').show();
            $(this).attr('value', 'pause');
            if (window.animate) window.clearInterval(animate);
            window.animate = window.setInterval(function() { swarm.step(); }, config.animationInterval);
        } else if ($(this).attr('value') == 'pause') {
            $(this).attr('value', 'animate');
            $('.animationSpeed').hide();
            $('#run').show();
            $('#step').show();
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
            setMonitorEnabled(false);
            // swarm.run();
            if (window.animate) window.clearInterval(animate);
            window.animate = window.setInterval(function() { swarm.step(); }, 0);
        } else if ($(this).attr('value') == 'stop') {
            $(this).attr('value', 'run');
            setMonitorEnabled(true);
            // swarm.stop();
            if (window.animate) window.clearInterval(animate);
        }
    });
});