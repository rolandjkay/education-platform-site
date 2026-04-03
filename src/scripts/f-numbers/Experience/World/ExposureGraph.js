import * as THREE from 'three'
import {isArrayOfX} from '../Utils/utils.js'
import Experience from '../Experience.js'

export default class ExposureGraph
{
    /*
     * Draw a graph showing how exposure relates to the distance between
     * the aperture and the sensor.
     * 
     * screenPosition:   (x: 100, y: 100)
     *   Where on the screen to draw the graph.
     * 
     * width:            400
     *   The width of the graph in pixels.
     * 
     * height:           300
     *   The height of the graph in pixels.
     * 
     * padding:          40
     *   How much space to put around the graph.
     * 
     * borderWidth:      2
     *   The width of the border, 0 for none.
     *
     */
    constructor({screenPosition, width = 400, height = 300, padding = 40, borderWidth = 0})
    {
        this.screenPosition = screenPosition;
        this.padding = padding;
        this.width = width;
        this.height = height;

        this.experience = new Experience();

        this.PUPIL_DIAMETER = 0.0001; // 0.1 mm
        this.MIN_FOCALLENGTH = 0.045;
        this.MAX_FOCALLENGTH = 1.0;

        this.setup();
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

    /*
     * Scaling our graph functions from real-world to screen coordinates.
     */
    scaleX(x)
    {
        return this.padding + (x / this.MAX_FOCALLENGTH) * (this.width - 2 * this.padding);
    }

    scaleY(y)
    {
        const maxY = 1; // Normalized value for y-axis
        return this.height - this.padding - (y / maxY) * (this.height - 2 * this.padding);
    }

    /*
     * The graph is an SVG element with a circle to indicate the 
     * current "focal length".
     */
    setup()
    {
        /*
         * Create SVG path data for the function f(x) = 1 / x^2
         */
        let pathData = "";
        for (let x = this.MIN_FOCALLENGTH; x <= this.MAX_FOCALLENGTH; x += 0.01)
        {
            const plotX = this.scaleX(x);
            const plotY = this.scaleY(this.f(x));
            pathData += `${x === this.MIN_FOCALLENGTH ? 'M' : 'L'} ${plotX} ${plotY} `;
        }

        const graphContainer = document.createElement('div');
        graphContainer.id = 'graphContainer';

        graphContainer.innerHTML = `
            <!-- Create the SVG element -->
            <svg width="${this.width}" height="${this.height}" style="${this.borderWidth > 0 ? 'border: 2px solid white;' : ''}">
            
            <!-- Draw X axis -->
            <line x1="${this.padding}" 
                    y1="${this.height - this.padding}" 
                    x2="${this.width - this.padding}" 
                    y2="${this.height - this.padding}" 
                    stroke="#bcbcbc" 
                    stroke-width="2px" />
            
            <!-- Draw Y axis -->
            <line x1="${this.padding}" 
                    y1="${this.height - this.padding}" 
                    x2="${this.padding}" 
                    y2="${this.padding}" 
                    stroke="#bcbcbc" 
                    stroke-width="2px" />
            
            <!-- X axis label -->
            <text x="${this.width / 2}" 
                  y="${this.height - 2*this.padding / 4}" 
                  text-anchor="middle" 
                  font-size="12" 
                  fill="white" 
                  font-family="Space Grotesk, Helvetica, sans-serif">
                Aperature - Sensor Distance
            </text>
            
            <!-- Y axis label -->
            <text x="${this.width / 2}" 
                    y="${0.8 * this.padding}" 
                    text-anchor="middle" 
                    font-size="12" 
                    fill="white" 
                    font-family="Space Grotesk, Helvetica, sans-serif">
                Light falling on Sensor
            </text>
            
            <!-- Graph Path (f(x) = 1 / x^2) -->
            <path d="${pathData}" 
                    fill="none" 
                    stroke="white" 
                    stroke-width="2px" />

            <!-- Circle indicating graph position -->
            <circle id="graphCircle"
                    cx="${this.scaleX(1)}" 
                    cy="${this.scaleY(this.f(1))}" 
                    r="5" 
                    fill="white" />
            </svg>
        `;

        this.experience.container.appendChild(graphContainer);

        const style = document.createElement('style');
        style.innerHTML = `
            #graphContainer {
                position: absolute;
                right: 0px;
                bottom: 100px;
            }
            `;
        document.head.appendChild(style);
    }

    // Function to update the circle position
    updateGraph(focalLength)
    {
        const graphCircle = document.getElementById('graphCircle');
        const cx = this.scaleX(focalLength, this.width, this.padding);
        const cy = this.scaleY(this.f(focalLength), this.height, this.padding);
        graphCircle.setAttribute("cx", cx);
        graphCircle.setAttribute("cy", cy);
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
            this.updateGraph(focalLength);
        }
    }

}

