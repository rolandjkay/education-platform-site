import * as THREE from 'three'
import Experience from '../Experience.js'

export default class CameraBody
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.setGeometry()
        this.setMesh()
    }

    setGeometry()
    {
        const model = this.resources.items.cameraModel.scene;

        this.mesh = model.getObjectByName('Camera');

        // Compute vertex normals for smooth shading
        this.mesh.geometry.computeVertexNormals();
    }

    setMesh()
    {
        //this.mesh = new THREE.Mesh(this.geometry, this.material)
        //this.mesh.rotation.x = - Math.PI * 0.5
        this.mesh.position.set(5,0.0,-0.015);
        this.mesh.rotation.set(-Math.PI/2, 0, -Math.PI/2);
        this.mesh.receiveShadow = true
        this.scene.add(this.mesh)
    }

    update()
    {
        const focalLength = this.experience.controlParams.focalLength/1000.0;
        const visible = this.experience.controlParams.isCameraBodyVisible;


        this.mesh.position.x = focalLength - 0.045;
        this.mesh.visible = visible;
    }
}
