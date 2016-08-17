import "./helper";
import $ from 'jquery';
import jQuery from 'jquery';
// export for others scripts to use
window.$ = $;
window.jQuery = jQuery;

require("./../../node_modules/jquery-csv/src/jquery.csv.js");

import UI from './ui';
import Canvas from './canvas';
import DataStore from './data-store';

import initDatGui from './dat-gui';

import TransitionManager from './visualization/map/transition-manager';

/**
 * @method window.onload
 * @description After loading all scripts initialize the instances, load dataset and update ui
 */

window.onload = () => {
    let dataStore = window.dataStore = new DataStore();
    dataStore.import(`${location.origin}${location.pathname}/dist/datasets/superstore-preprocessed-coords-geoids.csv`);
    dataStore.title = "Superstore";

    let ui = window.ui = new UI();
    let canvas = window.canvas = new Canvas(dataStore.data, dataStore.currentSelection);
    let TM = window.TM = new TransitionManager(canvas);
    initDatGui(dataStore, ui, canvas, window.updateScreen);

    // After import the dataset we now can update the dropboxes with the features
    UI.updateDropdown(dataStore.features, dataStore.currentSelection);
    UI.toggleFeatureDropdowns();

    addEventListener(dataStore, canvas);
    window.updateScreen();
};

// latest visualization in [0]
var visualizationHistory = [];
var currentVisualization = {};
window.updateScreen = () => {
    canvas.stop();

    let upcomingVisualizationType = $("select.visualization").val();
    let transitionType = $("select.transition").val();
    let transitionLayout = $("select.transition-layout").val();

    // if there was previous visualization
    if (visualizationHistory.length) {
        // check if it was anything with maps
        // and if the new visualization is another type than the last one
        let mapTypesWithDomNodes = ['dot', 'psm', 'choropleth', 'cartogram'];
        if (
            mapTypesWithDomNodes.indexOf(visualizationHistory[0].type) > -1 &&
            visualizationHistory[0].type !== upcomingVisualizationType
        ) {
            if (
                transitionType === 'linear' &&
                mapTypesWithDomNodes.indexOf(upcomingVisualizationType) > -1
            ) {
                let promise = TM.animate(
                    visualizationHistory[0],
                    upcomingVisualizationType
                );

                promise
                    .then((_currentVisualization) => {
                        visualizationHistory.unshift(_currentVisualization);
                        currentVisualization = _currentVisualization.obj;
                    })
                    .catch((error) => {
                        console.log('promise error');
                    });

                return;
            } else {
                if (visualizationHistory[0].type === "dot" && transitionType === "linear" && (transitionLayout === "juxtaposition" || transitionLayout === "stacked")) {
                    // Remove the dot map later
                } else {
                    // remove all dom nodes
                    visualizationHistory[0].obj.removeAllDomNodes();
                    // hide svg and map
                    visualizationHistory[0].obj.hide(true, true);
                }
            }
        }
    }

    switch (upcomingVisualizationType) {
        case "barChart":
            currentVisualization = canvas.drawBarChart(
                dataStore.data,
                dataStore.schema,
                dataStore.currentSelection,
                dataStore.oldSelectionX,
                dataStore.title
            );
            visualizationHistory.unshift({
                'type': 'bar',
                'obj': currentVisualization
            });
            break;
        case "scatterPlot":
            currentVisualization = canvas.drawScatterPlot(
                dataStore.data,
                dataStore.schema,
                dataStore.currentSelection,
                dataStore.title
            );
            visualizationHistory.unshift({
                'type': 'scatter',
                'obj': currentVisualization
            });
            break;

        case "dot":
            currentVisualization = canvas.drawDotMap(
                dataStore.data
            );
            visualizationHistory.unshift({
                'type': 'dot',
                'obj': currentVisualization
            });
            break;

        case "psm":
            currentVisualization = canvas.drawProportionalSymbolMap(
                dataStore.data,
                currentVisualization.constructor.name === "ProportionalSymbolMap"
            );
            visualizationHistory.unshift({
                'type': 'psm',
                'obj': currentVisualization
            });
            break;

        case "choropleth":
            currentVisualization = canvas.drawChoroplethMap(
                dataStore.data,
                currentVisualization.constructor.name === "ChoroplethMap"
            );
            visualizationHistory.unshift({
                'type': 'choropleth',
                'obj': currentVisualization
            });
            break;

        case "cartogram":
            currentVisualization = canvas.drawCartogram(
                dataStore.data,
                currentVisualization.constructor.name === "Cartogram"
            );
            visualizationHistory.unshift({
                'type': 'cartogram',
                'obj': currentVisualization
            });
            break;

        case "overview":
            currentVisualization = canvas.drawOverview(dataStore.data);
            visualizationHistory.unshift({
                'type': 'overview',
                'obj': currentVisualization
            });
            break;

        default:
            throw new Error(`Visualizationtype not working ("${visualizationType}")`);
    }

    window.viz = currentVisualization;
    canvas.render();
};

