import GenericMenu from './GenericMenu.js';

export default class MainMenu extends GenericMenu
{
    constructor()
    {
        super([
            { label: 'Start Game', action: () => console.log('Starting game...') },
            { label: 'Options', action: () => console.log('Opening options...') },
            { label: 'Exit', action: () => console.log('Exiting game...') },
        ]);
        
        // Show the menu after some event, e.g., a button click
        document.addEventListener('keydown', (e) => {
            if (e.key === 'm') { // Press 'M' to toggle menu
            this.showMenu();
            }
        });
    }
};