class Equipment {
    constructor() {
        this.weapons = this.initializeWeapons();
        this.armor = this.initializeArmor();
        this.specialItems = this.initializeSpecialItems();
    }
    
    initializeWeapons() {
        return {
            basicCannon: {
                id: 'basicCannon',
                name: 'Basic Cannon',
                description: 'Standard tank cannon. Reliable but basic.',
                cost: 0,
                damage: 1,
                range: 5,
                accuracy: 0.9,
                fireRate: 1,
                canShootOverWalls: false,
                canDestroyWalls: true,
                projectileSpeed: 0.3,
                type: 'weapon'
            },
            heavyCannon: {
                id: 'heavyCannon',
                name: 'Heavy Cannon',
                description: 'Upgraded cannon with increased damage and range.',
                cost: 500,
                damage: 2,
                range: 8,
                accuracy: 0.85,
                fireRate: 1,
                canShootOverWalls: false,
                canDestroyWalls: true,
                projectileSpeed: 0.4,
                type: 'weapon'
            },
            missileLauncher: {
                id: 'missileLauncher',
                name: 'Missile Launcher',
                description: 'Advanced weapon that can shoot over walls.',
                cost: 1000,
                damage: 3,
                range: 10,
                accuracy: 0.8,
                fireRate: 0.8,
                canShootOverWalls: true,
                canDestroyWalls: true,
                projectileSpeed: 0.5,
                type: 'weapon'
            },
            laserCannon: {
                id: 'laserCannon',
                name: 'Laser Cannon',
                description: 'High-accuracy laser weapon with instant hit.',
                cost: 1500,
                damage: 2,
                range: 12,
                accuracy: 1.0,
                fireRate: 1.2,
                canShootOverWalls: false,
                canDestroyWalls: false,
                projectileSpeed: 1.0,
                type: 'weapon'
            },
            plasmaCannon: {
                id: 'plasmaCannon',
                name: 'Plasma Cannon',
                description: 'Powerful plasma weapon with area damage.',
                cost: 2000,
                damage: 4,
                range: 6,
                accuracy: 0.7,
                fireRate: 0.6,
                canShootOverWalls: false,
                canDestroyWalls: true,
                projectileSpeed: 0.3,
                areaDamage: true,
                type: 'weapon'
            }
        };
    }
    
    initializeArmor() {
        return {
            none: {
                id: 'none',
                name: 'No Armor',
                description: 'No additional protection.',
                cost: 0,
                healthBonus: 0,
                damageReduction: 0,
                speedPenalty: 0,
                type: 'armor'
            },
            lightArmor: {
                id: 'lightArmor',
                name: 'Light Armor',
                description: 'Lightweight armor providing basic protection.',
                cost: 300,
                healthBonus: 1,
                damageReduction: 0.1,
                speedPenalty: 0,
                type: 'armor'
            },
            heavyArmor: {
                id: 'heavyArmor',
                name: 'Heavy Armor',
                description: 'Heavy armor with significant protection.',
                cost: 800,
                healthBonus: 2,
                damageReduction: 0.2,
                speedPenalty: 0.1,
                type: 'armor'
            },
            reactiveArmor: {
                id: 'reactiveArmor',
                name: 'Reactive Armor',
                description: 'Advanced armor that explodes to deflect projectiles.',
                cost: 1200,
                healthBonus: 1,
                damageReduction: 0.3,
                speedPenalty: 0.05,
                deflectChance: 0.3,
                type: 'armor'
            },
            stealthArmor: {
                id: 'stealthArmor',
                name: 'Stealth Armor',
                description: 'Stealth technology reduces enemy detection range.',
                cost: 1000,
                healthBonus: 0,
                damageReduction: 0.1,
                speedPenalty: 0,
                stealthBonus: 0.3,
                type: 'armor'
            }
        };
    }
    
    initializeSpecialItems() {
        return {
            speedBooster: {
                id: 'speedBooster',
                name: 'Speed Booster',
                description: 'Increases movement speed by 50%.',
                cost: 400,
                speedBonus: 0.5,
                type: 'special'
            },
            repairKit: {
                id: 'repairKit',
                name: 'Repair Kit',
                description: 'Instantly repair 2 health points.',
                cost: 200,
                healAmount: 2,
                type: 'special',
                consumable: true
            },
            radar: {
                id: 'radar',
                name: 'Radar System',
                description: 'Reveals enemy position through walls.',
                cost: 600,
                radarRange: 8,
                type: 'special'
            },
            shieldGenerator: {
                id: 'shieldGenerator',
                name: 'Shield Generator',
                description: 'Creates a temporary shield that blocks one hit.',
                cost: 800,
                shieldHealth: 1,
                type: 'special'
            },
            empDevice: {
                id: 'empDevice',
                name: 'EMP Device',
                description: 'Disables enemy weapons for one turn.',
                cost: 500,
                empRange: 5,
                type: 'special',
                consumable: true
            }
        };
    }
    
    getWeapon(id) {
        return this.weapons[id] || this.weapons.basicCannon;
    }
    
    getArmor(id) {
        return this.armor[id] || this.armor.none;
    }
    
    getSpecialItem(id) {
        return this.specialItems[id];
    }
    
    getAllWeapons() {
        return Object.values(this.weapons);
    }
    
    getAllArmor() {
        return Object.values(this.armor);
    }
    
    getAllSpecialItems() {
        return Object.values(this.specialItems);
    }
    
    getShopItems(level = 1) {
        const items = [];
        
        // Add weapons based on level
        Object.values(this.weapons).forEach(weapon => {
            if (weapon.cost > 0 && this.isItemAvailable(weapon, level)) {
                items.push(weapon);
            }
        });
        
        // Add armor based on level
        Object.values(this.armor).forEach(armor => {
            if (armor.cost > 0 && this.isItemAvailable(armor, level)) {
                items.push(armor);
            }
        });
        
        // Add special items based on level
        Object.values(this.specialItems).forEach(item => {
            if (this.isItemAvailable(item, level)) {
                items.push(item);
            }
        });
        
        return items;
    }
    
