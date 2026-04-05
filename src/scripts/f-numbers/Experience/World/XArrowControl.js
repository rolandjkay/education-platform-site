import * as THREE from 'three'
import { createTextMesh } from '../Utils/threejs_utils.js';
import UIControl from './UIControl.js'
import Experience from '../Experience.js'
import {isArrayOfX} from '../Utils/utils.js'


/*
 * Specialize the, generic, UIControl to create a control that uses
 * an arrow that moves along the X axis and controls the value of 
 * a scaler.
 * 
 * This is the basis for the focal-length and object-distance controls
 * 
 * limits:   [{"x": 0.045, "v": 45}, {"x": 1.0 , "v": 1000}]
 * 
 *           The minimum and maximum values of the X ordinate and
 *           the corresponding output values.
 * 
 * initialValue:  1.0
 *           The initial value; the control's initial position will
 *           be set to the correpsonding X ordinate.
 * 
 * ypos, zpos: -imagePlaneHeight/2, imagePlaneWidth/2 - 0.25
 *           The Y and Z coordinates. The control moves along the X
 *           axis, so these do not change.
 *           
 * arrowDirection:  1
 *           Should the arrow face in the positive X direction (+1)
 *           or the negative (-1).
 * 
 * attributeName: "focalLength"
 *           The attribute on the above object. We will store the 
 *           position of the control in world space here.
 * 
 * label:    "Focal length"
 *           The text label to be displayed beneath the control.
 * 
 * units:    "mm"
 *           We display the numerical value that the current position 
 *           of the control represents. This is a string containing
 *           the units to be displayed after the number
 * 
 * decimal_places:  2
 *           The number of decimal places to use to display the 
 *           numerical value.
 */
export default class XArrowControl extends UIControl
{
    constructor({limits,
                 initialValue,
                 ypos,
                 zpos,
                 arrowDirection,
                 params,
                 attributeName,
                 label,
                 units,
                 decimal_places
                })
    {
        // Type checking
        if ( typeof limits !== 'undefined' && 
            !isArrayOfX({variable: limits, hasAttributes: ["x", "v"], length: 2}))
        {
            console.error("XArrowControl: 'limits' should be an array of two {x,v} pairs; got: ", limits);
        }

        const minV = Math.min(limits[0].v, limits[1].v);
        const maxV = Math.max(limits[0].v, limits[1].v);

        if (!Number.isFinite(initialValue) || initialValue < minV || initialValue > maxV)
        {
            console.error("XArrowControl: 'initialValue' should be a number in the range given by 'limits'; got: ", initialValue);
        }
        if (!Number.isFinite(ypos))
        {
            console.error("XArrowControl: 'ypos' should be a number; got: ", ypos);
        }
        if (!Number.isFinite(zpos))
        {
            console.error("XArrowControl: 'zpos' should be a number; got: ", zpos);
        }

        const geometry = XArrowControl.createGeometry()
        const material = XArrowControl.createMaterial()
        const mesh = XArrowControl.createMesh(geometry, material)

        // NOTE: If by trial an error you can come up with a series of quaternion rotations
        //       that get the result you want, you can multiply then together to get the
        //       quaternion that does the same thing in one go.
        mesh.quaternion.copy(arrowDirection > 0 ? new THREE.Quaternion(0.5, -0.5, 0.5, 0.5) 
                                                : new THREE.Quaternion(0.5, 0.5, -0.5, 0.5)
                            );


        const group = new THREE.Group();
        group.add(mesh);

        // Controls are in the 'controls' layer, so that the aren't visible on the image
        // plane or the secondary camera, that provides the camera sensor view.
        mesh.layers.set(experience.CONTROL_LAYER);
             
        // Add label, if provided.
        let valueTextMesh
        const textRotation = new THREE.Euler(-Math.PI/2, 0, 0)

        if (label)
        {
            const textMesh = createTextMesh({
                size:     0.075,
                depth:    0.01,
                text:     label,
                position: new THREE.Vector3(0, 0, 0.4),
                rotation: textRotation,
                color:    0xffffff
            });

            textMesh.layers.set(experience.CONTROL_LAYER);

            group.add(textMesh)

            valueTextMesh = createTextMesh({
                size:     0.075,
                depth:    0.01,
                text:     XArrowControl.formatValue(initialValue, decimal_places) + (units ? " " + units : ""),
                position: new THREE.Vector3(0, 0, 0.60),
                rotation: textRotation,
                color:    0xffffff
            })

            valueTextMesh.layers.set(experience.CONTROL_LAYER);

            group.add(valueTextMesh);
        }
    

        super({mesh: group,
               // Only seems to work if the plane constant is 0, although I think it should be
               // equal to 'ypos' ???
               plane: new THREE.Plane(new THREE.Vector3(0,1,0), 0), 
               initialPosition: new THREE.Vector3(XArrowControl.interpolateX(limits, initialValue), 
                                                  ypos,
                                                  zpos),
               vectorRestriction: new THREE.Vector3(1,0,0),
               // Restrict between X0 and X1.
               geoFence: [new THREE.Vector3(limits[0].x, -1000, -1000), 
                          new THREE.Vector3(limits[1].x, 1000, 1000,) ]

        })

        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.limits = limits;
        this.units = units;
        this.decimal_places = decimal_places;

        this.params = params;
        this.attributeName = attributeName;

        this.valueTextMesh = valueTextMesh;
        this.textRotation = textRotation;
        this.group = group;

        // Used to throttle valueTextMesh updates
        this.lastValueStr = "0.0";  
    }

