/**
 * Location Tests Module
 * Comprehensive unit tests for object locations in Tank Battle Arena
 */

class LocationTests {
    constructor() {
        this.testResults = [];
        this.testGame = null;
        this.testUI = null;
    }

    /**
     * Initialize test environment
     */
    async initializeTestGame() {
        try {
            this.testGame = new Game();
            this.testUI = new UI(this.testGame);
            this.testGame.startNewGame();
            
            // Wait for game to initialize
            await this.wait(100);
            
            return {
                success: true,
                message: 'Test game initialized successfully',
                gameState: this.testGame.gameState
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to initialize test game: ' + error.message
            };
        }
    }

    /**
     * Utility function to wait for a specified time
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Log test result
     */
    logTest(testName, passed, message, details = null) {
        const result = {
            name: testName,
            passed: passed,
            message: message,
            details: details,
            timestamp: new Date().toISOString()
        };
        this.testResults.push(result);
        return result;
    }

    /**
     * Get test summary
     */
    getTestSummary() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = total - passed;
        const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

        return {
            total: total,
            passed: passed,
            failed: failed,
            successRate: successRate,
            results: this.testResults
        };
    }

    /**
     * Clear test results
     */
    clearResults() {
        this.testResults = [];
    }

    // ===== TANK POSITION TESTS =====

    /**
     * Test tank initialization and basic positioning
     */
    testTankInitialization() {
        if (!this.testGame || !this.testGame.playerTank || !this.testGame.aiTank) {
            return this.logTest('Tank Initialization', false, 'Tanks not available for testing');
        }

        const results = [];

        // Test player tank
        const playerTank = this.testGame.playerTank;
        results.push(this.logTest('Player Tank Exists', 
            playerTank !== null && playerTank !== undefined,
            `Player tank initialized: ${playerTank !== null}`,
            { tank: playerTank }
        ));

        // Test enemy tank
        const enemyTank = this.testGame.aiTank;
        results.push(this.logTest('Enemy Tank Exists',
            enemyTank !== null && enemyTank !== undefined,
            `Enemy tank initialized: ${enemyTank !== null}`,
            { tank: enemyTank }
        ));

        return results;
    }

    /**
     * Test tank position validity
     */
    testTankPositionValidity() {
        if (!this.testGame || !this.testGame.playerTank || !this.testGame.aiTank || !this.testGame.maze) {
            return this.logTest('Tank Position Validity', false, 'Required objects not available');
        }

        const results = [];
        const maze = this.testGame.maze;

        // Test player tank position bounds
        const playerTank = this.testGame.playerTank;
        const playerInBounds = playerTank.x >= 0 && playerTank.y >= 0 && 
                              playerTank.x < maze.width && playerTank.y < maze.height;
        
        results.push(this.logTest('Player Tank Bounds',
            playerInBounds,
            `Player tank at (${playerTank.x.toFixed(2)}, ${playerTank.y.toFixed(2)}) - ${playerInBounds ? 'IN BOUNDS' : 'OUT OF BOUNDS'}`,
            { x: playerTank.x, y: playerTank.y, bounds: { width: maze.width, height: maze.height } }
        ));

        // Test enemy tank position bounds
        const enemyTank = this.testGame.aiTank;
        const enemyInBounds = enemyTank.x >= 0 && enemyTank.y >= 0 && 
                             enemyTank.x < maze.width && enemyTank.y < maze.height;
        
        results.push(this.logTest('Enemy Tank Bounds',
            enemyInBounds,
            `Enemy tank at (${enemyTank.x.toFixed(2)}, ${enemyTank.y.toFixed(2)}) - ${enemyInBounds ? 'IN BOUNDS' : 'OUT OF BOUNDS'}`,
            { x: enemyTank.x, y: enemyTank.y, bounds: { width: maze.width, height: maze.height } }
        ));

        return results;
    }

    /**
     * Test tank angle validity
     */
    testTankAngles() {
        if (!this.testGame || !this.testGame.playerTank || !this.testGame.aiTank) {
            return this.logTest('Tank Angles', false, 'Tanks not available');
        }

        const results = [];

        // Test player tank angle
        const playerTank = this.testGame.playerTank;
        const playerAngleValid = playerTank.angle >= 0 && playerTank.angle < 360;
        
        results.push(this.logTest('Player Tank Angle',
            playerAngleValid,
            `Player tank angle: ${playerTank.angle.toFixed(1)}° - ${playerAngleValid ? 'VALID' : 'INVALID'}`,
            { angle: playerTank.angle }
        ));

        // Test enemy tank angle
        const enemyTank = this.testGame.aiTank;
        const enemyAngleValid = enemyTank.angle >= 0 && enemyTank.angle < 360;
        
        results.push(this.logTest('Enemy Tank Angle',
            enemyAngleValid,
            `Enemy tank angle: ${enemyTank.angle.toFixed(1)}° - ${enemyAngleValid ? 'VALID' : 'INVALID'}`,
            { angle: enemyTank.angle }
        ));

        return results;
    }

    /**
     * Test tank separation
     */
    testTankSeparation() {
        if (!this.testGame || !this.testGame.playerTank || !this.testGame.aiTank) {
            return this.logTest('Tank Separation', false, 'Tanks not available');
        }

        const playerTank = this.testGame.playerTank;
        const enemyTank = this.testGame.aiTank;
        
        const distance = Math.sqrt(
            Math.pow(playerTank.x - enemyTank.x, 2) + 
            Math.pow(playerTank.y - enemyTank.y, 2)
        );

        const adequateSeparation = distance > 3; // Minimum 3 cells apart

        return this.logTest('Tank Separation',
            adequateSeparation,
            `Tanks separated by ${distance.toFixed(2)} cells - ${adequateSeparation ? 'ADEQUATE' : 'TOO CLOSE'}`,
            { 
                distance: distance, 
                playerPos: { x: playerTank.x, y: playerTank.y },
                enemyPos: { x: enemyTank.x, y: enemyTank.y }
            }
        );
    }

    /**
     * Test tank movement
     */
    async testTankMovement() {
        if (!this.testGame || !this.testGame.playerTank) {
            return this.logTest('Tank Movement', false, 'Player tank not available');
        }

        const playerTank = this.testGame.playerTank;
        const originalX = playerTank.x;
        const originalY = playerTank.y;
        
        // Test movement to a new position
        const newX = originalX + 1;
        const newY = originalY + 1;
        
        playerTank.moveTo(newX, newY);
        
        // Wait for movement to complete
        await this.wait(1000);
        
        const currentX = playerTank.x;
        const currentY = playerTank.y;
        
        const movementSuccessful = Math.abs(currentX - newX) < 0.1 && Math.abs(currentY - newY) < 0.1;
        
        // Reset position
        playerTank.moveTo(originalX, originalY);
        
        return this.logTest('Tank Movement',
            movementSuccessful,
            `Tank moved from (${originalX.toFixed(2)}, ${originalY.toFixed(2)}) to (${currentX.toFixed(2)}, ${currentY.toFixed(2)})`,
            { 
                original: { x: originalX, y: originalY }, 
                target: { x: newX, y: newY },
                actual: { x: currentX, y: currentY }
            }
        );
    }

    /**
     * Test tank collision with walls
     */
    testTankWallCollision() {
        if (!this.testGame || !this.testGame.playerTank || !this.testGame.maze) {
            return this.logTest('Tank Wall Collision', false, 'Required objects not available');
        }

        const playerTank = this.testGame.playerTank;
        const maze = this.testGame.maze;
        
        const tankX = Math.floor(playerTank.x);
        const tankY = Math.floor(playerTank.y);
        
        const isOnWall = maze.isWall(tankX, tankY);
        
        return this.logTest('Tank Wall Collision',
            !isOnWall,
            `Tank at (${tankX}, ${tankY}) - ${isOnWall ? 'ON WALL' : 'NOT ON WALL'}`,
            { tankX: tankX, tankY: tankY, isWall: isOnWall }
        );
    }

    // ===== MAZE POSITION TESTS =====

    /**
     * Test maze generation and structure
     */
    testMazeGeneration() {
        if (!this.testGame || !this.testGame.maze) {
            return this.logTest('Maze Generation', false, 'Maze not generated');
        }

        const results = [];
        const maze = this.testGame.maze;

        // Test maze dimensions
        const validDimensions = maze.width > 0 && maze.height > 0;
        results.push(this.logTest('Maze Dimensions',
            validDimensions,
            `Maze size: ${maze.width} x ${maze.height}`,
            { width: maze.width, height: maze.height }
        ));

        // Test grid initialization
        const gridValid = maze.grid && maze.grid.length === maze.height && 
                         maze.grid[0] && maze.grid[0].length === maze.width;
        results.push(this.logTest('Maze Grid',
            gridValid,
            `Grid initialized: ${maze.grid.length} rows x ${maze.grid[0]?.length || 0} columns`,
            { rows: maze.grid.length, columns: maze.grid[0]?.length || 0 }
        ));

        return results;
    }

    /**
     * Test wall distribution
     */
    testWallDistribution() {
        if (!this.testGame || !this.testGame.maze) {
            return this.logTest('Wall Distribution', false, 'Maze not available');
        }

        const maze = this.testGame.maze;
        let wallCount = 0;
        let pathCount = 0;

        // Count walls and paths
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                if (maze.isWall(x, y)) {
                    wallCount++;
                } else {
                    pathCount++;
                }
            }
        }

        const totalCells = maze.width * maze.height;
        const wallPercentage = (wallCount / totalCells) * 100;
        
        // Reasonable wall density: between 10% and 50%
        const reasonableDensity = wallPercentage > 10 && wallPercentage < 50;

        return this.logTest('Wall Distribution',
            reasonableDensity,
            `Walls: ${wallCount}/${totalCells} (${wallPercentage.toFixed(1)}%)`,
            { 
                walls: wallCount, 
                paths: pathCount, 
                total: totalCells, 
                percentage: wallPercentage 
            }
        );
    }

    /**
     * Test start and end areas
     */
    testStartEndAreas() {
        if (!this.testGame || !this.testGame.maze) {
            return this.logTest('Start/End Areas', false, 'Maze not available');
        }

        const maze = this.testGame.maze;
        const results = [];

        // Test start area (top-left 3x3)
        let startAreaClear = true;
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (maze.isWall(x, y)) {
                    startAreaClear = false;
                    break;
                }
            }
        }

        results.push(this.logTest('Start Area Clear',
            startAreaClear,
            `Start area (3x3 top-left) - ${startAreaClear ? 'CLEAR' : 'BLOCKED'}`,
            { startAreaClear: startAreaClear }
        ));

        // Test end area (bottom-right 3x3)
        let endAreaClear = true;
        for (let y = maze.height - 3; y < maze.height; y++) {
            for (let x = maze.width - 3; x < maze.width; x++) {
                if (maze.isWall(x, y)) {
                    endAreaClear = false;
                    break;
                }
            }
        }

        results.push(this.logTest('End Area Clear',
            endAreaClear,
            `End area (3x3 bottom-right) - ${endAreaClear ? 'CLEAR' : 'BLOCKED'}`,
            { endAreaClear: endAreaClear }
        ));

        return results;
    }

    // ===== PROJECTILE POSITION TESTS =====

    /**
     * Test projectile creation
     */
    testProjectileCreation() {
        if (!this.testGame || !this.testGame.playerTank) {
            return this.logTest('Projectile Creation', false, 'Player tank not available');
        }

        const initialCount = this.testGame.projectiles.length;
        const tank = this.testGame.playerTank;
        
        // Create a test projectile
        const projectile = {
            x: tank.x,
            y: tank.y,
            angle: tank.angle,
            speed: 5,
            range: 10,
            distanceTraveled: 0,
            owner: 'player'
        };
        
        this.testGame.projectiles.push(projectile);
        
        const creationSuccessful = this.testGame.projectiles.length === initialCount + 1;
        
        return this.logTest('Projectile Creation',
            creationSuccessful,
            `Created projectile at (${projectile.x.toFixed(2)}, ${projectile.y.toFixed(2)})`,
            { 
                initialCount: initialCount, 
                newCount: this.testGame.projectiles.length, 
                projectile: projectile 
            }
        );
    }

    /**
     * Test projectile movement
     */
    testProjectileMovement() {
        if (!this.testGame || this.testGame.projectiles.length === 0) {
            return this.logTest('Projectile Movement', false, 'No projectiles available');
        }

        const projectile = this.testGame.projectiles[0];
        const originalX = projectile.x;
        const originalY = projectile.y;
        
        // Simulate projectile movement
        const radians = (projectile.angle * Math.PI) / 180;
        const newX = originalX + Math.cos(radians) * projectile.speed;
        const newY = originalY + Math.sin(radians) * projectile.speed;
        
        projectile.x = newX;
        projectile.y = newY;
        projectile.distanceTraveled += projectile.speed;
        
        const movementSuccessful = projectile.x !== originalX || projectile.y !== originalY;
        
        return this.logTest('Projectile Movement',
            movementSuccessful,
            `Projectile moved from (${originalX.toFixed(2)}, ${originalY.toFixed(2)}) to (${newX.toFixed(2)}, ${newY.toFixed(2)})`,
            { 
                original: { x: originalX, y: originalY }, 
                new: { x: newX, y: newY },
                distanceTraveled: projectile.distanceTraveled
            }
        );
    }

    /**
     * Test projectile collision detection
     */
    testProjectileCollision() {
        if (!this.testGame || this.testGame.projectiles.length === 0 || !this.testGame.maze) {
            return this.logTest('Projectile Collision', false, 'Required objects not available');
        }

        const projectile = this.testGame.projectiles[0];
        const maze = this.testGame.maze;
        
        const projectileX = Math.floor(projectile.x);
        const projectileY = Math.floor(projectile.y);
        
        const hitsWall = maze.isWall(projectileX, projectileY);
        
        return this.logTest('Projectile Wall Collision',
            !hitsWall,
            `Projectile at (${projectileX}, ${projectileY}) - ${hitsWall ? 'HITS WALL' : 'NO WALL'}`,
            { 
                projectileX: projectileX, 
                projectileY: projectileY, 
                hitsWall: hitsWall 
            }
        );
    }

    // ===== COORDINATE MAPPING TESTS =====

    /**
     * Test coordinate mapping from game to screen coordinates
     */
    testCoordinateMapping() {
        if (!this.testGame || !this.testGame.maze || !this.testGame.playerTank) {
            return this.logTest('Coordinate Mapping', false, 'Required objects not available');
        }

        const maze = this.testGame.maze;
        const tank = this.testGame.playerTank;
        
        // Test coordinate mapping from game coordinates to screen coordinates
        const screenX = tank.x * maze.cellSize;
        const screenY = tank.y * maze.cellSize;
        
        const mappingValid = screenX >= 0 && screenY >= 0 && 
                           screenX < maze.width * maze.cellSize && 
                           screenY < maze.height * maze.cellSize;
        
        return this.logTest('Coordinate Mapping',
            mappingValid,
            `Tank at (${tank.x.toFixed(2)}, ${tank.y.toFixed(2)}) maps to screen (${screenX.toFixed(0)}, ${screenY.toFixed(0)})`,
            { 
                gameCoords: { x: tank.x, y: tank.y }, 
                screenCoords: { x: screenX, y: screenY },
                cellSize: maze.cellSize
            }
        );
    }

    /**
     * Test reverse coordinate mapping (screen to game)
     */
    testReverseCoordinateMapping() {
        if (!this.testGame || !this.testGame.maze) {
            return this.logTest('Reverse Coordinate Mapping', false, 'Maze not available');
        }

        const maze = this.testGame.maze;
        
        // Test with known screen coordinates
        const testScreenX = 100;
        const testScreenY = 100;
        
        const gameX = testScreenX / maze.cellSize;
        const gameY = testScreenY / maze.cellSize;
        
        const reverseMappingValid = gameX >= 0 && gameY >= 0 && 
                                  gameX < maze.width && gameY < maze.height;
        
        return this.logTest('Reverse Coordinate Mapping',
            reverseMappingValid,
            `Screen (${testScreenX}, ${testScreenY}) maps to game (${gameX.toFixed(2)}, ${gameY.toFixed(2)})`,
            { 
                screenCoords: { x: testScreenX, y: testScreenY },
                gameCoords: { x: gameX, y: gameY },
                cellSize: maze.cellSize
            }
        );
    }

    // ===== COMPREHENSIVE TEST SUITES =====

    /**
     * Run all tank position tests
     */
    async runTankPositionTests() {
        console.log('Running tank position tests...');
        
        const results = [];
        results.push(...this.testTankInitialization());
        results.push(...this.testTankPositionValidity());
        results.push(...this.testTankAngles());
        results.push(this.testTankSeparation());
        results.push(await this.testTankMovement());
        results.push(this.testTankWallCollision());
        
        return results;
    }

    /**
     * Run all maze position tests
     */
    runMazePositionTests() {
        console.log('Running maze position tests...');
        
        const results = [];
        results.push(...this.testMazeGeneration());
        results.push(this.testWallDistribution());
        results.push(...this.testStartEndAreas());
        
        return results;
    }

    /**
     * Run all projectile position tests
     */
    runProjectilePositionTests() {
        console.log('Running projectile position tests...');
        
        const results = [];
        results.push(this.testProjectileCreation());
        results.push(this.testProjectileMovement());
        results.push(this.testProjectileCollision());
        
        return results;
    }

    /**
     * Run all coordinate mapping tests
     */
    runCoordinateMappingTests() {
        console.log('Running coordinate mapping tests...');
        
        const results = [];
        results.push(this.testCoordinateMapping());
        results.push(this.testReverseCoordinateMapping());
        
        return results;
    }

    /**
     * Run all location tests
     */
    async runAllLocationTests() {
        console.log('Running all location tests...');
        
        // Initialize test game if not already done
        if (!this.testGame) {
            const initResult = await this.initializeTestGame();
            if (!initResult.success) {
                return [this.logTest('Test Initialization', false, initResult.message)];
            }
        }
        
        const allResults = [];
        allResults.push(...await this.runTankPositionTests());
        allResults.push(...this.runMazePositionTests());
        allResults.push(...this.runProjectilePositionTests());
        allResults.push(...this.runCoordinateMappingTests());
        
        return allResults;
    }

    /**
     * Generate test report
     */
    generateTestReport() {
        const summary = this.getTestSummary();
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: summary,
            details: this.testResults
        };
        
        return report;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationTests;
} else {
    // Browser environment
    window.LocationTests = LocationTests;
}

