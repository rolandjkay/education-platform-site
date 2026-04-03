import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Tube
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.FLANGE_DISTANCE = 0.062;

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        const model = this.resources.items.blenderModel.scene;

        this.geometry = model.getObjectByName('Tube').geometry

        // Compute vertex normals for smooth shading
        this.geometry.computeVertexNormals();
    }

    setTextures()
    {
        this.textures = {}

        this.textures.color = this.resources.items.cardboardColor;
        this.textures.normal = this.resources.items.cardboardNormal;

        this.textures.color.wrapS = THREE.RepeatWrapping;
        this.textures.color.wrapT = THREE.RepeatWrapping;
        this.textures.normal.wrapS = THREE.RepeatWrapping;
        this.textures.normal.wrapT = THREE.RepeatWrapping;
        this.textures.color.repeat.set(1, 10);
        this.textures.normal.repeat.set(1, 10);
        this.textures.color.colorSpace = THREE.SRGBColorSpace;
    }

    setMaterial()
    {
        // Create a material and apply the canvas texture
        this.material =  new THREE.MeshStandardMaterial(
            { 
              color: 0x6f6f6f, 
              map: this.textures.color,
              normalMap: this.textures.normal,
              flatShading: false, 
              //side: THREE.DoubleSide
          }
        );      
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.rotation.z = -Math.PI * 0.5
        this.mesh.position.set(0,0,0);
        this.mesh.receiveShadow = true
        this.scene.add(this.mesh)
    }

    update()
    {
        const focalLength = this.experience.controlParams.focalLength/1000.0;
        
        const tube_length = focalLength - this.FLANGE_DISTANCE; 

        if (tube_length > 0) 
        {
            this.mesh.scale.y = focalLength - this.FLANGE_DISTANCE; 
            this.mesh.visible = this.experience.controlParams.isTubeVisible;
        } 
        else
         {
            this.mesh.visible = false;
        }
    }
}
