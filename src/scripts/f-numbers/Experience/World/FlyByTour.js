import { gsap } from 'gsap';
import * as THREE from 'three';

export default class FlyByTour 
{
    constructor(camera, controls, objects, annotations) {
      this.camera = camera;
      this.controls = controls;
      this.objects = objects;
      this.annotations = annotations;
      this.createUI();
    }
  
    createUI() {
      // Create a text container for annotations (you can style this with CSS)
      this.annotationContainer = document.createElement('div');
      this.annotationContainer.classList.add('annotation');
      this.annotationContainer.style.position = 'absolute';
      this.annotationContainer.style.bottom = '10%';
      this.annotationContainer.style.left = '50%';
      this.annotationContainer.style.transform = 'translateX(-50%)';
      this.annotationContainer.style.fontSize = '24px';
      this.annotationContainer.style.color = 'white';
      this.annotationContainer.style.background = 'rgba(0, 0, 0, 0.6)';
      this.annotationContainer.style.padding = '10px 20px';
      this.annotationContainer.style.borderRadius = '8px';
      this.annotationContainer.style.opacity = 0; // Start hidden
      document.body.appendChild(this.annotationContainer);
    }
  
    startFlyBy() {
      const timeline = gsap.timeline({ repeat: 0 });
      this.lastTarget = this.controls.target.clone(); // Holds the current interpolated target position

      // Store the original position and target
      this.originalPosition = this.camera.position.clone();
      this.originalTarget = this.controls.target.clone();

      // Used to ease our camera targeting, rather than just doing a straight linear 
      // interp between old and new object positions.
      function easeInOutCubic(t) {
        if (t < 0.5) {
          return 4 * t * t * t; // Ease in
        }
        return 1 - Math.pow(-2 * t + 2, 3) / 2; // Ease out
      }
  
      this.objects.forEach((object, index) => {
        // Fly to the position near the object
        timeline.to(this.camera.position, {
          duration: 3,
          x: object.position.x + 0.5, // Adjust x-offset for better view
          y: object.position.y + 0.5, // Adjust y-offset for better view
          z: object.position.z + 1, // Adjust z-offset for better view
          ease: "power1.inOut", // Add easing here
          onUpdateParams: [this], // Pass necesary context to onUpdate()
          // Have to use a "functio ()" here, not an arrow function, so that 'this'
          // refers to the Tween.
          onUpdate: function (mother) {
            // 'this' refers to the current Tween.
            // 'mother' refers to the instance of the containing FlyByTour class

            // Interpolate between current and next target position
            mother.controls.target.lerpVectors(mother.lastTarget, object.position, easeInOutCubic(this.progress()));
          },

          // Don't need access to the Tween, so just use an arrow function so we
          // can access 'this'.
          onComplete: () => { this.lastTarget.copy(object.position) }
        });

  
        // Show annotation text
        timeline.to(this.annotationContainer, {
          duration: 0.5,
          opacity: 1,
          onStart: () => {
            this.annotationContainer.textContent = this.annotations[index]; // Update text
          },
        });
  
        // Hold the annotation for 3 seconds
        timeline.to(this.annotationContainer, { duration: 3, opacity: 1 });
  
        // Hide the annotation
        timeline.to(this.annotationContainer, { duration: 0.5, opacity: 0 });
  
        // Pause for a moment before moving to the next object
        timeline.to({}, { duration: 1 }); // Empty tween for pause
      });

      // Return to the original camera position and target
      timeline.to(this.camera.position, {
        duration: 3,
        x: this.originalPosition.x,
        y: this.originalPosition.y,
        z: this.originalPosition.z,
        ease: "power1.inOut",
      });
    
      timeline.to(this.controls.target, {
        duration: 3,
        x: this.originalTarget.x,
        y: this.originalTarget.y,
        z: this.originalTarget.z,
        ease: "power1.inOut",
      });
    }
  }