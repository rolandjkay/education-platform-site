import Experience from '../Experience.js'

export default class HelpOverlay
{
    constructor()
    {
        this.experience = new Experience();
        this.visible = false;
        this.setup();
    }

    setup()
    {
        const container = this.experience.container;

        this.overlay = document.createElement('div');
        this.overlay.id = 'help-overlay';
        this.overlay.innerHTML = `
            <div id="help-panel">
                <button id="help-close">✕</button>
                <h2>How to use this simulator</h2>

                <section>
                    <h3>Navigate the scene</h3>
                    <table>
                        <tr class="mouse-only">
                            <td class="action">Rotate</td>
                            <td>Left-click and drag</td>
                        </tr>
                        <tr class="touch-only">
                            <td class="action">Rotate</td>
                            <td>One-finger drag</td>
                        </tr>
                        <tr class="mouse-only">
                            <td class="action">Zoom</td>
                            <td>Scroll wheel</td>
                        </tr>
                        <tr class="touch-only">
                            <td class="action">Zoom</td>
                            <td>Pinch</td>
                        </tr>
                        <tr class="mouse-only">
                            <td class="action">Pan</td>
                            <td>Right-click and drag</td>
                        </tr>
                        <tr class="touch-only">
                            <td class="action">Pan</td>
                            <td>Two-finger drag</td>
                        </tr>
                    </table>
                </section>

                <section>
                    <h3>Adjust the optics</h3>
                    <table>
                        <tr>
                            <td class="action">Focal length</td>
                            <td>Drag the blue arrow near the camera body left or right</td>
                        </tr>
                        <tr>
                            <td class="action">Object distance</td>
                            <td>Drag the blue arrow near the tree left or right</td>
                        </tr>
                    </table>
                </section>

                <section>
                    <h3>Toggle visibility</h3>
                    <table>
                        <tr>
                            <td class="action">Camera body</td>
                            <td>Show or hide the camera body model</td>
                        </tr>
                        <tr>
                            <td class="action">Tube</td>
                            <td>Show or hide the lens barrel</td>
                        </tr>
                        <tr>
                            <td class="action">Image hemisphere</td>
                            <td>Show or hide the hemisphere illustrating the image circle</td>
                        </tr>
                    </table>
                </section>

                <section>
                    <h3>Status bar</h3>
                    <p>The bar at the bottom shows the current <strong>f-number</strong> (aperture),
                    an equivalent <strong>ISO</strong>, and the <strong>fraction of light</strong>
                    reaching the sensor relative to the widest aperture.</p>
                </section>

                <p class="help-tip">Tip: press <strong>▶ Guided Tour</strong> for an automatic
                fly-through of the key components.</p>
            </div>
        `;

        container.appendChild(this.overlay);

        // Close on ✕ button or clicking the dark backdrop
        document.getElementById('help-close').addEventListener('click', () => this.hide());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.hide();
        });

        const style = document.createElement('style');
        style.textContent = `
            #help-overlay {
                display: none;
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.75);
                z-index: 30;
                align-items: center;
                justify-content: center;
                padding: 16px;
                box-sizing: border-box;
            }
            #help-overlay.visible {
                display: flex;
            }
            #help-panel {
                position: relative;
                background: rgba(15,15,25,0.97);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 12px;
                padding: 28px 32px;
                max-width: 540px;
                width: 100%;
                max-height: 90%;
                overflow-y: auto;
                font-family: "Space Grotesk", Helvetica, sans-serif;
                color: #fff;
            }
            #help-panel h2 {
                margin: 0 0 20px;
                font-size: 18px;
                font-weight: 700;
                letter-spacing: 0.3px;
            }
            #help-panel h3 {
                margin: 0 0 10px;
                font-size: 13px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: rgba(255,255,255,0.5);
            }
            #help-panel section {
                margin-bottom: 22px;
            }
            #help-panel table {
                width: 100%;
                border-collapse: collapse;
            }
            #help-panel td {
                padding: 5px 0;
                font-size: 14px;
                vertical-align: top;
                line-height: 1.4;
            }
            #help-panel td.action {
                font-weight: 600;
                width: 38%;
                color: rgba(255,255,255,0.85);
                padding-right: 12px;
            }
            .help-tip {
                margin: 4px 0 0;
                font-size: 13px;
                color: rgba(255,255,255,0.5);
                line-height: 1.5;
            }
            #help-close {
                position: absolute;
                top: 14px;
                right: 16px;
                background: none;
                border: none;
                color: rgba(255,255,255,0.5);
                font-size: 18px;
                cursor: pointer;
                line-height: 1;
                padding: 4px;
            }
            #help-close:hover {
                color: #fff;
            }

            /* Show only the relevant rows for the current input type */
            .touch-only { display: none; }

            @media (pointer: coarse) {
                .mouse-only { display: none; }
                .touch-only { display: table-row; }

                #help-panel {
                    padding: 20px 18px;
                    font-size: 14px;
                }
                #help-panel h2 {
                    font-size: 16px;
                    margin-bottom: 16px;
                }
                #help-panel td {
                    font-size: 13px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    show()
    {
        this.overlay.classList.add('visible');
        this.visible = true;
    }

    hide()
    {
        this.overlay.classList.remove('visible');
        this.visible = false;
    }

    toggle()
    {
        this.visible ? this.hide() : this.show();
    }
}
