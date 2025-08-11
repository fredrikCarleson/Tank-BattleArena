// Global game instance
let game = null;
let ui = null;
let equipment = null;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Tank Battle Arena - Initializing...');
    
    try {
        // Initialize systems
        console.log('Initializing Equipment...');
        equipment = new Equipment();
        console.log('Equipment initialized successfully');
        
        // Initialize game
        console.log('Initializing Game...');
        game = new Game();
        console.log('Game initialized successfully');
        
        // Initialize UI
        console.log('Initializing UI...');
        ui = new UI(game);
        console.log('UI initialized successfully');
        
        // Show welcome message
        ui.showNotification('Welcome to Tank Battle Arena!', 'info', 5000);
        
        console.log('Game initialized successfully!');
        console.log('Game instance:', game);
        console.log('UI instance:', ui);
        
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Save/Load system
class SaveSystem {
    static saveGame() {
        if (!game) return;
        
        const saveData = {
            level: game.level,
            score: game.score,
            points: game.points,
            playerTank: game.playerTank ? game.playerTank.toJSON() : null,
            timestamp: Date.now(),
            version: '1.0.0'
        };
        
        try {
            localStorage.setItem('tankBattleSave', JSON.stringify(saveData));
            ui.showNotification('Game saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save game:', error);
            ui.showNotification('Failed to save game!', 'error');
        }
    }
    
    static loadGame() {
        try {
            const saveData = localStorage.getItem('tankBattleSave');
            if (!saveData) {
                ui.showNotification('No save data found!', 'warning');
                return false;
            }
            
            const data = JSON.parse(saveData);
            
            // Validate save data
            if (!data.version || data.version !== '1.0.0') {
                ui.showNotification('Save data is incompatible!', 'error');
                return false;
            }
            
            // Load data into game
            game.level = data.level;
            game.score = data.score;
            game.points = data.points;
            
            if (data.playerTank) {
                game.playerTank.fromJSON(data.playerTank);
            }
            
            game.updateUI();
            ui.showNotification('Game loaded successfully!', 'success');
            return true;
            
        } catch (error) {
            console.error('Failed to load game:', error);
            ui.showNotification('Failed to load game!', 'error');
            return false;
        }
    }
    
    static hasSaveData() {
        return localStorage.getItem('tankBattleSave') !== null;
    }
    
    static deleteSaveData() {
        try {
            localStorage.removeItem('tankBattleSave');
            ui.showNotification('Save data deleted!', 'info');
        } catch (error) {
            console.error('Failed to delete save data:', error);
            ui.showNotification('Failed to delete save data!', 'error');
        }
    }
}

// Keyboard controls
class KeyboardControls {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    handleKeyPress(event) {
        // Prevent default behavior for game keys
        const gameKeys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
        if (gameKeys.includes(event.code)) {
            event.preventDefault();
        }
        
        switch (event.code) {
            case 'Space':
                if (game.gameState === 'playing' && game.selectedCards.length === 4) {
                    game.executeTurn();
                }
                break;
            case 'KeyR':
                if (game.gameState === 'playing') {
                    game.startNewGame();
                }
                break;
            case 'KeyS':
                if (game.gameState === 'playing') {
                    SaveSystem.saveGame();
                }
                break;
            case 'KeyL':
                if (game.gameState === 'playing') {
                    SaveSystem.loadGame();
                }
                break;
            case 'KeyM':
                game.openShop();
                break;
            case 'Escape':
                if (game.gameState === 'shop') {
                    game.closeShop();
                }
                break;
        }
    }
    
    update() {
        // Handle continuous key presses
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            // Could be used for camera movement or other continuous actions
        }
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fpsHistory = [];
        this.maxFpsHistory = 60;
    }
    
    update(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > this.maxFpsHistory) {
                this.fpsHistory.shift();
            }
        }
    }
    
    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 0;
        return this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
    }
    
    render(ctx) {
        if (window.showFPS) {
            ctx.fillStyle = '#fff';
            ctx.font = '12px monospace';
            ctx.fillText(`FPS: ${this.fps}`, 10, 110);
            ctx.fillText(`Avg: ${Math.round(this.getAverageFPS())}`, 10, 125);
        }
    }
}

// Debug utilities
class DebugTools {
    constructor(game) {
        this.game = game;
        this.enabled = false;
        this.showGrid = false;
        this.showPaths = false;
        this.showAI = false;
        
        this.setupDebugControls();
    }
    
