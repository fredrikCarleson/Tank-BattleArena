# Tank Battle Arena - Testing Documentation

This document describes the comprehensive testing system for object locations and the debug tools available in Tank Battle Arena.

## Overview

The testing system consists of:
1. **Unit Tests** - Comprehensive tests for object locations and positioning
2. **Debug Tools** - Real-time position monitoring and visualization
3. **Test Runners** - Interactive interfaces for running and managing tests

## Files

### Test Files
- `test-locations.html` - Interactive test interface with visual debugging
- `test-runner.html` - Automated test runner with comprehensive test suites
- `js/location-tests.js` - Core testing module with all unit tests

### Debug Tools
- Enhanced debug panel in the main game (press F12)
- Real-time position monitoring
- Visual coordinate mapping

## Quick Start

### 1. Interactive Testing Interface
Open `test-locations.html` in your browser:
```bash
# Navigate to the project directory
cd Tanks

# Open the test interface
open test-locations.html
```

### 2. Automated Test Runner
Open `test-runner.html` for comprehensive automated testing:
```bash
open test-runner.html
```

### 3. Debug Tools in Main Game
1. Open `index.html` (the main game)
2. Press `F12` to toggle debug tools
3. Check "Show Tank Positions" to see real-time coordinates

## Test Categories

### 1. Tank Position Tests
Tests for tank positioning, movement, and collision detection:

- **Tank Initialization** - Verifies tanks are properly created
- **Position Validity** - Checks if tanks are within maze bounds
- **Angle Validation** - Ensures tank angles are within valid range (0-360°)
- **Tank Separation** - Verifies adequate distance between player and enemy tanks
- **Movement Testing** - Tests tank movement mechanics
- **Wall Collision** - Ensures tanks don't spawn on walls

### 2. Maze Position Tests
Tests for maze generation and structure:

- **Maze Generation** - Verifies maze dimensions and grid initialization
- **Wall Distribution** - Checks for reasonable wall density (10-50%)
- **Start/End Areas** - Ensures clear areas for tank spawning
- **Pathfinding** - Basic connectivity testing

### 3. Projectile Position Tests
Tests for projectile behavior:

- **Projectile Creation** - Tests projectile spawning at tank positions
- **Projectile Movement** - Verifies projectile trajectory calculations
- **Collision Detection** - Tests projectile-wall interactions

### 4. Coordinate Mapping Tests
Tests for coordinate system accuracy:

- **Game to Screen Mapping** - Converts game coordinates to screen pixels
- **Screen to Game Mapping** - Converts screen coordinates to game grid
- **Boundary Testing** - Ensures coordinates stay within valid ranges

## Debug Tools

### Main Game Debug Panel (F12)
The debug panel provides real-time information:

- **Show Grid** - Displays maze grid overlay
- **Show Paths** - Visualizes AI pathfinding
- **Show AI Info** - Displays AI decision information
- **Show FPS** - Performance monitoring
- **Show Tank Positions** - Real-time X,Y coordinates for all objects

### Position Display
When "Show Tank Positions" is enabled, you'll see:
- Player tank coordinates and angle
- Enemy tank coordinates and angle
- Projectile positions (if any)
- All coordinates update in real-time

## Running Tests

### Interactive Testing (`test-locations.html`)

1. **Setup Test Game**
   - Click "Setup Test Game" to initialize a test environment
   - Wait for confirmation that the game is ready

2. **Run Individual Tests**
   - **Tank Position Tests**: Tests tank initialization, positioning, and movement
   - **Maze Position Tests**: Tests maze generation and wall placement
   - **Projectile Position Tests**: Tests projectile creation and movement
   - **GUI Position Tests**: Tests UI elements and coordinate mapping

3. **Real-time Monitoring**
   - Click "Start Monitoring" to watch positions update in real-time
   - Use the visual test canvas to see object positions graphically

### Automated Testing (`test-runner.html`)

1. **Run All Tests**
   - Click "Run All Tests" to execute the complete test suite
   - View results in real-time with progress tracking

2. **Run Specific Test Categories**
   - **Tank Tests**: Focus on tank positioning and movement
   - **Maze Tests**: Focus on maze generation and structure
   - **Projectile Tests**: Focus on projectile behavior
   - **Coordinate Tests**: Focus on coordinate mapping

