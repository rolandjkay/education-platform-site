/*
 * Functions for creating varius useful meshes.
 */
import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import Experience from '../Experience.js'
import {degToRad} from './utils.js'


export function createTextMesh({text, size, depth, rotation, position, color, baseline})
{
    const experience = new Experience();

    // Add another mesh that displays the value.
    const textGeometry =  new TextGeometry(text, {
        font: experience.resources.items.droidSans,
        size: size,
        depth: depth,
        curveSegments: 12,
        bevelEnabled: false,
    });

    const textMaterial = new THREE.MeshStandardMaterial({ color: color });
    
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.geometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;

    const centeringVector = new THREE.Vector3(0, 0, 0);

    if (!baseline || baseline === "center")
    {
        centeringVector.set(-textWidth/2, -textHeight/2, 0);
    }
    else if (baseline == "bottom")
    {
        centeringVector.set(-textWidth/2, -textHeight, 0);
    }

    if (rotation)
    {
        centeringVector.applyEuler(rotation);
        textMesh.rotation.copy(rotation);
    }

    textMesh.position.copy(position.add(centeringVector));

    return textMesh;
}
