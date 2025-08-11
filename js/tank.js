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
        
        // Draw tank shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-radius + 2, -radius + 2, radius * 2, radius * 2);
        
        // Draw tank body with gradient
        const bodyGradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
        bodyGradient.addColorStop(0, this.color);
        bodyGradient.addColorStop(0.7, this.owner === 'player' ? '#00cc00' : '#cc0000');
        bodyGradient.addColorStop(1, this.owner === 'player' ? '#008800' : '#880000');
        
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
        
        // Draw tank body highlight
        ctx.fillStyle = this.owner === 'player' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(-radius, -radius, radius * 2, radius * 0.4);
        
        // Draw tank outline with glow effect
        ctx.strokeStyle = this.owner === 'player' ? '#00ff00' : '#ff0000';
        ctx.lineWidth = 3;
        ctx.shadowColor = this.owner === 'player' ? '#00ff00' : '#ff0000';
        ctx.shadowBlur = 5;
        ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
        ctx.shadowBlur = 0;
        
        // Draw turret with gradient
        const turretGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.6);
        turretGradient.addColorStop(0, this.turretColor);
        turretGradient.addColorStop(1, this.owner === 'player' ? '#006600' : '#660000');
        
        ctx.fillStyle = turretGradient;
        const turretSize = radius * 0.6;
        ctx.fillRect(-turretSize/2, -turretSize/2, turretSize, turretSize);
        
        // Draw turret outline
        ctx.strokeStyle = this.owner === 'player' ? '#00ff00' : '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-turretSize/2, -turretSize/2, turretSize, turretSize);
        
        // Draw cannon with metallic effect
        const cannonGradient = ctx.createLinearGradient(0, -radius * 0.1, radius * 0.8, radius * 0.1);
        cannonGradient.addColorStop(0, '#666');
        cannonGradient.addColorStop(0.5, '#999');
        cannonGradient.addColorStop(1, '#333');
        
        ctx.fillStyle = cannonGradient;
        ctx.fillRect(0, -radius * 0.1, radius * 0.8, radius * 0.2);
        
        // Draw cannon highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(0, -radius * 0.1, radius * 0.8, radius * 0.08);
        
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
        // Draw tank tracks with metallic effect
        const trackGradient = ctx.createLinearGradient(-radius, 0, radius, 0);
        trackGradient.addColorStop(0, '#333');
        trackGradient.addColorStop(0.3, '#666');
        trackGradient.addColorStop(0.7, '#666');
        trackGradient.addColorStop(1, '#333');
        
        ctx.fillStyle = trackGradient;
        ctx.fillRect(-radius, -radius * 0.9, radius * 2, radius * 0.1);
        ctx.fillRect(-radius, radius * 0.8, radius * 2, radius * 0.1);
        
        // Draw track details (rivets)
        ctx.fillStyle = '#000';
        for (let i = 0; i < 6; i++) {
            const x = -radius + (i + 1) * (radius * 2 / 7);
            ctx.beginPath();
            ctx.arc(x, -radius * 0.85, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, radius * 0.85, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw tank identification with glow
        ctx.shadowColor = this.owner === 'player' ? '#00ff00' : '#ff0000';
        ctx.shadowBlur = 3;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${radius * 0.4}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.owner === 'player' ? 'P' : 'E', 0, 0);
        ctx.shadowBlur = 0;
        
        // Draw tank armor plates
        ctx.fillStyle = this.owner === 'player' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(-radius * 0.7, -radius * 0.7, radius * 1.4, radius * 1.4);
        
        // Draw armor plate lines
        ctx.strokeStyle = this.owner === 'player' ? '#00ff00' : '#ff0000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-radius * 0.7, -radius * 0.7, radius * 1.4, radius * 1.4);
    }
    
    drawStunEffect(ctx, centerX, centerY, radius) {
        ctx.save();
        ctx.translate(centerX, centerY);
        
        const time = Date.now() * 0.01;
        const numStars = 6;
        
        // Draw stun stars with enhanced effects
        for (let i = 0; i < numStars; i++) {
            const angle = (i / numStars) * Math.PI * 2 + time;
            const x = Math.cos(angle) * radius * 1.8;
            const y = Math.sin(angle) * radius * 1.8;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(time * 2 + i * 0.5);
            
            // Star glow effect
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#ffff00';
            ctx.font = `bold ${radius * 0.7}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', 0, 0);
            
            // Inner star
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${radius * 0.4}px monospace`;
            ctx.fillText('★', 0, 0);
            
            ctx.restore();
        }
        
        // Draw stun ring
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw pulsing effect
        const pulseSize = 1 + Math.sin(time * 3) * 0.2;
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.4 * pulseSize, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawHealthIndicator(ctx, centerX, centerY, radius) {
        const barWidth = radius * 2;
        const barHeight = radius * 0.2;
        const barY = centerY - radius - barHeight - 5;
        
        // Health bar background with gradient
        const bgGradient = ctx.createLinearGradient(centerX - barWidth/2, barY, centerX + barWidth/2, barY);
        bgGradient.addColorStop(0, '#222');
        bgGradient.addColorStop(0.5, '#333');
        bgGradient.addColorStop(1, '#222');
        
        ctx.fillStyle = bgGradient;
        ctx.fillRect(centerX - barWidth/2, barY, barWidth, barHeight);
        
        // Health bar with gradient
        const healthPercent = this.health / this.maxHealth;
        const healthGradient = ctx.createLinearGradient(centerX - barWidth/2, barY, centerX + barWidth/2, barY);
        
        if (healthPercent > 0.6) {
            healthGradient.addColorStop(0, '#00ff00');
            healthGradient.addColorStop(0.5, '#00cc00');
            healthGradient.addColorStop(1, '#008800');
        } else if (healthPercent > 0.3) {
            healthGradient.addColorStop(0, '#ffff00');
            healthGradient.addColorStop(0.5, '#cccc00');
            healthGradient.addColorStop(1, '#888800');
        } else {
            healthGradient.addColorStop(0, '#ff0000');
            healthGradient.addColorStop(0.5, '#cc0000');
            healthGradient.addColorStop(1, '#880000');
        }
        
        ctx.fillStyle = healthGradient;
        ctx.fillRect(centerX - barWidth/2, barY, barWidth * healthPercent, barHeight);
        
        // Health bar highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(centerX - barWidth/2, barY, barWidth * healthPercent, barHeight / 2);
        
        // Border with glow
        ctx.strokeStyle = this.owner === 'player' ? '#00ff00' : '#ff0000';
        ctx.lineWidth = 2;
        ctx.shadowColor = this.owner === 'player' ? '#00ff00' : '#ff0000';
        ctx.shadowBlur = 3;
        ctx.strokeRect(centerX - barWidth/2, barY, barWidth, barHeight);
        ctx.shadowBlur = 0;
        
        // Health text with glow
        ctx.shadowColor = this.owner === 'player' ? '#00ff00' : '#ff0000';
        ctx.shadowBlur = 2;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${radius * 0.3}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.health}/${this.maxHealth}`, centerX, barY + barHeight/2);
        ctx.shadowBlur = 0;
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
