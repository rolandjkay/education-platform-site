import * as THREE from 'three'
import Experience from './Experience.js'

/*
 * The secondary camera follows the sensor so we can always see the 
 * framing.
 */
export default class SecondaryCamera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        this.setInstance()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(35,1.0, 0.05, 100)
       // this.instance = new THREE.OrthographicCamera(-1, 1, -1, 1, 0.05, 5)
        this.instance.position.set(5, 0, 0)
        this.instance.lookAt(0,0,0)

        // SecondaryCamera should only see objects specifically enabled for it
        this.instance.layers.set(this.experience.CAMERA_SENSOR_VIEW_LAYER)

        this.scene.add(this.instance)
    }

    resize()
    {
        this.instance.aspect = 1.0; // Rendering to a square 
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        const focalLength = this.experience.controlParams.focalLength/1000.0;

        this.instance.position.set(focalLength + 0.2, 0, 0);
    }
}
