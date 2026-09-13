export class StartScreenUI {
    constructor() {
        this.container = null;
    }

    initialize() {
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.container.style.padding = '40px';
        this.container.style.borderRadius = '10px';
        this.container.style.textAlign = 'center';
        this.container.style.zIndex = '200';
        
        this.container.innerHTML = `
            <h1 style="color: white; font-size: 64px; margin: 0;">Crossy Road</h1>
            <div style="color: white; font-size: 18px; margin: 20px 0;">
                <p>🎮 Controls:</p>
                <p>WASD or Arrow Keys - Move</p>
                <p>Space - Pause</p>
                <p>M - Mute</p>
                <p>R - Restart</p>
            </div>
            <p style="color: #FFD700; font-size: 24px; margin-top: 30px;">Press any key to start</p>
        `;
        
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
