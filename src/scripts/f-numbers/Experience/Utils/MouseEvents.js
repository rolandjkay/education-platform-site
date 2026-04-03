import EventEmitter from './EventEmitter.js'

export default class MouseEvents extends EventEmitter
{
    constructor()
    {
        super()

        // Add event listeners for mouse events
        window.addEventListener('mousemove', (event) => 
        {
            this.onMouseMove(event);
        });

        window.addEventListener('mousedown', (event) => 
        {
            this.onMouseDown(event);
        });
        window.addEventListener('mouseup', (event) => 
        {
            this.onMouseUp(event);
        });
    }

    onMouseMove(event)
    {
        this.trigger('mousemove', [event])
    }

    onMouseDown(event)
    {
        this.trigger('mousedown', [event])
    }

    onMouseUp(event)
    {
        this.trigger('mouseup', [event])
    }
}
