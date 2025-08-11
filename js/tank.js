class Tank {
    constructor(x, y, angle, owner, maze) {
        this.x = x;
        this.y = y;
        this.angle = angle; // degrees
        this.owner = owner; // 'player' or 'ai'
        this.maze = maze;
        
        // Health system
        this.maxHealth = 3;
        this.health = this.maxHealth;
        
        // Equipment
        this.equipment = {
            weapon: {
                name: 'Basic Cannon',
                damage: 1,
                range: 5,
                canShootOverWalls: false,
                canDestroyWalls: true
            },
            armor: null
        };
        
        // Visual properties
        this.size = 0.8; // tank size relative to cell
        this.color = owner === 'player' ? '#00ff00' : '#ff0000';
        this.turretColor = owner === 'player' ? '#008800' : '#880000';
        
        // Animation properties
        this.targetX = x;
        this.targetY = y;
        this.targetAngle = angle;
        this.moveSpeed = 0.05; // Slower movement for better visibility
        this.rotateSpeed = 3; // Slower rotation for better visibility
        
        // Status effects
        this.stunned = false;
        this.stunDuration = 0;
        
        // Teleport flag
        this.isTeleporting = false;
    }
    
    update(deltaTime) {
        // Update movement animation
        this.updateMovement(deltaTime);
        
        // Update status effects
        this.updateStatusEffects(deltaTime);
    }
    
    updateMovement(deltaTime) {
        // Skip movement if teleporting
        if (this.isTeleporting) {
            return;
        }
        
        // Smooth movement towards target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.01) {
            const moveAmount = this.moveSpeed * deltaTime;
            const moveRatio = Math.min(moveAmount / distance, 1);
            
            this.x += dx * moveRatio;
            this.y += dy * moveRatio;
        } else {
            // Snap to target if very close to avoid floating point issues
            this.x = this.targetX;
            this.y = this.targetY;
        }
        
        // Smooth rotation towards target
        let angleDiff = this.targetAngle - this.angle;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        
        if (Math.abs(angleDiff) > 1) {
            const rotateAmount = this.rotateSpeed * deltaTime;
            const rotateDirection = angleDiff > 0 ? 1 : -1;
            const actualRotation = Math.min(Math.abs(angleDiff), rotateAmount) * rotateDirection;
            
            this.angle += actualRotation;
            this.angle = (this.angle + 360) % 360;
        }
    }
    
    updateStatusEffects(deltaTime) {
        if (this.stunned) {
            this.stunDuration -= deltaTime;
            if (this.stunDuration <= 0) {
                this.stunned = false;
            }
        }
    }
    
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
    }
    
    rotateTo(angle) {
        this.targetAngle = angle;
    }
    
    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        
        // Visual feedback
        this.flashRed();
        
        // Check for stun effect
        if (this.health <= 1) {
            this.stunned = true;
            this.stunDuration = 2000; // 2 seconds
        }
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    isAlive() {
        return this.health > 0;
    }
    
    flashRed() {
        // Visual feedback for taking damage
        this.originalColor = this.color;
        this.color = '#ffffff';
        
        setTimeout(() => {
            this.color = this.originalColor;
        }, 100);
    }
    
    render(ctx) {
        if (!this.isAlive()) return;
        
        // Calculate maze offset to center the maze in the canvas
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const mazeWidth = this.maze.width * this.maze.cellSize;
        const mazeHeight = this.maze.height * this.maze.cellSize;
        const offsetX = (canvasWidth - mazeWidth) / 2;
        const offsetY = (canvasHeight - mazeHeight) / 2;
        
        // Calculate the center of the cell the tank is in, accounting for maze offset
        const centerX = offsetX + (this.x + 0.5) * this.maze.cellSize;
        const centerY = offsetY + (this.y + 0.5) * this.maze.cellSize;
        const radius = (this.maze.cellSize * this.size) / 2;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.angle * Math.PI / 180);
        
        // Draw tank body
        ctx.fillStyle = this.color;
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
        
        // Draw tank outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
        
        // Draw turret
        ctx.fillStyle = this.turretColor;
        const turretSize = radius * 0.6;
        ctx.fillRect(-turretSize/2, -turretSize/2, turretSize, turretSize);
        
        // Draw cannon
        ctx.fillStyle = '#333';
        ctx.fillRect(0, -radius * 0.1, radius * 0.8, radius * 0.2);
        
        // Draw tank details
        this.drawTankDetails(ctx, radius);
        
        ctx.restore();
        
        // Draw stun effect
        if (this.stunned) {
            this.drawStunEffect(ctx, centerX, centerY, radius);
        }
        
        // Draw health indicator
        this.drawHealthIndicator(ctx, centerX, centerY, radius);
    }
    
    drawTankDetails(ctx, radius) {
        // Draw tank tracks
        ctx.fillStyle = '#000';
        ctx.fillRect(-radius, -radius * 0.9, radius * 2, radius * 0.1);
        ctx.fillRect(-radius, radius * 0.8, radius * 2, radius * 0.1);
        
        // Draw tank identification
        ctx.fillStyle = '#fff';
        ctx.font = `${radius * 0.4}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.owner === 'player' ? 'P' : 'E', 0, 0);
    }
    
    drawStunEffect(ctx, centerX, centerY, radius) {
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Draw stun stars
        ctx.fillStyle = '#ffff00';
        ctx.font = `${radius * 0.6}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const time = Date.now() * 0.01;
        const numStars = 4;
        
        for (let i = 0; i < numStars; i++) {
            const angle = (i / numStars) * Math.PI * 2 + time;
            const x = Math.cos(angle) * radius * 1.5;
            const y = Math.sin(angle) * radius * 1.5;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(time * 2);
            ctx.fillText('★', 0, 0);
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    drawHealthIndicator(ctx, centerX, centerY, radius) {
        const barWidth = radius * 2;
        const barHeight = radius * 0.2;
        const barY = centerY - radius - barHeight - 5;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(centerX - barWidth/2, barY, barWidth, barHeight);
        
        // Health bar
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(centerX - barWidth/2, barY, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX - barWidth/2, barY, barWidth, barHeight);
        
        // Health text
        ctx.fillStyle = '#fff';
        ctx.font = `${radius * 0.3}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.health}/${this.maxHealth}`, centerX, barY + barHeight/2);
    }
    
    // Equipment methods
    equipWeapon(weapon) {
        this.equipment.weapon = weapon;
    }
    
    equipArmor(armor) {
        this.equipment.armor = armor;
        this.maxHealth += armor.healthBonus;
        this.health += armor.healthBonus;
    }
    
    // Utility methods
    getDistanceTo(otherTank) {
        const dx = this.x - otherTank.x;
        const dy = this.y - otherTank.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    getAngleTo(otherTank) {
        const dx = otherTank.x - this.x;
        const dy = otherTank.y - this.y;
        return (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    }
    
    canSee(otherTank) {
        return this.maze.hasPath(this.x, this.y, otherTank.x, otherTank.y);
    }
    
    isInRange(otherTank) {
        const distance = this.getDistanceTo(otherTank);
        return distance <= this.equipment.weapon.range;
    }
    
    // AI helper methods
    getBestMoveTowards(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 0.1) return null;
        
        const moveX = this.x + (dx / distance) * 0.5;
        const moveY = this.y + (dy / distance) * 0.5;
        
        if (this.maze.isValidPosition(moveX, moveY)) {
            return { x: moveX, y: moveY };
        }
        
        return null;
    }
    
    getBestAngleTowards(targetX, targetY) {
        return this.getAngleTo({ x: targetX, y: targetY });
    }
    
    // Serialization for save/load
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            angle: this.angle,
            owner: this.owner,
            health: this.health,
            maxHealth: this.maxHealth,
            equipment: this.equipment
        };
    }
    
    fromJSON(data) {
        this.x = data.x;
        this.y = data.y;
        this.angle = data.angle;
        this.owner = data.owner;
        this.health = data.health;
        this.maxHealth = data.maxHealth;
        this.equipment = data.equipment;
        
        // Update targets to current position
        this.targetX = this.x;
        this.targetY = this.y;
        this.targetAngle = this.angle;
    }
}
