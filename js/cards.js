class Projectile {
    constructor(x, y, angle, damage, range, owner) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.damage = damage;
        this.range = range;
        this.owner = owner;
        
        // Movement - move one square at a time
        this.speed = 1; // 1 square per movement
        this.distanceTraveled = 0;
        this.moveTimer = 0;
        this.moveInterval = 200; // Move every 200ms (faster for better collision detection)
        
        // Visual properties
        this.size = 3;
        this.color = owner === 'player' ? '#00ffff' : '#ff00ff';
        this.trail = [];
        this.maxTrailLength = 5;
        
        // Special properties
        this.canDestroyWalls = damage >= 1; // Allow basic cannon to destroy walls
        this.canShootOverWalls = false;
    }
    
    update(deltaTime) {
        this.moveTimer += deltaTime;
        
        // Move one square at a time
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            
            // Calculate next grid position
            const dx = Math.cos(this.angle * Math.PI / 180) * this.speed;
            const dy = Math.sin(this.angle * Math.PI / 180) * this.speed;
            
            // Update position
            this.x += dx;
            this.y += dy;
            this.distanceTraveled += this.speed;
            
            // Debug: Log projectile position
            if (this.owner === 'player') {
                console.log(`Projectile position: (${this.x.toFixed(2)}, ${this.y.toFixed(2)})`);
            }
            
            // Update trail
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        }
    }
    
    render(ctx) {
        // Calculate maze offset to center the maze in the canvas
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const mazeWidth = this.maze ? this.maze.width * this.maze.cellSize : 20 * 40;
        const mazeHeight = this.maze ? this.maze.height * this.maze.cellSize : 20 * 40;
        const offsetX = (canvasWidth - mazeWidth) / 2;
        const offsetY = (canvasHeight - mazeHeight) / 2;
        
        // Draw trail
        this.trail.forEach((pos, index) => {
            const alpha = index / this.trail.length;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.fillRect(
                offsetX + pos.x * 40 + 20 - this.size/2, // Center in grid cell
                offsetY + pos.y * 40 + 20 - this.size/2, // Center in grid cell
                this.size,
                this.size
            );
        });
        
        // Draw projectile
        ctx.fillStyle = this.color;
        ctx.fillRect(
            offsetX + this.x * 40 + 20 - this.size/2, // Center in grid cell
            offsetY + this.y * 40 + 20 - this.size/2, // Center in grid cell
            this.size,
            this.size
        );
        
        // Draw glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(
            offsetX + this.x * 40 + 20 - this.size/2,
            offsetY + this.y * 40 + 20 - this.size/2,
            this.size,
            this.size
        );
        ctx.shadowBlur = 0;
    }
}

