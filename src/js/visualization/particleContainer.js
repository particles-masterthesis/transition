import Particle from "./particle";

export default class ParticleContainer extends PIXI.Container {
    constructor() {
        super();

        this.hasHighPriorityBar = false;
        this.isAnimating = false;
        this.speedPxPerFrame = 2;
        this.amountOfFrames = 0;
        this.isThisPreparation = false;

        // Bar chart
        this.animatePerBar = false;
        this.currentBarIndex = 0;
        this.amountOfBars = 0;
        this.animateBarsColored = false;
    }

    nextStep() {
        if (!this.isAnimating) {
            return false;
        }

        let particlesReachedDestinations = true;
        let isBarFinished = true;
        let particleReachedDestination;
        let particle;

        if (this.hasHighPriorityBar && !this.isThisPreparation) {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.getChildAt(i);

                if (particle.priority === 1) {
                    particleReachedDestination = !particle.animate();

                    if (particleReachedDestination === false) {
                        particlesReachedDestinations = false;
                    }
                }
            }

            if (particlesReachedDestinations) {
                this.hasHighPriorityBar = false;
            }
        } else {

            // Animating bar chart and bar by bar
            if (
                window.canvas.visualizationOld &&
                window.canvas.visualizationOld.constructor.name == "BarChart" &&
                this.animatePerBar && !this.isThisPreparation
            ) {
                for (let i = 0; i < this.children.length; i++) {
                    let child = this.getChildAt(i);

                    if (child.oldBar === this.currentBarIndex) {
                        particleReachedDestination = !child.animate();
                        if (particleReachedDestination === false) {
                            isBarFinished = false;
                            particlesReachedDestinations = false;
                        }
                    }

                    if (this.amountOfBars < child.oldBar) {
                        this.amountOfBars = child.oldBar;
                    }
                }
            }
            else {
                for (let i = 0; i < this.children.length; i++) {
                    let child = this.getChildAt(i);
                    particleReachedDestination = !child.animate();
                    if (particleReachedDestination === false) {
                        particlesReachedDestinations = false;
                    }
                }
            }

            // Bar chart
            if (isBarFinished && this.amountOfBars !== this.currentBarIndex) {
                particlesReachedDestinations = false;
                this.currentBarIndex++;
            }

            if (particlesReachedDestinations) {
                this.isAnimating = false;
                this.currentBarIndex = 0;
                this.amountOfBars = 0;
                this.isThisPreparation = false;
            }
        }

