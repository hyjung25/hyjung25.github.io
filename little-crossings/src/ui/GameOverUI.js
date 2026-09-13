export class GameOverUI {
    constructor(gameState) {
        this.gameState = gameState;
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
        this.container.style.display = 'none';
        this.container.style.zIndex = '200';
        
        this.container.innerHTML = `
            <h1 style="color: white; font-size: 64px; margin: 0;">Game Over</h1>
            <p id="final-score" style="color: white; font-size: 32px;">Score: 0</p>
            <p style="color: white; font-size: 18px;">Press R to Restart</p>
        `;
        
        document.body.appendChild(this.container);
    }

    show(score) {
        if (this.container) {
            document.getElementById('final-score').textContent = `Score: ${score}`;
            this.container.style.display = 'block';
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}
