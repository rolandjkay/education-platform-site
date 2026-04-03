import * as THREE from 'three'
import Experience from '../Experience.js'

export default class LightPath
{
    constructor({name})
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.name = name;

        // The point on the object plane where the light ray will 
        // initially be reflecting from.
        // (y and z ordinates, x is determined by object plane position)
        this.reflectionPosition = new THREE.Vector3(3, -1, 0);

        // Collect all our components in one group, so they can be
        // easily hidden from the camera
        this.group = new THREE.Group();
        this.group.name = name;
        this.scene.add(this.group);

        this.setupColourSampling()

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    /*
     * Helper function to extrapolate the position at which the ray intersects
     * the image plane.
     */
     extrapolateImagePlaneIntersection(objectPlanePosition, 
                                       aperaturePosition,
                                       focalLength)
    {
        // Given two points X and Y as THREE.Vector3 and the desired distance 'n'
        const X = objectPlanePosition;
        const Y = aperaturePosition; 

        // Step 1: Calculate the direction vector from X to Y
        const direction = new THREE.Vector3().subVectors(Y, X);

        // Step 2: Normalize the direction vector (keep direction, lose magnitude)
        const directionNormalized = direction.clone().normalize();

        // Step 3: Find the ratio by which the x-coordinate should increase
        const deltaX = focalLength; // This is the increase in x-coordinate (Y.x + n)
        const scaleFactor = deltaX / directionNormalized.x; // Scaling factor

        // Step 4: Scale the direction vector by the scaling factor
        const extrapolatedVector = directionNormalized.multiplyScalar(scaleFactor);

        // Step 5: Add this scaled vector to Y to get the position of Z
        const Z = new THREE.Vector3().addVectors(Y, extrapolatedVector);

        return Z;
    }

     /*
     * Copy colours from array of Vector3 to a C-style array.
     * (Used to update the line vertex colours)
     */
    setFromColours(bufferAttribute, colours)
    {
        for (let i = 0; i < colours.length; i++)
        {
            bufferAttribute.setXYZ(i, colours[i].r, colours[i].g, colours[i].b);
        }
    }

    /*
     * So we can get the colour of the image point that the user has selected.
     */
    setupColourSampling()
    {
        const image = this.experience.resources.items.treeImage.image;

        const canvas = document.createElement('canvas');
        this.imageContext = canvas.getContext('2d', {willReadFrequently: true});

        // Set the canvas size to match the texture's dimensions
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw the texture image on the canvas
        this.imageContext.drawImage(image, 0, 0);

        this.imageWidth = image.width;
        this.imageHeight = image.height;
    }

    // Function to get pixel color at UV coordinates
    getPixelColorFromTexture(uv) 
    {
        // Convert UV coordinates to pixel coordinates
        const x = Math.floor(uv.x * this.imageWidth);
        const y = Math.floor(uv.y * this.imageHeight);

        const pixelData = this.imageContext.getImageData(x, y, 1, 1).data;

        // Return the pixel color as an RGBA object
        return {
            r: pixelData[0], // Rad
            g: pixelData[1], // Green
            b: pixelData[2], // Blue
            a: pixelData[3], // Alpha (opacity)
        };
    }

    updatePointsAndColours()
    {
        const focalLength = this.experience.controlParams.focalLength/1000.0;
        const objectDistance = this.experience.controlParams.objectDistance;
        const initialObjectPlanePosition = this.reflectionPosition;
        const aperaturePosition = new THREE.Vector3(0, 0, 0);
        const sunPosition = new THREE.Vector3(3.5, 4, -3);

        initialObjectPlanePosition.x = -objectDistance;

        // Create a curve for the path
        this.points = [
            // First line
            sunPosition,
            initialObjectPlanePosition,

            // Second line
            initialObjectPlanePosition,
            //aperaturePosition,
            // Add a forth point where the ray intersects the image plane.
            this.extrapolateImagePlaneIntersection(initialObjectPlanePosition,
                                                   aperaturePosition,
                                                   focalLength)
        ];

        // Set the colour of the reflected light form the objectplane texture.
        const objectPlane = this.scene.getObjectByName("objectPlane");

        const uv = new THREE.Vector2(1 - (( this.reflectionPosition.z - objectPlane.position.z) / objectPlane.geometry.parameters.width + 0.5),
                                        ( objectPlane.position.y - this.reflectionPosition.y) / objectPlane.geometry.parameters.height + 0.5
                                    );

        const colorData = this.getPixelColorFromTexture(uv);

        let reflectedColor;
        if (colorData.a < 0.1) // Reflex white for transparent areas, rather than black.
        {
            reflectedColor = new THREE.Color(1, 1, 1);
        }
        else
        {
            reflectedColor = new THREE.Color(colorData.r/255, colorData.g/255, colorData.b/255);
        }

        reflectedColor.convertSRGBToLinear();

        this.colours = [
            // First line colour (two vertecies)
            new THREE.Color(1, 1, 1),   
            new THREE.Color(1, 1, 1),   
            // Second line colour
            reflectedColor,
            reflectedColor,
        ]
    }

    setGeometry()
    {
        this.updatePointsAndColours();


        // Create BufferGeometry and Attributes to hold the vertex and colour info.
        const coloursArray = new Float32Array(this.colours.length * 3);
        this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);
        this.geometry.setAttribute('color', new THREE.BufferAttribute(coloursArray, 3));

        const attribute = this.geometry.attributes.color;
        this.setFromColours(attribute, this.colours);
        this.geometry.attributes.color.needsUpdate = true;
    }

    setMaterial()
    {
        this.material = new THREE.LineBasicMaterial({ vertexColors: true });
    }

    setMesh()
    {
        this.line = new THREE.LineSegments(this.geometry, this.material);

        // Put this in the control group to keep it out of the ImagePlace,
        // where it's appearance is distracting
        this.line.layers.set(this.experience.CONTROL_LAYER);

        this.group.add(this.line);
    }

    /*
     * Called by LightPathControl to update the world-space position of
     * the reflection point.
     */
    setReflectionPosition(position)
    {
        this.positionUpdated = true;
        this.reflectionPosition.copy(position);
        this.points[1].copy(position);
        this.points[2].copy(position);
    }

    update()
    {
        const objectDistance = this.experience.controlParams.objectDistance;
        const focalLength = this.experience.controlParams.focalLength;


        // Only update the colours and points if the user has moved
        // the reflection point or 'focalLength' has changed.
        if (this.positionUpdated 
             || focalLength != this.lastFocalLength 
             || objectDistance != this.lastobjectDistance)
        {
            this.lastFocalLength = focalLength;
            this.lastobjectDistance = objectDistance;
            this.positionUpdated = false;
            this.updatePointsAndColours();

            this.geometry.setFromPoints(this.points); 
            const attribute = this.geometry.attributes.color;
            this.setFromColours(attribute, this.colours);

            this.geometry.attributes.position.needsUpdate = true;
            this.geometry.attributes.color.needsUpdate = true;
        }
    }
}
