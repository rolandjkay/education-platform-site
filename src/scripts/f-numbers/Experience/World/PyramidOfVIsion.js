import * as THREE from 'three'
import Experience from '../Experience.js'

export default class PyramidOfVision
{
    /*
     * imagePlaneDimensions: an object that dynamically updates
     * to give us the current width and height of the image plane;
     * we know the focalLength, as we get it from the control.
     */
    constructor({imagePlaneDimensions})
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.name = "PyramidOfVision";

        this.imagePlaneDimensions = imagePlaneDimensions;

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    /*
     * Helper function to extrapolate the end positions far behind
     * the object plane, which are extrapolations of the vector
     * joining the corners of the image planes and the aperture.
     */
     extrapolate(startPosition, endPosition, xDistance)
    {
        // Given two points X and Y as THREE.Vector3 and the desired distance 'n'
        const X = startPosition;
        const Y = endPosition; 

        // Step 1: Calculate the direction vector from X to Y
        const direction = new THREE.Vector3().subVectors(Y, X);

        // Step 2: Normalize the direction vector (keep direction, lose magnitude)
        const directionNormalized = direction.clone().normalize();

        // Step 3: Find the ratio by which the x-coordinate should increase
        const deltaX = xDistance; // This is the increase in x-coordinate (Y.x + n)
        const scaleFactor = deltaX / directionNormalized.x; // Scaling factor

        // Step 4: Scale the direction vector by the scaling factor
        const extrapolatedVector = directionNormalized.multiplyScalar(scaleFactor);

        // Step 5: Add this scaled vector to Y to get the position of Z
        const Z = new THREE.Vector3().addVectors(Y, extrapolatedVector);

        return Z;
    }

    updatePoints()
    {
        const focalLength = this.experience.controlParams.focalLength/1000.0;
        const objectDistance = this.experience.controlParams.objectDistance;

        // Create the pairs of points that define each line
        const imagePlaneCorners = [
            new THREE.Vector3(focalLength, this.imagePlaneDimensions.height / 2, -this.imagePlaneDimensions.width/2),
            new THREE.Vector3(focalLength, this.imagePlaneDimensions.height / 2, this.imagePlaneDimensions.width/2),
            new THREE.Vector3(focalLength, -this.imagePlaneDimensions.height / 2, this.imagePlaneDimensions.width/2),
            new THREE.Vector3(focalLength, -this.imagePlaneDimensions.height / 2, -this.imagePlaneDimensions.width/2)
        ]

        const aperature = new THREE.Vector3(0,0,0);

        // Extrapolate throught the aperture to get back the projection of the
        // image plane onto the object plane.
        const objectPlaneCorners =  imagePlaneCorners.flatMap( (corner) => {
            return this.extrapolate(corner, aperature, -objectDistance)
        });

        this.points = [
            // The lines between the corners of the object and image planes
            ...imagePlaneCorners.flatMap( (corner, index) => {
                return [corner, objectPlaneCorners[index]]
            }),
        
            // Join up the object plane corners (will double up 
            // one line, but not the end of the world.)
            ...objectPlaneCorners.flatMap( (corner, index) => {
                return [corner, objectPlaneCorners[(index + 1) % 4]
                ]
            }) 
        ];
    }

    setGeometry()
    {
        this.updatePoints();
        this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);
    }

    setMaterial()
    {
        this.material = new THREE.LineBasicMaterial({color: 0x7f7f7f});
    }

    setMesh()
    {
        this.line = new THREE.LineSegments(this.geometry, this.material);
        this.scene.add(this.line);
    }

    update()
    {
        this.updatePoints();

        this.geometry.setFromPoints(this.points); 
        this.geometry.attributes.position.needsUpdate = true;
    }

}
