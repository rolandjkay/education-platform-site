import Experience from '../Experience.js'

/*
 * Displays the current aperture in F-number notation.
 */
export default class StatsDisplay
{
    constructor({colour} = {})
    {
        this.experience = new Experience();

        this.PUPIL_DIAMETER = 0.0001; // 0.1 mm
        this.MIN_FOCALLENGTH = 0.045;
        this.MAX_FOCALLENGTH = 1.0;

        //this.STOPS = ["1", "½", "¼", "⅛", "¹⁄₁₆", "¹⁄₃₂", "¹⁄₆₄", "¹⁄₁₂₈", "¹⁄₂₅₆", "¹⁄₅₁₂", "¹⁄₁₀₂₄"];
        this.STOPS = ["1", "1/2", "1/4", "1/8", "1/16", "1/32", "1/64", "1/128", "1/256", "1/512", "1/1024"];

        this.minAperture = this.MIN_FOCALLENGTH / this.PUPIL_DIAMETER;

        this.setup();
    }



    setup()
    {
        const statusBar = document.createElement('div');
        statusBar.innerHTML = `
            <div class="status-bar">
                <div class="status-item">
                    <span class="status-label">Aperture:</span>
                    <span class="status-value" id="aperture">f 10000</span>
                </div>
                <div class="status-item">
                    <span class="status-label">ISO:</span>
                    <span class="status-value" id="iso">450</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Fraction of light hitting sensor:</span>
                    <span class="status-value" id="stop">1/512</span>
                </div>
            </div>
        `;
        this.experience.container.appendChild(statusBar);

        const style = document.createElement('style');
        style.textContent = `

        .status-bar {
            position: absolute;
            bottom: 0;
            width: 100%;
            display: flex;
            justify-content: space-around;
            padding: 8px 12px;
            box-sizing: border-box;
            background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
            border-top: 1px solid rgba(255,255,255,0.15);
            z-index: 10;
        }

        .status-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
        }

        .status-label {
            font-family: "Space Grotesk", Helvetica, sans-serif;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
            color: rgba(255,255,255,0.5);
            text-transform: uppercase;
        }

        .status-value {
            font-family: "Space Grotesk", Helvetica, sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #fff;
        }

        `;
        document.head.appendChild(style);

        const focalLength = this.experience.controlParams.focalLength/1000.0;

        this.updateAperture(focalLength);
        this.updateISO(focalLength);
    }

    updateAperture(focalLength) 
    {
        const aperture = focalLength / this.PUPIL_DIAMETER ;

        // Get the thermometer mask element
        document.getElementById('aperture').textContent = "f " + aperture.toFixed(0);
    }

    updateISO(focalLength)
    {
        const aperture = focalLength / this.PUPIL_DIAMETER ;
        const BASEISO = 100; // Reference ISO at this.MIN_FOCALLENGTH
        const iso = BASEISO * (aperture / this.minAperture)**2;

        // Get the thermometer mask element
        document.getElementById('iso').textContent = iso.toFixed(0);
    }

    updateStops(focalLength)
    {
        const aperture = focalLength / this.PUPIL_DIAMETER ;
        const stop = Math.round(2 * Math.log2(aperture / this.minAperture));
        
        document.getElementById('stop').textContent = this.STOPS[stop];
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
            this.updateAperture(focalLength);
            this.updateISO(focalLength);
            this.updateStops(focalLength);
        }
    }

}