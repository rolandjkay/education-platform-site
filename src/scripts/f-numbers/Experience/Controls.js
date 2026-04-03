import GUI from 'lil-gui'

export default class Controls
{
    constructor()
    {
        this.isDebugMode = window.location.hash === '#debug'

        if (this.isDebugMode)
        {
            this.ui = new GUI()
        }
    }
}
