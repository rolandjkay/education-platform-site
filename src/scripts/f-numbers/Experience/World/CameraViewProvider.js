import * as THREE from 'three'
import Experience from '../Experience.js'

export default class CameraViewProvider
{
    constructor({fov, aspectRatio})
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
        this.fov = fov;
        this.aspectRatio = aspectRatio;

        this.setup()
    }

    getTexture()
    {
        return this.renderTarget.texture;
    }

    setup()
    {
        // Create a secondary camera that we'll render the scene from
        // Empirically, the aspect ratio of the final image looks correct
        // with the aspect ratio set to 1.0 here, even though the aspect ratio
        // of our "hemisphere" is 1.33. I think it's because the RenderTarget
        // aspect ratio (below) is 1.0. I'm surprised that rendering onto a square
        // and then texture mapping onto a rentangle isn't cauing us problems though.
        this.secondaryCamera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, 0.1, 1000);

        // Position the secondary camera at the pin hole looking at the object
        this.secondaryCamera.position.set(0, 0, 0); 
        this.secondaryCamera.lookAt(new THREE.Vector3(-5,0,0))
        
        // Don't render controls.
        this.secondaryCamera.layers.set(this.experience.MAIN_LAYER);
        this.scene.add(this.secondaryCamera);

        // Create a render target
        this.renderTarget = new THREE.WebGLRenderTarget(4096, 4096,
            {
                format: THREE.RGBAFormat, // Enables alpha channel
                transparent: true,         // Ensure transparency
            }
        );

        // Create an object that will display the render target's texture
        /*const planeGeometry = new THREE.PlaneGeometry(1, 1);
        const planeMaterial = new THREE.MeshBasicMaterial(
        {
            map: this.renderTarget.texture,
            side: THREE.DoubleSide
        });
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.plane.position.set(0, 2, 0); // Position the plane so it's visible to the main camera
        this.scene.add(this.plane);*/
    }

    update()
    {
        this.experience.renderer.instance.setRenderTarget(this.renderTarget);

        // Set the renderer background to transparent
        let clearColor = new THREE.Color(), clearAlpha
        this.experience.renderer.instance.getClearColor(clearColor);
        this.experience.renderer.instance.getClearAlpha(clearAlpha);
        
        this.experience.renderer.instance.setClearColor(0x000000, 0);

        this.experience.renderer.instance.clear();
        this.experience.renderer.instance.render(this.scene, this.secondaryCamera);

        // Reset to the main render target (the screen) and render the whole scene from the main camera
        this.experience.renderer.instance.setRenderTarget(null);

        // Restore background colour.
        this.experience.renderer.instance.setClearColor(clearColor);
        this.experience.renderer.instance.setClearAlpha(clearAlpha);
    }
}
