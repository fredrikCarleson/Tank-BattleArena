# Tank Battle Arena

A turn-based tank battle game inspired by RoboRally, built with HTML5 Canvas and JavaScript. Navigate through procedurally generated mazes, equip your tank with powerful weapons, and defeat AI opponents in strategic combat.

## 🎮 Game Features

### Core Gameplay
- **Turn-based Strategy**: Plan your moves with navigation cards
- **Procedural Mazes**: Each level features a unique, increasingly complex maze
- **Equipment System**: Purchase weapons, armor, and special items with points
- **AI Opponents**: Face intelligent enemies with different difficulty levels
- **Progressive Difficulty**: Mazes get larger and more complex as you advance

### Combat System
- **Card-based Movement**: Select 4 cards from 6 random options each turn
- **Simultaneous Execution**: Both players reveal and execute cards at the same time
- **Weapon Variety**: From basic cannons to missile launchers that can shoot over walls
- **Strategic Positioning**: Use walls for cover and find optimal firing positions

### Equipment & Progression
- **Weapons**: Basic Cannon, Heavy Cannon, Missile Launcher, Laser Cannon, Plasma Cannon
- **Armor**: Light Armor, Heavy Armor, Reactive Armor, Stealth Armor
- **Special Items**: Speed Boosters, Repair Kits, Radar Systems, Shield Generators
- **Point System**: Earn points for victories and spend them on upgrades

## 🚀 How to Run

### Option 1: Direct Browser Opening
1. Download all files to a folder
2. Open `index.html` in any modern web browser
3. The game will start automatically

### Option 2: Local Server (Recommended)
1. Install a local server (e.g., Python, Node.js, or Live Server extension)
2. Navigate to the game directory
3. Start the server and open the URL in your browser

**Using Python:**
```bash
python -m http.server 8000
# Then open http://localhost:8000
```

**Using Node.js:**
```bash
npx http-server
# Then open the provided URL
```

## 🎯 How to Play

### Basic Controls
- **Mouse**: Click cards to select/deselect them
- **Spacebar**: Execute selected cards (when 4 are selected)
- **R**: Start a new game
- **S**: Save game
- **L**: Load game
- **M**: Open shop
- **Escape**: Close shop
- **F12**: Toggle debug tools

### Game Flow
1. **Planning Phase**: Select 4 cards from your hand of 6
2. **Execution Phase**: Both players reveal and execute cards simultaneously
3. **Resolution**: Projectiles travel, collisions are resolved, damage is dealt
4. **New Turn**: Receive 6 new cards and repeat

### Card Types
- **Move Forward X**: Move X steps in the direction you're facing
- **Move Backward X**: Move X steps opposite to your facing direction
- **Turn Left/Right**: Rotate 90 degrees
- **Fire Weapon**: Shoot your equipped weapon

### Strategy Tips
- **Positioning**: Use walls for cover and find optimal firing angles
- **Card Management**: Plan your sequence carefully - order matters!
- **Equipment**: Invest in better weapons and armor as you progress
- **Maze Knowledge**: Learn to navigate efficiently through the maze
- **AI Behavior**: Different difficulty levels change AI aggressiveness and accuracy

## 🛠️ Technical Details

### Architecture
- **Pure JavaScript**: No external dependencies
- **HTML5 Canvas**: For rendering and graphics
- **Modular Design**: Separate classes for game logic, AI, UI, etc.
- **Cross-platform**: Works on desktop and mobile browsers

### File Structure
```
Tanks/
├── index.html          # Main HTML file
├── styles.css          # Game styling
├── js/
│   ├── game.js         # Main game engine
│   ├── maze.js         # Maze generation
│   ├── tank.js         # Tank logic and rendering
│   ├── cards.js        # Card system and projectiles
│   ├── ai.js           # AI opponent logic
│   ├── equipment.js    # Equipment and shop system
│   ├── ui.js           # User interface
│   └── main.js         # Entry point and utilities
└── README.md           # This file
```

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🎨 Visual Style

The game features a modern arcade aesthetic with:
- **Dark Theme**: Deep blues and purples with neon accents
- **Pixel Art Style**: Retro-inspired graphics
- **Smooth Animations**: Tank movement, projectile trails, explosions
- **Visual Feedback**: Health bars, damage indicators, status effects

## 🔧 Debug Features

Press **F12** to access debug tools:
- **God Mode**: Infinite health
- **Kill Enemy**: Instantly defeat AI opponent
- **Add Points**: Get 1000 points instantly
- **Show Grid**: Display maze grid lines
- **Show AI Info**: Display AI tank information
- **Show FPS**: Monitor performance

## 🎯 Game Modes

### Difficulty Levels
- **Easy**: AI makes more mistakes, slower reactions
- **Medium**: Balanced AI behavior
- **Hard**: AI is more accurate and aggressive

### Progression
- **Level 1-5**: Small mazes, basic equipment
- **Level 6-10**: Medium mazes, advanced weapons unlock
- **Level 11+**: Large mazes, all equipment available

## 🏆 Scoring System

Points are awarded based on:
- **Base Victory**: 1000 points
- **Turn Bonus**: Faster victories earn more points
- **Level Bonus**: Higher levels provide more points
- **Equipment**: Better gear costs more points

## 🔮 Future Features

Potential additions:
- **Multiplayer**: Online battles with other players
- **Campaign Mode**: Story-driven missions
- **Custom Maps**: Level editor
- **Achievements**: Unlockable content
- **Sound Effects**: Audio feedback
- **Mobile Optimization**: Touch controls

## 🐛 Known Issues

- Performance may vary on older devices
- Some visual glitches on very small screens
- AI pathfinding can be suboptimal in complex mazes

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the game!

---

**Enjoy Tank Battle Arena!** 🎮⚔️
