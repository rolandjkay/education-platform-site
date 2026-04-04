import EventEmitter from './EventEmitter.js'

export default class MouseEvents extends EventEmitter
{
    constructor()
    {
        super()

        // Mouse events
        window.addEventListener('mousemove', (event) => { this.onMouseMove(event); });
        window.addEventListener('mousedown', (event) => { this.onMouseDown(event); });
        window.addEventListener('mouseup',   (event) => { this.onMouseUp(event); });

        // Touch events — single touch only; two-finger gestures are left for OrbitControls.
        // passive: false is required so we can call preventDefault() to suppress page scroll
        // while dragging a control.
        window.addEventListener('touchstart', (event) => { this.onTouchStart(event); }, { passive: false });
        window.addEventListener('touchmove',  (event) => { this.onTouchMove(event); },  { passive: false });
        window.addEventListener('touchend',   (event) => { this.onTouchEnd(event); });
    }

    onMouseMove(event) { this.trigger('mousemove', [event]) }
    onMouseDown(event) { this.trigger('mousedown', [event]) }
    onMouseUp(event)   { this.trigger('mouseup',   [event]) }

    onTouchStart(event)
    {
        if (event.touches.length !== 1) return;
        // Let taps on interactive HTML elements fire as normal click events.
        // Calling preventDefault() here would suppress the synthetic click that
        // button/link listeners depend on.
        if (event.target.closest('button, input, a, select')) return;
        event.preventDefault(); // Prevents double-tap zoom and tap highlight
        const touch = event.touches[0];
        this.trigger('mousedown', [{ clientX: touch.clientX, clientY: touch.clientY }]);
    }

    onTouchMove(event)
    {
        if (event.touches.length !== 1) return;
        event.preventDefault(); // Prevents page scroll while dragging a control
        const touch = event.touches[0];
        this.trigger('mousemove', [{ clientX: touch.clientX, clientY: touch.clientY }]);
    }

    onTouchEnd(event)
    {
        // changedTouches holds the touch(es) that were just lifted
        const touch = event.changedTouches[0];
        this.trigger('mouseup', [{ clientX: touch.clientX, clientY: touch.clientY }]);
    }
}
