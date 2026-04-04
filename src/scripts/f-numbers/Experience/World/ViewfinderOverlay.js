import Experience from '../Experience.js'

/*
 * Adds a border, title label and "Camera Sensor" label over the
 * secondary-camera viewfinder that is rendered in the bottom-left
 * corner of the canvas.
 */
export default class ViewfinderOverlay
{
    constructor()
    {
        this.experience = new Experience();
        this.setup();
        this.experience.sizes.on('resize', () => this.updateSize());
    }

    setup()
    {
        const container = this.experience.container;

        this.el = document.createElement('div');
        this.el.id = 'viewfinder-overlay';
        container.appendChild(this.el);

        // "Image Plane View" title along the bottom edge
        this.titleLabel = document.createElement('div');
        this.titleLabel.id = 'viewfinder-title';
        this.titleLabel.textContent = 'Image Plane View';
        this.el.appendChild(this.titleLabel);

        // "Camera Sensor" label above the centred red rectangle
        this.sensorLabel = document.createElement('div');
        this.sensorLabel.id = 'viewfinder-sensor-label';
        this.sensorLabel.textContent = 'Sensor';
        this.el.appendChild(this.sensorLabel);

        const style = document.createElement('style');
        style.textContent = `
            #viewfinder-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                box-sizing: border-box;
                border: 1px solid rgba(255,255,255,0.35);
                pointer-events: none;
                z-index: 5;
            }
            #viewfinder-title {
                position: absolute;
                top: 4px;
                left: 0;
                right: 0;
                text-align: center;
                font-family: "Space Grotesk", Helvetica, sans-serif;
                font-weight: 600;
                color: rgba(255,255,255,0.6);
                letter-spacing: 0.3px;
                white-space: nowrap;
            }
            #viewfinder-sensor-label {
                position: absolute;
                top: 32%;
                left: 0;
                right: 0;
                text-align: center;
                font-family: "Space Grotesk", Helvetica, sans-serif;
                font-weight: 600;
                color: rgba(255,255,255,0.6);
                letter-spacing: 0.3px;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);

        this.updateSize();
    }

    updateSize()
    {
        const size = Math.round(this.experience.sizes.width * 0.22);
        this.el.style.width  = size + 'px';
        this.el.style.height = size + 'px';

        // Scale fonts proportionally with the viewfinder
        this.titleLabel.style.fontSize  = Math.max(8,  Math.round(size / 18)) + 'px';
        this.sensorLabel.style.fontSize = Math.max(7,  Math.round(size / 26)) + 'px';
    }
}