function addEventListener(dataStore, canvas) {
    $("select.feature-x").not(".sort-by").change(function () {
        dataStore.oldSelectionX = dataStore.currentSelection.x;
        dataStore.currentSelection.x = $(this).children(":selected")[0].innerHTML;
        canvas.clean();
        window.updateScreen(dataStore, canvas);
    });

    $("select.feature-y").change(function () {
        dataStore.currentSelection.y = $(this).children(":selected")[0].innerHTML;
        canvas.clean();
        window.updateScreen(dataStore, canvas);
    });

    $("select.visualization").change(function () {
        let value = $(this).val();

        if (value === "psm" || value === "choropleth" || value == "cartogram") {
            $("select.transition-layout option").filter(function (index) {
                return $(this).val() === "inPlace";
            }).prop("selected", true);

            UI.toggleSortByDropdown();
            UI.toggleTransitionLayout();
        }

        UI.toggleFeatureDropdowns();
        canvas.clean();
        window.updateScreen(dataStore, canvas);
    });

    $("select.transition").change(function () {
        UI.toggleSortByDropdown();
        UI.toggleTransitionLayout();
    });

    $("select.sort-type").change(function () {
        UI.toggleSortByDropdown();
    });

    $("select.sort-by").change(function () {
        let sortByFeature = $(this).children(":selected")[0].innerHTML;
        dataStore.changeSorting(sortByFeature);
        canvas.changeSorting(sortByFeature);
    });

    $("#button-pause").click(function () {
        if ($("#button-pause span").hasClass("glyphicon-pause")) {
            $("#button-pause span").removeClass("glyphicon-pause").addClass("glyphicon-play").text("Play");
            canvas.particleContainer.setParticlesSpeed(0);
        } else {
            $("#button-pause span").removeClass("glyphicon-play").addClass("glyphicon-pause").text("Pause");
            canvas.particleContainer.setParticlesSpeed(canvas.particles.speedPxPerFrame);
        }
    });

    $("body").keypress(function (event) {
        // + = 43
        if (event.which == 43 && canvas.particles.speedPxPerFrame < 30) {
            canvas.particles.speedPxPerFrame += 1;
            canvas.particleContainer.setParticlesSpeed(canvas.particles.speedPxPerFrame);
        }
        // - = 45
        else if (event.which == 45 && canvas.particles.speedPxPerFrame > 0) {
            canvas.particles.speedPxPerFrame -= 1;
            canvas.particleContainer.setParticlesSpeed(canvas.particles.speedPxPerFrame);
        }
        // p = 112
        else if (event.which == 112) {
            if ($("#button-pause span").hasClass("glyphicon-pause")) {
                $("#button-pause span").removeClass("glyphicon-pause").addClass("glyphicon-play").text("Play");
                canvas.particleContainer.setParticlesSpeed(0);
            } else {
                $("#button-pause span").removeClass("glyphicon-play").addClass("glyphicon-pause").text("Pause");
                canvas.particleContainer.setParticlesSpeed(canvas.particles.speedPxPerFrame);
            }
        }

        if((event.which === 43 || event.which === 45) && canvas.particles.arrivalSync){
            canvas.particleContainer.calculateSpeedArrivingSameTime();
        }
    });
}

window.isFunction = function (cb) {
    return cb && ({}).toString.call(cb) === '[object Function]';
};
