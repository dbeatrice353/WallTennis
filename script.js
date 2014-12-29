
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

function v_scale_in_place(v,k){
	v.x *= k;
	v.y *= k;
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
		render: function(context){
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
			mass: 50,//3.14*Math.pow(radius,2),
			color: color,
			dampening: .999, 
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
				this.velocity.y += gravity;
				v_scale_in_place(this.velocity,this.dampening);
			},
			render: function(context){
				context.beginPath();
				context.arc(this.position.x,this.position.y,this.radius,
						   0,2*Math.PI,1);
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
		mass: 50,
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
//---------------------------------COLLISION-------------------------------------
function wall_contact(obj,wall_x_boundry,wall_top,ground_level){
	if(obj.position.x < ground_level &&
	  obj.position.y + obj.radius > wall_top && 
	  obj.position.x - obj.radius < wall_x_boundry){
		return 1;
	} else {
		return 0;
	}	
}
function manage_boundry_collision(obj,wall_x_boundry,wall_top,ground_level){
	wall_dampen = .5;
	if(wall_contact(obj,wall_x_boundry,wall_top,ground_level)){
		obj.velocity.x *= -wall_dampen;
		obj.position.x = wall_x_boundry + obj.radius + 1;
	}
	if(obj.position.y + obj.radius > ground_level){
		obj.velocity.y *= -1;
		obj.position.y = ground_level - obj.radius;
	}
}

function manage_racket_collision(racket,ball){
	if(ball.position.y + ball.radius > racket.py - racket.h/2 &&
	   ball.position.y - ball.radius < racket.py + racket.h/2 &&
	   Math.abs(ball.position.x - racket.px) < ball.radius){
		racket_collision(racket,ball);
	}
}

function racket_collision(racket,ball){
	v1 = Vector(racket.vx,racket.vy);
	v2 = ball.get_velocity();
	p2 = ball.get_position();
	p1 = Vector(racket.px,p2.y);
	m1 = racket.mass;
	m2 = ball.mass;
	
	unit_norm = v_add(p2,v_scale(p1,-1));
	unit_norm.normalize();
	unit_tan = Vector(-unit_norm.y, unit_norm.x);
	
	v1n = v_dot_product(unit_norm,v1);
	v2n = v_dot_product(unit_norm,v2);
	v2t = v_dot_product(unit_tan,v2);
	
    v2t_prime_scal = v2t;
    v2n_prime_scal = (v2n*(m2 - m1) + 2*m1*v1n)/(m1 + m2);
    v2n_prime = v_scale(unit_norm,v2n_prime_scal);
    v2t_prime = v_scale(unit_tan,v2t_prime_scal);
    v2_prime = v_add(v2n_prime,v2t_prime);

    ball.set_velocity(v2_prime);

    norm = v_add(p1,v_scale(p2,-1));
    ball.position = v_add(ball.position, v_scale(norm,-1)); 
}
//----------------------------TIME---------------------------------

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

//----------------------------TIME---------------------------------

function Score(){
	return{
		score: 0,
		up: function(){
			this.score++;
		},
		render: function(context){
			var output = 'score: ';
			output = output.concat(this.score.toString());
			context.fillStyle = 'black';
			context.font = 'bold 30px courier';
			context.fillText(output,15,30);
		}
	}
}

function game(){
	court = TennisCourt(width,length);
	ball = TennisBall(Vector(300,80),Vector(0.0,0.0),15,'yellow');
	racket = TennisRacket()
	score = Score();
	clock = Clock();
	clock.start();
	gravity = 10.0;

	wall_x_boundry = 90;
	wall_top = 50;
	ground_level = length - 100;
	
	setInterval(function(){
		seconds_passed = clock.seconds_elapsed()

		ball.update(seconds_passed,gravity);
		racket.update(seconds_passed);
		//if the ball bounced off the wall, increment the score.
		if(wall_contact(ball,wall_x_boundry,wall_top,ground_level)){
			score.up();
		}
		manage_boundry_collision(ball,wall_x_boundry,wall_top,ground_level);
		manage_racket_collision(racket,ball);
		
		court.render(context);
		ball.render(context);
		racket.render(context);
		score.render(context);
		
	},fps)
}


var canvas = document.getElementById("mainCanvas");
var context = canvas.getContext("2d");
var fps = 1000/100;
var width = 640;
var length = 440;
var mouse_position = {x:999999,y:999999};

window.addEventListener('mousemove',function(mouse_event){
mouse_position.x = mouse_event.clientX;
mouse_position.y = mouse_event.clientY;		
}, false);

game();