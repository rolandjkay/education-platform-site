import * as THREE from 'three'
import Experience from '../Experience.js'

export default class ImageHemisphere
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        const sphereGeometry = new THREE.SphereGeometry(1, 16, 32, Math.PI/2, 2*Math.PI/2); // Radius 5, 32 segments for smoothness

        // Create wireframe geometry from the sphere geometry
        this.geometry = new THREE.WireframeGeometry(sphereGeometry);
    }

    setMaterial()
    {
        // Create a line material for the wireframe
        this.material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true, 
            opacity: 0.25     
        }); 
    }

    setMesh()
    {
        this.mesh = new THREE.LineSegments(this.geometry, this.material);
        this.scene.add(this.mesh)
    }


    update()
    {
        const focalLength = this.experience.controlParams.focalLength/1000.0;

        /*
         * Scale the sphere to match the focal length
         */
        this.mesh.scale.set(focalLength, focalLength, focalLength);

        this.mesh.visible = this.experience.controlParams.isHemisphereVisible;
    }
}
