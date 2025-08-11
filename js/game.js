class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.level = 1;
        this.score = 0;
        this.points = 0;
        this.difficulty = 'easy';
        this.gameState = 'menu'; // menu, playing, gameOver, shop
        this.turnNumber = 0;
        this.maxTurns = 50; // Prevent infinite games
        
        // Game objects
        this.maze = null;
        this.playerTank = null;
        this.aiTank = null;
        this.projectiles = [];
        this.explosions = [];
        
        // Turn system
        this.currentTurn = 0;
        this.turnPhase = 'planning'; // planning, executing, resolving
        this.executionStep = 0;
        this.playerCards = [];
        this.selectedCards = [];
        this.aiCards = [];
        
        // Card execution display
        this.currentCardDisplay = '';
        this.cardDisplayTimer = 0;
        
        // Animation
        this.animationId = null;
        this.lastTime = 0;
        
        this.init();
    }
    
    init() {
        console.log('Game init called');
        this.setupEventListeners();
        // Don't automatically start a new game - let the user click the button
        console.log('Game init complete - waiting for user to start new game');
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Game control buttons
        const newGameBtn = document.getElementById('new-game-btn');
        console.log('New game button found:', newGameBtn);
        
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                console.log('New Game button clicked!');
                this.startNewGame();
            });
        } else {
            console.error('New game button not found!');
        }
        
        document.getElementById('difficulty-btn').addEventListener('click', () => this.toggleDifficulty());
        document.getElementById('shop-btn').addEventListener('click', () => this.openShop());
        document.getElementById('buy-cards-btn').addEventListener('click', () => this.openBuyCards());
        
        // Modal buttons
        document.getElementById('restart-btn').addEventListener('click', () => this.startNewGame());
        document.getElementById('main-menu-btn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('close-shop-btn').addEventListener('click', () => this.closeShop());
        document.getElementById('close-buy-cards-btn').addEventListener('click', () => this.closeBuyCards());
        
        // Play cards button
        const playCardsBtn = document.getElementById('play-cards-btn');
        if (playCardsBtn) {
            playCardsBtn.addEventListener('click', () => {
                try {
                    this.executeTurn();
                } catch (error) {
                    console.error('Error calling executeTurn:', error);
                }
            });
        }
        
        console.log('Event listeners setup complete');
    }
    
    startNewGame() {
        try {
            console.log('startNewGame called!');
            this.level = 1;
            this.score = 0;
            this.points = 0;
            this.turnNumber = 0;
            this.gameState = 'playing';
            this.turnPhase = 'planning';
            this.executionStep = 0;
            
            console.log('Game state reset, updating UI...');
            this.updateUI();
            console.log('Generating level...');
            this.generateLevel();
            console.log('Dealing cards...');
            this.dealCards();
            console.log('Starting game loop...');
            this.startGameLoop();
            
            // Hide modals
            document.getElementById('game-over-modal').classList.add('hidden');
            document.getElementById('shop-modal').classList.add('hidden');
            
            console.log('New game started successfully!');
        } catch (error) {
            console.error('Error in startNewGame:', error);
            alert('Error starting new game: ' + error.message);
        }
    }
    
    generateLevel() {
        // Generate maze based on level
        const mazeSize = Math.min(10 + Math.floor(this.level / 2), 20); // 10x10 to 20x20
        this.maze = new Maze(mazeSize, mazeSize, this.level);
        
        // Place tanks at opposite corners
        const playerStart = { x: 1, y: 1 };
        const aiStart = { x: mazeSize - 2, y: mazeSize - 2 };
        
        this.playerTank = new Tank(playerStart.x, playerStart.y, 0, 'player', this.maze);
        this.aiTank = new Tank(aiStart.x, aiStart.y, 180, 'ai', this.maze);
        
        // Clear projectiles and explosions
        this.projectiles = [];
        this.explosions = [];
    }
    
    dealCards() {
        console.log('dealCards called');
        this.playerCards = this.generateRandomCards(6);
        console.log('Player cards generated:', this.playerCards);
        this.selectedCards = [];
        this.aiCards = this.generateRandomCards(6);
        console.log('AI cards generated:', this.aiCards);
        
        console.log('Calling updateCardUI...');
        this.updateCardUI();
        console.log('updateCardUI completed');
    }
    
    generateRandomCards(count) {
        const cardTypes = [
            { type: 'move', direction: 'forward', steps: 1, name: 'Move Forward 1' },
            { type: 'move', direction: 'forward', steps: 2, name: 'Move Forward 2' },
            { type: 'move', direction: 'backward', steps: 1, name: 'Move Backward 1' },
            { type: 'turn', direction: 'left', name: 'Turn Left' },
            { type: 'turn', direction: 'right', name: 'Turn Right' },
            { type: 'fire', name: 'Fire Weapon' }
        ];
        
        const cards = [];
        
        // Always include these 4 guaranteed cards
        cards.push({ type: 'turn', direction: 'left', name: 'Turn Left', id: 0 });
        cards.push({ type: 'turn', direction: 'right', name: 'Turn Right', id: 1 });
        cards.push({ type: 'move', direction: 'forward', steps: 1, name: 'Move Forward 1', id: 2 });
        cards.push({ type: 'fire', name: 'Fire Weapon', id: 3 });
        
        // Add 2 completely random cards
        for (let i = 4; i < count; i++) {
            const randomCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
            cards.push({ ...randomCard, id: i });
        }
        
        // Shuffle the cards to randomize positions
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        
        return cards;
    }
    
    updateCardUI() {
        console.log('updateCardUI called');
        const cardsContainer = document.getElementById('cards-container');
        const selectedContainer = document.getElementById('selected-cards-container');
        const playButton = document.getElementById('play-cards-btn');
        
        console.log('Cards container found:', cardsContainer);
        console.log('Selected container found:', selectedContainer);
        console.log('Play button found:', playButton);
        console.log('Player cards:', this.playerCards);
        
        // Clear containers
        cardsContainer.innerHTML = '';
        selectedContainer.innerHTML = '';
        
        // Render available cards
        this.playerCards.forEach((card, index) => {
            console.log(`Creating card element for card ${index}:`, card);
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.textContent = card.name;
            cardElement.dataset.index = index;
            
            if (this.selectedCards.includes(index)) {
                cardElement.classList.add('selected');
            }
            
            cardElement.addEventListener('click', () => this.toggleCardSelection(index));
            cardsContainer.appendChild(cardElement);
            console.log(`Card element added to container:`, cardElement);
        });
        
        // Render selected cards
        this.selectedCards.forEach(index => {
            const cardElement = document.createElement('div');
            cardElement.className = 'selected-card';
            cardElement.textContent = this.playerCards[index].name;
            selectedContainer.appendChild(cardElement);
        });
        
        // Update selected count
        document.querySelector('#selected-cards h4').textContent = `Selected Cards (${this.selectedCards.length}/4)`;
        
        // Enable/disable play button
        const shouldBeDisabled = this.selectedCards.length !== 4;
        playButton.disabled = shouldBeDisabled;
        console.log(`Play button state updated - selected: ${this.selectedCards.length}/4, disabled: ${shouldBeDisabled}`);
        console.log('updateCardUI completed');
    }
    
    toggleCardSelection(index) {
        const cardIndex = this.selectedCards.indexOf(index);
        
        if (cardIndex === -1 && this.selectedCards.length < 4) {
            this.selectedCards.push(index);
        } else if (cardIndex !== -1) {
            this.selectedCards.splice(cardIndex, 1);
        }
        
        this.updateCardUI();
    }
    
    executeTurn() {
        try {
            if (this.selectedCards.length !== 4) {
                return;
            }
            
            this.turnPhase = 'executing';
            this.executionStep = 0;
            
            // AI selects 4 random cards
            this.aiCards = this.aiCards.sort(() => Math.random() - 0.5).slice(0, 4);
            
            // Execute cards one by one
            this.executeNextCard();
        } catch (error) {
            console.error('Error in executeTurn:', error);
        }
    }
    
    executeNextCard() {
        if (this.executionStep >= 4) {
            this.currentCardDisplay = '';
            this.endTurn();
            return;
        }
        
        const playerCard = this.playerCards[this.selectedCards[this.executionStep]];
        const aiCard = this.aiCards[this.executionStep];
        
        // Show which cards are being played
        this.currentCardDisplay = `Playing: ${playerCard.name} vs ${aiCard.name}`;
        this.cardDisplayTimer = 2000; // Show for 2 seconds
        
        // Execute both cards simultaneously
        this.executeCard(this.playerTank, playerCard);
        this.executeCard(this.aiTank, aiCard);
        
        this.executionStep++;
        
        // Wait longer before next card so movement is visible
        setTimeout(() => this.executeNextCard(), 2500);
    }
    
    executeCard(tank, card) {
        switch (card.type) {
            case 'move':
                this.executeMove(tank, card);
                break;
            case 'turn':
                this.applyTankTurn(tank, card);
                break;
            case 'fire':
                this.executeFire(tank);
                break;
            case 'teleport':
                this.executeTeleport(tank);
                break;
        }
    }
    
    executeMove(tank, card) {
        const steps = card.steps;
        const direction = card.direction === 'forward' ? 1 : -1;
        
        let finalX = tank.x;
        let finalY = tank.y;
        
        for (let i = 0; i < steps; i++) {
            const newX = finalX + Math.cos(tank.angle * Math.PI / 180) * direction;
            const newY = finalY + Math.sin(tank.angle * Math.PI / 180) * direction;
            
            if (this.maze.isValidPosition(newX, newY)) {
                finalX = newX;
                finalY = newY;
            } else {
                break; // Stop if we hit a wall
            }
        }
        
        // Set the target position for smooth animation
        tank.moveTo(finalX, finalY);
    }
    
    applyTankTurn(tank, card) {
        const angleChange = card.direction === 'left' ? -90 : 90;
        let newAngle = (tank.angle + angleChange) % 360;
        if (newAngle < 0) newAngle += 360;
        tank.rotateTo(newAngle);
    }
    
    executeFire(tank) {
        const weapon = tank.equipment.weapon;
        
        // Calculate the position one square ahead of the tank in the cannon direction
        const startX = tank.x + Math.cos(tank.angle * Math.PI / 180);
        const startY = tank.y + Math.sin(tank.angle * Math.PI / 180);
        
        // Create projectile at the calculated position
        const projectile = new Projectile(
            startX,
            startY,
            tank.angle,
            weapon.damage,
            weapon.range,
            tank.owner
        );
        
        projectile.maze = this.maze; // Pass maze reference to projectile
        this.projectiles.push(projectile);
    }
    
    executeTeleport(tank) {
        if (tank.owner === 'player') {
            // Find a random position 2 hexes away from AI tank
            const targetPosition = this.findTeleportPosition();
            if (targetPosition) {
                tank.moveTo(targetPosition.x, targetPosition.y);
            }
        }
    }
    
    findTeleportPosition() {
        const aiTank = this.aiTank;
        const attempts = 50; // Try 50 times to find a valid position
        
        for (let i = 0; i < attempts; i++) {
            // Generate a random angle
            const angle = Math.random() * 360;
            const distance = 2; // 2 hexes away
            
            // Calculate position 2 hexes away from AI tank
            const teleportX = aiTank.x + Math.cos(angle * Math.PI / 180) * distance;
            const teleportY = aiTank.y + Math.sin(angle * Math.PI / 180) * distance;
            
            // Check if position is valid (within maze bounds and not a wall)
            if (teleportX >= 0 && teleportX < this.maze.width && 
                teleportY >= 0 && teleportY < this.maze.height &&
                this.maze.isValidPosition(teleportX, teleportY)) {
                
                // Check if position is not occupied by player tank
                const playerGridX = Math.floor(this.playerTank.x);
                const playerGridY = Math.floor(this.playerTank.y);
                const teleportGridX = Math.floor(teleportX);
                const teleportGridY = Math.floor(teleportY);
                
                if (teleportGridX !== playerGridX || teleportGridY !== playerGridY) {
                    return { x: teleportX, y: teleportY };
                }
            }
        }
        
        // If no valid position found, return null
        return null;
    }
    
    endTurn() {
        this.turnNumber++;
        this.turnPhase = 'planning';
        this.executionStep = 0;
        
        // Check for game over conditions
        if (this.checkGameOver()) {
            return;
        }
        
        // Deal new cards
        this.dealCards();
        
        // Check for max turns
        if (this.turnNumber >= this.maxTurns) {
            this.endGame('Time limit reached!');
        }
    }
    
    checkGameOver() {
        // Check if tanks are destroyed
        if (this.playerTank.health <= 0) {
            this.endGame('You were destroyed!');
            return true;
        }
        
        if (this.aiTank.health <= 0) {
            this.calculateScore();
            this.endGame('Victory! You destroyed the enemy tank!');
            return true;
        }
        
        return false;
    }
    
    calculateScore() {
        const baseScore = 1000;
        const turnBonus = Math.max(0, this.maxTurns - this.turnNumber) * 10;
        const levelBonus = this.level * 100;
        
        this.score = baseScore + turnBonus + levelBonus;
        this.points += this.score;
        
        // Level up
        this.level++;
    }
    
    endGame(message) {
        this.gameState = 'gameOver';
        this.stopGameLoop();
        
        document.getElementById('game-over-message').textContent = message;
        document.getElementById('final-stats').innerHTML = `
            <p>Level: ${this.level}</p>
            <p>Score: ${this.score}</p>
            <p>Total Points: ${this.points}</p>
        `;
        
        document.getElementById('game-over-modal').classList.remove('hidden');
    }
    
    toggleDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        const currentIndex = difficulties.indexOf(this.difficulty);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        this.difficulty = difficulties[nextIndex];
        
        document.getElementById('difficulty-btn').textContent = `Difficulty: ${this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1)}`;
    }
    
    openShop() {
        this.gameState = 'shop';
        this.updateShopUI();
        document.getElementById('shop-modal').classList.remove('hidden');
    }
    
    closeShop() {
        this.gameState = 'playing';
        document.getElementById('shop-modal').classList.add('hidden');
    }
    
    openBuyCards() {
        this.gameState = 'buyCards';
        this.updateBuyCardsUI();
        document.getElementById('buy-cards-modal').classList.remove('hidden');
    }
    
    closeBuyCards() {
        this.gameState = 'playing';
        document.getElementById('buy-cards-modal').classList.add('hidden');
    }
    
    updateBuyCardsUI() {
        const buyCardsContainer = document.getElementById('buy-cards-items-modal');
        buyCardsContainer.innerHTML = '';
        
        const buyCardsItems = this.getBuyCardsItems();
        
        buyCardsItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            itemElement.innerHTML = `
                <div class="item-name">${item.name}</div>
                <div class="item-cost">Cost: ${item.cost} points</div>
                <div class="item-description">${item.description}</div>
            `;
            
            if (this.points >= item.cost) {
                itemElement.addEventListener('click', () => this.purchaseCard(item));
            } else {
                itemElement.style.opacity = '0.5';
                itemElement.style.cursor = 'not-allowed';
            }
            
            buyCardsContainer.appendChild(itemElement);
        });
    }
    
    getBuyCardsItems() {
        return [
            {
                name: 'Teleport',
                cost: 100,
                description: 'Teleport to a random position 2 hexes away from enemy tank',
                type: 'teleport'
            }
        ];
    }
    
    purchaseCard(item) {
        if (this.points < item.cost) return;
        
        this.points -= item.cost;
        
        if (item.type === 'teleport') {
            // Add teleport card to current hand
            const teleportCard = {
                type: 'teleport',
                name: 'Teleport',
                id: this.playerCards.length
            };
            this.playerCards.push(teleportCard);
            this.updateCardUI();
        }
        
        this.updateUI();
        this.updateBuyCardsUI();
    }
    
    updateShopUI() {
        const shopContainer = document.getElementById('shop-items-modal');
        shopContainer.innerHTML = '';
        
        const shopItems = this.getShopItems();
        
        shopItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            itemElement.innerHTML = `
                <div class="item-name">${item.name}</div>
                <div class="item-cost">Cost: ${item.cost} points</div>
                <div class="item-description">${item.description}</div>
            `;
            
            if (this.points >= item.cost) {
                itemElement.addEventListener('click', () => this.purchaseItem(item));
            } else {
                itemElement.style.opacity = '0.5';
                itemElement.style.cursor = 'not-allowed';
            }
            
            shopContainer.appendChild(itemElement);
        });
    }
    
    getShopItems() {
        return [
            {
                name: 'Heavy Cannon',
                cost: 500,
                description: 'Deals 2 damage, longer range',
                type: 'weapon',
                damage: 2,
                range: 8
            },
            {
                name: 'Missile Launcher',
                cost: 1000,
                description: 'Deals 3 damage, can shoot over walls',
                type: 'weapon',
                damage: 3,
                range: 10,
                canShootOverWalls: true
            },
            {
                name: 'Light Armor',
                cost: 300,
                description: '+1 health',
                type: 'armor',
                healthBonus: 1
            },
            {
                name: 'Heavy Armor',
                cost: 800,
                description: '+2 health',
                type: 'armor',
                healthBonus: 2
            }
        ];
    }
    
    purchaseItem(item) {
        if (this.points < item.cost) return;
        
        this.points -= item.cost;
        
        if (item.type === 'weapon') {
            this.playerTank.equipment.weapon = item;
        } else if (item.type === 'armor') {
            this.playerTank.health += item.healthBonus;
            this.playerTank.maxHealth += item.healthBonus;
        }
        
        this.updateUI();
        this.updateShopUI();
    }
    
    updateUI() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('score').textContent = this.score;
        document.getElementById('points').textContent = this.points;
        
        // Update equipment display only if playerTank exists
        if (this.playerTank) {
            document.getElementById('weapon-slot').textContent = this.playerTank.equipment.weapon.name;
            document.getElementById('armor-slot').textContent = this.playerTank.equipment.armor ? this.playerTank.equipment.armor.name : 'None';
        } else {
            // Set default values if playerTank doesn't exist yet
            document.getElementById('weapon-slot').textContent = 'Basic Cannon';
            document.getElementById('armor-slot').textContent = 'None';
        }
    }
    
    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    stopGameLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        if (this.gameState === 'playing') {
            this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
        } else {
            console.log('Game loop stopped - gameState:', this.gameState);
        }
    }
    
    update(deltaTime) {
        // Update projectiles
        this.projectiles.forEach((projectile, index) => {
            projectile.update(deltaTime);
            
            // Check collision with tanks
            if (this.checkProjectileCollision(projectile, this.playerTank)) {
                this.playerTank.takeDamage(projectile.damage);
                this.projectiles.splice(index, 1);
                this.createExplosion(projectile.x, projectile.y);
            } else if (this.checkProjectileCollision(projectile, this.aiTank)) {
                this.aiTank.takeDamage(projectile.damage);
                this.projectiles.splice(index, 1);
                this.createExplosion(projectile.x, projectile.y);
            }
            
            // Check collision with walls
            if (this.maze.isWall(projectile.x, projectile.y)) {
                console.log('Projectile hit wall at:', projectile.x, projectile.y);
                console.log('Projectile can destroy walls:', projectile.canDestroyWalls);
                this.projectiles.splice(index, 1);
                this.createExplosion(projectile.x, projectile.y);
                
                                 // Destroy wall if projectile can do so
                 if (projectile.canDestroyWalls) {
                     console.log('Destroying wall at:', projectile.x, projectile.y);
                     this.maze.destroyWall(projectile.x, projectile.y);
                     
                     // Award points for destroying wall
                     this.points += 50;
                     this.updateUI();
                 }
            }
            
            // Check if projectile is outside maze bounds
            if (projectile.x < 0 || projectile.x >= this.maze.width || 
                projectile.y < 0 || projectile.y >= this.maze.height) {
                console.log('Projectile outside maze bounds, removing');
                this.projectiles.splice(index, 1);
            }
            
            // Remove projectiles that are out of range
            if (projectile.distanceTraveled > projectile.range) {
                console.log('Projectile out of range, removing');
                this.projectiles.splice(index, 1);
            }
        });
        
        // Update explosions
        this.explosions.forEach((explosion, index) => {
            explosion.update(deltaTime);
            if (explosion.isFinished()) {
                this.explosions.splice(index, 1);
            }
        });
        
        // Update tanks
        if (this.playerTank) {
            this.playerTank.update(deltaTime);
        }
        if (this.aiTank) {
            this.aiTank.update(deltaTime);
        }
    }
    
    checkProjectileCollision(projectile, tank) {
        // Use grid-based collision detection
        const projectileGridX = Math.floor(projectile.x);
        const projectileGridY = Math.floor(projectile.y);
        const tankGridX = Math.floor(tank.x);
        const tankGridY = Math.floor(tank.y);
        
        // Check if projectile is in the same grid cell as tank
        return projectileGridX === tankGridX && projectileGridY === tankGridY;
    }
    
    createExplosion(x, y) {
        const explosion = new Explosion(x, y);
        explosion.maze = this.maze; // Pass maze reference to explosion
        this.explosions.push(explosion);
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render maze (will be centered by the maze render method)
        this.maze.render(this.ctx);
        
        // Render tanks
        this.playerTank.render(this.ctx);
        this.aiTank.render(this.ctx);
        
        // Render projectiles
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
        
        // Render explosions
        this.explosions.forEach(explosion => explosion.render(this.ctx));
        
        // Render UI overlays
        this.renderUI();
    }
    
    renderUI() {
        // Render tank health bars
        this.renderHealthBar(this.playerTank, 10, 10, 'Player');
        this.renderHealthBar(this.aiTank, 10, 40, 'Enemy');
        
        // Render turn info
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`Turn: ${this.turnNumber + 1}/${this.maxTurns}`, 10, 70);
        this.ctx.fillText(`Phase: ${this.turnPhase}`, 10, 90);
        
        // Render current card execution
        if (this.currentCardDisplay && this.cardDisplayTimer > 0) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = 'bold 20px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.currentCardDisplay, this.canvas.width / 2, 50);
            this.ctx.textAlign = 'left';
            
            // Update timer
            this.cardDisplayTimer -= 16; // Assuming 60fps
        }
    }
    
    renderHealthBar(tank, x, y, label) {
        const barWidth = 200;
        const barHeight = 20;
        const healthPercent = tank.health / tank.maxHealth;
        
        // Background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health bar
        this.ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
        this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        // Border
        this.ctx.strokeStyle = '#fff';
        this.ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`${label}: ${tank.health}/${tank.maxHealth}`, x, y + 15);
    }
    
    showMainMenu() {
        this.gameState = 'menu';
        document.getElementById('game-over-modal').classList.add('hidden');
        // Could implement a main menu here
    }
}