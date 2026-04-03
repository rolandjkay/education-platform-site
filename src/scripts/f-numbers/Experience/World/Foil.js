import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Foil
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        const model = this.resources.items.blenderModel.scene;

        this.geometry = model.getObjectByName('pinhole').geometry

        // Compute vertex normals for smooth shading
        this.geometry.computeVertexNormals();
    }

    setTextures()
    {
        this.textures = {}

        this.textures.color = this.resources.items.foilColor;
        this.textures.normal = this.resources.items.foilNormal;
    }

    setMaterial()
    {
        // Create a material and apply the canvas texture
        this.material =  new THREE.MeshStandardMaterial(
            { 
              map: this.textures.color,
              normalMap: this.textures.normal,
              normalScale: new THREE.Vector2(.1, .1),
              metalness: 1.0,
              roughness: 0.1,
              //color: 0x8f8f8f, 
              flatShading: false, 
              side: THREE.DoubleSide
          }
        );       
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.name = "foil"
        //this.mesh.rotation.x = - Math.PI * 0.5
        this.mesh.position.set(0,0,0);
        this.mesh.receiveShadow = true
        this.scene.add(this.mesh)
    }
}
