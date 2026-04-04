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

        // Prepend so Tour/Fullscreen come before the toggle buttons
        bar.insertBefore(fsBtn, bar.firstChild);
        bar.insertBefore(tourBtn, bar.firstChild);

        // Update fullscreen button label on change
        document.addEventListener('fullscreenchange', () => {
            const isFs = !!document.fullscreenElement;
            fsBtn.textContent = isFs ? '✕ Exit Full Screen' : '⛶ Full Screen';

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
