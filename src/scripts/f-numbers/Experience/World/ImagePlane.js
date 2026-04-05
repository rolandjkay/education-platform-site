import * as THREE from 'three'
import { createTextMesh } from '../Utils/threejs_utils.js';
import {degToRad} from '../Utils/utils.js'
import Experience from '../Experience.js'

export default class ImagePlane
{
    /*
     * cameraViewProvider: The instance of CameraViewProvider which provides
     *                     a rendering of the view from the simulated camera.
     *
     * fov: The Field of View, in degrees. This determines the size of the
     *      image plane. The image plane size approaches infinity as FOV
     *      approaches 180 deg, so be reasonable with the value of fov.
     * 
     * sensor height/width: The dimensions of the camera sensor. We don't
     *                      necessarily require this. But, we will set the
     *                      image plane to the same aspect ratio as the
     *                      sensor
     */
    constructor({
        name, 
        cameraViewProvider,
        fov,
        aspectRatio
        }
    )
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.name = name;
        this.cameraViewProvider = cameraViewProvider;
        this.fov = fov;
        this.aspectRatio = aspectRatio;

        this.setGeometry();
        this.setMaterial();
        this.setMesh();
        this.setTextMesh();
    }

    setGeometry()
    {
        const focalLength = this.experience.controlParams.focalLength/1000.0;

        this.planeHeight = 2 * focalLength * Math.tan(degToRad(this.fov)/2);
        this.planeWidth = this.planeHeight * this.aspectRatio;

        this.geometry = new THREE.PlaneGeometry(this.planeWidth, this.planeHeight);

        // An outline around our, transparent, image plane.
        const points = [];
        points.push( new THREE.Vector3( 0, this.planeHeight/2, -this.planeWidth/2 ) );
        points.push( new THREE.Vector3( 0, this.planeHeight/2, this.planeWidth/2 ) );
        points.push( new THREE.Vector3( 0, -this.planeHeight/2, this.planeWidth/2 ) );
        points.push( new THREE.Vector3( 0, -this.planeHeight/2, -this.planeWidth/2 ) );
        points.push( new THREE.Vector3( 0, this.planeHeight/2, -this.planeWidth/2 ) );

        this.outlineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    }

    setMaterial()
    {
        this.material = new THREE.MeshBasicMaterial( // Basic or standard ?
            {
                map:         this.cameraViewProvider.getTexture(),
                side:        THREE.DoubleSide,
                transparent: true
            }
        );

        this.outlineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff
        });
    }

    setMesh()
    {
        const focalLength = this.experience.controlParams.focalLength/1000.0;

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.receiveShadow = true
        this.mesh.name = this.name;
        // X rotation is to invert the image
        this.mesh.rotation.set(Math.PI, Math.PI/2, 0);

        /*
         * We put the image plane in the controls and "camera sensor view layer" but NOT 
         * he main layer. This means that it is visible in the camera sensor view and
         * to the main camera, but not the SecondaryCamera, which is rendering the image
         * for the image plane. If it were, we would have an infinite loop because the
         * output of the render would exist within the scene being rendered.
         */
        this.mesh.layers.set(this.experience.CONTROL_LAYER);
        this.mesh.layers.enable(this.experience.CAMERA_SENSOR_VIEW_LAYER);

        this.line = new THREE.Line(this.outlineGeometry, 
                                   this.outlineMaterial );

        this.group = new THREE.Group();

        this.group.add(this.mesh);
        this.group.add(this.line);

        this.group.position.set(focalLength, 0, 0);

        this.scene.add(this.group);
    }

    setTextMesh()
    {
        const focalLength = this.experience.controlParams.focalLength/1000.0;

        // Text label
        const tr = this.experience.translations;
        this.textMesh = createTextMesh({
            color:    0xffffff,
            size:     0.075,
            depth:    0.01,
            text:     tr.labelImagePlane ?? "Image Plane",
            position: new THREE.Vector3(focalLength, this.planeHeight/2, 0),
            rotation: new THREE.Euler(0, -Math.PI/2, 0),
            baseline: "bottom"
        })

        this.scene.add(this.textMesh);
    }

    update() {
        const focalLength = this.experience.controlParams.focalLength/1000.0;

        /*
         * Scale the sphere to match the focal length
         */
        this.group.scale.set(focalLength, focalLength, focalLength);
        this.group.position.set(focalLength, 0, 0);
        this.textMesh.position.x = focalLength;
        this.textMesh.position.y = (this.planeHeight/2 + 0.1) * focalLength ;
    }
}