    isItemAvailable(item, level) {
        // Some items are only available at higher levels
        const levelRequirements = {
            'missileLauncher': 3,
            'laserCannon': 5,
            'plasmaCannon': 8,
            'reactiveArmor': 4,
            'stealthArmor': 6,
            'radar': 2,
            'shieldGenerator': 7,
            'empDevice': 3
        };
        
        const requiredLevel = levelRequirements[item.id] || 1;
        return level >= requiredLevel;
    }
    
    // Equipment effects and calculations
    calculateDamage(baseDamage, armor) {
        if (!armor) return baseDamage;
        
        const damageReduction = armor.damageReduction || 0;
        return Math.max(1, Math.floor(baseDamage * (1 - damageReduction)));
    }
    
    calculateSpeed(baseSpeed, armor, specialItems) {
        let speed = baseSpeed;
        
        // Apply armor penalty
        if (armor && armor.speedPenalty) {
            speed *= (1 - armor.speedPenalty);
        }
        
        // Apply speed booster
        const speedBooster = specialItems.find(item => item.id === 'speedBooster');
        if (speedBooster) {
            speed *= (1 + speedBooster.speedBonus);
        }
        
        return speed;
    }
    
    calculateDetectionRange(baseRange, armor, specialItems) {
        let range = baseRange;
        
        // Apply stealth armor
        if (armor && armor.stealthBonus) {
            range *= (1 - armor.stealthBonus);
        }
        
        return range;
    }
    
    // Equipment comparison and recommendations
    compareWeapons(weapon1, weapon2) {
        const score1 = this.calculateWeaponScore(weapon1);
        const score2 = this.calculateWeaponScore(weapon2);
        
        return {
            weapon1: { ...weapon1, score: score1 },
            weapon2: { ...weapon2, score: score2 },
            winner: score1 > score2 ? weapon1 : weapon2
        };
    }
    
    calculateWeaponScore(weapon) {
        let score = 0;
        
        // Damage is most important
        score += weapon.damage * 100;
        
        // Range is second most important
        score += weapon.range * 10;
        
        // Accuracy bonus
        score += weapon.accuracy * 50;
        
        // Special abilities
        if (weapon.canShootOverWalls) score += 200;
        if (weapon.canDestroyWalls) score += 100;
        if (weapon.areaDamage) score += 150;
        
        // Fire rate adjustment
        score *= weapon.fireRate;
        
        return score;
    }
    
    getRecommendedEquipment(level, points, currentEquipment) {
        const recommendations = {
            weapon: null,
            armor: null,
            special: []
        };
        
        const availableItems = this.getShopItems(level);
        const affordableItems = availableItems.filter(item => item.cost <= points);
        
        if (affordableItems.length === 0) {
            return recommendations;
        }
        
        // Recommend best weapon
        const weapons = affordableItems.filter(item => item.type === 'weapon');
        if (weapons.length > 0) {
            const currentWeapon = currentEquipment.weapon;
            const bestWeapon = weapons.reduce((best, weapon) => {
                const comparison = this.compareWeapons(best, weapon);
                return comparison.winner;
            });
            
            if (this.compareWeapons(currentWeapon, bestWeapon).winner === bestWeapon) {
                recommendations.weapon = bestWeapon;
            }
        }
        
        // Recommend best armor
        const armors = affordableItems.filter(item => item.type === 'armor');
        if (armors.length > 0) {
            const currentArmor = currentEquipment.armor;
            const bestArmor = armors.reduce((best, armor) => {
                return (armor.healthBonus + armor.damageReduction) > 
                       (best.healthBonus + best.damageReduction) ? armor : best;
            });
            
            if (!currentArmor || 
                (bestArmor.healthBonus + bestArmor.damageReduction) > 
                (currentArmor.healthBonus + currentArmor.damageReduction)) {
                recommendations.armor = bestArmor;
            }
        }
        
        // Recommend special items
        const specialItems = affordableItems.filter(item => item.type === 'special');
        if (specialItems.length > 0) {
            recommendations.special = specialItems.slice(0, 2); // Recommend up to 2 special items
        }
        
        return recommendations;
    }
    
    // Equipment validation and compatibility
    validateEquipment(equipment) {
        const errors = [];
        
        // Check if weapon exists
        if (equipment.weapon && !this.weapons[equipment.weapon.id]) {
            errors.push(`Invalid weapon: ${equipment.weapon.id}`);
        }
        
        // Check if armor exists
        if (equipment.armor && !this.armor[equipment.armor.id]) {
            errors.push(`Invalid armor: ${equipment.armor.id}`);
        }
        
        // Check special items
        if (equipment.specialItems) {
            equipment.specialItems.forEach(item => {
                if (!this.specialItems[item.id]) {
                    errors.push(`Invalid special item: ${item.id}`);
                }
            });
        }
        
        return errors;
    }
    
    // Equipment serialization
    serializeEquipment(equipment) {
        return {
            weapon: equipment.weapon ? equipment.weapon.id : 'basicCannon',
            armor: equipment.armor ? equipment.armor.id : 'none',
            specialItems: equipment.specialItems ? equipment.specialItems.map(item => item.id) : []
        };
    }
    
    deserializeEquipment(data) {
        return {
            weapon: this.getWeapon(data.weapon),
            armor: this.getArmor(data.armor),
            specialItems: data.specialItems ? data.specialItems.map(id => this.getSpecialItem(id)).filter(Boolean) : []
        };
    }
}
