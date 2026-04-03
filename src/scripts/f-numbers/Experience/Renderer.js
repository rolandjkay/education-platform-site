import * as THREE from 'three'
import Experience from './Experience.js'

export default class Renderer
{
    constructor()
    {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.overlayCamera = this.experience.secondaryCamera;
        this.setInstance()
    }

    setInstance()
    {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })
        this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMappingExposure = 1.75
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.setClearColor('#211d20')
        this.instance.setSize(this.sizes.width, this.sizes.height, false)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
        this.instance.autoClear = false; // We do it manually because of the double rendering
    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height, false)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    update()
    {
        this.instance.clear();  // Manually clear, as doing two renders
        this.instance.render(this.scene, this.camera.instance)

        // Render the scene from the overlay camera on top of the previous render
        this.instance.clearDepth();  // Clear the depth buffer so the overlay can render on top
        this.instance.setViewport(0, 0, 300, 300);  // Define the position and size of the overlay
        this.instance.render(this.scene, this.overlayCamera.instance);
        // Reset viewport to full screen for the next render loop
        this.instance.setViewport(0, 0, this.sizes.width, this.sizes.height); 
    }
}
