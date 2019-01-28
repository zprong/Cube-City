## term-project-group-46
## This is a README Markdown file containing all of the information about CubeCity, a 3D animated game created in WebGL for the final term project of CS 174A at UCLA under the instruction of Scott Friedman.

# CubeCity 

by 

Ben Huang UID: 204625583  Email: benthuang@g.ucla.edu

Anderson Ju  UID: 504606314 Email: anderson.ju9797@gmail.com

Subhodh Madala UID: 804766612 Email: smadala98@gmail.com

Zachary Prong  UID: 304958784 Email: prongzachary@gmail.com


# Introduction:

CubeCity is a three dimensional platforming game in which two players, playing as cubes, work together in order to reach the goal at the end of each level. The game features custom-made levels which include obstacles such as barriers that can be opened by switches. In order to complete each level, the two players must link up to become a rectangular prism and reach the goal in order to conquer Cube City. These shapes move only by rotating about their edges, rather than translating, which leads to added difficulty when using the prism.
The game involves many different graphics features, including a toggle for transparency, which allows the user to see through blocks obstructing the player's view, unit collision, which allows implementation of walls to allow for more diverse puzzle design, and projectile physics, which provides challenging obstacles to avoid in each level (and detected collision with the player will cause the player to 'lose'). There are some challenging puzzles included in each level, which includes a switch system that will require you to unlock doors for each player to proceed.

# How to run the program:

Download the .zip file and extract the contents
On Windows, run the Host.bat file, provided within the program files
On Mac, run the Host.command file, provided within the program files
Run the program using localhost:8000 on Google Chrome web browser
Enjoy!


# How to Play: 


Objective: 
	Reach the end goal! The end is denoted by a Kirby icon, and can only be completed when both players (cubes) link up to become a rectangular prism. The level is completed when the rectangular prism is placed upright on the Goal (Kirby) icon. There are 5 levels in total.
	
Blocks Types:

	Kirby: Finish Block - Land here as a team to win!
	Ecce Mono: Switch - Opens doors that obstruct you from the goal
	Pikachu: Double Switch - Form a combined block and land here to activate it, opening a door.
	Brown Block: Wall
	Dark Green Block: Door
	Red Projectile: Meteor! A dangerous meteor that will reset the block it hits.
	
Controls: 

Player 1 Controls:

	Movement: w/a/s/d: up/left/down/right (these are also the controls for the combined rectangular prism)
	Movement occurs as a rotation about the edge in the direction you are attempting to go.
	
	Transparency: q
	
Player 2 Controls: 

	Movement: i/j/k/l: up/left/down/right (these are also the controls for the combined rectangular prism)
	Movement occurs as a rotation about the edge in the direction you are attempting to go.
	
	Transparency: u
	
General Controls: 

	n : Go to the next level after completion / reset level if incomplete
	
	b : make all obstacles transparent


# Roles:

Ben: 
	My main role was to help code and display the levels that we have in the game. This involved learning how to create and display the maps, including the walls/obstacles that obstruct the players, and laying out the levels such that they can be completed without getting stuck. One of the biggest obstacles I faced was approaching one of our advanced topics, shadows, because we could not figure out how to get the masking to work and create a reliable shadow with our resources. We decided to rely on the use of the tiny graphics library, which made a lot of things simple, but the shadows feature became harder to implement, so we decided not to implement it and decided to try something else (projectile physics).

Anderson: 
	My main role involved designing levels to traverse and providing input on the different types of obstacles that could be involved in the game. I designed the levels in a way such that the game would be simple so that we could allow the graphics of our project to be the main focus of the demonstration. We came up with ideas for the game to be multiplayer instead of single player, and then fleshed this idea out into a cooperative game where the multiple players can link up to complete the level. I also helped create the controls description to assist players.

Subhodh:
	 My main role was to help implement the basic movement functions of each player, as well as to implement the advanced features of transparency and projectile physics and their collisions. I was able to implement the transparency function so that the player's could still view all aspects of the map, even though there were obstructions, and implemented the projectile physics and their collisions using the demos as inspiration. I wanted to have projectiles flying through the map to make the game a little more challenging for each player. I worked to try and get shadow mapping to work, but despite many different efforts I realized that the tiny graphics library, something that we relied on for a large portion of our project, made it far too difficult to implement it, so I decided to work on the physics and collision detection instead. I also implemented the function that allowed the two players to join together and move as one player, helped implement a lot of the level designs that were mocked up, and created the skybox.

Zachary:
	 My main role involved implementing the collision detection and movement of the cubes through the level. I was able to create the walls and include switches that had to be pressed in order to proceed in each level, as well as create barriers for the blocks so that the user cannot freely move off the terrain. Additionally, if the blocks tried to move off when they combined into a rectangular prism, but there wasn't space to move in that direction, the game would prevent the user from moving. I also helped implement the objective space which the user has to land on in order to complete each level. I assisted in a large portion of level design to keep the game challenging. 




# Advanced Features:

Collision (and collision detection): 
	The blocks in our game have collision detection, so that each block cannot pass through another. The program also detects if player blocks and the red projectiles (meteors) collide, which forces the players back to their respective starting position. 

Projectile Physics: 
	We implemented projectile physics in our game by having projectiles that bounce and translate throughout the first 3 levels for added difficulty. The projectiles move through the map and if the user's block intersects with that projectile's bounding sphere, the user will be sent back to their starting spot. The physics were implemented with assistance from the demos and slides provided by the professor and TA's. The bouncing physics are made more realistic through manipulating the linear and angular velocity when it reaches ground level, either randomizing them or reversing them.
 
Transparency: Transparency was implemented as a toggle for our game, where the toggle was implemented with a keypress in the control panel. We wanted to have transparency in this game so that we could play with a graphics setting that did not affect much of the rest of the project, but still display what we have learned this quarter. The transparency was implemented with transparent versions of each texture-mapped cube, and the toggle changes the cube from the non-transparent one to the transparent one. The cubes are drawn in this transparent form by determining which has greater depth, and then drawing that cube first. We did this for the two cubes since they are not static, and their position changes often. This allows for proper interpolation of the cube's colors if they are adjacent. We also enabled transparency toggling for walls and doors, so that the map elements aren't fully obstructed.
