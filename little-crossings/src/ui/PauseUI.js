export class PauseUI {
    constructor() {
        this.container = null;
    }

    initialize() {
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.color = 'white';
        this.container.style.fontSize = '72px';
        this.container.style.fontWeight = 'bold';
        this.container.style.textShadow = '4px 4px 8px rgba(0,0,0,0.8)';
        this.container.style.display = 'none';
        this.container.style.zIndex = '150';
        this.container.textContent = 'PAUSED';
        
        document.body.appendChild(this.container);
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}
