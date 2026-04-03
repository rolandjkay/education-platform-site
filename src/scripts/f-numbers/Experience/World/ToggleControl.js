import Experience from '../Experience.js';
import { hasAttributes } from '../Utils/utils.js';
import { rgbToHex } from '../Utils/utils.js';

export default class ToggleControl
{
    static buttonId = 0;        // Used to give each button a unique ID.
    static doneStlyes = false;  // Don't push the style multiple times.

    /*
     * camera: Camera
     *      Instance of our Camera class representing the main camera
     * 
     * screenPosition: {x: 300, y: 0}
     *      Coordinate on the screen where to display the control (0,0)
     *      is bottom left-hand corner.
     * 
     * label: "Display label" / {on: "On label", off: "Off label"}
     *      Either a fixed label string, or two strings, one of which
     *      is displayed when the control is in the "on" state and the
     *      other when it's in the "off" state.
     */
    constructor({camera,
                 parentId,
                 label,
                 colour,
                 params,
                 attributeName,
                })
    {
        this.camera = camera;
        this.parentId = parentId;
        this.label = label;
        this.params = params;
        this.attributeName = attributeName;

        if (colour)
        {
            this.colour = colour;
        }
        else
        {
            this.colour = {r: 255, g: 255, b: 255};
        }


        this.experience = new Experience();

        if ((typeof label !== "string" || label === null) && 
             !hasAttributes(label, ["on", "off"])
            )
        {
            console.error("ToggleControl: 'label' should be a string of an object containing two strings; got: ", label);
        }

        if (typeof label === "string")
        {
            this.label = {on: label, off: label};
        }
        else
        {
            this.label = label;
        }

        this.WIDTH_SCALE = 80;  // i.e 1/80th of world space
        this.HEIGHT_SCALE = 450;
        this.BORDER_WIDTH = 0.0003;

        this.COLOR = 'white';
        this.INVERSE_COLOR = 'black';

        // How far in front of the camera the control floats.
        this.DEPTH = 0.1;

        this.setup();
    }

    setup()
    {
        const div = document.createElement('div');
        div.innerHTML = `
            <button id="sci-fi-button-${ToggleControl.buttonId}" class="top-bar-btn">${this.label.on}</button>
        `;

        document.getElementById(this.parentId).appendChild(div);

        // Get an ID for our button instance.
        this.buttonId = ToggleControl.buttonId++;

        const button = document.getElementById(`sci-fi-button-${this.buttonId}`);

        const colourHex = rgbToHex(this.colour);

        // Add click event listener
        button.addEventListener('click', () => {
            this.onClick();
        });


        this.updateLabel();
    }
 
    update()
    {

    }

    updateLabel()
    {
        // Update label
        const button = document.getElementById(`sci-fi-button-${this.buttonId}`);

        if (this.params[this.attributeName])
        {
            button.textContent = this.label.on;
        }
        else
        {
            button.textContent = this.label.off;
        }
    }

     onClick()
     {
        // Toggle the value we were meant to toggle.
        this.params[this.attributeName] = !this.params[this.attributeName];

        this.updateLabel();
    }
}