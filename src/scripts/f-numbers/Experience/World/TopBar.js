import Experience from '../Experience.js'

export default class TopBar
{
    constructor({ flyByTour })
    {
        this.experience = new Experience();
        this.flyByTour = flyByTour;

        this.setup();
    }

    setup()
    {
        // The #top-bar div was already created in World.js so that ToggleControls
        // could append to it. We prepend the Tour and Fullscreen buttons.
        const bar = document.getElementById('top-bar');

        const tourBtn = document.createElement('button');
        tourBtn.className = 'top-bar-btn';
        tourBtn.textContent = '▶ Guided Tour';
        tourBtn.addEventListener('click', () => this.flyByTour.startFlyBy());

        const fsBtn = document.createElement('button');
        fsBtn.id = 'fs-btn';
        fsBtn.className = 'top-bar-btn';
        fsBtn.textContent = '⛶ Full Screen';
        fsBtn.addEventListener('click', () => this.toggleFullscreen());

        // Prepend Tour button; append fsBtn last so it sits at the far right
        bar.insertBefore(tourBtn, bar.firstChild);
        bar.appendChild(fsBtn);

        // On mobile, fullscreen is requested before the Experience initialises,
        // so fullscreenchange fires before this listener is registered.
        // Check immediately whether we're already in fullscreen.
        if (window.matchMedia('(pointer: coarse)').matches && document.fullscreenElement) {
            fsBtn.textContent = '✕';
            fsBtn.style.display = 'block';
        }

        // Update fullscreen button label on change
        document.addEventListener('fullscreenchange', () => {
            const isFs = !!document.fullscreenElement;
            fsBtn.textContent = isFs ? '✕' : '⛶ Full Screen';

            // On touch devices the button is hidden by default (launch is handled
            // by the placeholder). Reveal it only while in fullscreen so the user
            // has a way to exit.
            if (window.matchMedia('(pointer: coarse)').matches) {
                fsBtn.style.display = isFs ? 'block' : 'none';
            }

            // Let Sizes re-measure the canvas now it has new dimensions
            this.experience.sizes._updateFromCanvas();
            this.experience.sizes.trigger('resize');
        });

        const style = document.createElement('style');
        style.textContent = `
            #top-bar {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                padding: 8px 12px;
                box-sizing: border-box;
                background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
                z-index: 10;
            }
            .top-bar-btn {
                font-family: "Space Grotesk", Helvetica, sans-serif;
                font-size: 13px;
                font-weight: 600;
                letter-spacing: 0.5px;
                color: #fff;
                background: rgba(255,255,255,0.12);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 6px;
                padding: 5px 14px;
                cursor: pointer;
                transition: background 0.2s;
            }
            .top-bar-btn:hover {
                background: rgba(255,255,255,0.25);
            }
            @media (pointer: coarse) {
                .top-bar-btn {
                    padding: 10px 16px;
                    font-size: 15px;
                    min-height: 44px;
                }
                #fs-btn {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    toggleFullscreen()
    {
        if (!document.fullscreenElement) {
            this.experience.container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}
