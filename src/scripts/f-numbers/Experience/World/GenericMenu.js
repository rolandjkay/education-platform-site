
export default class GenericMenu {
    constructor(options) {
      this.options = options;
      this.createMenu();
      this.addCss();
    }
  
    createMenu() {
      // Create the menu overlay container
      this.menuContainer = document.createElement('div');
      this.menuContainer.classList.add('sci-fi-menu-overlay');
  
      // Create the menu list
      const menuList = document.createElement('ul');
      menuList.classList.add('sci-fi-menu');
  
      // Populate the menu with options
      this.options.forEach((option) => {
        const menuItem = document.createElement('li');
        menuItem.classList.add('sci-fi-menu-item');
        menuItem.textContent = option.label;
        
        // Add click event for each option
        menuItem.addEventListener('click', () => {
          option.action();
          this.hideMenu(); // Hide the menu after selecting an option
        });
  
        menuList.appendChild(menuItem);
      });
  
      // Add the list to the container
      this.menuContainer.appendChild(menuList);
  
      // Add to the body of the document
      document.body.appendChild(this.menuContainer);
  
      // Initially hide the menu
      this.hideMenu();
    }

    addCss()
    {
        const style = document.createElement('style');
        style.textContent = `
        .sci-fi-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8); /* Semi-transparent background */
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10; /* Ensure it appears above the Three.js canvas */
        }
        
        /* Sci-fi style for the menu */
        .sci-fi-menu {
            list-style: none;
            padding: 0;
            margin: 0;
            background: black;
            border: 2px solid cyan;
            border-radius: 10px;
            box-shadow: 0 0 20px cyan;
            padding: 20px;
        }
        
        .sci-fi-menu-item {
            font-family: 'Orbitron', sans-serif; /* Sci-fi font */
            font-size: 24px;
            color: cyan;
            text-align: center;
            margin: 10px 0;
            cursor: pointer;
            transition: color 0.3s, transform 0.3s;
        }
        
        .sci-fi-menu-item:hover {
            color: lime;
            transform: scale(1.1); /* Small scale effect on hover */
        }
        
        /* Add some animation for the whole menu when it pops up */
        .sci-fi-menu-overlay {
            animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
            from {
            opacity: 0;
            }
            to {
            opacity: 1;
            }
        }`;

        document.head.appendChild(style);
    }
  
    showMenu() {
      this.menuContainer.style.display = 'flex'; // Show the menu
    }
  
    hideMenu() {
      this.menuContainer.style.display = 'none'; // Hide the menu
    }
  }
  
