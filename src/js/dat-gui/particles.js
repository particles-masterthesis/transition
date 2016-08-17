export default function (dataStore, ui, canvas, update) {
    let folder = ui.DatGui.addFolder("Particles");

    folder.add(canvas.particles, "arrivalSync").onChange((value) => {
        canvas.particleContainer.setParticlesSpeed(canvas.particles.speedPxPerFrame);

        if (value) canvas.particleContainer.calculateSpeedArrivingSameTime();
    });

    folder.add(canvas.particles, "speedPxPerFrame", 0, 30).listen().onChange((value) => {
        canvas.particleContainer.setParticlesSpeed(value);
        if (canvas.particles.arrivalSync) canvas.particleContainer.calculateSpeedArrivingSameTime();
        if (canvas.visualizationOld) canvas.visualizationOld.calculateSpeed(canvas.particleContainer.getAmountOfFrames());
        canvas.visualization.calculateSpeed(canvas.particleContainer.getAmountOfFrames());
    });

    folder.addColor(canvas.particles, "color").onChange((value) => {
        canvas.particleContainer.setColorOfParticles(value);
        canvas.particleContainer.redraw();
    });

    folder.add(
        canvas.particles,
        "shape",
        ["rectangle", "circle"]
    ).onChange(() => {
        canvas.reset();
        update(dataStore, canvas);
    });

    folder.open();
}
