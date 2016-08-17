import * as dat from "exdat";

export default class UI {
    constructor() {
        this.DatGui = new dat.GUI();
        this.DatGui.close();
    }

    static updateDropdown(features, currentSelection) {
        features.sort();

        for (let feature of features) {
            if (feature === currentSelection.x) {
                $(".feature-x, .sort-by").append(`<option selected>${feature}</option>`);
            } else {
                $(".feature-x, .sort-by").append(`<option>${feature}</option>`);
            }

            if (feature === currentSelection.y) {
                $(".feature-y").append(`<option selected>${feature}</option>`);
            } else {
                $(".feature-y").append(`<option>${feature}</option>`);
            }
        }

        $("select.sort-by option").filter(function (index) {
            return $(this).text() === "Row ID";
        }).prop("selected", true);
    }

    static toggleFeatureDropdowns() {
        let chosenVisualization = $("select.visualization option:selected")[0].innerHTML;

        switch ($("select.visualization").val()) {
            case "overview":
                $("select.feature-x, select.feature-y").attr("disabled", true);
                $("select.transition").attr("disabled", false);
                $("select.sort-type").attr("disabled", false);
                UI.toggleTransitionLayout();
                break;

            case "barChart":
                $("select.feature-y").attr("disabled", true);
                $("select.feature-x").attr("disabled", false);
                $("select.transition").attr("disabled", false);
                $("select.sort-type").attr("disabled", false);
                UI.toggleTransitionLayout();
                break;

            case "scatterPlot":
                $("select.feature-x, select.feature-y").attr("disabled", false);
                $("select.transition").attr("disabled", false);
                $("select.sort-by, select.sort-type").attr("disabled", true);
                UI.toggleTransitionLayout();
                break;

            case "dot":
                $("select.feature-x, select.feature-y").attr("disabled", true);
                $("select.transition").attr("disabled", false);
                $("select.sort-by, select.sort-type").attr("disabled", true);
                UI.toggleTransitionLayout();
                break;

            default:
                $("select.feature").attr("disabled", true);
                $("select.transition").attr("disabled", false);
                $("select.transition-layout").attr("disabled", true);
                $("select.sort-type").attr("disabled", true);
                break;
        }

        UI.toggleSortByDropdown();
    }

    static toggleTransitionLayout(){
        let node = $("select.transition");
        if(node.attr("disabled") || node.val() === "none"){
            $("select.transition-layout").attr("disabled", true);
        } else {
            $("select.transition-layout").attr("disabled", false);
        }
    }

    static toggleSortByDropdown(){
        let node = $("select.sort-type");
        if(node.attr("disabled") || node.val() === "automatically"){
            $("select.sort-by").attr("disabled", true);
        } else {
            $("select.sort-by").attr("disabled", false);
        }
    }
}
