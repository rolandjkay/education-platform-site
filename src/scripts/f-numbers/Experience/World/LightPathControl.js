import * as THREE from 'three'
import PlanarControl from './PlanarControl.js'
import Experience from '../Experience.js';
import ObjectPlane from './ObjectPlane.js';
import LightPath from './LightPath.js';

export default class LightPathControl extends PlanarControl
{
    constructor(objectPlane, lightPath)
    {
        const experience = new Experience();

        const INITIAL_REFLECTION_POSITION = new THREE.Vector3(-experience.controlParams.objectDistance, 3, -1);

        // Type checking
        if (!objectPlane || ! objectPlane instanceof ObjectPlane)
        {
            console.error("LightPathControl: 'objectPlane' should must be an instance of ObjectPlane; got: ", objectPlane);
        }
        if (!lightPath || ! lightPath instanceof LightPath)
        {
            console.error("LightPathControl: 'lightPath' should must be an instance of LightPath; got: ", lightPath);
        }

        //objectPlane.geometry.computeBoundingBox();
        //let bounding_box = objectPlane.geometry.bounding_box;
        //console.log(">>>", bounding_box);
        const bounding_box = [new THREE.Vector3(-1000, -1, -2), new THREE.Vector3(1000, 4, 2)]

        // Remove constraint in the X direction.
        bounding_box[0].x = -1000;
        bounding_box[1].x = 1000;

        super(
            {plane:     new THREE.Plane(new THREE.Vector3(-1, 0, 0), -experience.controlParams.objectDistance),
                        initialPosition: INITIAL_REFLECTION_POSITION,
             geofence:  bounding_box,
             label:     "Light Ray Control" 
            }
        )

        lightPath.setReflectionPosition(INITIAL_REFLECTION_POSITION);

        this.lightPath = lightPath;
    }

    /*
     * Called when the user moves the control
     */
    positionUpdate(position) 
    {
        // Update the light path object.
        this.lightPath.setReflectionPosition(position);
    }

    update()
    {
        const objectDistance = this.experience.controlParams.objectDistance;

        // Keep the UI object on the plane when it moves.
        this.plane.constant = -objectDistance;
        this.mesh.position.x = -objectDistance;
    }
}