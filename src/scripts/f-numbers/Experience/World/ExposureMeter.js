import Experience from '../Experience.js'

export default class ExposureMeter
{
    constructor({screenPosition, width=300, height=20})
    {
        this.screenPosition = screenPosition;
        this.width = width;
        this.height = height;
        this.experience = new Experience();

        this.PUPIL_DIAMETER = 0.0001; // 0.1 mm
        this.MIN_FOCALLENGTH = 0.045;
        this.MAX_FOCALLENGTH = 1.0;

        this.setup();
    }



    setup()
    {
        const outerDiv = document.createElement('div');
        outerDiv.innerHTML = `
            <div id="thermometer-display" class="thermometer-display">
                <div id="thermometer" class="thermometer-container">
                    <div id="thermometer-fill" class="thermometer-fill"></div>
                    <div id="thermometer-mask" class="thermometer-mask"></div>
                </div>
                <div id="thermometer-label" class="thermometer-label">Light&nbsp;Falling&nbsp;on&nbsp;Sensor</div>
            </div>
        `;

        this.experience.container.appendChild(outerDiv);

        const style = document.createElement('style');
        style.innerHTML = `
            .thermometer-container {
                width: ${this.width}px;
                height: ${this.height}px;
                background-color: lightgray;
                position: relative;
                border-radius: 10px;
                overflow: hidden;
            }
            .thermometer-fill {
                width: 100%;
                height: 100%;
                background: linear-gradient(to right, darkblue, purple, green, yellow, orange, red);
                position: absolute;
                bottom: 0;
            }
            .thermometer-mask {
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                background-color: #444444;
            }
            .thermometer-label {
                font-size: 14px;
                font-family: "Space Grotesk", Helvetica, sans-serif;
                text-align: center;
                color: white;

                position: absolute;
                top: 50%;       /* 50% from the top of the container */
                left: 50%;      /* 50% from the left of the container */
                transform: translate(-50%, -50%); /* Move the label back by 50% of its own width and height */
            }
            .thermometer-display {
                position: absolute;
                display: flex;
                right: ${this.screenPosition.x}px;
                bottom: ${this.screenPosition.y}px;
            }
        `;
        document.head.appendChild(style);
    }

    /*
     * Amount of light as a function of focal length, scaled so that the maximum
     * value is 1.0
     */
    f(focalLength)
    {
        // fraction of total light = sensorArea / hemisphereArea = A / 2*Pi*f**2
        // Total light = B * Pi * D**2/4
        // 
        // Illumination = (A / 2*Pi*f) *B*Pi * D**2 /4 = (AB/8) * D**2 /f**2
        //
        // B is "amount of light" falling on a 1m2 area
        // A is sensor area
        //
        // 
        return (this.PUPIL_DIAMETER / focalLength)**2 / (this.PUPIL_DIAMETER / this.MIN_FOCALLENGTH)**2;
    }

    updateThermometer(value) 
    {
        // Ensure the value is between 0 and 1
        value = Math.max(0, Math.min(1, value));

        // Get the thermometer mask element
        const mask = document.getElementById('thermometer-mask');

        // Calculate the mask height based on the value
        const maskWidth = (1 - value) * 100;

        // Apply the mask height
        mask.style.width = maskWidth + '%';
        mask.style.left = this.width - maskWidth*(this.width/100) + "px";
    }


    /*
     * Important thing to understand is that the amount of light falling
     * on the sensor is inversely related to the focal length squared, so 
     * halfing the focal length quadruples the amount of light falling
     * on the sensor. I think we need a graph as well.
     */

    update()
    {
        const focalLength = this.experience.controlParams.focalLength/1000.0;

        if (this.lastFocalLength !== focalLength)
        {
            this.lastFocalLength = focalLength;
            this.updateThermometer(this.f(focalLength));
        }
    }

}