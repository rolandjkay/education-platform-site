import * as THREE from 'three'
import {isArrayOfX} from '../Utils/utils.js'
import Experience from '../Experience.js'

/*
 * A control handle which the user can manipulate in order to 
 * interact with objects.
 * 
 * intialPosition: the initial position of the control's UI element
 * 
 * plane: THREE.Plane
 *        The plane on which the UI control is restricted to move.
 * 
 * vectorRestriction: If the UI control is to be restricted to move
 *                    along a single dimension then it will be 
 *                    restricted to move along the projection
 *                    of this vector onto the plane.
 * 
 *                    For 2D movement, pass null.
 * 
 * geoFence: An array of two vectors that bound the allowed movement
 *           of the control on the plane.
 * 
 * mesh: The mesh to use for the UI element.
 */
export default class UIControl
{
    constructor({mesh, initialPosition, initialRotation,
                 plane, vectorRestriction,
                 geoFence
                })
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Type checking
        if (!plane instanceof THREE.Plane)
            console.error("UIControl: plane should be a Plane; got: ", plane);
        //if (!Number.isFinite(constant))
        //    console.error("UIControl: constant should be a number and not Nan or Infinity; got: ", constant);
        if (!vectorRestriction instanceof THREE.Vector3 && vectorRestriction)
            console.error("UIControl: vectorRestriction should be a Vector3; got: ", vectorRestriction);
        if ( typeof geoFence !== 'undefined' && !isArrayOfX({variable: geoFence, 
                                                             cls: THREE.Vector3, 
                                                             n: 2}))
            console.error("UIControl: geoFence should be an arry of two Vector3s; got: ", geoFence);


        if (!mesh) 
        {
            // Default to a small sphere to represent the movable point
            const pointGeometry = new THREE.SphereGeometry(0.05, 32, 32);
            const pointMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            this.mesh = new THREE.Mesh(pointGeometry, pointMaterial);
        }
        else
        {
            this.mesh = mesh;
        }

        if (initialPosition)
        {
            this.mesh.position.copy(initialPosition);
        }

        if (initialRotation)
        {
            if (initialRotation instanceof THREE.Euler)
                this.mesh.rotation.copy(initialRotation);
            else if (initialRotation instanceof THREE.Quaternion)
                this.mesh.quaternion.copy(initialRotation)
            else
                console.error("UIControl: initialRotation should be Euler or Quaternion; got: ", initialRotation);
        }

        this.plane = plane;

        if (vectorRestriction)
        {

            // Project the passed vector onto the plane, to make sure we have
            // a vector that lies in the plane.
            this.vectorRestriction = new THREE.Vector3();
            this.plane.projectPoint(vectorRestriction, this.vectorRestriction);
            this.vectorRestriction.normalize();

            // The projected vector better hadn't be (0,0,0) !
            if (this.vectorRestriction.length() == 0) 
                console.error("UIControl: projection of 'vectorRestriction' on the given plane is zero length!", vectorRestriction);
        }

        this.geoFence = geoFence;

        this.setup()

        // Redirest mouse events to member functions.
        this.experience.mouseEvents.on('mousedown', (event) => { this.onMouseDown(event)})
        this.experience.mouseEvents.on('mousemove', (event) => { this.onMouseMove(event)})
        this.experience.mouseEvents.on('mouseup', (event) => { this.onMouseUp(event)})
    }

    setup()
    {
        this.scene.add(this.mesh);

        // Raycaster for detecting mouse position
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.dragging = false;

        // Reycaster needs to be in the controls layer, otherwise it won't
        // be able to see them.
        this.raycaster.layers.set(this.experience.CONTROL_LAYER);
    }

    // Client's can call this to get the current position of the control
    getPosition()
    {
        return this.mesh.position;
    }
    
    // Mouse down event to start dragging
    onMouseDown(event)
    {
        const camera = this.experience.camera.instance;

        // Raycast to check if the user clicked on the point
        this.mouse.x = (event.clientX / this.experience.sizes.width) * 2 - 1;
        this.mouse.y = -(event.clientY / this.experience.sizes.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, camera);

        const intersects = this.raycaster.intersectObject(this.mesh);

        if (intersects.length > 0) 
        {
            this.dragging = true;
            this.experience.camera.controls.enabled = false; // Disable OrbitControls while dragging


            // We grab the intersection point of the ray with the plane and store it along with the 
            // starting mesh position. The user won't necessarily click on the origin of the object
            // and we don't want that to cause a jump, so, in onMouseMove, we calculate the vector
            // direction between the initial and final intersection points and apply that to the
            // mesh staring position.
            const intersectionPoint =  new THREE.Vector3();
            this.raycaster.ray.intersectPlane(this.plane, intersectionPoint)

            this.startingIntersectionPoint = intersectionPoint.clone();
            this.startingMeshPosition = this.mesh.position.clone();

            this.objectOffset = new THREE.Vector3().subVectors(this.startingIntersectionPoint, this.mesh.position);    
        }
    }

    // Mouse move event to update the point's position on the plane
    onMouseMove(event)
    {
        const camera = this.experience.camera.instance;
        if (this.dragging) 
        {
            // Convert mouse position to normalized device coordinates (-1 to +1)
            this.mouse.x = (event.clientX / this.experience.sizes.width) * 2 - 1;
            this.mouse.y = -(event.clientY / this.experience.sizes.height) * 2 + 1;

            // Update the raycaster based on the camera and mouse position
            this.raycaster.setFromCamera(this.mouse, camera);

            const intersectionPoint = new THREE.Vector3();

            // Get the intersection point with the plane
            this.raycaster.ray.intersectPlane(this.plane, intersectionPoint);

            // If vectorRestriciton is also provided.
            if (this.vectorRestriction)
            {
                // Move the move vector from the old to the new position.
                const moveVector = new THREE.Vector3();

                moveVector.subVectors(intersectionPoint, this.startingIntersectionPoint);
                
                // Project onto the restriction vector and assign to UI control position
                moveVector.projectOnVector(this.vectorRestriction);

                this.mesh.position.copy(this.startingMeshPosition).add(moveVector);
            }
            else
            {
                // Set the point's position to the intersection point
                this.mesh.position.copy(intersectionPoint);
            }

            // Keep within geo fence.
            if (this.geoFence) 
            {
                this.mesh.position.clamp(this.geoFence[0], this.geoFence[1]);
            }

            this.positionUpdate(this.mesh.position);
        }
    }

    // Mouse up event to stop dragging
    onMouseUp(event)
    {
        this.dragging = false;
        this.experience.camera.controls.enabled = true; // Re-enable OrbitControls after dragging
    }

    // Derived classes should override this.
    positionUpdate(position) {}
}
