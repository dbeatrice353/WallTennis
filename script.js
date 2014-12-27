
function Vector(x,y){
	return{
		x: x,
		y: y,
		magnitude: function(){
			return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
		},
		normalize: function(){
			length = this.magnitude();
			if(length != 0){
				this.x = this.x/length;
				this.y = this.y/length;
			}
		},
		scale: function(k){
			this.x *= k;
			this.y *= k;
		}
	}
}

function v_add(v1,v2){
	return Vector(v1.x + v2.x,v1.y + v2.y);
}

function v_add_k(v,k){
	return Vector(v.x + k,v.y + k);
}

function v_scale(v,k){
	return Vector(v.x*k,v.y*k);
}

function v_dot_product(v1,v2){
	return v1.x*v2.x + v1.y*v2.y;
}

function v_distance(v1,v2){
	difference = v_add(v1,v_scale(v2,-1));
	dp = v_dot_product(difference,difference);
	return Math.sqrt(dp);
}
//-------------------------SHAPES------------------------------------------
function draw_polygon(context,color,vertices){
	context.fillStyle = color;
	context.beginPath();
	context.moveTo(vertices[0][0],vertices[0][1]);
	for(item=1; item<vertices.length; item+=1){
		context.lineTo(vertices[item][0],vertices[item][1]);
	}
	context.closePath();
	context.fill();
}
function draw_line(context,color,point_a,point_b){
	context.strokeStyle = color;
	context.beginPath();
	context.moveTo(point_a[0], point_a[1]);
	context.lineTo(point_b[0], point_b[1]);
	context.stroke();
}

function draw_box(context,x,y,w,h,color){
	context.rect(x, y, w, h);
	context.stroke();
	context.fillStyle = color;
	context.fill();
}

function draw_ellipse(context,x,y,w,h,color) {
  context.beginPath();
  context.moveTo(x,y-h/2); // A1
  
  context.bezierCurveTo(
    x + w/2, y - h/2, // C1
    x + w/2, y + h/2, // C2
    x, y + h/2); // A2

  context.bezierCurveTo(
    x - w/2, y + h/2, // C3
    x - w/2, y - h/2, // C4
    x, y - h/2); // A1
 
  context.fillStyle = color;
  context.fill();
  context.closePath();	
}
//-------------------------TENNIS COURT------------------------------------

function TennisCourt(screen_width,screen_length){
	return{
		screen_length:screen_length,
		screen_width:screen_width,
		render_sky: function(context){
			context.fillStyle = "#47D1FF";
			context.fillRect(0, 0, this.screen_width, this.screen_length);
		},
		render_ground: function(context){
			lower_x = 0;
			lower_y = (this.screen_length*3/5).toFixed();;
			upper_x = this.screen_width;
			upper_y = this.screen_length;
			context.fillStyle = "#47D147";
			context.fillRect(lower_x, lower_y, upper_x, upper_y);
		},
		render_court: function(context){
			//The floor of the court...
			floor_color = '#194719'
			corners=[[this.screen_width-50,this.screen_length-50],    // lower right
					 [this.screen_width-80,this.screen_length-150], // upper right
					 [80,this.screen_length-150], // upper left
					 [50,this.screen_length-50]]; // lower left
			draw_polygon(context,floor_color,corners);
			//The lines on the court...
			middle_court_x = (this.screen_width/2).toFixed()
			line_color = 'white';
			//vertical line
			point_a = [middle_court_x, this.screen_length-50];
			point_b = [middle_court_x, this.screen_length-150];
			draw_line(context,line_color,point_a,point_b);
			//horizontal line
			point_a = [80,this.screen_length-105]
			point_b = [middle_court_x,this.screen_length-105]
			draw_line(context,line_color,point_a,point_b);
		},
		render_wall: function(context){
			//the wall consists of two polygons...
			side=[[80,this.screen_length-50],    // lower right
					 [80,50], // upper right
					 [50,50], // upper left
					 [50,this.screen_length-50]]; // lower left
			face=[[110,this.screen_length-150],    // lower right
					 [110,65], // upper right
					 [80,50], // upper left
					 [80,this.screen_length-50]]; // lower left
			side_color = '#999966';
			face_color = '#7A7A52';
			draw_polygon(context,side_color,side);
			draw_polygon(context,face_color,face);
			// ...and a line
			point_a = [80,this.screen_length-130]
			point_b = [110,this.screen_length-180]
			middle_court_x = (this.screen_width/2).toFixed()
			draw_line(context,line_color,point_a,point_b);
		},
		render: function(){
			this.render_sky(context);
			this.render_ground(context);
			this.render_court(context);
			this.render_wall(context)
		}
	}
}

//---------------------------------TENNIS BALL----------------------------------------
function TennisBall(position,velocity,radius,color){
	return {position: position,
			velocity: velocity,
			radius: radius,
			mass: Math.PI*Math.pow(this.radius,2),
			color: color,
			dampening: .99999,
			set_velocity: function(new_velocity){
				this.velocity = new_velocity;
			},
			set_position: function(new_position){
				this.position = new_position;
			},
			get_velocity: function(){
				return this.velocity;
			},
			get_position: function(){
				return this.position;
			},
			update: function(seconds_passed,gravity){
				this.position = v_add(this.position,v_scale(this.velocity,seconds_passed));
				this.velocity = v_add_k(this.velocity,gravity);
			},
			render: function(context){
				context.beginPath();
				context.arc(this.position.x,
						   this.position.y,
						   this.radius,
						   0,
						   2*Math.PI,
						   1);
				context.stroke();
				context.fillStyle = this.color;
				context.fill();
			}
		}
}
//----------------------------TENNIS RACKET--------------------------------------

function TennisRacket(){
	return{
		px: 100,
		py: 100,
		vx: 0,
		vy: 0,
		h: 80,
		w: 30,
		radius: 25,
		mass: 15,
		color: 'blue',
		update: function(time_passed){
			px_temp = this.px;
			py_temp = this.py;
			this.px = mouse_position.x;
			this.py = mouse_position.y;
			if(time_passed != 0){
				this.vx = (this.px - px_temp)/time_passed;
				this.vy = (this.py - py_temp)/time_passed;
			}
		},
		render: function(context){
			draw_ellipse(context,this.px,this.py,this.w,this.h,this.color);
			draw_box(context,this.px-this.w/6,this.py,this.w/3,this.h-5,'blue')
		}
	}
}
//----------------------------KEEP TRACK OF TIME---------------------------------

function Clock(){
	return{
		initial_time: 0,
		start: function(){
			this.initial_time = new Date();
		},
		seconds_elapsed: function(){
			temp = this.initial_time;
			this.initial_time = new Date();
			return (this.initial_time - temp)/1000;
		}
	}
}


var canvas = document.getElementById("mainCanvas");
var context = canvas.getContext("2d");
var mouse_position = {x:999999,y:999999};
var fps = 1000/30;
var width = 640;
var length = 440;

window.addEventListener('mousemove',function(mouse_event){
mouse_position.x = mouse_event.clientX;
mouse_position.y = mouse_event.clientY;		
}, false);
	
court = TennisCourt(width,length);
ball = TennisBall(Vector(300,300),Vector(-10,-10),15,'yellow');
racket = TennisRacket()
clock = Clock();
clock.start();
gravity = 0;

//test comment
setInterval(function(){
	seconds_passed = clock.seconds_elapsed()
	ball.update(seconds_passed,gravity);
	racket.update(seconds_passed);
	court.render(context);
	ball.render(context);
	racket.render(context);
},fps)


