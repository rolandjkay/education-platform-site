import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Sensor
{
    /*
     * Sensor width and height in mm
     */
    constructor(sensorWidth = 32, sensorHeight = 24, thickness = 1, depth = 5, bevel = 1)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.sensorWidth = sensorWidth / 1000.0;
        this.sensorHeight = sensorHeight / 1000.0;
        this.thickness = thickness / 1000.0;
        this.depth = depth / 1000.0;
        this.bevel = bevel / 1000.0;

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        // Create a shape for the outer rectangle
        const outerWidth = this.sensorWidth + 2 * this.thickness;
        const outerHeight = this.sensorHeight + 2 * this.thickness;
        const outerShape = new THREE.Shape();
        outerShape.moveTo(-outerWidth / 2, -outerHeight / 2);
        outerShape.lineTo(outerWidth / 2, -outerHeight / 2);
        outerShape.lineTo(outerWidth / 2, outerHeight / 2);
        outerShape.lineTo(-outerWidth / 2, outerHeight / 2);
        outerShape.lineTo(-outerWidth / 2, -outerHeight / 2);

        // Create a shape for the inner hole
        const holeWidth = this.sensorWidth + 2*this.bevel;
        const holeHeight = this.sensorHeight + 2* this.bevel;
        const holeShape = new THREE.Path();
        holeShape.moveTo(-holeWidth / 2, -holeHeight / 2);
        holeShape.lineTo(holeWidth / 2, -holeHeight / 2);
        holeShape.lineTo(holeWidth / 2, holeHeight / 2);
        holeShape.lineTo(-holeWidth / 2, holeHeight / 2);
        holeShape.lineTo(-holeWidth / 2, -holeHeight / 2);

        // Add the hole shape to the outer shape
        outerShape.holes.push(holeShape);

        // Create the geometry from the shape
        this.geometry = new THREE.ExtrudeGeometry(outerShape, 
            { depth: this.depth, 
             // bevelEnabled: false ,
              bevelEnabled: true,     // Enable bevel
              bevelThickness: 0.001,  // Thickness of the bevel
              bevelSize: this.bevel,       // Distance the bevel extends from the shape edges
              bevelSegments: 3        // Number of segments for the bevel's roundness
            });


        // Compute vertex normals for smooth shading
        this.geometry.computeVertexNormals();
    }

    setMaterial()
    {
        this.material = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            flatShading: false
        })

        this.material.flatShading = false;
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.rotation.y = - Math.PI * 0.5
        this.mesh.receiveShadow = true

        // Make this visible in the camera sensor view.
        this.mesh.layers.enable(this.experience.CAMERA_SENSOR_VIEW_LAYER);

        this.scene.add(this.mesh)
    }

    update()
    {
        const focalLength = this.experience.controlParams.focalLength/1000.0;

        // Place it on the wall of the sphere.
        this.mesh.position.set(focalLength, 0, 0);
    }
}
