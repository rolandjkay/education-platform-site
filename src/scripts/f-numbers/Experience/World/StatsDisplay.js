import Experience from '../Experience.js'
import { rgbToHex } from '../Utils/utils.js';

/*
 * Displays the current aperture in F-number notation.
 */
export default class StatsDisplay
{
    constructor({colour})
    {
        this.experience = new Experience();

        if (colour)
        {
            this.colour = colour;
        }
        else
        {
            this.colour = {r: 255, g: 255, b: 255};
        }

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

        const colourHex = rgbToHex(this.colour);

        const style = document.createElement('style');
        style.textContent = `
        
        .status-bar {
            position: absolute;
            bottom: 0;
            width: 100%;
            display: flex;
            justify-content: space-around;
            padding: 10px;
            background: linear-gradient(90deg, #0A0A0A 0%, #222 100%);
            border-top: 2px solid ${colourHex};
            box-shadow: 0 -5px 15px rgba(${this.colour.r}, ${this.colour.g}, ${this.colour.g}, 0.4);
            z-index: 1000;
        }
        
        .status-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .status-label {
            font-family: "Space Grotesk", sans-serif;
            font-size: 14px;
            letter-spacing: 1.5px;
            color: #888;
            text-transform: uppercase;
        }
        
        .status-value {
            font-family: "Space Grotesk", sans-serif;
            font-size: 18px;
            font-weight: bold;
            color: ${colourHex};
            text-shadow: 0 0 3px ${colourHex}, 0 0 5px ${colourHex};
            animation: glow 1.5s infinite alternate;
            z-index: 1; 
        }
        
        @keyframes glow {
            from {
                text-shadow: 0 0 3px ${colourHex}, 0 0 5px ${colourHex};
            }
            to {
                text-shadow: 0 0 6px {colourHex}, 0 0 10px ${colourHex};
            }
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