class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.maxRadius = 20;
        this.currentRadius = 0;
        this.duration = 500; // milliseconds
        this.startTime = Date.now();
        this.particles = [];
        
        // Create explosion particles
        this.createParticles();
    }
    
    createParticles() {
        const numParticles = 12;
        for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2;
            const speed = 0.1 + Math.random() * 0.2;
            
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03
            });
        }
    }
    
    update(deltaTime) {
        const elapsed = Date.now() - this.startTime;
        const progress = elapsed / this.duration;
        
        // Update explosion radius
        this.currentRadius = this.maxRadius * Math.sin(progress * Math.PI);
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= particle.decay * deltaTime;
        });
        
        // Remove dead particles
        this.particles = this.particles.filter(particle => particle.life > 0);
    }
    
    isFinished() {
        return Date.now() - this.startTime > this.duration;
    }
    
    render(ctx) {
        // Calculate maze offset to center the maze in the canvas
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const mazeWidth = this.maze ? this.maze.width * this.maze.cellSize : 20 * 40;
        const mazeHeight = this.maze ? this.maze.height * this.maze.cellSize : 20 * 40;
        const offsetX = (canvasWidth - mazeWidth) / 2;
        const offsetY = (canvasHeight - mazeHeight) / 2;
        
        const centerX = offsetX + this.x * 40 + 20; // Center in grid cell
        const centerY = offsetY + this.y * 40 + 20; // Center in grid cell
        
        // Draw explosion circle
        const elapsed = Date.now() - this.startTime;
        const progress = elapsed / this.duration;
        const alpha = 1 - progress;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Draw main explosion
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, this.currentRadius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw explosion particles
        this.particles.forEach(particle => {
            const particleX = centerX + particle.x;
            const particleY = centerY + particle.y;
            
            ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.8})`;
            ctx.fillRect(particleX - 2, particleY - 2, 4, 4);
        });
        
        ctx.restore();
    }
}

// Card system classes
class Card {
    constructor(type, name, description) {
        this.type = type;
        this.name = name;
        this.description = description;
        this.id = Math.random().toString(36).substr(2, 9);
    }
    
    execute(tank, game) {
        // Override in subclasses
    }
}

class MoveCard extends Card {
    constructor(direction, steps) {
        const name = `Move ${direction} ${steps}`;
        const description = `Move ${steps} steps ${direction}`;
        super('move', name, description);
        
        this.direction = direction;
        this.steps = steps;
    }
    
    execute(tank, game) {
        const direction = this.direction === 'forward' ? 1 : -1;
        
        for (let i = 0; i < this.steps; i++) {
            const newX = tank.x + Math.cos(tank.angle * Math.PI / 180) * direction;
            const newY = tank.y + Math.sin(tank.angle * Math.PI / 180) * direction;
            
            if (game.maze.isValidPosition(newX, newY)) {
                tank.moveTo(newX, newY);
            } else {
                break; // Stop if we hit a wall
            }
        }
    }
}

class TurnCard extends Card {
    constructor(direction) {
        const name = `Turn ${direction}`;
        const description = `Turn ${direction}`;
        super('turn', name, description);
        
        this.direction = direction;
    }
    
    execute(tank, game) {
        const angleChange = this.direction === 'left' ? -90 : 90;
        tank.rotateTo((tank.angle + angleChange + 360) % 360);
    }
}

class FireCard extends Card {
    constructor() {
        super('fire', 'Fire Weapon', 'Fire your equipped weapon');
    }
    
    execute(tank, game) {
        const weapon = tank.equipment.weapon;
        
        console.log('FireCard execute - weapon:', weapon);
        console.log('Weapon canDestroyWalls:', weapon.canDestroyWalls);
        console.log('Weapon damage:', weapon.damage);
        
        // Calculate the position one square ahead of the tank in the cannon direction
        const startX = tank.x + Math.cos(tank.angle * Math.PI / 180);
        const startY = tank.y + Math.sin(tank.angle * Math.PI / 180);
        
        const projectile = new Projectile(
            startX,
            startY,
            tank.angle,
            weapon.damage,
            weapon.range,
            tank.owner
        );
        
        console.log('Projectile canDestroyWalls before weapon copy:', projectile.canDestroyWalls);
        
        // Copy weapon properties
        projectile.canDestroyWalls = weapon.canDestroyWalls || false;
        projectile.canShootOverWalls = weapon.canShootOverWalls || false;
        
        console.log('Projectile canDestroyWalls after weapon copy:', projectile.canDestroyWalls);
        
        // Pass maze reference to projectile
        projectile.maze = game.maze;
        
        console.log('=== PROJECTILE CREATED ===');
        console.log('Projectile created at:', startX, startY);
        console.log('Projectile angle:', tank.angle);
        console.log('Projectile canDestroyWalls:', projectile.canDestroyWalls);
        console.log('Projectile damage:', projectile.damage);
        game.projectiles.push(projectile);
    }
}

class TeleportCard extends Card {
    constructor() {
        super('teleport', 'Teleport', 'Teleport to a random position near the enemy tank');
    }
    
    execute(tank, game) {
        // Find valid teleport positions around the AI tank
        const validPositions = game.findValidTeleportPositions();
        
        if (validPositions.length > 0) {
            // Pick a random valid position
            const targetPosition = validPositions[Math.floor(Math.random() * validPositions.length)];
            
            // Teleport the tank directly
            tank.x = targetPosition.x;
            tank.y = targetPosition.y;
            tank.targetX = targetPosition.x;
            tank.targetY = targetPosition.y;
            
            console.log(`Teleporting ${tank.owner} to:`, targetPosition.x, targetPosition.y);
        } else {
            console.log('No valid teleport positions found');
        }
    }
}

// Card factory
class CardFactory {
    static createCard(type, ...args) {
        switch (type) {
            case 'move':
                return new MoveCard(args[0], args[1]);
            case 'turn':
                return new TurnCard(args[0]);
            case 'fire':
                return new FireCard();
            case 'teleport':
                return new TeleportCard();
            default:
                throw new Error(`Unknown card type: ${type}`);
        }
    }
    
    static createRandomCard() {
        const cardTypes = [
            ['move', 'forward', 1],
            ['move', 'forward', 2],
            ['move', 'forward', 3],
            ['move', 'backward', 1],
            ['move', 'backward', 2],
            ['turn', 'left'],
            ['turn', 'right'],
            ['fire']
        ];
        
        const randomType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
        return this.createCard(...randomType);
    }
    
    static createDeck(size = 6) {
        const deck = [];
        for (let i = 0; i < size; i++) {
            deck.push(this.createRandomCard());
        }
        return deck;
    }
}
