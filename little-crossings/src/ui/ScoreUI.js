export class ScoreUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.element = null;
    }

    initialize() {
        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.top = '20px';
        this.element.style.right = '20px';
        this.element.style.fontSize = '48px';
        this.element.style.fontFamily = 'Arial, sans-serif';
        this.element.style.fontWeight = 'bold';
        this.element.style.color = '#FFFFFF';
        this.element.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        this.element.style.zIndex = '100';
        document.body.appendChild(this.element);
        
        this.update();
    }

    update() {
        if (this.element) {
            this.element.textContent = `Score: ${this.gameState.score}`;
        }
    }
}
