class Maze {
    constructor(width, height, level) {
        this.width = width;
        this.height = height;
        this.level = level;
        this.grid = [];
        this.cellSize = 40; // pixels per cell
        
        this.generate();
    }
    
    generate() {
        // Initialize grid with walls
        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = 1; // 1 = wall, 0 = path
            }
        }
        
        // Generate maze using recursive backtracking
        this.generateMaze(1, 1);
        
        // Add some random walls based on level difficulty
        this.addRandomWalls();
        
        // Ensure start and end areas are clear
        this.clearStartEndAreas();
    }
    
    generateMaze(x, y) {
        this.grid[y][x] = 0; // Mark current cell as path
        
        const directions = [
            [0, -2], // North
            [2, 0],  // East
            [0, 2],  // South
            [-2, 0]  // West
        ];
        
        // Shuffle directions
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            
            if (this.isValidCell(newX, newY) && this.grid[newY][newX] === 1) {
                // Carve path through wall
                this.grid[y + dy/2][x + dx/2] = 0;
                this.generateMaze(newX, newY);
            }
        }
    }
    
    isValidCell(x, y) {
        return x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1;
    }
    
    addRandomWalls() {
        // Add very few walls based on level difficulty - target ~15% total walls
        const wallDensity = Math.min(0.01 + (this.level - 1) * 0.002, 0.04);
        const numWalls = Math.floor(this.width * this.height * wallDensity);
        
        for (let i = 0; i < numWalls; i++) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            
            // Don't block start/end areas
            if (!this.isStartEndArea(x, y)) {
                this.grid[y][x] = 1;
            }
        }
    }
    
    isStartEndArea(x, y) {
        // Start area (top-left)
        if (x <= 2 && y <= 2) return true;
        
        // End area (bottom-right)
        if (x >= this.width - 3 && y >= this.height - 3) return true;
        
        return false;
    }
    
    clearStartEndAreas() {
        // Clear 3x3 areas at start and end
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                this.grid[y][x] = 0;
                this.grid[this.height - 1 - y][this.width - 1 - x] = 0;
            }
        }
    }
    
    isWall(x, y) {
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return true; // Out of bounds counts as wall
        }
        
        return this.grid[gridY][gridX] === 1;
    }
    
    isValidPosition(x, y, game = null) {
        // Check if position is a wall
        if (this.isWall(x, y)) {
            return false;
        }
        
        // Check if position is occupied by a tank (if game is provided)
        if (game && game.playerTank && game.aiTank) {
            const gridX = Math.floor(x);
            const gridY = Math.floor(y);
            
            // Check if player tank is at this position
            const playerGridX = Math.floor(game.playerTank.x);
            const playerGridY = Math.floor(game.playerTank.y);
            if (gridX === playerGridX && gridY === playerGridY) {
                return false;
            }
            
            // Check if AI tank is at this position
            const aiGridX = Math.floor(game.aiTank.x);
            const aiGridY = Math.floor(game.aiTank.y);
            if (gridX === aiGridX && gridY === aiGridY) {
                return false;
            }
        }
        
        return true;
    }
    
    destroyWall(x, y) {
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        
        if (gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height) {
            this.grid[gridY][gridX] = 0;
        }
    }
    
    render(ctx) {
        // Calculate offset to center the maze in the canvas
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const mazeWidth = this.width * this.cellSize;
        const mazeHeight = this.height * this.cellSize;
        const offsetX = (canvasWidth - mazeWidth) / 2;
        const offsetY = (canvasHeight - mazeHeight) / 2;
        
        // Render maze grid
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cellX = offsetX + x * this.cellSize;
                const cellY = offsetY + y * this.cellSize;
                
                if (this.grid[y][x] === 1) {
                    // Render wall with enhanced visuals
                    const wallGradient = ctx.createLinearGradient(cellX, cellY, cellX + this.cellSize, cellY + this.cellSize);
                    wallGradient.addColorStop(0, '#666');
                    wallGradient.addColorStop(0.3, '#888');
                    wallGradient.addColorStop(0.7, '#555');
                    wallGradient.addColorStop(1, '#333');
                    
                    ctx.fillStyle = wallGradient;
                    ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                    
                    // Add wall texture (brick pattern)
                    ctx.strokeStyle = '#444';
                    ctx.lineWidth = 1;
                    
                    // Horizontal brick lines
                    for (let i = 1; i < 4; i++) {
                        const y = cellY + (i * this.cellSize / 4);
                        ctx.beginPath();
                        ctx.moveTo(cellX, y);
                        ctx.lineTo(cellX + this.cellSize, y);
                        ctx.stroke();
                    }
                    
                    // Vertical brick lines (staggered)
                    for (let i = 0; i < 4; i++) {
                        const x = cellX + (i * this.cellSize / 4);
                        const startY = cellY + (i % 2 === 0 ? 0 : this.cellSize / 8);
                        const endY = cellY + this.cellSize - (i % 2 === 0 ? this.cellSize / 8 : 0);
                        
                        ctx.beginPath();
                        ctx.moveTo(x, startY);
                        ctx.lineTo(x, endY);
                        ctx.stroke();
                    }
                    
                    // Add wall highlight
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize / 4);
                    
                    // Add wall shadow
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.fillRect(cellX, cellY + this.cellSize * 0.75, this.cellSize, this.cellSize / 4);
                    
                    // Add wall outline with glow
                    ctx.strokeStyle = '#e94560';
                    ctx.lineWidth = 2;
                    ctx.shadowColor = '#e94560';
                    ctx.shadowBlur = 3;
                    ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
                    ctx.shadowBlur = 0;
                    
                } else {
                    // Render floor with enhanced visuals
                    const floorGradient = ctx.createRadialGradient(
                        cellX + this.cellSize/2, cellY + this.cellSize/2, 0,
                        cellX + this.cellSize/2, cellY + this.cellSize/2, this.cellSize/2
                    );
                    floorGradient.addColorStop(0, '#2a2a2a');
                    floorGradient.addColorStop(1, '#1a1a1a');
                    
                    ctx.fillStyle = floorGradient;
                    ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                    
                    // Add subtle floor texture
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
                    
                    // Add subtle floor pattern
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
                    ctx.fillRect(cellX + 2, cellY + 2, this.cellSize - 4, this.cellSize - 4);
                }
            }
        }
        
        // Add some visual effects based on level
        this.renderLevelEffects(ctx, offsetX, offsetY);
    }
    
    renderLevelEffects(ctx, offsetX, offsetY) {
        // Add level-specific visual effects
        if (this.level > 5) {
            // Add some hazard zones
            this.renderHazardZones(ctx, offsetX, offsetY);
        }
        
        if (this.level > 10) {
            // Add some power-up zones
            this.renderPowerUpZones(ctx, offsetX, offsetY);
        }
    }
    
    renderHazardZones(ctx, offsetX, offsetY) {
        // Add some dangerous areas
        const numHazards = Math.floor(this.level / 3);
        
        for (let i = 0; i < numHazards; i++) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            
            if (this.grid[y][x] === 0 && !this.isStartEndArea(x, y)) {
                const cellX = offsetX + x * this.cellSize;
                const cellY = offsetY + y * this.cellSize;
                
                // Render hazard zone
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Add hazard symbol
                ctx.fillStyle = '#ff0000';
                ctx.font = '20px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('☠', cellX + this.cellSize/2, cellY + this.cellSize/2 + 5);
            }
        }
    }
    
    renderPowerUpZones(ctx, offsetX, offsetY) {
        // Add some power-up areas
        const numPowerUps = Math.floor(this.level / 5);
        
        for (let i = 0; i < numPowerUps; i++) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            
            if (this.grid[y][x] === 0 && !this.isStartEndArea(x, y)) {
                const cellX = offsetX + x * this.cellSize;
                const cellY = offsetY + y * this.cellSize;
                
                // Render power-up zone
                ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Add power-up symbol
                ctx.fillStyle = '#00ffff';
                ctx.font = '20px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('⚡', cellX + this.cellSize/2, cellY + this.cellSize/2 + 5);
            }
        }
    }
    
    // Helper method to get a random valid position
    getRandomValidPosition() {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            const x = Math.random() * (this.width - 2) + 1;
            const y = Math.random() * (this.height - 2) + 1;
            
            if (this.isValidPosition(x, y)) {
                return { x, y };
            }
            
            attempts++;
        }
        
        // Fallback to start position
        return { x: 1, y: 1 };
    }
    
    // Helper method to check if a path exists between two points
    hasPath(startX, startY, endX, endY) {
        // Simple line-of-sight check
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 1) return true;
        
        const steps = Math.ceil(distance * 2);
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = startX + dx * t;
            const y = startY + dy * t;
            
            if (this.isWall(x, y)) {
                return false;
            }
        }
        
        return true;
    }
}
