export default function (dataStore, ui, canvas, update) {

    let folderBarChart = ui.DatGui.addFolder('Bar Chart');

    folderBarChart.add(canvas, "useBars").onChange(() => {
        canvas.reset();
        update(dataStore, canvas);
    });

    folderBarChart.add(canvas.particleContainer, "animatePerBar");

    folderBarChart.add(canvas.particleContainer, "animateBarsColored");

    folderBarChart.open();

}
