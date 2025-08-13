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
        
        // Splash screen event listeners
        this.setupSplashScreenListeners();
        
        // Debug panel functionality
        const debugPanelBtn = document.getElementById('debug-panel-btn');
        console.log('Debug panel button found:', debugPanelBtn);
        if (debugPanelBtn) {
            debugPanelBtn.addEventListener('click', () => {
                console.log('Debug panel button clicked!');
                this.toggleDebugPanel();
            });
        } else {
            console.error('Debug panel button not found!');
        }
        
        // Game control buttons (now in debug panel)
        const newGameBtn = document.getElementById('new-game-btn');
        console.log('New game button found:', newGameBtn);
        
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                console.log('New Game button clicked!');
                this.showSplashScreen();
            });
        } else {
            console.error('New game button not found!');
        }
        
        const difficultyBtn = document.getElementById('difficulty-btn');
        if (difficultyBtn) {
            difficultyBtn.addEventListener('click', () => this.toggleDifficulty());
        }
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
    
    setupSplashScreenListeners() {
        // Difficulty selection buttons
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectDifficulty(btn.dataset.difficulty);
            });
        });
        
        // Start game button
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }
        
        // Load game button
        const loadGameBtn = document.getElementById('load-game-btn');
        if (loadGameBtn) {
            loadGameBtn.addEventListener('click', () => {
                this.loadGame();
            });
        }
    }
    
    selectDifficulty(difficulty) {
        // Remove selected class from all difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selected class to clicked button
        const selectedBtn = document.querySelector(`[data-difficulty="${difficulty}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        // Update difficulty and enable start button
        this.difficulty = difficulty;
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            startGameBtn.disabled = false;
        }
        
        // Update difficulty display in game interface
        const difficultyBtn = document.getElementById('difficulty-btn');
        if (difficultyBtn) {
            difficultyBtn.textContent = `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
        }
    }
    
    showSplashScreen() {
        document.getElementById('splash-screen').classList.remove('hidden');
        document.getElementById('game-interface').classList.add('hidden');
        document.querySelector('header').classList.add('hidden');
    }
    
    hideSplashScreen() {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('game-interface').classList.remove('hidden');
        document.querySelector('header').classList.remove('hidden');
    }
    
    loadGame() {
        // TODO: Implement load game functionality
        console.log('Load game functionality not implemented yet');
        alert('Load game functionality coming soon!');
    }
    
    toggleDebugPanel() {
        console.log('toggleDebugPanel called');
        const debugPanel = document.getElementById('debug-panel');
        console.log('Debug panel found:', debugPanel);
        if (debugPanel) {
            debugPanel.classList.toggle('hidden');
            console.log('Debug panel hidden:', debugPanel.classList.contains('hidden'));
        } else {
            console.error('Debug panel not found!');
        }
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
            
            // Hide splash screen and show game interface
            this.hideSplashScreen();
            
            console.log('Game state reset, updating UI...');
            this.updateUI();
            console.log('Generating level...');
            this.generateLevel();
            console.log('Dealing cards...');
            this.dealCards();
            console.log('Starting game loop...');
            this.startGameLoop();
            
            // Initialize button states
            this.updateButtonStates();
            
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
        
        // Equip tanks with proper weapons from Equipment system
        const equipment = new Equipment();
        this.playerTank.equipWeapon(equipment.getWeapon('basicCannon'));
        this.aiTank.equipWeapon(equipment.getWeapon('basicCannon'));
        
        // Store equipment reference for later use
        this.equipment = equipment;
        
        // Track purchased items per level
        this.purchasedItems = {
            weapons: new Set(),
            armor: new Set()
        };
        
        // Track persistent special cards (carry over between levels)
        this.specialCards = [];
        
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
        const cards = [];
        
        // Always include these 4 guaranteed cards using CardFactory
        cards.push(CardFactory.createCard('turn', 'left'));
        cards.push(CardFactory.createCard('turn', 'right'));
        cards.push(CardFactory.createCard('move', 'forward', 1));
        cards.push(CardFactory.createCard('fire'));
        
        // Add 2 completely random cards
        const randomCardTypes = [
            ['move', 'forward', 1],
            ['move', 'forward', 2],
            ['move', 'backward', 1],
            ['turn', 'left'],
            ['turn', 'right'],
            ['fire']
        ];
        
        for (let i = 4; i < count; i++) {
            const randomType = randomCardTypes[Math.floor(Math.random() * randomCardTypes.length)];
            cards.push(CardFactory.createCard(...randomType));
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
            this.updateButtonStates();
            
            // AI selects 4 random cards
            this.aiCards = this.aiCards.sort(() => Math.random() - 0.5).slice(0, 4);
            
            // Execute cards one by one
            this.executeNextCard();
        } catch (error) {
            console.error('Error in executeTurn:', error);
        }
    }
    
    executeNextCard() {
        console.log('executeNextCard called, step:', this.executionStep);
        console.log('Selected cards indices:', this.selectedCards);
        console.log('Player cards:', this.playerCards);
        
        if (this.executionStep >= 4) {
            console.log('All cards executed, ending turn');
            this.currentCardDisplay = '';
            this.endTurn();
            return;
        }
        
        const selectedIndex = this.selectedCards[this.executionStep];
        console.log('Selected index for step', this.executionStep, ':', selectedIndex);
        
        if (selectedIndex === undefined || selectedIndex >= this.playerCards.length) {
            console.error('Invalid selected index:', selectedIndex, 'for step:', this.executionStep);
            console.error('Selected cards:', this.selectedCards);
            console.error('Player cards length:', this.playerCards.length);
            this.endTurn();
            return;
        }
        
        const playerCard = this.playerCards[selectedIndex];
        const aiCard = this.aiCards[this.executionStep];
        
        console.log('Executing cards:', playerCard, aiCard);
        
        // Show which cards are being played
        this.currentCardDisplay = `Playing: ${playerCard.name} vs ${aiCard.name}`;
        this.cardDisplayTimer = 2000; // Show for 2 seconds
        
        // Execute both cards simultaneously
        try {
            this.executeCard(this.playerTank, playerCard);
            this.executeCard(this.aiTank, aiCard);
        } catch (error) {
            console.error('Error executing cards:', error);
        }
        
        this.executionStep++;
        
        // Wait longer before next card so movement is visible
        setTimeout(() => this.executeNextCard(), 2500);
    }
    
    executeCard(tank, card) {
        console.log(`Executing card for ${tank.owner}:`, card);
        
        try {
            // All cards should now have their own execute method
            if (card.execute && typeof card.execute === 'function') {
                card.execute(tank, this);
            } else {
                console.error(`Card ${card.name} does not have an execute method:`, card);
                throw new Error(`Card ${card.name} does not have an execute method`);
            }
        } catch (error) {
            console.error(`Error executing card ${card.name} for ${tank.owner}:`, error);
            throw error;
        }
    }
    

    

    
    findValidTeleportPositions() {
        const aiTank = this.aiTank;
        const validPositions = [];
        
        // Check all positions 2 squares away from AI tank
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                // Only positions exactly 2 squares away (Manhattan distance)
                if (Math.abs(dx) + Math.abs(dy) === 2) {
                    const teleportX = aiTank.x + dx;
                    const teleportY = aiTank.y + dy;
                    
                    // Check if position is valid
                            if (teleportX >= 0 && teleportX < this.maze.width &&
            teleportY >= 0 && teleportY < this.maze.height &&
            this.maze.isValidPosition(teleportX, teleportY, this)) {
                        
                        // Check if not occupied by player tank
                        const playerGridX = Math.floor(this.playerTank.x);
                        const playerGridY = Math.floor(this.playerTank.y);
                        
                                                 if (teleportX !== playerGridX || teleportY !== playerGridY) {
                             validPositions.push({ x: teleportX, y: teleportY });
                         }
                    }
                }
            }
        }
        
        return validPositions;
    }
    
    endTurn() {
        this.turnNumber++;
        this.turnPhase = 'planning';
        this.executionStep = 0;
        this.updateButtonStates();
        
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
        // Check if player tank is destroyed (game over)
        if (this.playerTank.health <= 0) {
            this.endGame('You were destroyed!');
            return true;
        }
        
        // Check if AI tank is destroyed (level completed)
        if (this.aiTank.health <= 0) {
            this.calculateScore();
            this.nextLevel();
            return true;
        }
        
        return false;
    }
    
    calculateScore() {
        // Base score for completing the level
        const baseScore = 500;
        
        // Bonus for completing quickly (more turns remaining = higher bonus)
        const turnsRemaining = this.maxTurns - this.turnNumber;
        const speedBonus = Math.max(0, turnsRemaining) * 25; // 25 points per turn remaining
        
        // Level difficulty bonus (higher levels give more points)
        const levelBonus = this.level * 200;
        
        // Health bonus (completing with more health = more points)
        const healthBonus = this.playerTank.health * 50;
        
        this.score = baseScore + speedBonus + levelBonus + healthBonus;
        this.points += this.score;
        
        console.log(`Level ${this.level} completed!`);
        console.log(`Base Score: ${baseScore}`);
        console.log(`Speed Bonus: ${speedBonus} (${turnsRemaining} turns remaining)`);
        console.log(`Level Bonus: ${levelBonus}`);
        console.log(`Health Bonus: ${healthBonus}`);
        console.log(`Total Score: ${this.score}`);
        console.log(`Total Points: ${this.points}`);
    }
    
    nextLevel() {
        // Level up
        this.level++;
        
        // Show level completion message
        this.gameState = 'levelComplete';
        this.stopGameLoop();
        
        document.getElementById('game-over-message').textContent = 'Level Complete!';
        document.getElementById('final-stats').innerHTML = `
            <p>Level ${this.level - 1} Completed!</p>
            <p>Score: ${this.score}</p>
            <p>Total Points: ${this.points}</p>
            <p>Next Level: ${this.level}</p>
        `;
        
        // Change button text to "Next Level"
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.textContent = 'Next Level';
            playAgainBtn.onclick = () => this.startNextLevel();
        }
        
        document.getElementById('game-over-modal').classList.remove('hidden');
    }
    
    startNextLevel() {
        // Reset equipment (weapons and armor are lost between levels)
        this.resetEquipment();
        
        // Reset purchased items tracking
        this.purchasedItems = {
            weapons: new Set(),
            armor: new Set()
        };
        
        // Start the new level
        this.startLevel(this.level);
        
        // Hide the modal
        document.getElementById('game-over-modal').classList.add('hidden');
    }
    
    resetEquipment() {
        // Reset player tank to basic equipment
        const basicCannon = this.equipment.getWeapon('basicCannon');
        this.playerTank.equipWeapon(basicCannon);
        this.playerTank.equipArmor(null); // Remove armor
        
        // Reset AI tank to basic equipment
        this.aiTank.equipWeapon(basicCannon);
        this.aiTank.equipArmor(null); // Remove armor
        
        console.log('Equipment reset for new level');
    }
    
    endGame(message) {
        this.gameState = 'gameOver';
        this.stopGameLoop();
        
        // Show splash screen instead of modal
        this.showSplashScreen();
        
        // Reset difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Select current difficulty
        const currentDifficultyBtn = document.querySelector(`[data-difficulty="${this.difficulty}"]`);
        if (currentDifficultyBtn) {
            currentDifficultyBtn.classList.add('selected');
        }
        
        // Enable start button
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            startGameBtn.disabled = false;
        }
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
        // Restart the game loop after closing shop
        this.startGameLoop();
    }
    
    openBuyCards() {
        this.gameState = 'buyCards';
        this.updateBuyCardsUI();
        document.getElementById('buy-cards-modal').classList.remove('hidden');
    }
    
    closeBuyCards() {
        this.gameState = 'playing';
        document.getElementById('buy-cards-modal').classList.add('hidden');
        // Restart the game loop after closing buy cards
        this.startGameLoop();
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
                name: 'Shield',
                cost: 300,
                description: 'Block the next damage you would take',
                type: 'special',
                cardType: 'shield'
            },
            {
                name: 'Repair',
                cost: 400,
                description: 'Heal 1 health point',
                type: 'special',
                cardType: 'repair'
            },
            {
                name: 'Double Move',
                cost: 500,
                description: 'Move twice in one action',
                type: 'special',
                cardType: 'doubleMove'
            },
            {
                name: 'Quick Shot',
                cost: 600,
                description: 'Fire immediately without using a turn',
                type: 'special',
                cardType: 'quickShot'
            },
            {
                name: 'EMP',
                cost: 800,
                description: 'Disable enemy tank for 1 turn',
                type: 'special',
                cardType: 'emp'
            },
            {
                name: 'Overcharge',
                cost: 1000,
                description: 'Next shot deals double damage',
                type: 'special',
                cardType: 'overcharge'
            }
        ];
    }
    
    purchaseCard(item) {
        if (this.points < item.cost) return;
        
        // Check if we already have maximum special cards (4)
        if (item.type === 'special' && this.specialCards.length >= 4) {
            console.log('Maximum special cards reached (4)');
            return;
        }
        
        this.points -= item.cost;
        
        if (item.type === 'special') {
            // Add special card to persistent collection
            this.specialCards.push({
                name: item.name,
                description: item.description,
                cardType: item.cardType,
                id: Math.random().toString(36).substr(2, 9)
            });
            
            console.log(`Added special card: ${item.name}`);
            this.updateSpecialCardsUI();
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
                range: 8,
                canDestroyWalls: true
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
            },
            {
                name: 'Teleport',
                cost: 400,
                description: 'Teleport to a random position near the enemy tank',
                type: 'teleport'
            }
        ];
    }
    
    purchaseItem(item) {
        if (this.points < item.cost) return;
        
        // Check if armor has already been purchased this level
        if (item.type === 'armor' && this.purchasedItems.armor.has(item.id)) {
            console.log('Armor already purchased this level:', item.name);
            return; // Don't allow duplicate armor purchases
        }
        
        this.points -= item.cost;
        
        if (item.type === 'weapon') {
            this.playerTank.equipWeapon(item);
            this.purchasedItems.weapons.add(item.id);
        } else if (item.type === 'armor') {
            this.playerTank.equipArmor(item);
            this.purchasedItems.armor.add(item.id);
        }
        
        // Force sprite update to ensure visual changes are applied
        this.playerTank.updateSprites();
        
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
        // Update projectiles - iterate backwards to avoid index issues when removing
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);
            
            let shouldRemove = false;
            
            // Check collision with walls FIRST (before tank collision)
            if (this.maze.isWall(projectile.x, projectile.y)) {
                this.createExplosion(projectile.x, projectile.y);
                
                // Destroy wall if projectile can do so
                if (projectile.canDestroyWalls) {
                    this.maze.destroyWall(projectile.x, projectile.y);
                    
                    // Award points for destroying wall (only if player fired)
                    if (projectile.owner === 'player') {
                        this.points += 50;
                        this.updateUI();
                    }
                }
                shouldRemove = true;
            }
            // Check collision with tanks AFTER wall collision
            else if (this.checkProjectileCollision(projectile, this.playerTank)) {
                this.playerTank.takeDamage(projectile.damage);
                this.createExplosion(projectile.x, projectile.y);
                shouldRemove = true;
            } else if (this.checkProjectileCollision(projectile, this.aiTank)) {
                this.aiTank.takeDamage(projectile.damage);
                this.createExplosion(projectile.x, projectile.y);
                shouldRemove = true;
            }
            
            // Check if projectile is outside maze bounds
            if (projectile.x < 0 || projectile.x >= this.maze.width || 
                projectile.y < 0 || projectile.y >= this.maze.height) {
                console.log('Projectile outside maze bounds, removing');
                shouldRemove = true;
            }
            
            // Remove projectiles that are out of range
            if (projectile.distanceTraveled > projectile.range) {
                console.log('Projectile out of range, removing');
                shouldRemove = true;
            }
            
            // Remove projectile if needed
            if (shouldRemove) {
                this.projectiles.splice(i, 1);
            }
        }
        
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
        
        // Render debug tools (if available)
        if (this.debugTools) {
            this.debugTools.render(this.ctx);
        }
    }
    
    renderUI() {
        // Update status display
        this.updateStatusDisplay();
        
        // Render current card execution on canvas
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
    
    updateButtonStates() {
        // Get the shop and buy cards buttons
        const shopBtn = document.getElementById('shop-btn');
        const buyCardsBtn = document.getElementById('buy-cards-btn');
        
        // Disable buttons during execution phase
        if (this.turnPhase === 'executing') {
            if (shopBtn) {
                shopBtn.disabled = true;
                shopBtn.style.opacity = '0.5';
                shopBtn.style.cursor = 'not-allowed';
            }
            if (buyCardsBtn) {
                buyCardsBtn.disabled = true;
                buyCardsBtn.style.opacity = '0.5';
                buyCardsBtn.style.cursor = 'not-allowed';
            }
        } else {
            // Enable buttons during planning phase
            if (shopBtn) {
                shopBtn.disabled = false;
                shopBtn.style.opacity = '1';
                shopBtn.style.cursor = 'pointer';
            }
            if (buyCardsBtn) {
                buyCardsBtn.disabled = false;
                buyCardsBtn.style.opacity = '1';
                buyCardsBtn.style.cursor = 'pointer';
            }
        }
    }
    
    updateSpecialCardsUI() {
        const specialCardsContainer = document.getElementById('special-cards');
        if (!specialCardsContainer) return;
        
        specialCardsContainer.innerHTML = '';
        
        if (this.specialCards.length === 0) {
            specialCardsContainer.innerHTML = '<p>No special cards</p>';
            return;
        }
        
        this.specialCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'special-card';
            cardElement.innerHTML = `
                <div class="card-name">${card.name}</div>
                <div class="card-description">${card.description}</div>
            `;
            
            // Only allow playing special cards during planning phase
            if (this.turnPhase === 'planning') {
                cardElement.addEventListener('click', () => this.playSpecialCard(index));
                cardElement.style.cursor = 'pointer';
            } else {
                cardElement.style.opacity = '0.5';
                cardElement.style.cursor = 'not-allowed';
            }
            
            specialCardsContainer.appendChild(cardElement);
        });
    }
    
    playSpecialCard(index) {
        if (index >= this.specialCards.length) return;
        
        const card = this.specialCards[index];
        console.log(`Playing special card: ${card.name}`);
        
        // Execute the special card effect
        this.executeSpecialCard(card);
        
        // Remove the card from collection (one-time use)
        this.specialCards.splice(index, 1);
        
        // Update UI
        this.updateSpecialCardsUI();
    }
    
    executeSpecialCard(card) {
        switch (card.cardType) {
            case 'shield':
                this.playerTank.hasShield = true;
                console.log('Shield activated - next damage will be blocked');
                break;
                
            case 'repair':
                this.playerTank.heal(1);
                console.log('Repair used - healed 1 health');
                break;
                
            case 'doubleMove':
                // This will be handled in the next move action
                this.playerTank.hasDoubleMove = true;
                console.log('Double move activated - next move will be doubled');
                break;
                
            case 'quickShot':
                // Fire immediately
                const weapon = this.playerTank.equipment.weapon;
                const startX = this.playerTank.x + Math.cos(this.playerTank.angle * Math.PI / 180);
                const startY = this.playerTank.y + Math.sin(this.playerTank.angle * Math.PI / 180);
                
                const projectile = new Projectile(
                    startX, startY, this.playerTank.angle,
                    weapon.damage, weapon.range, 'player'
                );
                
                projectile.canDestroyWalls = weapon.canDestroyWalls || false;
                projectile.canShootOverWalls = weapon.canShootOverWalls || false;
                projectile.maze = this.maze;
                
                this.projectiles.push(projectile);
                console.log('Quick shot fired!');
                break;
                
            case 'emp':
                this.aiTank.empDisabled = true;
                this.aiTank.empTimer = 2000; // 2 seconds
                console.log('EMP used - enemy tank disabled for 2 seconds');
                break;
                
            case 'overcharge':
                this.playerTank.hasOvercharge = true;
                console.log('Overcharge activated - next shot will deal double damage');
                break;
        }
    }
    
    updateStatusDisplay() {
        // Update health bars
        if (this.playerTank) {
            const playerHealthPercent = (this.playerTank.health / this.playerTank.maxHealth) * 100;
            document.getElementById('player-health-fill').style.width = `${playerHealthPercent}%`;
            document.getElementById('player-health-text').textContent = `${this.playerTank.health}/${this.playerTank.maxHealth}`;
            
            // Update health bar color based on health percentage
            const playerHealthFill = document.getElementById('player-health-fill');
            if (playerHealthPercent > 66) {
                playerHealthFill.style.background = 'linear-gradient(90deg, #44ff44, #44ff44)';
            } else if (playerHealthPercent > 33) {
                playerHealthFill.style.background = 'linear-gradient(90deg, #ffff44, #ffff44)';
            } else {
                playerHealthFill.style.background = 'linear-gradient(90deg, #ff4444, #ff4444)';
            }
        }
        
        if (this.aiTank) {
            const enemyHealthPercent = (this.aiTank.health / this.aiTank.maxHealth) * 100;
            document.getElementById('enemy-health-fill').style.width = `${enemyHealthPercent}%`;
            document.getElementById('enemy-health-text').textContent = `${this.aiTank.health}/${this.aiTank.maxHealth}`;
            
            // Update health bar color based on health percentage
            const enemyHealthFill = document.getElementById('enemy-health-fill');
            if (enemyHealthPercent > 66) {
                enemyHealthFill.style.background = 'linear-gradient(90deg, #44ff44, #44ff44)';
            } else if (enemyHealthPercent > 33) {
                enemyHealthFill.style.background = 'linear-gradient(90deg, #ffff44, #ffff44)';
            } else {
                enemyHealthFill.style.background = 'linear-gradient(90deg, #ff4444, #ff4444)';
            }
        }
        
        // Update turn and phase info
        document.getElementById('turn-display').textContent = `${this.turnNumber + 1}/${this.maxTurns}`;
        document.getElementById('phase-display').textContent = this.turnPhase.charAt(0).toUpperCase() + this.turnPhase.slice(1);
    }
    

    
    showMainMenu() {
        this.gameState = 'menu';
        document.getElementById('game-over-modal').classList.add('hidden');
        // Could implement a main menu here
    }
}