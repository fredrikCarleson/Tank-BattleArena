class AI {
    constructor(tank, game, difficulty = 'easy') {
        this.tank = tank;
        this.game = game;
        this.difficulty = difficulty;
        this.targetTank = null;
        this.lastKnownPlayerPosition = null;
        this.memory = [];
        this.maxMemory = 10;
        
        // AI behavior parameters based on difficulty
        this.behaviorParams = this.getBehaviorParams();
    }
    
    getBehaviorParams() {
        const params = {
            easy: {
                reactionTime: 2000,
                accuracy: 0.3,
                aggressiveness: 0.4,
                memoryDecay: 0.1,
                pathfindingQuality: 0.5
            },
            medium: {
                reactionTime: 1500,
                accuracy: 0.6,
                aggressiveness: 0.7,
                memoryDecay: 0.05,
                pathfindingQuality: 0.8
            },
            hard: {
                reactionTime: 1000,
                accuracy: 0.9,
                aggressiveness: 0.9,
                memoryDecay: 0.02,
                pathfindingQuality: 1.0
            }
        };
        
        return params[this.difficulty] || params.easy;
    }
    
    update() {
        // Update memory
        this.updateMemory();
        
        // Find target if not set
        if (!this.targetTank) {
            this.findTarget();
        }
        
        // Update last known position
        if (this.targetTank && this.canSeeTarget()) {
            this.lastKnownPlayerPosition = { x: this.targetTank.x, y: this.targetTank.y };
        }
    }
    
    findTarget() {
        // Find the player tank
        this.targetTank = this.game.playerTank;
    }
    
    canSeeTarget() {
        if (!this.targetTank) return false;
        return this.tank.canSee(this.targetTank);
    }
    
    updateMemory() {
        // Add current situation to memory
        const situation = {
            playerPosition: this.targetTank ? { x: this.targetTank.x, y: this.targetTank.y } : null,
            playerHealth: this.targetTank ? this.targetTank.health : null,
            myHealth: this.tank.health,
            myPosition: { x: this.tank.x, y: this.tank.y },
            timestamp: Date.now()
        };
        
        this.memory.push(situation);
        
        // Limit memory size
        if (this.memory.length > this.maxMemory) {
            this.memory.shift();
        }
        
        // Apply memory decay
        this.memory = this.memory.filter(situation => {
            const age = Date.now() - situation.timestamp;
            return age < 10000; // Keep memories for 10 seconds
        });
    }
    
    selectCards(cards) {
        const selectedCards = [];
        const availableCards = [...cards];
        
        // AI strategy based on difficulty
        const strategy = this.determineStrategy();
        
        for (let i = 0; i < 4; i++) {
            const bestCard = this.selectBestCard(availableCards, strategy, i);
            if (bestCard) {
                selectedCards.push(bestCard);
                availableCards.splice(availableCards.indexOf(bestCard), 1);
            }
        }
        
        return selectedCards;
    }
    
    determineStrategy() {
        if (!this.targetTank) {
            return 'explore';
        }
        
        const distance = this.tank.getDistanceTo(this.targetTank);
        const canSee = this.canSeeTarget();
        const myHealth = this.tank.health;
        const targetHealth = this.targetTank.health;
        
        // Health-based strategy
        if (myHealth <= 1) {
            return 'retreat';
        }
        
        // Distance-based strategy
        if (distance > this.tank.equipment.weapon.range * 1.5) {
            return 'approach';
        }
        
        // Combat strategy
        if (canSee && distance <= this.tank.equipment.weapon.range) {
            if (targetHealth <= 1) {
                return 'finish';
            } else {
                return 'attack';
            }
        }
        
        // Default strategy
        return 'explore';
    }
    
    selectBestCard(cards, strategy, position) {
        const cardScores = cards.map(card => ({
            card: card,
            score: this.evaluateCard(card, strategy, position)
        }));
        
        // Sort by score and add some randomness based on difficulty
        cardScores.sort((a, b) => b.score - a.score);
        
        // Add randomness for lower difficulties
        const randomFactor = 1 - this.behaviorParams.accuracy;
        const randomIndex = Math.floor(Math.random() * Math.min(cards.length, 3));
        
        if (Math.random() < randomFactor) {
            return cardScores[randomIndex].card;
        }
        
        return cardScores[0].card;
    }
    
    evaluateCard(card, strategy, position) {
        let score = 0;
        
        switch (strategy) {
            case 'attack':
                score = this.evaluateAttackCard(card);
                break;
            case 'approach':
                score = this.evaluateApproachCard(card);
                break;
            case 'retreat':
                score = this.evaluateRetreatCard(card);
                break;
            case 'finish':
                score = this.evaluateFinishCard(card);
                break;
            case 'explore':
                score = this.evaluateExploreCard(card);
                break;
        }
        
        // Position-based adjustments
        score += this.evaluateCardPosition(card, position);
        
        return score;
    }
    
    evaluateAttackCard(card) {
        let score = 0;
        
        if (card.type === 'fire') {
            score += 100; // High priority for firing
        } else if (card.type === 'turn') {
            // Turn towards target
            if (this.targetTank) {
                const targetAngle = this.tank.getAngleTo(this.targetTank);
                const angleDiff = Math.abs(this.tank.angle - targetAngle);
                if (angleDiff > 45) {
                    score += 50;
                }
            }
        } else if (card.type === 'move') {
            // Move to maintain optimal range
            const distance = this.tank.getDistanceTo(this.targetTank);
            const optimalRange = this.tank.equipment.weapon.range * 0.8;
            
            if (distance < optimalRange && card.direction === 'backward') {
                score += 30;
            } else if (distance > optimalRange && card.direction === 'forward') {
                score += 30;
            }
        }
        
        return score;
    }
    
    evaluateApproachCard(card) {
        let score = 0;
        
        if (card.type === 'move' && card.direction === 'forward') {
            score += 80;
        } else if (card.type === 'turn') {
            // Turn towards target
            if (this.targetTank) {
                const targetAngle = this.tank.getAngleTo(this.targetTank);
                const angleDiff = Math.abs(this.tank.angle - targetAngle);
                if (angleDiff > 45) {
                    score += 60;
                }
            }
        } else if (card.type === 'fire') {
            score += 20; // Low priority for firing when approaching
        }
        
        return score;
    }
    
    evaluateRetreatCard(card) {
        let score = 0;
        
        if (card.type === 'move' && card.direction === 'backward') {
            score += 100;
        } else if (card.type === 'move' && card.direction === 'forward') {
            score -= 50; // Avoid moving forward when retreating
        } else if (card.type === 'turn') {
            // Turn away from target
            if (this.targetTank) {
                const targetAngle = this.tank.getAngleTo(this.targetTank);
                const angleDiff = Math.abs(this.tank.angle - targetAngle);
                if (angleDiff < 45) {
                    score += 40;
                }
            }
        }
        
        return score;
    }
    
    evaluateFinishCard(card) {
        let score = 0;
        
        if (card.type === 'fire') {
            score += 150; // Very high priority for finishing
        } else if (card.type === 'turn') {
            // Turn towards target
            if (this.targetTank) {
                const targetAngle = this.tank.getAngleTo(this.targetTank);
                const angleDiff = Math.abs(this.tank.angle - targetAngle);
                if (angleDiff > 45) {
                    score += 80;
                }
            }
        }
        
        return score;
    }
    
    evaluateExploreCard(card) {
        let score = 0;
        
        if (card.type === 'move') {
            score += 60; // Prefer movement when exploring
        } else if (card.type === 'turn') {
            score += 40; // Turn to look around
        } else if (card.type === 'fire') {
            score += 10; // Low priority for firing when exploring
        }
        
        return score;
    }
    
    evaluateCardPosition(card, position) {
        let score = 0;
        
        // Prefer certain cards in certain positions
        if (position === 0) {
            // First card: prefer movement or turning
            if (card.type === 'move' || card.type === 'turn') {
                score += 20;
            }
        } else if (position === 3) {
            // Last card: prefer firing
            if (card.type === 'fire') {
                score += 30;
            }
        }
        
        return score;
    }
    
    // Advanced AI methods for higher difficulties
    predictPlayerMovement() {
        if (this.memory.length < 2) return null;
        
        const recent = this.memory.slice(-2);
        const dx = recent[1].playerPosition.x - recent[0].playerPosition.x;
        const dy = recent[1].playerPosition.y - recent[0].playerPosition.y;
        
        return {
            x: recent[1].playerPosition.x + dx,
            y: recent[1].playerPosition.y + dy
        };
    }
    
    findOptimalPosition() {
        if (!this.targetTank) return null;
        
        // Find position that maximizes line of sight and minimizes exposure
        const positions = this.getNearbyPositions();
        let bestPosition = null;
        let bestScore = -Infinity;
        
        positions.forEach(pos => {
            const score = this.evaluatePosition(pos);
            if (score > bestScore) {
                bestScore = score;
                bestPosition = pos;
            }
        });
        
        return bestPosition;
    }
    
    getNearbyPositions() {
        const positions = [];
        const range = 3;
        
        for (let dx = -range; dx <= range; dx++) {
            for (let dy = -range; dy <= range; dy++) {
                const x = this.tank.x + dx;
                const y = this.tank.y + dy;
                
                if (this.game.maze.isValidPosition(x, y)) {
                    positions.push({ x, y });
                }
            }
        }
        
        return positions;
    }
    
    evaluatePosition(pos) {
        let score = 0;
        
        if (!this.targetTank) return score;
        
        // Distance to target
        const distance = Math.sqrt(
            Math.pow(pos.x - this.targetTank.x, 2) + 
            Math.pow(pos.y - this.targetTank.y, 2)
        );
        
        // Prefer positions within weapon range
        if (distance <= this.tank.equipment.weapon.range) {
            score += 50;
        }
        
        // Prefer positions with line of sight
        if (this.game.maze.hasPath(pos.x, pos.y, this.targetTank.x, this.targetTank.y)) {
            score += 100;
        }
        
        // Avoid positions too close to target (for safety)
        if (distance < 2) {
            score -= 30;
        }
        
        return score;
    }
    
    // Method to change difficulty
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.behaviorParams = this.getBehaviorParams();
    }
}
