import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Sun
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Create the Sun (Main Sphere)
        const sunGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const sunMaterial = new THREE.MeshStandardMaterial({
            color: 0xFDB813,       // Yellowish sun color
            emissive: 0xFDB813,    // Makes it appear to glow
            emissiveIntensity: 1.5
        });
        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);

        // Custom Shader for Glow Effect
        const glowShader = {
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);  // Pass the normal to the fragment shader
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);  // Create radial falloff
                    gl_FragColor = vec4(1.0, 0.8, 0.0, 1.0) * intensity;  // Set the glow color (yellowish)
                }
            `,
            side: THREE.BackSide,  // Render the glow on the back faces
            blending: THREE.AdditiveBlending,  // Additive blending for a glowing effect
            transparent: true
        };

        // Create a slightly larger sphere for the glow
        const glowGeometry = new THREE.SphereGeometry(0.6,16, 16);  // Slightly larger than the Sun
        const glowMaterial = new THREE.ShaderMaterial(glowShader);
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);

        sunMesh.position.set(3.5, 4, -3);
        glowMesh.position.set(3.5, 4, -3);


        this.scene.add(sunMesh);
        this.scene.add(glowMesh);
    }

    update()
    {

    }

}