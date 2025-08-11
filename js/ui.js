class UI {
    constructor(game) {
        this.game = game;
        this.animations = [];
        this.notifications = [];
        this.tooltips = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createTooltips();
    }
    
    setupEventListeners() {
        // Card hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('card')) {
                this.showCardTooltip(e.target, e);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('card')) {
                this.hideTooltip();
            }
        });
        
        // Equipment hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('equipment-item')) {
                this.showEquipmentTooltip(e.target, e);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('equipment-item')) {
                this.hideTooltip();
            }
        });
        
        // Shop item hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.shop-item')) {
                this.showShopItemTooltip(e.target.closest('.shop-item'), e);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('.shop-item')) {
                this.hideTooltip();
            }
        });
    }
    
    createTooltips() {
        // Create tooltip container
        this.tooltipContainer = document.createElement('div');
        this.tooltipContainer.id = 'tooltip-container';
        this.tooltipContainer.style.cssText = `
            position: fixed;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #e94560;
            font-size: 12px;
            max-width: 250px;
            pointer-events: none;
            display: none;
        `;
        document.body.appendChild(this.tooltipContainer);
    }
    
    showCardTooltip(cardElement, event) {
        const cardIndex = parseInt(cardElement.dataset.index);
        const card = this.game.playerCards[cardIndex];
        
        if (!card) return;
        
        let content = `<strong>${card.name}</strong><br>`;
        
        switch (card.type) {
            case 'move':
                content += `Move ${card.steps} steps ${card.direction}`;
                break;
            case 'turn':
                content += `Turn ${card.direction}`;
                break;
            case 'fire':
                content += `Fire your weapon`;
                break;
        }
        
        this.showTooltip(content, event);
    }
    
    showEquipmentTooltip(equipmentElement, event) {
        const slot = equipmentElement.closest('.equipment-slot').dataset.slot;
        const equipment = this.game.playerTank.equipment[slot];
        
        if (!equipment) return;
        
        let content = `<strong>${equipment.name}</strong><br>`;
        
        if (slot === 'weapon') {
            content += `Damage: ${equipment.damage}<br>`;
            content += `Range: ${equipment.range}<br>`;
            if (equipment.canShootOverWalls) content += `Can shoot over walls<br>`;
            if (equipment.canDestroyWalls) content += `Can destroy walls<br>`;
        } else if (slot === 'armor') {
            content += `Health bonus: +${equipment.healthBonus || 0}<br>`;
            content += `Damage reduction: ${Math.round((equipment.damageReduction || 0) * 100)}%<br>`;
        }
        
        this.showTooltip(content, event);
    }
    
    showShopItemTooltip(shopItem, event) {
        const itemName = shopItem.querySelector('.item-name').textContent;
        const itemCost = shopItem.querySelector('.item-cost').textContent;
        const itemDescription = shopItem.querySelector('.item-description')?.textContent || '';
        
        let content = `<strong>${itemName}</strong><br>`;
        content += `${itemCost}<br>`;
        content += `${itemDescription}`;
        
        this.showTooltip(content, event);
    }
    
    showTooltip(content, event) {
        this.tooltipContainer.innerHTML = content;
        this.tooltipContainer.style.display = 'block';
        
        // Position tooltip
        const rect = this.tooltipContainer.getBoundingClientRect();
        let x = event.clientX + 10;
        let y = event.clientY + 10;
        
        // Adjust if tooltip goes off screen
        if (x + rect.width > window.innerWidth) {
            x = event.clientX - rect.width - 10;
        }
        if (y + rect.height > window.innerHeight) {
            y = event.clientY - rect.height - 10;
        }
        
        this.tooltipContainer.style.left = x + 'px';
        this.tooltipContainer.style.top = y + 'px';
    }
    
    hideTooltip() {
        this.tooltipContainer.style.display = 'none';
    }
    
    // Animation system
    addAnimation(animation) {
        this.animations.push(animation);
    }
    
    updateAnimations(deltaTime) {
        this.animations = this.animations.filter(animation => {
            animation.update(deltaTime);
            return !animation.isFinished();
        });
    }
    
    // Notification system
    showNotification(message, type = 'info', duration = 3000) {
        const notification = {
            id: Date.now(),
            message: message,
            type: type,
            duration: duration,
            startTime: Date.now(),
            element: null
        };
        
        this.notifications.push(notification);
        this.createNotificationElement(notification);
    }
    
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(notification.type)};
            color: white;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e94560;
            z-index: 10000;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        element.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${notification.message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; margin-left: 10px;">×</button>
            </div>
        `;
        
        document.body.appendChild(element);
        notification.element = element;
        
        // Animate in
        setTimeout(() => {
            element.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, notification.duration);
    }
    
    removeNotification(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && notification.element) {
            notification.element.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.element.parentElement) {
                    notification.element.remove();
                }
            }, 300);
        }
        
        this.notifications = this.notifications.filter(n => n.id !== id);
    }
    
    getNotificationColor(type) {
        switch (type) {
            case 'success': return '#28a745';
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            case 'info':
            default: return '#17a2b8';
        }
    }
    
    // UI update methods
    updateGameInfo() {
        document.getElementById('level').textContent = this.game.level;
        document.getElementById('score').textContent = this.game.score;
        document.getElementById('points').textContent = this.game.points;
    }
    
    updateEquipmentDisplay() {
        const weaponSlot = document.getElementById('weapon-slot');
        const armorSlot = document.getElementById('armor-slot');
        
        if (this.game.playerTank) {
            weaponSlot.textContent = this.game.playerTank.equipment.weapon.name;
            armorSlot.textContent = this.game.playerTank.equipment.armor ? 
                this.game.playerTank.equipment.armor.name : 'None';
        }
    }
    
    updateTurnInfo() {
        const turnInfo = document.getElementById('turn-info');
        if (turnInfo) {
            turnInfo.textContent = `Turn ${this.game.turnNumber + 1}/${this.game.maxTurns}`;
        }
    }
    
    // Visual effects
    flashElement(element, color = '#e94560', duration = 200) {
        const originalBackground = element.style.background;
        element.style.background = color;
        element.style.transition = 'background 0.1s ease';
        
        setTimeout(() => {
            element.style.background = originalBackground;
            element.style.transition = '';
        }, duration);
    }
    
    shakeElement(element, intensity = 5, duration = 500) {
        const originalTransform = element.style.transform;
        const startTime = Date.now();
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const x = (Math.random() - 0.5) * intensity * (1 - progress);
                const y = (Math.random() - 0.5) * intensity * (1 - progress);
                element.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(shake);
            } else {
                element.style.transform = originalTransform;
            }
        };
        
        shake();
    }
    
    // Modal management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }
    
    // Loading screen
    showLoadingScreen(message = 'Loading...') {
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        loadingScreen.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 24px; margin-bottom: 20px;">${message}</div>
                <div class="loading-spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #333;
                    border-top: 4px solid #e94560;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                "></div>
            </div>
        `;
        
        document.body.appendChild(loadingScreen);
        
        // Add CSS animation
        if (!document.querySelector('#loading-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'loading-spinner-style';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.remove();
        }
    }
    
    // Progress bar
    createProgressBar(containerId, label, current, max) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div style="margin-bottom: 5px;">${label}</div>
            <div style="
                width: 100%;
                height: 20px;
                background: #333;
                border-radius: 10px;
                overflow: hidden;
                border: 1px solid #e94560;
            ">
                <div style="
                    width: ${(current / max) * 100}%;
                    height: 100%;
                    background: linear-gradient(90deg, #e94560, #c44569);
                    transition: width 0.3s ease;
                "></div>
            </div>
            <div style="text-align: center; font-size: 12px; margin-top: 2px;">
                ${current}/${max}
            </div>
        `;
    }
    
    // Confirmation dialog
    showConfirmationDialog(message, onConfirm, onCancel) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        dialog.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                padding: 30px;
                border-radius: 15px;
                border: 3px solid #e94560;
                max-width: 400px;
                text-align: center;
            ">
                <h3 style="color: #ffd700; margin-bottom: 20px;">Confirm Action</h3>
                <p style="color: #e94560; margin-bottom: 30px;">${message}</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="confirm-btn" style="
                        padding: 10px 20px;
                        background: linear-gradient(145deg, #e94560, #c44569);
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Confirm</button>
                    <button id="cancel-btn" style="
                        padding: 10px 20px;
                        background: #333;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Event listeners
        dialog.querySelector('#confirm-btn').addEventListener('click', () => {
            dialog.remove();
            if (onConfirm) onConfirm();
        });
        
        dialog.querySelector('#cancel-btn').addEventListener('click', () => {
            dialog.remove();
            if (onCancel) onCancel();
        });
    }
    
    // Update method called by game loop
    update(deltaTime) {
        this.updateAnimations(deltaTime);
        this.updateGameInfo();
        this.updateEquipmentDisplay();
        this.updateTurnInfo();
    }
}
