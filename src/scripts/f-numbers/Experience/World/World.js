import * as THREE from 'three'
import Experience from '../Experience.js'
import Environment from './Environment.js'
import ImagePlane from './ImagePlane.js'
import Tube from './Tube.js'
import CameraBody from './CameraBody.js'
import Foil from './Foil.js'
import ObjectPlane from './ObjectPlane.js'
import CameraViewProvider from './CameraViewProvider.js'
import Sensor from './Sensor.js'
import LightPath from './LightPath.js'
import PyramidOfVision from './PyramidOfVIsion.js'
import Sun from './Sun.js'
import XArrowControl from './XArrowControl.js'
import PlanarControl from './PlanarControl.js'
import LightPathControl from './LightPathControl.js'
import ToggleControl from './ToggleControl.js'
import ImageHemisphere from './ImageHemisphere.js'
import ExposureMeter from './ExposureMeter.js'
import ExposureGraph from './ExposureGraph.js'
import StatsDisplay from './StatsDisplay.js'
import MainMenu from './MainMenu.js'
import FlyByTour from './FlyByTour.js'
import TopBar from './TopBar.js'
import ViewfinderOverlay from './ViewfinderOverlay.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.params = {
            focalLength: 1000,
            isTubeVisible: true
        };

        // Wait for resources
        this.resources.on('ready', () =>
        {
            // See comment in ImagePlane.js
            const simulatedCameraFov = 105; // (deg)
            const treeHeight = 5; // (m)
            const pumpkinHeight = 0.3; // (m)
            const sensorSizeMm = {width: 36, height: 24} // (mm)
            
            // Setup
            this.cameraViewProvider = new CameraViewProvider({
                fov: simulatedCameraFov,
                aspectRatio: sensorSizeMm.width / sensorSizeMm.height
              }
            );
            this.imagePlane = new ImagePlane({
                name: "imagePlane",
                cameraViewProvider: this.cameraViewProvider, 
                fov: simulatedCameraFov,
                aspectRatio:  sensorSizeMm.width / sensorSizeMm.height
            });
            this.tube = new Tube(this.param);
            this.cameraBody = new CameraBody();
            this.foil = new Foil();

            this.sensor = new Sensor();

            this.experience.controlParams.objectDistance;
            this.objectPlane = new ObjectPlane({
                // To centre 1m up the tree's trunk.
                positionOffset: new THREE.Vector3(0, treeHeight/2 - 1, 0), 
                texture: this.resources.items.treeImage,
                worldHeight: treeHeight
            });
            this.objectPlane.geometry.computeBoundingBox();

            this.objectPlane2 = new ObjectPlane({
                positionOffset: new THREE.Vector3(0.01, 0, 0), 
                texture: this.resources.items.pumpkinImage,
                worldHeight: pumpkinHeight
            });

            // Make sure the pumpkin is rendered after the tree, otherwise
            // we intermittently see a black box around it.
            this.objectPlane.mesh.renderOrder = 0;
            this.objectPlane2.mesh.renderOrder = 1;

            this.lightpath = new LightPath({name: "lightPath"});

            this.pyramidOfVision = new PyramidOfVision({
                imagePlaneDimensions: {
                    // Connect the dimensions of the image plane to the 
                    // pyramid.
                    width: 36/1000.0, // this.imagePlane.planeWidth, 
                    height: 24/1000.0 // this.imagePlane.planeHeight
                }
            });

            this.sun = new Sun();

            this.imageHemisphere = new ImageHemisphere();

            /*
             * Controls
             */
            const tr = this.experience.translations;

            this.focalLengthControl = new XArrowControl({
                limits:        [{x: 0.045, v: 45}, {x: 1.000, v: 1000}],
                initialValue:  this.experience.controlParams.focalLength,
                ypos:          -this.imagePlane.planeHeight/2,
                zpos:          0,
                arrowDirection: 1,
                params:        this.experience.controlParams,
                attributeName: "focalLength",
                label:         tr.controlFocalLength ?? "Aperture\u2013Sensor Dist.",
                units:         "mm",
                decimal_places: -1 
            })

            this.objectDistanceControl = new XArrowControl({
                limits:        [{x: -30, v: 30}, {x:-0.5 , v: 0.5}],
                initialValue:  this.experience.controlParams.objectDistance,
                ypos:           -treeHeight/2 + 1.5,
                zpos:          0.05,
                arrowDirection: -1,
                params:        this.experience.controlParams,
                attributeName: "objectDistance",
                label:         tr.controlObjectDist ?? "Object Distance",
                units:         "m",
                decimal_places: 1
            })

            this.lightRayControl = new LightPathControl(this.objectPlane, this.lightpath);

            /*
             * Top bar — created early so ToggleControls can append to it.
             * TopBar.js will find this div and prepend the Tour/Fullscreen buttons.
             */
            const topBarEl = document.createElement('div');
            topBarEl.id = "top-bar";
            this.experience.container.appendChild(topBarEl);

            this.isCameraBodyVisibleControl = new ToggleControl({camera: this.experience.camera,
                                                                 parentId:      "top-bar",
                                                                 colour:        {r: 50, g: 220, b: 50},
                                                                 label:         {on: tr.toggleCameraBodyOn ?? "Hide Camera Body", off: tr.toggleCameraBodyOff ?? "Show Camera Body"},
                                                                 params:        this.experience.controlParams,
                                                                 attributeName: "isCameraBodyVisible",
                                                                });

            this.isTubeVisibleControl = new ToggleControl({camera: this.experience.camera,
                parentId:      "top-bar",
                label:         {on: tr.toggleTubeOn ?? "Hide Tube", off: tr.toggleTubeOff ?? "Show Tube"},
                params:        this.experience.controlParams,
                attributeName: "isTubeVisible",
                });

            this.isHemisphereVisibleControl = new ToggleControl({camera: this.experience.camera,
                    parentId:      "top-bar",
                    label:         {on: tr.toggleHemisphereOn ?? "Hide Image Hemisphere", off: tr.toggleHemisphereOff ?? "Show Image Hemisphere"},
                    params:        this.experience.controlParams,
                    attributeName: "isHemisphereVisible",
                    });

            /*
             * Display
             */

            // Load the font used for display
            //this.loadAudiowideFont();
            this.loadSpaceFont();

            this.exposureMeter = new ExposureMeter({screenPosition: {x:10, y:80}});
            this.exposureGraph = new ExposureGraph({screenPosition: {x:300, y:200}, width: 200, height: 150});
            this.statsDisplay = new StatsDisplay({colour: {r: 50, g: 220, b: 50}});

            this.environment = new Environment()


            /*
             * Menu
             */
            const mainMenu = new MainMenu();

            /*
             * Fly-bys
             */
            const objects = [this.objectPlane.mesh, this.cameraBody.mesh, this.foil.mesh]; // Objects to fly to
            const offsets = [
                new THREE.Vector3(5, 2, 5),
                new THREE.Vector3(-0.75, 0.375, 0.75),
                new THREE.Vector3(-1, 0.5, 1),
            ];
            const annotations = [
                tr.annotation1 ?? 'This is the object plane',
                tr.annotation2 ?? 'This is the camera body.',
                tr.annotation3 ?? 'This is a piece of foil with a pin hole in it; the \u201caperture\u201d.',
            ];

            // Create the flyby tour instance
            this.flyByTour = new FlyByTour(this.experience.camera.instance,
                                           this.experience.camera.controls,
                                           objects,
                                           offsets,
                                           annotations);


            this.topBar = new TopBar({ flyByTour: this.flyByTour });
            this.viewfinderOverlay = new ViewfinderOverlay();

            // Keyboard shortcut kept as a convenience
            document.addEventListener('keydown', (e) => {
                if (e.key === 't') {
                    this.flyByTour.startFlyBy();
                }
            });


            // The main camera needs to see everything (controls and objects)
            // except the image plane that we use as a backdrop for the 
            // SecondaryCamera view.
            this.experience.camera.instance.layers.enable(this.experience.MAIN_LAYER);
            this.experience.camera.instance.layers.enable(this.experience.CONTROL_LAYER);
        })
    }

    update()
    {
        // Make sure this is updated before 'imagePlane', which uses the texture
        // it provides.
        if (this.cameraViewProvider)
            this.cameraViewProvider.update()

        if (this.tube)
            this.tube.update();
        if (this.imagePlane)
            this.imagePlane.update();
        if (this.objectPlane)
            this.objectPlane.update();
        if (this.objectPlane2)
            this.objectPlane2.update();

        if (this.sensor)
            this.sensor.update();

        if(this.cameraBody)
            this.cameraBody.update();

        if (this.lightpath) 
            this.lightpath.update();
        if (this.pyramidOfVision) 
            this.pyramidOfVision.update();
        if (this.lightRayControl)
            this.lightRayControl.update();

        if (this.imageHemisphere)
            this.imageHemisphere.update();

        if (this.toggleControl)
            this.toggleControl.update();

        if (this.exposureMeter)
            this.exposureMeter.update();

        if (this.exposureGraph)
            this.exposureGraph.update();

        if (this.statsDisplay)
            this.statsDisplay.update();

    }

    loadAudiowideFont()
    {
        // Create link elements
        const link1 = document.createElement('link');
        link1.rel = 'preconnect';
        link1.href = 'https://fonts.googleapis.com';

        const link2 = document.createElement('link');
        link2.rel = 'preconnect';
        link2.href = 'https://fonts.gstatic.com';
        link2.crossOrigin = '';

        const link3 = document.createElement('link');
        link3.rel = 'stylesheet';
        link3.href = 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap';

        // Inject into document head
        document.head.appendChild(link1);
        document.head.appendChild(link2);
        document.head.appendChild(link3);
    }

    loadSpaceFont()
    {
        // Create link elements
        const link1 = document.createElement('link');
        link1.rel = 'preconnect';
        link1.href = 'https://fonts.googleapis.com';

        const link2 = document.createElement('link');
        link2.rel = 'preconnect';
        link2.href = 'https://fonts.gstatic.com';
        link2.crossOrigin = '';

        const link3 = document.createElement('link');
        link3.rel = 'stylesheet';
        link3.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap';

        // Inject into document head
        document.head.appendChild(link1);
        document.head.appendChild(link2);
        document.head.appendChild(link3);
    }
}