    setupDebugControls() {
        // Debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #e94560;
            font-size: 12px;
            display: none;
            z-index: 1000;
        `;
        
        debugPanel.innerHTML = `
            <h4>Debug Tools</h4>
            <label><input type="checkbox" id="debug-enabled"> Enable Debug</label><br>
            <label><input type="checkbox" id="show-grid"> Show Grid</label><br>
            <label><input type="checkbox" id="show-paths"> Show Paths</label><br>
            <label><input type="checkbox" id="show-ai"> Show AI Info</label><br>
            <label><input type="checkbox" id="show-fps"> Show FPS</label><br>
            <button id="god-mode">God Mode</button><br>
            <button id="kill-enemy">Kill Enemy</button><br>
            <button id="add-points">Add 1000 Points</button>
        `;
        
        document.body.appendChild(debugPanel);
        
        // Event listeners
        document.getElementById('debug-enabled').addEventListener('change', (e) => {
            this.enabled = e.target.checked;
            debugPanel.style.display = this.enabled ? 'block' : 'none';
        });
        
        document.getElementById('show-grid').addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
        });
        
        document.getElementById('show-paths').addEventListener('change', (e) => {
            this.showPaths = e.target.checked;
        });
        
        document.getElementById('show-ai').addEventListener('change', (e) => {
            this.showAI = e.target.checked;
        });
        
        document.getElementById('show-fps').addEventListener('change', (e) => {
            window.showFPS = e.target.checked;
        });
        
        document.getElementById('god-mode').addEventListener('click', () => {
            if (game.playerTank) {
                game.playerTank.health = 999;
                game.playerTank.maxHealth = 999;
                ui.showNotification('God mode activated!', 'warning');
            }
        });
        
        document.getElementById('kill-enemy').addEventListener('click', () => {
            if (game.aiTank) {
                game.aiTank.health = 0;
                ui.showNotification('Enemy destroyed!', 'warning');
            }
        });
        
        document.getElementById('add-points').addEventListener('click', () => {
            game.points += 1000;
            game.updateUI();
            ui.showNotification('Added 1000 points!', 'warning');
        });
        
        // Debug key
        document.addEventListener('keydown', (e) => {
            if (e.code === 'F12') {
                e.preventDefault();
                document.getElementById('debug-enabled').checked = !this.enabled;
                document.getElementById('debug-enabled').dispatchEvent(new Event('change'));
            }
        });
    }
    
    render(ctx) {
        if (!this.enabled) return;
        
        // Show grid
        if (this.showGrid && game.maze) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            
            for (let x = 0; x <= game.maze.width; x++) {
                ctx.beginPath();
                ctx.moveTo(x * game.maze.cellSize, 0);
                ctx.lineTo(x * game.maze.cellSize, game.maze.height * game.maze.cellSize);
                ctx.stroke();
            }
            
            for (let y = 0; y <= game.maze.height; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * game.maze.cellSize);
                ctx.lineTo(game.maze.width * game.maze.cellSize, y * game.maze.cellSize);
                ctx.stroke();
            }
        }
        
        // Show AI info
        if (this.showAI && game.aiTank) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(
                game.aiTank.x * game.maze.cellSize - 10,
                game.aiTank.y * game.maze.cellSize - 10,
                20,
                20
            );
            
            ctx.fillStyle = '#ff0000';
            ctx.font = '10px monospace';
            ctx.fillText(`AI: ${game.aiTank.health}HP`, 
                game.aiTank.x * game.maze.cellSize, 
                game.aiTank.y * game.maze.cellSize - 15);
        }
    }
}

// Initialize additional systems after game loads
setTimeout(() => {
    if (game) {
        // Initialize keyboard controls
        const keyboardControls = new KeyboardControls(game);
        
        // Initialize performance monitor
        const performanceMonitor = new PerformanceMonitor();
        
        // Initialize debug tools
        const debugTools = new DebugTools(game);
        
        // Add save/load buttons to UI
        const saveLoadContainer = document.createElement('div');
        saveLoadContainer.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            display: flex;
            gap: 10px;
            z-index: 1000;
        `;
        
        saveLoadContainer.innerHTML = `
            <button onclick="SaveSystem.saveGame()" style="
                padding: 8px 12px;
                background: linear-gradient(145deg, #e94560, #c44569);
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            ">Save</button>
            <button onclick="SaveSystem.loadGame()" style="
                padding: 8px 12px;
                background: #333;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            ">Load</button>
        `;
        
        document.body.appendChild(saveLoadContainer);
        
        // Show controls help
        setTimeout(() => {
            ui.showNotification('Press F12 for debug tools', 'info', 3000);
        }, 2000);
    }
}, 1000);

// Export for global access
window.game = game;
window.ui = ui;
window.equipment = equipment;
window.SaveSystem = SaveSystem;
