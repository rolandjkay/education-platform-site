import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { createTextMesh } from '../Utils/threejs_utils.js';
import UIControl from './UIControl.js'
import Experience from '../Experience.js'
import {isArrayOfX} from '../Utils/utils.js'


/*
 * Specialize the, generic, UIControl to create a control that uses
 * four arrows to allow the user to define a position on a plane.
 * 
 * This is the basis for the control that lets the user choose the 
 * light ray that strikes the tree.
 * 
 * XXX XXX XXX Only tested/working for YZ plane atm.
 * 
 * plane:    THREE.Plane
 *           The plane within which we allow movement of the control
 * 
 * initialPosition:  Vector3
 *           The initial world space 
 *  
 * geofence:   [Vector3(...), Vector3(...)]
 * 
 *           The bounding box in which the control must remain.
 *           The positions should lie in the plane.
 * 
 * params:   Object
 *           The object containing the attribute that we will update
 *           as the user moves the contorl.
 * 
 * attributeName: "focalLength"
 *           The attribute on the above object. We will store the 
 *           position of the control in world space here.
 * 
 * label:    "Focal length"
 *           The text label to be displayed beneath the control.
 */
export default class PlanarControl extends UIControl
{
    constructor({plane,
                 initialPosition,
                 geofence,
                 params,
                 attributeName,
                 label
                })
    {
        // Type checking
        if (!plane instanceof THREE.Plane)
        {
            console.error("PlanarControl: 'plane' should be a Plane'; got: ", plane);
        }
        if (!initialPosition instanceof THREE.Vector3)
        {
            console.error("PlanarControl: 'initialPosition' should be a Vector3'; got: ", initialPosition);
        }
        if ( typeof limits !== 'undefined' && 
            !isArrayOfX({variable: limits, cls: THREE.Vector3, length: 2}))
        {
            console.error("PlanarControl: 'limits' should be an array of two Vector3s; got: ", limits);
        }

        const mesh = PlanarControl.createMesh()

        mesh.quaternion.copy(new THREE.Quaternion(0, Math.sqrt(2) / 2, 0, Math.sqrt(2) / 2));

        const group = new THREE.Group();
        group.add(mesh);
             
        // Add label, if provided.
        if (label)
        {
            // XXX Should put createTextMesh somewhere more sensible, 
            //     so that we don't have to share with XArrpwControl
            // Also, position and rotation should be controled from
            // LightPathControl
            const textMesh = createTextMesh({
                text:     label,
                size:     0.075,
                depth:    0.01,
                position: new THREE.Vector3(0, 0.4, 0),
                rotation: new THREE.Euler(0, Math.PI/2, 0),
                color:    0xffffff
            });

            textMesh.layers.set(experience.CONTROL_LAYER);

            group.add(textMesh)
        }
    

        super({mesh: group,
               plane: plane,
               initialPosition: initialPosition,
               vectorRestriction: null,
               geoFence: geofence

        })

        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.mesh = group;

        this.params = params;
        this.attributeName = attributeName;
    }

    static createMesh()
    {
        // Up arrow
        const upArrow = new THREE.Shape();
        upArrow.moveTo(0, 0.26);      // Arrow tip
        upArrow.lineTo(-0.10, 0.16);   // Left side
        upArrow.lineTo(-0.05, 0.16);
        upArrow.lineTo(-0.05, 0.06);
        upArrow.lineTo(0.05, 0.06);
        upArrow.lineTo(0.05, 0.16);
        upArrow.lineTo(0.10, 0.16);    // Right side
        upArrow.lineTo(0, 0.26);      // Back to arrow tip

        // 90 degrees rotation (Right Arrow)
        const rightArrow = new THREE.Shape();
        rightArrow.moveTo(0.26, 0);      // Arrow tip (right)
        rightArrow.lineTo(0.16, 0.10);   // Bottom side
        rightArrow.lineTo(0.16, 0.05);
        rightArrow.lineTo(0.06, 0.05);
        rightArrow.lineTo(0.06, -0.05);
        rightArrow.lineTo(0.16, -0.05);
        rightArrow.lineTo(0.16, -0.10);  // Top side
        rightArrow.lineTo(0.26, 0);      // Back to arrow tip

        // 180 degrees rotation (Down Arrow)
        const downArrow = new THREE.Shape();
        downArrow.moveTo(0, -0.26);     // Arrow tip (down)
        downArrow.lineTo(0.10, -0.16);  // Right side
        downArrow.lineTo(0.05, -0.16);
        downArrow.lineTo(0.05, -0.06);
        downArrow.lineTo(-0.05, -0.06);
        downArrow.lineTo(-0.05, -0.16);
        downArrow.lineTo(-0.10, -0.16); // Left side
        downArrow.lineTo(0, -0.26);     // Back to arrow tip

        // 270 degrees rotation (Left Arrow)
        const leftArrow = new THREE.Shape();
        leftArrow.moveTo(-0.25, 0);     // Arrow tip (left)
        leftArrow.lineTo(-0.15, -0.10); // Top side
        leftArrow.lineTo(-0.15, -0.05);
        leftArrow.lineTo(-0.05, -0.05);
        leftArrow.lineTo(-0.05, 0.05);
        leftArrow.lineTo(-0.15, 0.05);
        leftArrow.lineTo(-0.15, 0.10);  // Bottom side
        leftArrow.lineTo(-0.25, 0);     // Back to arrow tip */

        const extrudeSettings = { depth: 0.01, bevelEnabled: false };

        const material = new THREE.MeshStandardMaterial({ color: 0x4477b2 }); //Dark pastel blue

        const shapes = [upArrow, rightArrow, downArrow, leftArrow];
        const geometries = shapes.map( (shape) => { return new THREE.ExtrudeGeometry(shape, extrudeSettings) });
        const meshes = geometries.map( (geometry) => { return new THREE.Mesh(geometry, material)} );

        const group = new THREE.Group();
        meshes.forEach((mesh) => {
            // It's actually quite nice to be able to see this control in the image plane, so we use
            // 'enable' to add it to the controls layers without removing it from the main layer.
            mesh.layers.enable(experience.CONTROL_LAYER);

            group.add(mesh);
        })

        return group;
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

    
    /*
     * Called when the user moves the control
     */
    positionUpdate(position) {}


}