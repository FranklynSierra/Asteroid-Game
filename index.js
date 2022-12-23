
var canv=document.getElementById('gameCanvas')
var ctx=canv.getContext('2d')
var fxLaser=new Sound('sounds/laser.m4a',5,0.5);
var fxExplode=new Sound('sounds/explode.m4a');
var fxHit=new Sound('sounds/hit.m4a',5);
var fxTrhust=new Sound('sounds/thrust.m4a');
var roidsLeft,roidsTotal;

var music=new Music('sounds/music-low.m4a',"sounds/music-high.m4a");


const FPS = 30; // frames per second
        const FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = lots of friction)
        const LASER_MAX = 10; 
        const SOUND_ON=true;
        const MUSIC_ON=true;
        const GAME_LIVES = 3;
        const ROIDS_PTS_LGE=20;
        const ROIDS_PTS_SML=100;
        const ROIDS_PTS_MDE=50;       
        const LASER_DIST = 0.5; 
        const LASER_SPEED=500;
        const LASER_EXPLODE_DUR=0.1;
        const ROID_JAG = 0.4; // jaggedness of the asteroids (0 = none, 1 = lots)
        const ROID_NUM = 3; // starting number of asteroids
        const ROID_SIZE = 100; // starting size of asteroids in pixels
        const ROID_SPD = 50; // max starting speed of asteroids in pixels per second
        const ROID_VERT = 10; // average number of vertices on each asteroid
        const SHIP_SIZE = 30; // ship height in pixels
        const SHIP_THRUST = 5; // acceleration of the ship in pixels per second per second
        const TURN_SPEED=360; // turn speed in degrees per second
        const SHOW_CENTRE_DOT = false; // show or hide ship's centre dot
        const SHOW_BOUNDING= false;
        const SHIP_EXPLOTE_DUR=0.3;
        const SHIP_BLINK_DUR=0.1;
        const SHIP_INV_DUR=3;
        const TEXT_FADE_TIME=2.5;
        const TEXT_SIZE=40;
        const SAVE_KEY_SCORE="hightscore";
var roids=[];


 var level, lives,ship, text,score,scoreHight, textAlpha;
newGame();
document.addEventListener('keydown',keyDown);
document.addEventListener('keyup',keyUp);


     function createAsteroidsBelt() {
         roids = [];
         roidsTotal=(ROID_NUM + level)*7;
         roidsLeft=roidsTotal
         var x, y;
         for (var i = 0; i < ROID_NUM+level; i++) {
             // random asteroid location (not touching spaceship)
             do {
                 x = Math.floor(Math.random() * canv.width);
                y = Math.floor(Math.random() * canv.height);
             } while (distBetweenPoints(ship.x, ship.y, x, y) < ROID_SIZE * 2 + ship.r);
             roids.push(newAsteroid(x, y,Math.ceil(ROID_SIZE/2)));
         }
     }
     function destroyAsteroid(index){
        let x=roids[index].x;
        let y=roids[index].y;
        let r=roids[index].r;

        if(r==Math.ceil(ROID_SIZE/2)){
            roids.push(newAsteroid(x,y,Math.ceil(ROID_SIZE/4)))
            roids.push(newAsteroid(x,y,Math.ceil(ROID_SIZE/4)))
          score+=ROIDS_PTS_LGE
        }else if(r==Math.ceil(ROID_SIZE/4)){
            roids.push(newAsteroid(x,y,Math.ceil(ROID_SIZE/8)))
            roids.push(newAsteroid(x,y,Math.ceil(ROID_SIZE/8)))
         score+=ROIDS_PTS_MDE
        }else{
            score+=ROIDS_PTS_SML
            localStorage.setItem(SAVE_KEY_SCORE,scoreHight)
        }

        if(score>scoreHight){
            scoreHight=score
        }
        roids.splice(index,1)
        fxHit.play()
        roidsLeft--;
        music.setAsteroidRatio(roidsLeft==0?1:roidsLeft/roidsTotal)
   
        if(roids.length==0){
            level++
            newLevel()
        }
        
     }

     function distBetweenPoints(x1, y1, x2, y2) {
         return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
     }

     function drawShip(x,y,a,colour='white'){
        ctx.strokeStyle=colour

        ctx.lineWidth=SHIP_SIZE/20;
        ctx.beginPath()
        ctx.moveTo(
           x+4/3*+ship.r*Math.cos(a),
           y-4/3*ship.r*Math.sin(a),
        );
        ctx.lineTo(
           x-ship.r*(2/3*Math.cos(a)+Math.sin(a)),
           y+ship.r*(2/3*Math.sin(a)-Math.cos(a)),
        )
        ctx.lineTo(
           x-ship.r*(2/3*Math.cos(a)-Math.sin(a)),
          y+ship.r*(2/3*Math.sin(a)+Math.cos(a)),
        )
        ctx.closePath();   
        ctx.stroke();
     }
     function explodeShip(){
     ship.exploteTime=Math.ceil(SHIP_EXPLOTE_DUR*FPS)
     fxExplode.play()
     }
     function GameOver(){
        ship.dead=true;
        text='Game Over';
        textAlpha=1.0
     }

