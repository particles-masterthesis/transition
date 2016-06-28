export default function (dataStore, ui, canvas, update) {

    let folderBarChart = ui.DatGui.addFolder('Bar Chart');

    folderBarChart.add(canvas, "useBars").onChange(() => {
        canvas.reset();
        update(dataStore, canvas);
    });

    folderBarChart.add(canvas.particlesContainer, "animatingPerBar");

    folderBarChart.add(canvas.particlesContainer, "animateBarsColored");

    folderBarChart.open();

}
