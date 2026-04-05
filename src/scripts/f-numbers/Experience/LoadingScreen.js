import Experience from './Experience.js'

export default class LoadingScreen
{
    constructor()
    {
        this.experience = new Experience();
        this.resources = this.experience.resources;

        this.setup();

        this.resources.on('progress', (loaded, total) => this.onProgress(loaded, total));
        this.resources.on('ready', () => this.onReady());
    }

    setup()
    {
        this.overlay = document.createElement('div');
        this.overlay.id = 'loading-overlay';

        const tr = this.experience.translations;
        this.overlay.innerHTML = `
            <p id="loading-label">${tr.loading ?? 'Loading\u2026'}</p>
            <div id="loading-track">
                <div id="loading-fill"></div>
            </div>
        `;

        this.experience.container.appendChild(this.overlay);

        const style = document.createElement('style');
        style.textContent = `
            #loading-overlay {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 16px;
                background: #1a1a1a;
                z-index: 100;
                transition: opacity 0.6s ease;
            }
            #loading-label {
                font-family: "Space Grotesk", Helvetica, sans-serif;
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 1px;
                color: rgba(255,255,255,0.6);
                margin: 0;
            }
            #loading-track {
                width: 240px;
                height: 4px;
                background: rgba(255,255,255,0.12);
                border-radius: 2px;
                overflow: hidden;
            }
            #loading-fill {
                height: 100%;
                width: 0%;
                background: rgba(255,255,255,0.8);
                border-radius: 2px;
                transition: width 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    onProgress(loaded, total)
    {
        const pct = Math.round((loaded / total) * 100);
        document.getElementById('loading-fill').style.width = pct + '%';
        const tr = this.experience.translations;
        const tpl = tr.loadingPct ?? 'Loading\u2026 {pct}%';
        document.getElementById('loading-label').textContent = tpl.replace('{pct}', pct);
    }

    onReady()
    {
        const overlay = this.overlay;
        overlay.style.opacity = '0';
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }
}