function keyDown(ev){
    if(ship.dead){
        return
    }
    switch(ev.keyCode){
        case 32://left
        shootLaser();
       break
        case 37://left
             ship.rot= TURN_SPEED/180*Math.PI/FPS
            break
        case 38://up
            ship.thrusting=true
            break
        case 39://right
        ship.rot=-TURN_SPEED/180*Math.PI/FPS
             break
  
                          
    }
}
function keyUp(ev){
    if(ship.dead){
        return
    }
    switch(ev.keyCode){
        case 32://left
       ship.canShoot=true
       break
        case 37://left
             ship.rot=0
            break
        case 38://up
        ship.thrusting=false
            break
        case 39://right
        ship.rot=0
             break
  
              
}
}

setInterval(update,1000/FPS)
function newAsteroid(x, y,r) {
    var lvlMult=1-0.1-level
    var roid = {
        a: Math.random() * Math.PI * 2, // in radians
        offs: [],
        r,
        vert: Math.floor(Math.random() * (ROID_VERT + 1) + ROID_VERT / 2),
        x: x,
        y: y,
        xv: Math.random() * ROID_SPD*lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROID_SPD*lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1)
    };

    // populate the offsets array
    for (var i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * ROID_JAG * 2 + 1 - ROID_JAG);
    }

    return roid;
}
      
function newGame() {
            level = 0;
            lives = GAME_LIVES;
            score=0;
            ship = newShip();
           var scoreString=localStorage.getItem(SAVE_KEY_SCORE);
            if(scoreString==null){
                scoreHight=0;
            }else{
                scoreHight=parseInt(scoreString);
            }
           newLevel();

           
        }

        function newLevel() {
            text = "Level " + (level + 1);
            textAlpha = 1.0;
            createAsteroidsBelt();
        }