    static createGeometry()
    {
        // Create arrow geometry
        const shape = new THREE.Shape();

        shape.moveTo(0, 0.35);      // Arrow tip
        shape.lineTo(-0.25, 0.1);   // Left side
        shape.lineTo(-0.2, 0.1);
        shape.lineTo(-0.2, 0);
        shape.lineTo(0.2, 0);
        shape.lineTo(0.2, 0.1);
        shape.lineTo(0.25, 0.1);    // Right side
        shape.lineTo(0, 0.35);      // Back to arrow tip

        const extrudeSettings = { depth: 0.01, bevelEnabled: false };
        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }

    static createMaterial()
    {
        return new THREE.MeshStandardMaterial({ color: 0x4477b2 }); //Dark pastel blue
    }

    static createMesh(geometry, material)
    {
        return new THREE.Mesh(geometry, material);
    }

    // Interpolate an X ordinate that corresponds to the given 'v'.
    static interpolateX(limits, v) {          
        // Calculate the slope (m)
        const m = (limits[1].v - limits[0].v) / (limits[1].x - limits[0].x);
        
        // Calculate x for the given v
        const x = (v - limits[0].v) / m + limits[0].x;
        
        return x;
    }

    // Inverse of the above function
    static interpolateV(limits, x) {          
        // Calculate the slope (m)
        const m = (limits[1].v - limits[0].v) / (limits[1].x - limits[0].x);
        
        // Calculate v for the given x
        const v = m * (x - limits[0].x) + limits[0].v;
        
        return v;
    }

    // Format the value as a string.
    static formatValue(value, decimal_places)
    {
        /*
         * Negative numbers would cause, 1234 to be formatted as 
         * 1200.
         */ 
        if (decimal_places >= 0)
        {
            return value.toFixed(this.decimal_places);
        }
        else
        {  
            return Math.floor(value / Math.pow(10, -decimal_places)) * Math.pow(10, -decimal_places);
        }

    }

    /*
     * Update the parameter value on updates.
     */
    positionUpdate(position) 
    {
        const v = XArrowControl.interpolateV(this.limits, position.x);

        if (this.params && this.attributeName)
        {
            this.params[this.attributeName] = v;
        }

        const vStr = XArrowControl.formatValue(v, this.decimal_places);

        /*
         * Update the label
         */
        if (vStr !== this.lastValueStr)
        {
            this.lastValueStr = vStr;

            this.group.remove(this.valueTextMesh)
            this.valueTextMesh.dispose();


            this.valueTextMesh = createTextMesh({
                color:    0xffffff,
                size:     0.075,
                depth:    0.01,
                text:     vStr + (this.units ? " " + this.units : ""),
                position: new THREE.Vector3(0, 0, 0.60),
                rotation: this.textRotation
            })

            this.valueTextMesh.layers.set(experience.CONTROL_LAYER);

            this.group.add(this.valueTextMesh);
        }
    }


}