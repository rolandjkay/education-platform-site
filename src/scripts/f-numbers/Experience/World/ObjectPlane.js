import * as THREE from 'three'
import Experience from '../Experience.js'

export default class ObjectPlane
{
    /*
     * position:     Y,Z position of the center of the object plane
     *               relative to position on X axis set by control
     * texture:      The texture to display
     * world_height: The height of the object plane in meters. 
     */
    constructor({positionOffset, texture, worldHeight})
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.positionOffset = positionOffset;
        this.texture = texture;

        this.aspectRatio = texture.image.width / texture.image.height;
        this.worldHeight = worldHeight // m

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        this.geometry = new THREE.PlaneGeometry(this.worldHeight * this.aspectRatio , this.worldHeight);
    }

    setTextures()
    {
        this.textures = {}

        this.textures.color = this.texture;
        //this.textures.color.colorSpace = THREE.SRGBColorSpace
        //this.textures.color.repeat.set(1, 1)
        //this.textures.color.wrapS = THREE.RepeatWrapping
        //this.textures.color.wrapT = THREE.RepeatWrapping

        //this.textures.normal = this.resources.items.grassNormalTexture
        //this.textures.normal.repeat.set(1.5, 1.5)
        //this.textures.normal.wrapS = THREE.RepeatWrapping
        //this.textures.normal.wrapT = THREE.RepeatWrapping
    }

    setMaterial()
    {
        // Create a material and apply the canvas texture
        this.material =  new THREE.MeshStandardMaterial(
            { 
              map: this.textures.color,
              color: 0x6f6f6f, 
              flatShading: false, 
              side: THREE.DoubleSide,
              transparent: true
          }
        );       
    }

    setMesh()
    {
        const objectDistance = this.experience.controlParams.objectDistance;

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.rotation.y = Math.PI / 2;
        //this.mesh.position.set(-objectDistance, this.mesh.height/2 - 1, 0);
        this.mesh.receiveShadow = true
        this.mesh.name = "objectPlane";

        const position = new THREE.Vector3(-objectDistance, 0, 0).add(this.positionOffset);
        this.mesh.position.copy(position);

        this.scene.add(this.mesh)
    }

    update() 
    {
        const objectDistance = this.experience.controlParams.objectDistance;
        
        
        const newPosition = new THREE.Vector3(-objectDistance, 0, 0).add(this.positionOffset);
        this.mesh.position.copy(newPosition);
        
    }
}