3. **Export Results**
   - Click "Export Results" to save test results as JSON
   - Results include timestamps, detailed test data, and summary statistics

## Test Results Interpretation

### Pass/Fail Criteria

**Tank Tests:**
- ✅ **PASS**: Tank is within maze bounds, valid angle, not on wall
- ❌ **FAIL**: Tank outside bounds, invalid angle, or on wall

**Maze Tests:**
- ✅ **PASS**: Valid dimensions, reasonable wall density, clear start/end areas
- ❌ **FAIL**: Invalid dimensions, excessive wall density, blocked areas

**Projectile Tests:**
- ✅ **PASS**: Projectile created successfully, moves correctly, collision detection works
- ❌ **FAIL**: Projectile creation fails, movement errors, collision issues

**Coordinate Tests:**
- ✅ **PASS**: Coordinates map correctly between game and screen space
- ❌ **FAIL**: Mapping errors, out-of-bounds coordinates

### Success Rate
- **90-100%**: Excellent - All systems working correctly
- **80-89%**: Good - Minor issues that don't affect gameplay
- **70-79%**: Fair - Some issues that may need attention
- **Below 70%**: Poor - Significant issues requiring fixes

## Keyboard Shortcuts

### Test Runner (`test-runner.html`)
- `Ctrl+R`: Run all tests
- `Ctrl+T`: Run tank tests
- `Ctrl+M`: Run maze tests
- `Ctrl+P`: Run projectile tests
- `Ctrl+C`: Run coordinate tests
- `Ctrl+E`: Export results

### Main Game Debug
- `F12`: Toggle debug panel
- `R`: Restart game
- `S`: Save game
- `L`: Load game
- `M`: Open shop

## Troubleshooting

### Common Issues

1. **Tests Fail to Initialize**
   - Ensure all game scripts are loaded correctly
   - Check browser console for JavaScript errors
   - Verify file paths are correct

2. **Tank Position Tests Fail**
   - Check if tanks are spawning in valid locations
   - Verify maze generation is working
   - Ensure tank movement mechanics are functional

3. **Maze Tests Fail**
   - Check maze generation algorithm
   - Verify wall density calculations
   - Ensure start/end areas are properly cleared

4. **Coordinate Mapping Issues**
   - Verify cell size calculations
   - Check canvas dimensions
   - Ensure coordinate conversion functions are correct

### Debug Tips

1. **Use Browser Console**
   - Open developer tools (F12)
   - Check for error messages
   - Use `console.log()` for debugging

2. **Visual Debugging**
   - Enable "Show Grid" and "Show Tank Positions"
   - Use the test canvas for visual verification
   - Compare expected vs actual positions

3. **Step-by-Step Testing**
   - Run tests individually to isolate issues
   - Check intermediate results
   - Verify each component separately

## Performance Considerations

### Test Execution Time
- **Individual Tests**: < 1 second
- **Full Test Suite**: 2-5 seconds
- **Real-time Monitoring**: Continuous (minimal impact)

### Memory Usage
- **Test Environment**: ~10MB additional memory
- **Debug Tools**: ~5MB additional memory
- **Real-time Monitoring**: ~2MB additional memory

## Extending the Test Suite

### Adding New Tests

1. **Create Test Function**
   ```javascript
   testNewFeature() {
       // Test logic here
       return this.logTest('New Feature Test', 
           passed, 
           message, 
           details);
   }
   ```

2. **Add to Test Suite**
   ```javascript
   runNewFeatureTests() {
       const results = [];
       results.push(this.testNewFeature());
       return results;
   }
   ```

3. **Update Test Runner**
   - Add button to test runner
   - Include in comprehensive test suite
   - Update documentation

### Test Best Practices

1. **Isolation**: Each test should be independent
2. **Clear Naming**: Use descriptive test names
3. **Detailed Logging**: Include relevant data in test results
4. **Error Handling**: Gracefully handle missing dependencies
5. **Performance**: Keep tests fast and efficient

## Conclusion

The testing system provides comprehensive coverage of object locations and positioning in Tank Battle Arena. Use the interactive interfaces for development and debugging, and the automated test runner for continuous integration and quality assurance.

For questions or issues, check the browser console for error messages and refer to this documentation for troubleshooting steps.

