import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter
{
    constructor(canvas)
    {
        super()

        this.canvas = canvas;

        // Setup
        this._updateFromCanvas()

        // Resize event
        window.addEventListener('resize', () =>
        {
            this._updateFromCanvas()
            this.trigger('resize')
        })
    }

    _updateFromCanvas()
    {
        const rect = this.canvas.getBoundingClientRect();
        this.width  = rect.width  || this.canvas.clientWidth  || window.innerWidth
        this.height = rect.height || this.canvas.clientHeight || window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)
    }
}