function newShip(){
    return {
        x:canv.width/2,
        y:canv.height/2,
        r:SHIP_SIZE/2,
        a:90/180*Math.PI,
        exploteTime:0,
        canShoot:true,
        dead:false,
        lasers:[],
        blinkNum:Math.ceil(SHIP_INV_DUR/SHIP_BLINK_DUR),
        blinkTime:Math.ceil(SHIP_BLINK_DUR*FPS),
        rot:0,
        thrusting:false,
        thrust:{
            x:0,
            y:0
        }
        }
}
function shootLaser(){
    if(ship.canShoot&&ship.lasers.length<LASER_MAX){
        ship.lasers.push({
            x: ship.x+4/3*+ship.r*Math.cos(ship.a),
            y:ship.y-4/3*ship.r*Math.sin(ship.a),
            xv:LASER_SPEED*Math.cos(ship.a)/FPS,
            yv:-LASER_SPEED*Math.sin(ship.a)/FPS,
            dist:0,
            explodeTime:0,
    });
    fxLaser.play();
    }
    ship.canShoot=false
}
function Music(srcLow,srcHigh){
this.soundLow=new Audio(srcLow)
this.soundHigh=new Audio(srcHigh)
this.low=true;
this.tempo=1.0;
this.beatTime=0;
this.setAsteroidRatio=function(ratio){
    this.tempo=1.0-0.75*(1.0-ratio);
}
this.play=function(){
    if(MUSIC_ON){

    
    if(this.low){
        this.soundLow.play()
    }else{
        this.soundHigh.play()
    }

    this.low=!this.low;
}
}
this.tick=function(){
    if(this.beatTime==0){
        this.play();
        this.beatTime=Math.ceil(this.tempo*FPS)
    }else{
        this.beatTime--;

    }
}
}
function Sound(src,maxStreams=1,vol=1.0){
    this.streamNum=0;
    this.streams=[];
    for (let i = 0; i < maxStreams; i++) {
        this.streams.push(new Audio(src))
        this.streams[i].volume=vol
        
    }
    this.play=function(){
        if(SOUND_ON){
        this.streamNum=(this.streamNum+1)%maxStreams;
        this.streams[this.streamNum].play();
        }
    }
    this.stop=function(){
        this.streams[this.streamNum].pause();
        this.streams[this.streamNum].currentTime=0;

    }
}
function update(){
    var blinkOn=ship.blinkNum%2==0;
    var exploding=ship.exploteTime>0;
   music.tick()
    ctx.fillStyle='black'
    ctx.fillRect(0,0,canv.width,canv.height)
    
    if(ship.thrusting&&!ship.dead){
        ship.thrust.x+=SHIP_THRUST*Math.cos(ship.a)/FPS;
        ship.thrust.y-=SHIP_THRUST*Math.sin(ship.a)/FPS;
        fxTrhust.play()
        if(!exploding&&blinkOn){

      
        ctx.fillStyle='red'
        ctx.strokeStyle='yellow'
        ctx.lineWidth=SHIP_SIZE/20;
        ctx.beginPath()
        ctx.moveTo(
            ship.x-ship.r*(2/3*Math.cos(ship.a)+ 0.5*Math.sin(ship.a)),
            ship.y+ship.r*(2/3*Math.sin(ship.a)- 0.5*Math.cos(ship.a)),
        );
        ctx.lineTo(
           ship.x-ship.r*6/3*Math.cos(ship.a),
           ship.y+ship.r*6/3*Math.sin(ship.a),
        )
        ctx.lineTo(
           ship.x-ship.r*(2/3*Math.cos(ship.a)- 0.5*Math.sin(ship.a)),
           ship.y+ship.r*(2/3*Math.sin(ship.a)+ 0.5*Math.cos(ship.a)),
        )
        ctx.closePath();  
        ctx.fill() 
        ctx.stroke();
    }
   
    }else{
        ship.thrust.x-=FRICTION*ship.thrust.x/FPS
        ship.thrust.y-=FRICTION*ship.thrust.y/FPS
        fxTrhust.stop()
    }
    if(!exploding){
        if(blinkOn&&!ship.dead){   
drawShip(ship.x,ship.y,ship.a)
 }
 if(ship.blinkNum>0){
    ship.blinkTime--;
    if(ship.blinkTime==0){
        ship.blinkTime=Math.ceil(SHIP_BLINK_DUR*FPS)
        ship.blinkNum--;
    }
 }
}else{
    ctx.fillStyle='darkred'
    ctx.beginPath()
    ctx.arc(ship.x,ship.y,ship.r*1.7,0,Math.PI*2,false)
    ctx.fill()
   
    ctx.fillStyle='red'
    ctx.beginPath()
    ctx.arc(ship.x,ship.y,ship.r*1.4,0,Math.PI*2,false)
    ctx.fill()
   
   ctx.fillStyle='orange'
   ctx.beginPath()
   ctx.arc(ship.x,ship.y,ship.r*1.1,0,Math.PI*2,false)
   ctx.fill()
   
  ctx.fillStyle='yellow'  
  ctx.beginPath()
  ctx.arc(ship.x,ship.y,ship.r*0.8,0,Math.PI*2,false)
  ctx.fill()
  
  ctx.fillStyle='white' 
  ctx.beginPath()
  ctx.arc(ship.x,ship.y,ship.r*0.5,0,Math.PI*2,false)
  ctx.fill()



   
}
     if(SHOW_BOUNDING){
        ctx.strokeStyle='lime'
        ctx.beginPath()
        ctx.arc(ship.x,ship.y,ship.r,0,Math.PI*2,false)
        ctx.stroke()
            
    }
     

var a, r, x, y, offs, vert;
for (var i = 0; i < roids.length; i++) {
    ctx.strokeStyle = "slategrey";
    ctx.lineWidth = SHIP_SIZE / 20;
    // get the asteroid properties
    a = roids[i].a;
    r = roids[i].r;
    x = roids[i].x;
    y = roids[i].y;
    offs = roids[i].offs;
    vert = roids[i].vert;
    
    // draw the path
    ctx.beginPath();
    ctx.moveTo(
        x + r * offs[0] * Math.cos(a),
        y + r * offs[0] * Math.sin(a)
    );

    // draw the polygon
    for (var j = 1; j < vert; j++) {
        ctx.lineTo(
            x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
            y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
        );
    }
    ctx.closePath();
    ctx.stroke();
    if(SHOW_BOUNDING){
        ctx.strokeStyle='lime'
        ctx.beginPath()
        ctx.arc(x,y,r,0,Math.PI*2,false)
        ctx.stroke()
            
    }
    // move the asteroid

}

// centre dot
if (SHOW_CENTRE_DOT){
    ctx.fillStyle = "red";
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
}

for(let i=0;i<ship.lasers.length;i++){
   if(ship.lasers[i].explodeTime==0){

   
    ctx.fillStyle='salmon';
    ctx.beginPath();
    ctx.arc(ship.lasers[i].x,ship.lasers[i].y,SHIP_SIZE/15,0,Math.PI*2,false);
    ctx.fill()
}else{
    ctx.fillStyle='orange';
    ctx.beginPath();
    ctx.arc(ship.lasers[i].x,ship.lasers[i].y,ship.r*0.75,0,Math.PI*2,false);
    ctx.fill()

    ctx.fillStyle='salmon';
    ctx.beginPath();
    ctx.arc(ship.lasers[i].x,ship.lasers[i].y,ship.r*0.5,0,Math.PI*2,false);
    ctx.fill()

    ctx.fillStyle='pink';
    ctx.beginPath();
    ctx.arc(ship.lasers[i].x,ship.lasers[i].y,ship.r*0.75,0,Math.PI*2,false);
    ctx.fill()

  
}
}
if(textAlpha>=0){
    ctx.textAlign='center';
    ctx.textBaseLine='middle'
    ctx.fillStyle="rgba(255,255,255," +textAlpha + ")"
    //ctx.font = "bold 48px dejavu";
    ctx.font="small-caps 40px dejavu sans mono";
    ctx.fillText(text,canv.width/2,canv.height*0.75);
    textAlpha-=(1.0/TEXT_FADE_TIME/FPS)
}else if(ship.dead){
    newGame()
}
var lifeColour;

for (let i = 0; i < lives; i++) {
    lifeColour=exploding&&i==lives - 1 ?'red':"white";
      drawShip(SHIP_SIZE+i*SHIP_SIZE*1.2,SHIP_SIZE,0.5*Math.PI,lifeColour)
    
}
//SCORE
ctx.textAlign='right';
ctx.textBaseLine='middle'
ctx.fillStyle="white"
ctx.font="40px dejavu sans mono";
ctx.fillText(score,canv.width-SHIP_SIZE/2 ,SHIP_SIZE);

//hightscore
ctx.textAlign='center';
ctx.textBaseLine='middle'
ctx.fillStyle="white"
ctx.font="35px dejavu sans mono";
ctx.fillText("BEST "+scoreHight,canv.width/2 ,SHIP_SIZE);

var ax,ay,ar,lx,ly;
for(let i=roids.length-1;i>=0;i--){
    ax=roids[i].x;
    ay=roids[i].y;
    ar=roids[i].r;

    for(let j=ship.lasers.length-1;j>=0;j--){
        lx=ship.lasers[j].x;
        ly=ship.lasers[j].y;

         if( ship.lasers[j].explodeTime==0&& distBetweenPoints(ax,ay,lx,ly)<ar){
        

            destroyAsteroid(i)
            ship.lasers[j].explodeTime=Math.ceil(LASER_EXPLODE_DUR*FPS)
            break;
         } 

    }
}

if(!exploding){
    if(ship.blinkNum==0&&!ship.dead){

    

for(let i=0;i<roids.length;i++){
    if(distBetweenPoints(ship.x,ship.y,roids[i].x,roids[i].y)<ship.r+roids[i].r){
        explodeShip()
        destroyAsteroid(i);
        break
    }
 }
}
   ship.a+=ship.rot;

   ship.x+=ship.thrust.x;
   ship.y+=ship.thrust.y;
}else{
    ship.exploteTime--;
    if(ship.exploteTime==0){
       lives--;
       if(lives==0){
        GameOver()
       }else{
        ship=newShip()
       }
       
        

    }
}
   if(ship.x<0-ship.r){
    ship.x=canv.width+ship.r;
   }else if(ship.x>canv.width+ship.r){
    ship.x=0-ship.r
   }
   if(ship.y<0-ship.r){
    ship.y=canv.height+ship.r;
   }else if(ship.y>canv.height+ship.r){
    ship.y=0-ship.r
   }
   for(let i=ship.lasers.length-1;i>=0;i--){
    if(ship.lasers[i].dist>LASER_DIST*canv.width){
        ship.lasers.splice(i,1);
        continue;
    }

    if(ship.lasers[i].explodeTime>0){
        ship.lasers[i].explodeTime--

        if(ship.lasers[i].explodeTime==0){
          ship.lasers.splice(i,1)
          continue;  
        }
    }else{
        ship.lasers[i].x+=ship.lasers[i].xv
        ship.lasers[i].y+=ship.lasers[i].yv
        ship.lasers[i].dist+=Math.sqrt(Math.pow(ship.lasers[i].xv,2)+Math.pow(ship.lasers[i].yv,2));
    }

    



    if( ship.lasers[i].x<0){
        ship.lasers[i].x=canv.width;

    }else if( ship.lasers[i].x>canv.width){
        ship.lasers[i].x=0
    }
    if( ship.lasers[i].y<0){
        ship.lasers[i].y=canv.height;

    }else if( ship.lasers[i].y>canv.height){
        ship.lasers[i].y=0
    }

}
//    ctx.fillStyle='red';
//    ctx.fillRect(ship.x-1,ship.y-1,2,3)
  for(let i=0;i<roids.length;i++){
    
   roids[i].x += roids[i].xv;
   roids[i].y += roids[i].yv;

  
   // handle asteroid edge of screen
   if (roids[i].x < 0 - roids[i].r) {
       roids[i].x = canv.width + roids[i].r;
   } else if (roids[i].x > canv.width + roids[i].r) {
       roids[i].x = 0 - roids[i].r
   }
   if (roids[i].y < 0 - roids[i].r) {
       roids[i].y = canv.height + roids[i].r;
   } else if (roids[i].y > canv.height + roids[i].r) {
       roids[i].y = 0 - roids[i].r
   }
}






}