        return this.isAnimating;
    }

    createParticles(dataset, options) {
        this.speedPxPerFrame = options.speedPxPerFrame;

        if (this.children.length === 0) {
            let callbackAdd = data => () => this.showParticleDetails(data);
            let callbackRemove = () => () => {
                if (document.getElementById("dataRow")) {
                    document.body.removeChild(document.getElementById("dataRow"));
                }
            };

            for (let i = 0; i < dataset.length; i++) {
                let sprite = new Particle(dataset[i], 0, 0, options.sizeOfParticles, options.speedPxPerFrame, options.shape, options.color);
                sprite.on("mouseover", callbackAdd(sprite.data));
                sprite.on("mouseout", callbackRemove());
                this.addChild(sprite);
            }

            return true;
        }
        else {
            return false;
        }
    }

    showParticleDetails(data) {
        var table = document.getElementById("dataRow");
        table = table ? document.body.removeChild(table) : document.createElement("table");

        var features = Object.keys(data);

        let tmp = features.splice(0, Math.round(features.length / 2));
        let tmp2 = features.splice(0, features.length);

        var text = "<tr>";
        tmp.forEach(function (key) {
            text += `<th>${key}</th>`;
        });
        text += "</tr><tr>";
        tmp.forEach(function (key) {
            text += `<td>${data[key]}</td>`;
        });
        text += "</tr><tr>";

        tmp2.forEach(function (key) {
            text += `<th>${key}</th>`;
        });
        text += "</tr><tr>";
        tmp2.forEach(function (key) {
            text += `<td>${data[key]}</td>`;
        });
        text += "</tr>";

        table.innerHTML = text;
        table.id = "dataRow";
        document.body.appendChild(table);
    }

    setColorOfParticles(color) {
        color = color.RGBToHSL();
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].color = color;
        }
    }

    setColorOfBars() {
        let amountOfBars = 0;
        for (let i = 0; i < this.children.length; i++) {
            if (amountOfBars < this.children[i].bar) {
                amountOfBars = this.children[i].bar;
            }
        }

        // because child.bar starts at 0 and not at 1
        amountOfBars++;

        var startColor = "#00FFFF".RGBToHSL();
        startColor[1] = startColor[1] - 0.2;        // less saturation
        startColor[2] = startColor[2] + 0.2;       // more light

        let colors = [];
        for (let i = 0; i < amountOfBars; i++) {
            let hue = 1 / amountOfBars * i;
            colors.push([hue, startColor[1], startColor[2]]);
        }

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].color = colors[this.children[i].bar];
        }
    }

    redraw() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].redraw();
        }
    }

    startAnimation() {
        this.isAnimating = true;
    }

    resetHighPriorityParticles() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].priority = 0; // priority = low
        }
    }

    setHighPriorityParticles(barWithHighPriority) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].bar === barWithHighPriority) {
                this.children[i].priority = 1; // priority = high
            } else {
                this.children[i].priority = 0; // priority = low
            }
        }

        this.hasHighPriorityBar = true;
    }

    setParticlesSpeed(speed) {
        this.speedPxPerFrame = speed;

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].speed = speed;
        }
    }

    calculateSpeedArrivingSameTime() {
        let counter = 0;
        let sum = 0;
        for (let i = 0; i < this.children.length; i++) {
            let deltaX = this.children[i].destination.x - this.children[i].position.x;
            let deltaY = this.children[i].destination.y - this.children[i].position.y;
            let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
            sum += distance;
            this.children[i].distance = distance;

            if (distance > 0) {
                counter++;
            }
        }

        if (counter === 0) {
            return 0;
        }

        let averageDistance = Math.floor(sum / counter);
        this.amountOfFrames = averageDistance / this.speedPxPerFrame;

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].speed = this.children[i].distance / this.amountOfFrames;
            delete this.children[i].distance;
        }

        return this.amountOfFrames;
    }

    getAmountOfFrames() {
        return this.amountOfFrames;
    }

    moveParticles(to, transition, origin, yTranslate, ratio) {
        let particle;

        if (to === "left") {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];

                if (particle.alpha === 0) {
                    continue;
                }

                particle.transitionTo(
                    particle.position.x - particle.position.x / 2,
                    origin.y + particle.position.y / 2,
                    particle.width / 2,
                    particle.height / 2,
                    transition
                );
            }
        } else if (to === "top") {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }

                particle.transitionTo(
                    origin.x + particle.position.x * ratio,
                    particle.position.y * ratio - yTranslate * ratio,
                    particle.width * ratio,
                    particle.height * ratio,
                    transition
                );
            }
        }

        this.isThisPreparation = true;
        return this.calculateSpeedArrivingSameTime();
    }

    moveParticlesDestination(canvasWidth, canvasHeight, to, transition, width, yTranslate, ratio) {
        let particle;

        if (to === "right") {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }

                particle.transitionTo(
                    particle.destination.x - particle.destination.x / 2 + canvasWidth / 2,
                    particle.destination.y - particle.destination.y / 2 + canvasHeight / 4,
                    particle.aimedSize.width / 2,
                    particle.aimedSize.height / 2,
                    transition
                );
            }
        } else if (to === "bottom") {
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }

                particle.transitionTo(
                    particle.destination.x = canvasWidth / 2 - width / 2 + particle.destination.x * ratio,
                    particle.destination.y = canvasHeight / 2 + particle.destination.y * ratio - yTranslate * ratio,
                    particle.aimedSize.width * ratio,
                    particle.aimedSize.height = particle.aimedSize.height * ratio,
                    transition
                );
            }
        }
    }

    moveParticlesBack(canvasWidth, canvasHeight, from, transition, width, yTranslate, ratio) {
        if (from === "right") {
            let particle;
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }
                particle.transitionTo(
                    particle.position.x * 2 - canvasWidth,
                    (particle.position.y - canvasHeight / 4) * 2,
                    particle.width * 2,
                    particle.height * 2,
                    transition
                );
            }
        } else if (from === "bottom") {
            let particle;
            for (let i = 0; i < this.children.length; i++) {
                particle = this.children[i];
                if (particle.alpha === 0) {
                    continue;
                }
                particle.transitionTo(
                    (particle.position.x + width / 2 - canvasWidth / 2) / ratio,
                    (particle.position.y + yTranslate * ratio - canvasHeight / 2) / ratio,
                    particle.width / ratio,
                    particle.height / ratio,
                    transition
                );
            }
        }

        this.isThisPreparation = true;
        return this.calculateSpeedArrivingSameTime();
    }
}
