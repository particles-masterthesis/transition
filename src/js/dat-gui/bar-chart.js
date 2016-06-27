export default function (dataStore, ui, canvas, update) {

    let folderBarChart = ui.DatGui.addFolder('Bar Chart');

    folderBarChart.add(canvas, "useBars").onChange(() => {
        canvas.reset();
        update(dataStore, canvas);
    });

    folderBarChart.add(canvas.particlesContainer, "animatingPerBar");

    folderBarChart.add(canvas.particlesContainer, "barsDifferentColors").onChange((value)=> {
        if (canvas.visualization.constructor.name === "BarChart") {
            if (value) {
                canvas.particlesContainer.setColorOfBars();
                canvas.particlesContainer.redraw();
            } else {
                canvas.particlesContainer.setColorOfParticles(canvas.particles.color);
                canvas.particlesContainer.redraw();
            }
        }
    });

    folderBarChart.open();

}
