import Map from "./map";

function drawParticle(particle, size, animated){
    if(animated) particle.setAlpha(0);

    particle
    .setPosition(particle.coords[0]-(size/2), particle.coords[1]-(size/2))
    .setSize(size, size)
    .setDestination(particle.coords[0]-(size/2), particle.coords[1]-(size/2))
    .setAimedSize(size, size);

    if(animated) particle.setAimedSize(size, size).fade('in');
}

function drawFunc(particle, size){
    drawParticle(particle, size, true);
    this.particleContainer.startAnimation();
}

export default class DotMap extends Map {

    constructor(width, height, particleContainer, levelOfDetail, animationCb, sizeOfParticles){
        super(width, height, particleContainer, levelOfDetail, true);
        this.size = sizeOfParticles;
        super.show(true, true);
    }

    drawData(animationCb, areParticlesNew){
        let point;

        if(isFunction(animationCb)){
            for(let particle of this.particles){
                point = [particle.data.Longitude, particle.data.Latitude];
                point = this.baseMap.projection(point);
                particle.coords = point;

                setTimeout(drawFunc.bind(this), 250, particle, this.size);
            }
        } else {
            let transitionType = $("select.transition").val();

            for(let particle of this.particles){
                point = [particle.data.Longitude, particle.data.Latitude];
                point = this.baseMap.projection(point);
                particle.coords = point;

                if(areParticlesNew){
                    drawParticle(particle, this.size, false);
                } else {
                    particle.transitionTo(point[0]-(this.size/2), point[1]-(this.size/2), this.size, this.size, transitionType);
                }
            }
        }
    }

    transitionTo(x, y, scale, type) {
        super.transitionTo(x,y,scale,type);

        this.baseMap.svg.transition().duration(1/60)
            .attr("transform", "translate(" + this.position.x + "," + this.position.y + ") scale(" + this.scale.x + "," + this.scale.y + ")");
    }

    nextStep() {
        super.nextStep();

        this.baseMap.svg.transition().duration(1/60)
            .attr("transform", "translate(" + this.position.x + "," + this.position.y + ") scale(" + this.scale.x + "," + this.scale.y + ")");
    }

    removeAllDomNodes(){

    }
}
