window.CubeCity = window.classes.CubeCity =
class CubeCity extends Simulation
  { constructor( context, control_box )
      { super(   context, control_box );
      if( !context.globals.has_controls   )
        context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) );
//       if( !context.globals.has_info_table )
//         context.register_scene_component( new Global_Info_Table( context, control_box.parentElement.insertCell() ) );
        
      context.globals.graphics_state.    camera_transform = Mat4.translation([ 0,0,-50 ]);
      context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, context.width/context.height, 1, 1000 );

         const shapes = { box:   new Cube(),
                          box_2: new ZoomCube(),
                          axis:  new Axis_Arrows(),
                          floor: new Square(),
                          ball:  new Subdivision_Sphere(1),
                          rect_prism: new Prism(),
                        }                       
         this.submit_shapes( context, shapes );
         this.level = 1;
         this.beat_level = false;
         // JavaScript Player + Board information
         // 1 = valid, -1 = empty, 0 = obstacle, 
         // 2 = switch, 3 = finish, 4 = door
         this.board = [
             [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
             [ 1, 3, 1, 1, 1, 1, 1, 1, 2, 1],
             [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
             [ 1, 1, 1, 1,-1,-1, 1, 1, 1, 1],
             [ 1, 1, 1, 1,-1,-1, 1, 1, 1, 1],
             [ 0, 4, 0, 0,-1,-1, 0, 0, 4, 0],
             [ 1, 1, 1, 1,-1,-1, 1, 1, 1, 1],
             [ 1, 1, 1, 1,-1,-1, 1, 1, 1, 1],
             [ 1, 1, 1, 1,-1,-1, 1, 1, 1, 1],
             [ 1, 1, 1, 2,-1,-1, 1, 1, 1, 1],
         ];
         this.player1 = {
             x: 0,
             y: 9
         };
        
         this.player2 = {
             x: 9,
             y: 9
         };
        
         this.prism = {
             x: 4,
             y: 2
         };               
        
         this.x_aligned = false;
         this.is_standing = false;        
         this.show_doors = [true, true];

         this.materials =
           { phong:  context.get_instance( Phong_Shader ).material( Color.of( 0.258,1,0.793,1 ), { specularity: 1, smoothness: 100}),
             boldandbrash: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, specularity: 1, texture: context.get_instance("assets/boldandbrash.jpg", true) }),
             boldandbrasht: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,0.5 ), { ambient: 1, texture: context.get_instance("assets/boldandbrash.jpg", true) }),
             brashandbold: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, specularity: 1, texture: context.get_instance("assets/brashandbold.jpg", true) }),
             brashandboldt: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,0.5 ), { ambient: 1, texture: context.get_instance("assets/brashandbold.jpg", true) }),                        
             ditto: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/ditto.png", true) }),
             kirby: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/kirby.jpg", true) }),
             pikachu: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/pikachu.jpg", true) }),
             ground: context.get_instance( Phong_Shader ).material( Color.of( 1,0.25,0.15,1 ), { ambient: 0.5, specularity: 1}),
             outline: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/outline.png", true) }),
             eccemono: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/eccemono.jpg", true) }),             
             skybox_top: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/skybox/top.png", true)} ),             
             skybox_bot: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/skybox/bot.png", true)} ),             
             skybox_back: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/skybox/back.png", true)} ),             
             skybox_front: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/skybox/front.png", true)} ),             
             skybox_left: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/skybox/left.png", true)} ),             
             skybox_right: context.get_instance( Phong_Shader ).material( Color.of(0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/skybox/right.png", true)} ),             
           }

         this.lights = [ new Light( Vec.of(-10,10,10,1 ), Color.of( 0.5,1,1,1 ), 100000000 ) ];
         context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of(-10,20,25), Vec.of(0,0,0), Vec.of(0,1,0));

         this.transparent_obj = 0;

         this.position = Mat4.identity(); // Holds the current transformation matrix of shape.
         this.position = this.position.times(Mat4.translation([-8,0,10]));
         this.cur_val = 0;
         this.cur_position = "a";
         this.coords1 = [-8,0,10];
         this.transparent1 = 0;
        
         this.position2 = Mat4.identity();
         this.position2 = this.position2.times(Mat4.translation([10,0,10]));
         this.cur_val2 = 0;
         this.cur_position2 = 'a';
         this.coords2 = [10,0,10];
         this.transparent2 = 0;

         this.combine = 0;
         this.along_x = 0;
         this.rect_position = Mat4.identity();
         this.rect_cur_position = 'a';
         this.rect_coords = [0,0,0];
         // Dictionary containing the next orientation of the cube, index into the string where 0 = right, 1 = left, 2 = up, 3 = down, will give you the next orientation.
         this.next_positions_dict = {
               'a': "dbjp",
               'b': "ackm",
               'c': "bdln",
               'd': "caio",
               'e': "fhnl",
               'f': "geoi",
               'g': "hfpj",
               'h': "egmk",
               'i': "qufd",
               'j': "rvga",
               'k': "swhb",
               'l': "txec",
               'm': "uqbh",
               'n': "vrce",
               'o': "wsdf",
               'p': "xtag",
               'q': "mitr",
               'r': "njqs",
               's': "okrt",
               't': "plsq",
               'u': "imvx",
               'v': "jnwu",
               'w': "koxv",
               'x': "lpuw"
         };
         // Dictionary containing the translation to be executed on the current orientation, where the index into the value is the same as for the position dictionary.
         this.translations_dict = {
               'a': [[2,0,0],[-2,0,0],[0,0,-2],[0,0,2]],
               'b': [[0,-2,0],[0,2,0],[0,0,-2],[0,0,2]],
               'c': [[-2,0,0],[2,0,0],[0,0,-2],[0,0,2]],
               'd': [[0,2,0],[0,-2,0],[0,0,-2],[0,0,2]],
               'e': [[-2,0,0],[2,0,0],[0,0,2],[0,0,-2]],
               'f': [[0,2,0],[0,-2,0],[0,0,2],[0,0,-2]],
               'g': [[2,0,0],[-2,0,0],[0,0,2],[0,0,-2]],
               'h': [[0,-2,0],[0,2,0],[0,0,2],[0,0,-2]],
               'i': [[0,2,0],[0,-2,0],[-2,0,0],[2,0,0]],
               'j': [[2,0,0],[-2,0,0],[0,2,0],[0,-2,0]],
               'k': [[0,-2,0],[0,2,0],[2,0,0],[-2,0,0]],
               'l': [[-2,0,0],[2,0,0],[0,-2,0],[0,2,0]],
               'm': [[0,-2,0],[0,2,0],[-2,0,0],[2,0,0]],
               'n': [[-2,0,0],[2,0,0],[0,2,0],[0,-2,0]],
               'o': [[0,2,0],[0,-2,0],[2,0,0],[-2,0,0]],
               'p': [[2,0,0],[-2,0,0],[0,-2,0],[0,2,0]],
               'q': [[0,0,2],[0,0,-2],[-2,0,0],[2,0,0]],
               'r': [[0,0,2],[0,0,-2],[0,2,0],[0,-2,0]],
               's': [[0,0,2],[0,0,-2],[2,0,0],[-2,0,0]],
               't': [[0,0,2],[0,0,-2],[0,-2,0],[0,2,0]],
               'u': [[0,0,-2],[0,0,2],[-2,0,0],[2,0,0]],
               'v': [[0,0,-2],[0,0,2],[0,2,0],[0,-2,0]],
               'w': [[0,0,-2],[0,0,2],[2,0,0],[-2,0,0]],
               'x': [[0,0,-2],[0,0,2],[0,-2,0],[0,2,0]],              
         };
         // Dictionary similar to other translation dictionary, but maps out translations for the 2x1 rectangular prism.
         this.prism_translations_dict = {
               'a': [[3,1,0],[-3,1,0],[0,0,-2],[0,0,2]],
               'b': [[-1,-3,0],[-1,3,0],[-1,0,-3],[-1,0,3]], // standing up
               'c': [[-3,-1,0],[3,-1,0],[0,0,-2],[0,0,2]],
               'd': [[1,3,0],[1,-3,0],[1,0,-3],[1,0,3]], // standing up
               'e': [[-3,1,0],[3,1,0],[0,0,2],[0,0,-2]],
               'f': [[-1,3,0],[-1,-3,0],[-1,0,3],[-1,0,-3]], // standing up
               'g': [[3,-1,0],[-3,-1,0],[0,0,2],[0,0,-2]],
               'h': [[1,-3,0],[1,3,0],[1,0,3],[1,0,-3]], // standing up
               'i': [[0,2,0],[0,-2,0],[-3,0,1],[3,0,1]],
               'j': [[3,0,1],[-3,0,1],[0,2,0],[0,-2,0]],
               'k': [[0,-2,0],[0,2,0],[3,0,1],[-3,0,1]],
               'l': [[-3,0,1],[3,0,1],[0,-2,0],[0,2,0]],
               'm': [[0,-2,0],[0,2,0],[-3,0,-1],[3,0,-1]],
               'n': [[-3,0,-1],[3,0,-1],[0,2,0],[0,-2,0]],
               'o': [[0,2,0],[0,-2,0],[3,0,-1],[-3,0,-1]],
               'p': [[3,0,-1],[-3,0,-1],[0,-2,0],[0,2,0]],
               'q': [[0,0,2],[0,0,-2],[-3,-1,0],[3,-1,0]],
               'r': [[1,0,3],[1,0,-3],[1,3,0],[1,-3,0]], // standing up
               's': [[0,0,2],[0,0,-2],[3,1,0],[-3,1,0]],
               't': [[-1,0,3],[-1,0,-3],[-1,-3,0],[-1,3,0]], // standing up
               'u': [[0,0,-2],[0,0,2],[-3,1,0],[3,1,0]],
               'v': [[-1,0,-3],[-1,0,3],[-1,3,0],[-1,-3,0]], // standing up
               'w': [[0,0,-2],[0,0,2],[3,-1,0],[-3,-1,0]],
               'x': [[1,0,-3],[1,0,3],[1,-3,0],[1,3,0]], // standing up             
         };
      }
      
     set_rect_coordinates() {
        this.prism.x = this.player1.x < this.player2.x ? this.player1.x : this.player2.x;
        this.prism.y = this.player1.y < this.player2.y ? this.player1.y : this.player2.y;
     }
    
     check_if_adjacent() {
         // If this statement is true, this means the blocks are lined up in the x axis and adjacent.
         if ((Math.abs(this.coords1[0] - this.coords2[0]) === 2) && (this.coords1[2] === this.coords2[2])) {
                 let new_coords = [1/2 * (this.coords1[0] + this.coords2[0]), 1/2 * (this.coords1[1] + this.coords2[1]), 1/2 * (this.coords1[2] + this.coords2[2])];
                 this.rect_position = this.rect_position.times(Mat4.translation(new_coords));
                 this.rect_coords = new_coords;  
                 this.combine = 1;
                 this.x_aligned = true;
         // If this statement is true, this means that the blocks are lined up in the z axis and adjacent.
         } else if ((Math.abs(this.coords1[2] - this.coords2[2]) === 2) && (this.coords1[0] === this.coords2[0])) {
                 let new_coords = [1/2 * (this.coords1[0] + this.coords2[0]), 1/2 * (this.coords1[1] + this.coords2[1]), 1/2 * (this.coords1[2] + this.coords2[2])];
                 this.rect_position = this.rect_position.times(Mat4.translation(new_coords));
                 // If its aligned in the z axis, we need to rotate the prism to fit the orientation. This also changes the axis orientation, so we need to change the rect_cur_position to the key in the dictionaries that fit
                 // that axis orientation, which is 'u'.
                 this.rect_position = this.rect_position.times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)));
                 this.rect_cur_position = 's';
                 this.rect_coords = new_coords;  
                 this.combine = 1;
                 this.x_aligned = false;
         }
         // Set rectangular prism coordinates for future movements + collision detection
         this.set_rect_coordinates();        
     }

     change_position( is_lateral, sign, index, cube_index) {
          // We are in prism mode, so use a different function.
           if (this.combine) {
                   this.change_rect_position(sign, index);
                   return;
           }
           let cur_pos = cube_index ? this.cur_position2 : this.cur_position;
           let pos = cube_index ? this.position2 : this.position;
           let rotation_x = -1 * (cur_pos === 'i' || cur_pos === 'm' || cur_pos === 'q' || cur_pos === 'u') + 
                                 (cur_pos === 'k' || cur_pos === 'o' || cur_pos === 's' || cur_pos === 'w');
           let rotation_y = -1 * (cur_pos === 'l' || cur_pos === 'p' || cur_pos === 't' || cur_pos === 'x') + 
                                 (cur_pos === 'j' || cur_pos === 'n' || cur_pos === 'r' || cur_pos === 'v');              
           let rotation_z = -1 * (cur_pos === 'a' || cur_pos === 'b' || cur_pos === 'c' || cur_pos === 'd') + 
                                 (cur_pos === 'e' || cur_pos === 'f' || cur_pos === 'g' || cur_pos === 'h');  
           if (index >= 2) {
                 rotation_x = -1 * (cur_pos === 'a' || cur_pos === 'g' || cur_pos === 'j' || cur_pos === 'p') + 
                                   (cur_pos === 'c' || cur_pos === 'e' || cur_pos === 'l' || cur_pos === 'n');
                 rotation_y = -1 * (cur_pos === 'd' || cur_pos === 'f' || cur_pos === 'i' || cur_pos === 'o') + 
                                   (cur_pos === 'b' || cur_pos === 'h' || cur_pos === 'k' || cur_pos === 'm');              
                 rotation_z = -1 * (cur_pos === 'q' || cur_pos === 'r' || cur_pos === 's' || cur_pos === 't') + 
                                   (cur_pos === 'u' || cur_pos === 'v' || cur_pos === 'w' || cur_pos === 'x');
           }
           pos = pos.times(Mat4.translation(this.translations_dict[cur_pos][index]))
                    .times(Mat4.rotation(sign * Math.PI/2, Vec.of(rotation_x, rotation_y, rotation_z)));
           cur_pos = this.next_positions_dict[cur_pos][index];
           if (!cube_index) {
                 this.cur_position = cur_pos;
                 this.position = pos;
           } else {
                 this.cur_position2 = cur_pos;
                 this.position2 = pos;
           }
           // Change each cube's coordinate correspondingly.
           switch (index) {
                 case 0:
                         if (!cube_index) {
                                 this.coords1[0] += 2;
                         } else {
                                 this.coords2[0] += 2;
                         }
                         break;
                 case 1:
                         if (!cube_index) {
                                 this.coords1[0] -= 2;
                         } else {
                                 this.coords2[0] -= 2;
                         }
                         break;
                 case 2:
                         if (!cube_index) {
                                 this.coords1[2] -= 2;
                         } else {
                                 this.coords2[2] -= 2;
                         }
                         break;
                 case 3:
                         if (!cube_index) {
                                 this.coords1[2] += 2;
                         } else {
                                 this.coords2[2] += 2;
                         }
                         break;
                 default:
                         break;
           }
           // Check if our cubes are adjacent, so that we can then combine our blocks into the 2x1 prism.
           this.check_if_adjacent();
     }
     // Works the same as the change_position, but without the cube_index stuff.
     change_rect_position(sign, index) {
           let cur_pos = this.rect_cur_position;
           let rotation_x = -1 * (cur_pos === 'i' || cur_pos === 'm' || cur_pos === 'q' || cur_pos === 'u') + 
                                 (cur_pos === 'k' || cur_pos === 'o' || cur_pos === 's' || cur_pos === 'w');
           let rotation_y = -1 * (cur_pos === 'l' || cur_pos === 'p' || cur_pos === 't' || cur_pos === 'x') + 
                                 (cur_pos === 'j' || cur_pos === 'n' || cur_pos === 'r' || cur_pos === 'v');              
           let rotation_z = -1 * (cur_pos === 'a' || cur_pos === 'b' || cur_pos === 'c' || cur_pos === 'd') + 
                                 (cur_pos === 'e' || cur_pos === 'f' || cur_pos === 'g' || cur_pos === 'h');  
           if (index >= 2) {
                 rotation_x = -1 * (cur_pos === 'a' || cur_pos === 'g' || cur_pos === 'j' || cur_pos === 'p') + 
                                   (cur_pos === 'c' || cur_pos === 'e' || cur_pos === 'l' || cur_pos === 'n');
                 rotation_y = -1 * (cur_pos === 'd' || cur_pos === 'f' || cur_pos === 'i' || cur_pos === 'o') + 
                                   (cur_pos === 'b' || cur_pos === 'h' || cur_pos === 'k' || cur_pos === 'm');              
                 rotation_z = -1 * (cur_pos === 'q' || cur_pos === 'r' || cur_pos === 's' || cur_pos === 't') + 
                                   (cur_pos === 'u' || cur_pos === 'v' || cur_pos === 'w' || cur_pos === 'x');
           }
           this.rect_position = this.rect_position.times(Mat4.translation(this.prism_translations_dict[cur_pos][index]))
                                                   .times(Mat4.rotation(sign * Math.PI/2, Vec.of(rotation_x, rotation_y, rotation_z)));
           this.rect_cur_position = this.next_positions_dict[this.rect_cur_position][index];
     }     
  
     // Makes sure that objects can't move into obstacles/doors.
     can_move(x, y) {
       return (y>=0) && (y<this.board.length) && (x >= 0) && (x < this.board[y].length) && (this.board[y][x] >= 1 && this.board[y][x] != 4);
     }  

     // Direction = [0,1,2,3] for [right, left, up, down], respectively, allows us to check if prism would not fit in the next move position.    
     update_rect_coord(direction) {          
         // Right      
         if (direction === 0) {                   
             if (this.x_aligned && !this.is_standing) {                                       
                 if (this.can_move(this.prism.x+2,this.prism.y)) {                                            
                     this.is_standing = true;
                     this.prism.x = this.prism.x+2;
                     this.change_position(1, 1, 0, 0);
                     this.check_finish(this.prism.x, this.prism.y);
                 }
             }
             else if (!this.x_aligned && !this.is_standing) {
                 if (this.can_move(this.prism.x+1,this.prism.y) && this.can_move(this.prism.x+1,this.prism.y+1)) {                        
                     this.prism.x++;
                     this.change_position(1, 1, 0, 0);
                 }
             }
             else { // is_standing === 1
                 if (this.can_move(this.prism.x+2, this.prism.y) && this.can_move(this.prism.x+1, this.prism.y)) {
                     this.is_standing = false;
                     this.x_aligned = true;
                     this.prism.x = this.prism.x+1;
                     this.change_position(1, 1, 0, 0);
                 }
             }            
        }
        // Left 
        if (direction === 1) {
             if (this.x_aligned && !this.is_standing) {                                           
                 if (this.can_move(this.prism.x-1, this.prism.y)) {                        
                     this.is_standing = true;
                     this.prism.x = this.prism.x-1;
                     this.change_position(1, -1, 1, 0); 
                     this.check_finish(this.prism.x, this.prism.y);
                 }                    
             }
             else if (!this.x_aligned && !this.is_standing) {
                 if (this.can_move(this.prism.x-1, this.prism.y) && this.can_move(this.prism.x-1, this.prism.y+1)) {
                     this.prism.x--;
                     this.change_position(1, -1, 1, 0); 
                 }
             }
             else { // is_standing === 1
                 if (this.can_move(this.prism.x-2, this.prism.y) && this.can_move(this.prism.x-1, this.prism.y)) {
                     this.is_standing = false;
                     this.x_aligned = true;
                     this.prism.x = this.prism.x-2;
                     this.change_position(1, -1, 1, 0); 
                 }
             }      
        }
        // Up
        if (direction === 2) {
             if (this.x_aligned && !this.is_standing) {
                 if (this.can_move(this.prism.x, this.prism.y-1) && this.can_move(this.prism.x+1, this.prism.y-1)) {
                     this.prism.y--;
                     this.change_position(0, 1, 2, 0);
                 }
             }
             else if (!this.x_aligned && !this.is_standing) {                    
                     if (this.can_move(this.prism.x, this.prism.y-1)) {
                         this.is_standing = true;
                         this.prism.y = this.prism.y-1;
                         this.change_position(0, 1, 2, 0);
                         this.check_finish(this.prism.x, this.prism.y);
                     }
             }
             else { // is_standing === 1
                 if (this.can_move(this.prism.x, this.prism.y-2) && this.can_move(this.prism.x, this.prism.y-1)) {
                     this.is_standing = false;
                     this.x_aligned = false;
                     this.prism.y = this.prism.y-2;
                     this.change_position(0, 1, 2, 0);
                 }
             }
        }
        // Down
        if (direction === 3) {
             if (this.x_aligned && !this.is_standing) {
                 if (this.can_move(this.prism.x, this.prism.y+1) && this.can_move(this.prism.x+1, this.prism.y+1)) {
                     this.prism.y++;
                     this.change_position(0, -1, 3, 0);     
                 }
             }
             else if (!this.x_aligned && !this.is_standing) {
                 if (this.can_move(this.prism.x, this.prism.y+2)) {
                     this.is_standing = true;
                     this.prism.y = this.prism.y + 2;
                     this.change_position(0, -1, 3, 0); 
                     this.check_finish(this.prism.x, this.prism.y);
                 }
             }
             else { // is_standing === 1
                 if (this.can_move(this.prism.x, this.prism.y+2) && this.can_move(this.prism.x, this.prism.y+1)) {
                     this.is_standing = false;
                     this.x_aligned = false;
                     this.prism.y = this.prism.y + 1;
                     this.change_position(0, -1, 3, 0); 
                 }
             }
        }
     }          
    
     check_switch(x,y) {
         // Position is switch if value = 2
         if (this.board[y][x] == 2 || this.board[y][x] == 5) {
             console.log("Stepped on switch");            
             this.open_door(x,y);
         }
     }
    
     // A Map of all switches for each level, indexed by this.level.
     open_door(x,y) {
         // Change door values to 1 in order to open
         switch (this.level) {
             case 1:
                 if ( x === 3 && y === 9) {
                     this.board[5][8] = 1;
                     this.show_doors[0] = false;
                 } else if ( x === 8 && y === 1) {
                     this.board[5][1] = 1;
                     this.show_doors[1] = false;
                 }
                 break;
             case 2:
                 if ( x === 9 && y === 0) {
                      this.board[5][6] = 1;
                 } else if ( x === 3 && y === 9) {
                      this.board[7][1] = 1;
                 }
                 break;
             case 3:
                 if ( x === 0 && y === 2) {
                     this.board[2][8] = 1;
                 } else if ( x === 1 && y === 7) {
                     this.board[5][8] = 1;
                 } else if ( x === 4 && y === 4) {
                     this.board[1][2] = 1;
                 } else if ( x === 6 && y === 1) {
                     this.board[5][3] = 1;
                 } else if ( x === 6 && y === 3) {
                     this.board[5][1] = 1;
                 }
                 break;
             case 4:
                 if ( x === 0 && y === 0) {
                     this.board[3][8] = 1;
                 } else if ( x === 2 && y === 0) {
                     this.board[1][7] = 1;
                 } else if ( x === 8 && y === 0) {
                     this.board[1][3] = 1;
                 } else if ( x === 3 && y === 3) {
                     this.board[5][9] = 1;
                 } else if ( x === 1 && y === 6) {
                     this.board[5][6] = 1;
                 } else if ( x === 5 && y === 6) {
                     this.board[4][0] = 1;
                 } else if ( x === 8 && y === 6) {
                     this.board[6][3] = 1;
                 } else if ( x === 1 && y === 9) {
                     this.board[9][2] = 1;
                 } else if ( x === 5 && y === 9) {
                     this.board[8][6] = 1;
                 } else if ( x === 8 && y === 9) {
                     this.board[7][9] = 1;
                 }
                 break;
               case 5:                
                 if ( x === 2 && y === 9) {
                      this.board[7][1] = 1;
                 } else if ( x === 0 && y === 6) {
                      this.board[2][8] = 1;
                 } else if ( x === 1 && y === 0) {
                      this.board[0][9] = 1;
                 } else if ( ((x === 0 && y === 4) && ((this.player1.x === 0 && this.player1.y === 5) || this.player2.x === 0 && this.player2.y === 5)) 
                                    || ((x === 0 && y === 5) && ((this.player1.x === 0 && this.player1.y === 4) || this.player2.x === 0 && this.player2.y === 4))) { // Special Pair-required Switch
                      console.log("Reached special coordinate");
                      console.log(this.prism.x);
                      console.log(this.prism.y);
                      this.board[4][6] = 1;
                 }
                 break; 
             default:
                 break;
         }
     } 

     check_finish(x,y) {
         // Position is finsih if value = 3
         if (this.is_standing && this.board[y][x] == 3) {
             console.log("Nice! Onto the next level");
             this.beat_level = true;
         }
     }

     change_map() {
         switch (this.level) {
             case 1:
                 // Restores board and other variables and objects to constructor state for level 1.
                 this.board = [
                   [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                   [ 1, 3, 1, 1, 1, 1, 1, 1, 2, 1],
                   [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                   [ 1, 1, 1, 1,-1,-1, 1, 1, 1, 1],
                   [ 1, 1, 1, 1,-1,-1, 1, 1, 1, 1],
                   [ 0, 4, 0, 0,-1,-1, 0, 0, 4, 0],
                   [ 1, 1, 1, 1,-1,-1, 1, 1, 1, 1],
                   [ 1, 1, 1, 1,-1,-1, 1, 1, 1, 1],
                   [ 1, 1, 1, 1,-1,-1, 1, 1, 1, 1],
                   [ 1, 1, 1, 2,-1,-1, 1, 1, 1, 1],
                 ];
                // Puts everything back where it's supposed to go, and changes values accordingly.
                // Could have put it all in a function, but in case other values want to be set, leave alone.
                this.player1.x = 0;
                this.player1.y = 9;
                this.cur_position = 'a';
                this.coords1 = [-8,0,10]
                this.position = Mat4.identity().times(Mat4.translation([-8,0,10]));
                this.player2.x = 9;
                this.player2.y = 9;
                this.cur_position2 = 'a';
                this.position2 = Mat4.identity().times(Mat4.translation([10,0,10]));
                this.coords2 = [10,0,10];
                this.combine = 0;
                this.along_x = 0;
                this.rect_position = Mat4.identity();
                this.rect_cur_position = 'a';
                this.rect_coords = [0,0,0];
                this.x_aligned = false;
                this.is_standing = false;        
                this.show_doors = [true, true];
                break;
             case 2:
                // Makes new/restores level 2 board, same idea as above.
                this.board = [
                  [-1,-1,-1,-1, 1, 1, 1, 1, 1, 2],
                  [-1,-1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [-1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                  [ 1, 1, 1, 1, 1,-1, 1, 1, 1,-1],
                  [ 1, 1, 1, 1, 1,-1, 1, 1, 1,-1],
                  [-1,-1,-1,-1, 1,-1, 4,-1,-1,-1],
                  [-1, 3,-1,-1, 1,-1, 1, 1,-1,-1],
                  [-1, 4,-1, 1, 1,-1, 1, 1, 1,-1],
                  [ 1, 1, 1, 1, 1,-1, 1, 1, 1, 1],
                  [ 1, 1, 1, 2, 1,-1, 1, 1, 1, 1],
                ];
                this.player1.x = 0;
                this.player1.y = 9;
                this.cur_position = 'a';
                this.coords1 = [-8,0,10]
                this.position = Mat4.identity().times(Mat4.translation([-8,0,10]));
                this.player2.x = 9;
                this.player2.y = 9;
                this.cur_position2 = 'a';
                this.position2 = Mat4.identity().times(Mat4.translation([10,0,10]));
                this.coords2 = [10,0,10];
                this.combine = 0;
                this.along_x = 0;
                this.rect_position = Mat4.identity();
                this.rect_cur_position = 'a';
                this.rect_coords = [0,0,0];
                this.x_aligned = false;
                this.is_standing = false;        
                this.show_doors = [true, true];
                break;
            case 3:
                this.board = [
                  [ 1, 1,-1, 1, 1, 0, 1, 1, 1,-1],
                  [ 1, 1, 4, 1, 1, 1, 2, 1, 1,-1],
                  [ 2, 1,-1, 1, 1, 0, 0, 0, 4,-1],
                  [ 1, 1,-1, 1, 1, 0, 2, 1, 1, 1],
                  [ 1, 1,-1, 1, 2, 0, 1, 1, 1,-1],
                  [ 0, 4,-1, 4, 0, 0, 0, 0, 4,-1],
                  [ 1, 1,-1, 1, 1, 1, 1,-1, 1,-1],
                  [ 1, 2,-1, 1, 1, 1, 1,-1, 1, 1],
                  [ 1, 1,-1, 1, 1, 1, 1,-1, 1, 1],
                  [ 1, 1,-1, 1, 3, 1, 1,-1, 1, 1],
                ];
                this.player1.x = 0;
                this.player1.y = 9;
                this.cur_position = 'a';
                this.coords1 = [-8,0,10]
                this.position = Mat4.identity().times(Mat4.translation([-8,0,10]));
                this.player2.x = 9;
                this.player2.y = 9;
                this.cur_position2 = 'a';
                this.position2 = Mat4.identity().times(Mat4.translation([10,0,10]));
                this.coords2 = [10,0,10];
                this.combine = 0;
                this.along_x = 0;
                this.rect_position = Mat4.identity();
                this.rect_cur_position = 'a';
                this.rect_coords = [0,0,0];
                this.x_aligned = false;
                this.is_standing = false;        
                this.show_doors = [true, true];
                break;
            case 4:
                this.board = [
                  [ 2, 1, 2, 0, 3, 1, 1, 0, 2, 0],
                  [ 1, 1, 1, 4, 1, 1, 1, 4, 1, 1],
                  [ 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
                  [ 1, 1, 0, 2, 0, 0, 0, 1, 4, 0],
                  [ 4, 0, 0, 1, 0, 0, 1, 1, 0, 1],
                  [ 1, 1, 0, 1, 0, 1, 4, 1, 0, 4],
                  [ 1, 2, 0, 4, 0, 2, 1, 0, 2, 1],
                  [ 1, 1, 0, 1, 0, 1, 1, 0, 1, 4],
                  [ 1, 0, 0, 1, 0, 0, 4, 0, 0, 1],
                  [ 1, 2, 4, 1, 0, 2, 1, 1, 2, 1],
                ];
                this.player1.x = 0;
                this.player1.y = 9;
                this.cur_position = 'a';
                this.coords1 = [-8,0,10]
                this.position = Mat4.identity().times(Mat4.translation([-8,0,10]));
                this.player2.x = 9;
                this.player2.y = 9;
                this.cur_position2 = 'a';
                this.position2 = Mat4.identity().times(Mat4.translation([10,0,10]));
                this.coords2 = [10,0,10];
                this.combine = 0;
                this.along_x = 0;
                this.rect_position = Mat4.identity();
                this.rect_cur_position = 'a';
                this.rect_coords = [0,0,0];
                this.x_aligned = false;
                this.is_standing = false;        
                this.show_doors = [true, true];
                break;
            case 5:                
                this.board = [
                  [-1, 2, 1, 1, 1, 1, 1, 1, 1, 4],
                  [ 1, 1,-1,-1,-1,-1,-1,-1, 1, 1],
                  [ 1, 1,-1,-1,-1,-1,-1,-1, 4, 1],
                  [ 1,-1,-1, 1, 1, 1,-1, 1, 1, 1],
                  [ 5,-1, 3, 1, 1, 1, 4, 1, 1, 1],
                  [ 5,-1,-1, 1, 1, 1,-1, 1, 1, 1],
                  [ 2,-1,-1,-1,-1,-1,-1,-1, 1, 1],
                  [-1, 4, 1, 1,-1,-1,-1,-1, 1, 1],
                  [ 1, 1,-1, 1, 1, 1, 1, 1, 1, 1],
                  [-1, 1, 2,-1,-1, 1, 1, 1, 1,-1],
                ];
                this.player1.x = 0;
                this.player1.y = 8;
                this.cur_position = 'a';
                this.coords1 = [-8,0,8]
                this.position = Mat4.identity().times(Mat4.translation([-8,0,8]));
                this.player2.x = 1;
                this.player2.y = 9;
                this.cur_position2 = 'a';
                this.position2 = Mat4.identity().times(Mat4.translation([-6,0,10]));
                this.coords2 = [-6,0,10];
                this.combine = 0;
                this.along_x = 0;
                this.rect_position = Mat4.identity();
                this.rect_cur_position = 'a';
                this.rect_coords = [0,0,0];
                this.x_aligned = false;
                this.is_standing = false;        
                this.show_doors = [true, true];
                break;  
            default:
                break;
         }
     }

     make_control_panel()
       {
         this.key_triggered_button( "Go to next level (after beating level) or reset level.", ["n"], () => {
             if (this.beat_level) {
                 this.level += 1;
                 console.log(this.level);
                 this.change_map();
                 this.beat_level = false;                 
             } else {
                 this.change_map();
             }
         });
         this.new_line();
         this.key_triggered_button( "Make all obstacles transparent.", ["b"], () => {this.transparent_obj = !this.transparent_obj;});
         this.new_line();
         this.control_panel.innerHTML += "Player One Controls";
         this.new_line();
         this.key_triggered_button( "Right",  [ "d" ], () => {                         
             if (this.combine) { this.update_rect_coord(0); }
             else { if (this.can_move(this.player1.x+1,this.player1.y)) { this.player1.x++; this.change_position(1, 1, 0, 0); this.check_switch(this.player1.x, this.player1.y); } }
         });

         this.key_triggered_button( "Left", [ "a" ], ()   => { 
             if (this.combine) { this.update_rect_coord(1); }                       
             else { if (this.can_move(this.player1.x-1,this.player1.y)) { this.player1.x--; this.change_position(1, -1, 1, 0); this.check_switch(this.player1.x, this.player1.y); } }
         });
         this.key_triggered_button( "Up", [ "w" ], ()     => { 
             if (this.combine) { this.update_rect_coord(2); }            
             else { if (this.can_move(this.player1.x,this.player1.y-1)) { this.player1.y--; this.change_position(0, 1, 2, 0); this.check_switch(this.player1.x, this.player1.y); } }
         });
         this.key_triggered_button("Down", [ "s" ], ()    => { 
             if (this.combine) { this.update_rect_coord(3); }            
             else { if (this.can_move(this.player1.x,this.player1.y+1)) { this.player1.y++; this.change_position(0, -1, 3, 0); this.check_switch(this.player1.x, this.player1.y);} }                     
         });          
         this.key_triggered_button("Make Transparent", [ "q" ], () => { this.transparent1 = !this.transparent1; });
         this.new_line();
         this.control_panel.innerHTML += "Player Two Controls";
         this.new_line();
         this.key_triggered_button( "Right",  [ "l" ], () => { 
             if (this.combine) { this.update_rect_coord(0); }
             else { if (this.can_move(this.player2.x+1,this.player2.y)) { this.player2.x++; this.change_position(1, 1, 0, 1); this.check_switch(this.player2.x, this.player2.y); } }
         });
         this.key_triggered_button( "Left", [ "j" ], ()   => { 
             if (this.combine) { this.update_rect_coord(1); }
             else { if (this.can_move(this.player2.x-1,this.player2.y)) { this.player2.x--; this.change_position(1, -1, 1, 1); this.check_switch(this.player2.x, this.player2.y);} }
         });
         this.key_triggered_button( "Up", [ "i" ], ()     => { 
             if (this.combine) { this.update_rect_coord(2); }
             else { if (this.can_move(this.player2.x,this.player2.y-1)) { this.player2.y--; this.change_position(0, 1, 2, 1); this.check_switch(this.player2.x, this.player2.y);} }
         });
         this.key_triggered_button("Down", [ "k" ], ()    => { 
             if (this.combine) { this.update_rect_coord(3); }
             else { if (this.can_move(this.player2.x,this.player2.y+1)) { this.player2.y++; this.change_position(0, -1, 3, 1); this.check_switch(this.player2.x, this.player2.y);} }
         });
         this.key_triggered_button("Make Transparent", [ "u" ], () => { this.transparent2 = !this.transparent2; });
         this.new_line();

         this.control_panel.innerHTML += "Entity Descriptions";
         this.new_line();
         this.control_panel.innerHTML += "<img src='assets/eccemono.jpg' style='width:25px;height:25px;''> Switch: Opens A Door";
         this.new_line();
         this.control_panel.innerHTML += "<img src='assets/pikachu.jpg' style='width:25px;height:25px;''><img src='assets/pikachu.jpg' style='width:25px;height:25px;''> Paired Switch: Land On Together To Open A Door";
         this.new_line();
         this.control_panel.innerHTML += "<img src='assets/kirby.jpg' style='width:25px;height:25px;''> Finish: Land Here As A Combined Prism, Standing Up";
         this.new_line();
         this.control_panel.innerHTML += "<svg width='25' height='25'><rect width='25' height='25' style='fill:rgb(193.8,105.315,94.35)' /></svg> Brown Block: Wall"          
         this.new_line();
         this.control_panel.innerHTML += "<svg width='25' height='25'><rect width='25' height='25' style='fill:rgb(76.5,105.315,94.35)' /></svg> Dark Green Block: Door"
         this.new_line();
         this.control_panel.innerHTML += "<svg width='25' height='25'><rect width='25' height='25' style='fill:rgb(255,105.315,94.35)' /></svg> Red Projectile: Dangerous! Being Hit Will Reset Block"
       }
    update_state( dt )
    {
      while( this.bodies.length < 1 ) {        // Generate moving bodies:
        switch(this.level) {
          case 1:
            this.bodies.push( new Body( this.shapes.ball, this.materials.ground , Vec.of( 1,1,1 ) )
                .emplace( Mat4.translation( Vec.of(1,10,6) ), Vec.of(-1,2,0).times(3), 0 ) );
            this.bodies.push( new Body( this.shapes.ball, this.materials.ground, Vec.of( 1,1,1 ) )
                .emplace( Mat4.translation( Vec.of(1,10,-2) ), Vec.of(0,2,-1).times(3), 0));
            break;
          case 2:
            this.bodies.push( new Body( this.shapes.ball, this.materials.ground, Vec.of( 1,1,1 ) )
                .emplace( Mat4.identity(), Vec.of(1,0,0).times(3), Math.random()) );
            this.bodies.push( new Body( this.shapes.ball, this.materials.ground, Vec.of( 1,1,1 ) )
                .emplace( Mat4.translation( Vec.of(4,0,0) ), Vec.of(0,0,1).times(3), Math.random()) );
            break;
          case 3:
            this.bodies.push( new Body( this.shapes.ball, this.materials.ground, Vec.of( 1,1,1 ) )
                .emplace( Mat4.translation( Vec.of(-10,10,-10)), Vec.of(1,1,1).times(3), 0));
            break;
          case 4:
            return;
          default:
            return;
        }
      }

      let c1 = new Body( this.shapes.box, this.materials.ground , Vec.of( 1,1,1 ) )
                .emplace( this.position, Vec.of(0,0,0).times(3), 0 );
      let c2 = new Body( this.shapes.box, this.materials.ground, Vec.of( 1,1,1) )
                .emplace( this.position2, Vec.of(0,0,0).times(3), 0);
      let r = new Body( this.shapes.prism, this.materials.ground, Vec.of(1,1,1))
                .emplace( this.rect_position, Vec.of(0,0,0).times(3), 0);
      for( let b of this.bodies )
      { let b_inv = Mat4.inverse(b.drawn_location.times(Mat4.scale([1.1,1.1,1.1])));
         if (this.combine && b.check_if_colliding(r, b_inv, this.shapes.ball)) {
            this.player1.x = 0;
            this.player1.y = 9;
            this.cur_position = 'a';
            this.coords1 = [-8,0,10]
            this.position = Mat4.identity().times(Mat4.translation([-8,0,10]));
            this.player2.x = 9;
            this.player2.y = 9;
            this.cur_position2 = 'a';
            this.position2 = Mat4.identity().times(Mat4.translation([10,0,10]));
            this.coords2 = [10,0,10];
            this.combine = 0;
            this.along_x = 0;
            this.rect_position = Mat4.identity();
            this.rect_cur_position = 'a';
            this.rect_coords = [0,0,0];
            this.x_aligned = false;
            this.is_standing = false;        
            this.show_doors = [true, true];
         } else if(!this.combine && b.check_if_colliding(c1, b_inv , this.shapes.ball)) {
            this.position = Mat4.identity().times(Mat4.translation([-8,0,10]));
            this.player1.x = 0;
            this.player1.y = 9;
            this.cur_position = 'a';
            this.coords1 = [-8,0,10]
         } else if(!this.combine && (b.check_if_colliding(c2, b_inv, this.shapes.ball))) {
            this.player2.x = 9;
            this.player2.y = 9;
            this.position2 = Mat4.identity().times(Mat4.translation([10,0,10]));
            this.cur_position2 = 'a';
            this.coords2 = [10,0,10];
         } else if (this.beat_level) {
            this.bodies = [];
         } else {
            switch(this.level) {
              case 1:
                if (b.center[1] < 0 && b.linear_velocity[1] < 0) {
                    b.linear_velocity[1] *= -.8;
                    b.angular_velocity = -1;
                }
                b.linear_velocity[1] += dt * -9.8;
                break;
              case 2:
                if (b.center.norm() > 13) {
                    b.linear_velocity[0] *= -1;
                    b.linear_velocity[2] *= -1;
                }
                break;
              case 3:
                if (b.center[1] < 0 && b.linear_velocity[1] < 0) {
                    b.linear_velocity[1] *= -.8;
                    b.angular_velocity = Math.random();                   
                } else {
                    b.linear_velocity[1] += dt * -9.8;
                }
                break;
              default:
                break;
            }
         }      
      }                                          // Delete bodies that stop or stray too far away.
      if (this.level === 1 || this.level === 2) {
          this.bodies = this.bodies.filter( b => b.center.norm() < 14);
      } else if (this.level === 3) {
          this.bodies = this.bodies.filter( b=> b.center.norm() < 18);  
      }
    }
    display( graphics_state )
       { 
       super.display( graphics_state );
         graphics_state.lights = this.lights;
         const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

         // Iterate through board, drawing based of the board's values.
         let model_transform = Mat4.identity();
         let horiz_wall_transform = Mat4.identity();
         model_transform = model_transform.times(Mat4.translation([-10,-2,-10]));
         for (var i = 0; i < 10; i++) {
               model_transform = model_transform.times(Mat4.translation([0,0,2]));
               for (var j = 0; j < 10; j++) {
                     model_transform = model_transform.times(Mat4.translation([2,0,0]));
                     if (this.board[i][j] === 0 || this.board[i][j] === 1 || this.board[i][j] === 4) {
                         if (this.board[i][j] === 0 || this.board[i][j] === 4) {
                             horiz_wall_transform = model_transform;
                             horiz_wall_transform = horiz_wall_transform.times(Mat4.translation([0,2,0]));
                             this.shapes.box.draw(graphics_state, horiz_wall_transform, this.materials.phong.override( 
                                    { color: (!this.board[i][j] ? Color.of(0.760,0.413,0.370, (this.transparent_obj ? 0.5 : 1)) : Color.of(0.3,0.413,0.370, (this.transparent_obj ? 0.5 : 1))) }));
                         }
                         this.shapes.box.draw(graphics_state, model_transform, this.materials.outline);
                     } else if (this.board[i][j] === 2) {
                         this.shapes.box.draw(graphics_state, model_transform, this.materials.eccemono);
                     } else if (this.board[i][j] === 3) {
                         this.shapes.box.draw(graphics_state, model_transform, this.materials.kirby);
                     } else if (this.board[i][j] === 5) {
                         this.shapes.box.draw(graphics_state, model_transform, this.materials.pikachu);
                     }                     
               }
               model_transform = model_transform.times(Mat4.translation([-20,0,0]));
         }
         // We combined our cubes into the prism.
         if (this.combine) {
             this.shapes.rect_prism.draw(graphics_state, this.rect_position, this.materials.phong);
         } else {
             // Change order in which cubes are drawn to have accurate transparency, based off z value of cube coordinates.
             if (this.coords2[2] > this.coords1[2]) {
                 this.shapes.box.draw(graphics_state, this.position,
                         this.transparent1 ? this.materials.boldandbrasht : this.materials.boldandbrash);
                 this.shapes.box.draw(graphics_state, this.position2,
                         this.transparent2 ? this.materials.brashandboldt : this.materials.brashandbold);
             } else {
                 this.shapes.box.draw(graphics_state, this.position2,
                         this.transparent2 ? this.materials.brashandboldt : this.materials.brashandbold);
                 this.shapes.box.draw(graphics_state, this.position,
                         this.transparent1 ? this.materials.boldandbrasht : this.materials.boldandbrash);
             }
         }

         //Draw skybox.
         let model_transform2 = Mat4.identity();
         model_transform2 = model_transform2.times(Mat4.translation([0,0,-200]))
                                            .times(Mat4.scale([200,200,200]));
         this.shapes.floor.draw(graphics_state, model_transform2, this.materials.skybox_front);
         model_transform2 = Mat4.identity();
         model_transform2 = model_transform2.times(Mat4.translation([0,0,200]))
                                            .times(Mat4.rotation(Math.PI, Vec.of(0,1,0)))
                                            .times(Mat4.scale([200,200,200]));
         this.shapes.floor.draw(graphics_state, model_transform2, this.materials.skybox_back);
         model_transform2 = Mat4.identity();
         model_transform2 = model_transform2.times(Mat4.translation([200,0,0]))
                                            .times(Mat4.rotation(Math.PI/2, Vec.of(0,-1,0)))
                                            .times(Mat4.scale([200,200,200]));
         this.shapes.floor.draw(graphics_state, model_transform2, this.materials.skybox_right);
         model_transform2 = Mat4.identity();
         model_transform2 = model_transform2.times(Mat4.translation([-200,0,0]))
                                            .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)))
                                            .times(Mat4.scale([200,200,200]));
         this.shapes.floor.draw(graphics_state, model_transform2, this.materials.skybox_left);
         model_transform2 = Mat4.identity();
         model_transform2 = model_transform2.times(Mat4.translation([0,200,0]))
                                            .times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0)))
                                            .times(Mat4.scale([200,200,200]));
         this.shapes.floor.draw(graphics_state, model_transform2, this.materials.skybox_top);
         model_transform2 = Mat4.identity();
         model_transform2 = model_transform2.times(Mat4.translation([0,-200,0]))
                                            .times(Mat4.rotation(Math.PI/2, Vec.of(-1,0,0)))
                                            .times(Mat4.scale([200,200,200]));
         this.shapes.floor.draw(graphics_state, model_transform2, this.materials.skybox_bot);
       }
}
