import * as THREE from 'three'

import Controls from './Controls.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import MouseEvents from './Utils/MouseEvents.js'
import Camera from './Camera.js'
import SecondaryCamera from './SecondaryCamera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'

import sources from './sources.js'

let instance = null

export default class Experience
{
    constructor(_canvas)
    {
        // Singleton
        if(instance)
        {
            return instance
        }
        instance = this
        
        // Global access
        window.experience = this

        // Options
        this.canvas = _canvas

        /*
         * Control parameters
         * - These can be controlled by objects within the UI.
         */
        this.controlParams = {
            focalLength: 1000,
            objectDistance: 5,
            isTubeVisible: true,
            isCameraBodyVisible: true,
            isHemisphereVisible: false,
        }

        /*
         * Useful global constants
         */
        this.MAIN_LAYER = 0;
        // Put controls in a separate layer so they aren't visible on the image plane
        this.CONTROL_LAYER = 1; 
        // Anything that should be visible in the overlay that should the camera sensor
        // should be added to this layer.
        this.CAMERA_SENSOR_VIEW_LAYER = 2;

        // Setup
        this.controls = new Controls()
        this.sizes = new Sizes(this.canvas)
        this.time = new Time()
        this.mouseEvents = new MouseEvents()
        this.scene = new THREE.Scene()
        this.resources = new Resources(sources)
        this.camera = new Camera()
        this.secondaryCamera = new SecondaryCamera()
        this.renderer = new Renderer()
        this.world = new World()

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () =>
        {
            this.update()
        })
    }

    resize()
    {
        this.camera.resize()
        this.secondaryCamera.resize()
        this.renderer.resize()
    }

    update()
    {
        this.camera.update()
        this.secondaryCamera.update()
        this.world.update()
        this.renderer.update()
    }

    destroy()
    {
        this.sizes.off('resize')
        this.time.off('tick')

        // Traverse the whole scene
        this.scene.traverse((child) =>
        {
            // Test if it's a mesh
            if(child instanceof THREE.Mesh)
            {
                child.geometry.dispose()

                // Loop through the material properties
                for(const key in child.material)
                {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if(value && typeof value.dispose === 'function')
                    {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()

        this.controls.ui.destroy()
    }
}
