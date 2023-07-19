class game {


    constructor(bricksNumber=14, bricksRows=4, level=1){

        //Data
        this.bricksNumber = bricksNumber;
        this.bricksRows = bricksRows;
        this.level = level;
		
		//Properties in game
        this.totalScore = 0;
        this.animRequest = '';
		this.frameCount = 0;

        //Properties of dom
        this.document = document;
        this.container = document.querySelector('#container');
        this.containerWidth = container.offsetWidth;
        this.containerHeight = container.offsetHeight;
        this.blocksContainer = document.querySelector('.blocks-container');
        this.windowWidth = document.querySelector('#wrapper').offsetWidth;
        this.marginWidth = (this.windowWidth - this.containerWidth) / 2;
        this.windowHeight = document.querySelector('#container').offsetHeight;
        this.infoBox = document.querySelector('.info-box');
        this.scoreBox = document.querySelector('#score-box');
        this.scoreWidth = this.scoreBox.offsetWidth;
        this.scoreRecord = document.querySelector('#score');
		this.ballBox = document.querySelector('#balls');
		this.velIncrement = 1;
		this.incrementCount = 0;
        this.startingBalls = 3
		this.ballSaved = this.startingBalls;
        this.velocity_y = 7;
        this.velocity_x = 3;
        this.maxVelocity = 17;

        
        //Bricks
        this.bricksProp = [
            {
                level		: 1,
                height		: Math.abs( (this.windowHeight / 2) / 15),
                color		: 'yellow',
                value		: 15,
                resistance	: 2,
            },
            {
                level		: 2,
                height		: Math.abs( (this.windowHeight / 2) / 15),
                color		: 'green',
                value		: 10,
                resistance	: 1,
            },
            {
                level		: 3,
                height		: Math.abs( (this.windowHeight / 2) / 15),
                color		: 'red',
                value		: 20,
                resistance	: 1,
            },
            {
                level		: 4,
                width		: '5%',
                height		: Math.abs( (this.windowHeight / 2) / 15),
                color		: 'blue',
                value		: 25,
                resistance	: 1,
            }
        ];

        this.pillsEffect = [
            {
                name                : 'blue_pill',
                racketStretch       : 30,
                ballSpeedIncrease   : 0,
                color               : 'blue',
                succededMin         : 0,
                succededMax         : 9, //10%
                succeeded           : []
            },
            {
                name                : 'red_pill',
                racketStretch       : -30,
                ballSpeedIncrease   : 0,
                color               : 'red',
                succededMin         : 10,
                succededMax         : 40, //30%
                succeeded           : []
            },
            {
                name                : 'black_pill',
                racketStretch       : 0,
                ballSpeedIncrease   : 2,
                color               : 'black',
                succededMin         : 41,
                succededMax         : 69, //30%
                succeeded           : []
            },
            {
                name                : 'purple_pill',
                racketStretch       : 0,
                ballSpeedIncrease   : -2,
                color               : 'purple',
                succededMin         : 70,
                succededMax         : 100, //30%
                succeeded           : []
            },
            
        ];

        //Number of pills object
        this.pillsNumber = this.pillsEffect.length;

        //Foreach pill create a numeric range
        this.pillsEffect.forEach( (pill) => {
            pill.succeeded = this.arrayRange(pill.succededMin,pill.succededMax,1);

        })

        //Ball
        this.ballProp = {
            velocity_x 	: this.velocity_x,
            velocity_y	: this.velocity_y,
            radius		: '100%',
            width 		: Math.abs( (this.containerWidth / 100) * 1.2),
            height 		: Math.abs( (this.containerWidth / 100) * 1.2),
        };
        
        //Racket
        this.racketProp = {
            width	: '8%',
            height 	: Math.abs( (this.containerHeight / 100) * 3),
            reduction : 10,
        
        };

        //Game initialization
        this.gameInit();
       
        //Start or pause the game
        document.addEventListener('keyup', (e) => {
            if(e.code == 'Space'){
                this.gameStart();
            }
        });
        
        //Racket movement
        document.addEventListener( 'mousemove', (e) => {
			
			let racketWidth = this.racket.offsetWidth;
            let pos = e.clientX - this.marginWidth + (this.scoreWidth / 2) - (racketWidth / 2);
			
            if( pos >= 0 && (pos + racketWidth) <= this.containerWidth){
                
                if(this.gamePaused == false || this.gameOn == false){
                    this.racket.style.left = pos + "px";
                    if(e.clientX > this.containerWidth ){
                        this.racket.style.left = (this.containerWidth - racketWidth) + "px";
                    }
                    
                    if(e.clientX < this.container.offsetLeft ){
                        this.racket.style.left = "0px";
                    }
                }
              
                if(this.gameOn == false){
                    this.balls[0].style.left = pos + (racketWidth / 2) - (this.balls[0].offsetWidth/2) + "px";
                }
            }
        })
    }

    //Create a number range
    arrayRange = (start, stop, step) => Array.from({ 
        length: (stop - start) / step + 1 
    },(value, index) => start + index * step);
    

     //Get element position
     getPos(ele){
        const x = ele.offsetLeft;
        const y = ele.offsetTop;
        return [x,y];
    }

    //Stretch or reduce racket
    racketStretch(val=0){
        let racketWidth = this.racket.offsetWidth;
        this.racket.style.width = racketWidth + ( ( racketWidth / 100 ) * val) + 'px';
    }
    

    //Bricks initialization
    createBlocks(num,rows){

        const blockWidth = (100/num)+'%';
      
        for(let r = rows; r > 0 ; r--){

            this.bricksProp.forEach( (brick) => {

                if(brick.level == r){

                    for(let i=1; i<=num; i++){

                        let div = document.createElement('div');
                        div.classList.add('block', 'bg-' + brick.color);
                        div.style.height	= brick.height + 'px';
                        div.style.width		= blockWidth;
                        div.setAttribute('data-resistance',brick.resistance);
                        div.setAttribute('data-value',brick.value);
                        this.blocksContainer.appendChild(div);
                    }
                }
            })
        }

        this.blocks = this.blocksContainer.querySelectorAll('.block');
        let blocksNumber = this.blocks.length;
        let pillsNumber = Math.round(blocksNumber / 4);
        let i = 0;
        while(i < pillsNumber ){
            let blockIndex =  Math.floor(Math.random() * blocksNumber);
            if(this.blocks[blockIndex].hasAttribute('data-special','specialPill')){

            } else {
                this.blocks[blockIndex].setAttribute('data-special','specialPill');
                i++;
            }
        }
    }

   
    //Racket initialization
    createRacket(){
        let div = document.createElement('div');
        div.classList.add("racket");
        div.style.height	= this.racketProp.height + 'px';
        div.style.width		= this.racketProp.width;
        this.container.appendChild(div);

        this.racket = document.querySelector('.racket');
        let racketWidth = this.racket.offsetWidth;
        this.racket.style.left = (this.containerWidth / 2) - (racketWidth / 2) + 'px';
        
    }

    //Ball initialization
    createBall(){
        let div = document.createElement('div');
        let racketPosition  = this.getPos(this.racket);
		let racketWidth     = this.racket.offsetWidth;
		let racketHeight    = this.racket.offsetHeight;
        
        div.classList.add('ball');
        div.style.width 	= this.ballProp.width + 'px';
        div.style.height	= this.ballProp.height + 'px';
        div.style.left		= racketPosition[0] + (racketWidth /2) - (this.ballProp.width/2) + 'px';
        div.style.top   	= racketPosition[1] - racketHeight + (this.ballProp.height/2) + 'px';

        this.container.appendChild(div);
        this.balls = document.querySelectorAll('.ball');
    };
	
    //Paused the game
	gamePause(status){
		this.gamePaused = status;
	}
	
    //Game finished
	gameEnd(status){
		this.gameEnds = status;
	}
	
    //Game status
	gameStarted(status){
		this.gameOn = status;
	}
	
    //Balls remains
	remainingBalls(num){
		this.ballSaved = num;
	}


    //Game initialization
    gameInit(){
		this.gameEnd(false);
		this.gamePause(true);
		this.gameStarted(false);
		this.remainingBalls(this.startingBalls);
        this.createBlocks(this.bricksNumber,this.bricksRows);
        this.createRacket();
        this.createBall();
        this.infoBox.innerHTML = '<h3>Press space bar to start/pause</h3>';
        this.blocksNumber = this.blocks.length;
		this.ballBox.innerText = this.ballSaved;
        //this.racketWidth = this.racket.offsetWidth;
    };
	
	

	//Verify velocity increment
	checkIncrement(){
		
		let count = Math.floor(this.totalScore / 100);
		if(count > this.incrementCount){
			
            if(this.ballProp.velocity_y < this.maxVelocity){
                this.velocityIncreaseY(this.velIncrement);
                this.incrementCount = count;
            }
		}
	}

    velocityIncreaseX(vel=0){
		this.ballProp.velocity_x = (this.ballProp.velocity_x > 0) ? this.ballProp.velocity_x + vel : this.ballProp.velocity_x - vel;
	}
	
	velocityIncreaseY(vel=0){
		this.ballProp.velocity_y = (this.ballProp.velocity_y > 0) ? this.ballProp.velocity_y + vel : this.ballProp.velocity_y - vel;
	}

    velocityReset(){
        this.ballProp.velocity_y = this.velocity_y;
        this.ballProp.velocity_x = this.velocity_x;
    }

    
    //Ball animation
    animationStart(){
		
        this.balls.forEach((ball) => {

            let ballPosition = this.getPos(ball);
            let racketPosition = this.getPos(this.racket);
            let ballWidth = ball.offsetWidth;
            let ballHeight = ball.offsetHeight;
            let racketWidth = this.racket.offsetWidth;
            this.pills = this.blocksContainer.querySelectorAll('.pill');
	
            //Racket collision
            if((ballPosition[1] + ballHeight >= racketPosition[1]) && ballPosition[0] >= racketPosition[0] && ballPosition[0] <= (racketPosition[0] + racketWidth)){
                
                this.ballProp.velocity_y = - Math.abs(this.ballProp.velocity_y);
    
                //Incidence change
                let incidenceLeft =  racketPosition[0] + ( racketWidth / 2 ) - ballPosition[0];
                this.ballProp.velocity_x = - (incidenceLeft / this.racketProp.reduction);
            
            }
    
            //Bricks collision
            for(let i=0; i < this.blocks.length; i++){
                
                if( ballPosition[1] <= (this.blocks[i].offsetTop + this.blocks[i].offsetHeight) &&
                    ballPosition[0] >= this.blocks[i].offsetLeft && ballPosition[0] <= (this.blocks[i].offsetLeft + this.blocks[i].offsetWidth) &&
                    this.blocks[i].style.visibility != "hidden"
                ){
    
                    let resistance = this.blocks[i].getAttribute('data-resistance');
                    let dataSpecial = this.blocks[i].getAttribute('data-special');
                    let score = Number(this.blocks[i].getAttribute('data-value'));
                    resistance --;
                    this.blocks[i].setAttribute('data-resistance',resistance);
    
                    this.ballProp.velocity_y = Math.abs(this.ballProp.velocity_y);
                    
                    //If brick broke
                    if(resistance == 0){

                        //Hide the brick
                        this.blocks[i].style.visibility="hidden";
                        this.blocksNumber --;
                        this.totalScore += score
                        this.scoreRecord.innerText = this.totalScore;

                        //if brick has a special function
                        if(dataSpecial == 'specialPill'){
                            
                            //Create the pill to show
                            let pillRand = Math.floor(Math.random() * 100);
                            let indexFound = this.pillsEffect.findIndex( pill => pill.succeeded.includes(pillRand) );
                            let div = document.createElement('div');
                            let pillColor = this.pillsEffect[indexFound].color;
                            div.classList.add('pill', 'bg-' + pillColor);
                            div.style.width = this.blocks[i].offsetWidth / 2 + 'px';
                            div.style.height = this.blocks[i].offsetHeight + 'px';
                            div.style.left = this.blocks[i].offsetLeft + 'px';
                            div.style.top = this.blocks[i].offsetTop + 'px';
                            div.setAttribute('data-index',indexFound);

                            this.blocksContainer.appendChild(div);
                
                        }
                    }
                }
            }
			
			//Collision with pills
            if(this.pills){
                
                this.pills.forEach( (pill) => {

                    let pillPosition = this.getPos(pill);
                    let pilIndex = pill.getAttribute('data-index');
                    pill.style.top = pillPosition[1] + 1 + 'px';

                    if((
                        pillPosition[1] + pill.offsetHeight >= racketPosition[1]) && 
                        (
                            (   pillPosition[0] >= racketPosition[0] &&
                                pillPosition[0] <= (racketPosition[0] + racketWidth)
                            ) ||

                            (
                                racketPosition[0] >= pillPosition[0] &&
                                racketPosition[0] <= (pillPosition[0] + pill.offsetWidth)
                            )
                        )
                    ){
                        this.racketStretch(this.pillsEffect[pilIndex].racketStretch);
                        this.velocityIncreaseY(this.pillsEffect[pilIndex].ballSpeedIncrease);
						pill.remove();
					}

                    if( pillPosition[1] > this.containerHeight){
                        pill.remove();
                    }
                })
            }
           
        
    
            //Roof collision
            if(ballPosition[1] <= 0){
                this.ballProp.velocity_y = Math.abs(this.ballProp.velocity_y);
            }
    
            //Floor collision
            if( ballPosition[1] + ballHeight  >= this.containerHeight){
                //this.ballProp.velocity_y = - Math.abs(this.ballProp.velocity_y);
            }
    
            //Left wall collision
            if(ballPosition[0] <= 0){
                this.ballProp.velocity_x = Math.abs(this.ballProp.velocity_x);
            }
            
            //Right wall collision
            if(ballPosition[0] >= (this.containerWidth - ballWidth)){
                this.ballProp.velocity_x = - Math.abs(this.ballProp.velocity_x);
            }
            
			
			//Ball under the floor. Check for game over
            if(ballPosition[1] >= this.containerHeight){
				this.gamePaused = true;
                this.ballLost();
            }
            
            //Ball movement
            ball.style.left = ballPosition[0] + this.ballProp.velocity_x + 'px';
            ball.style.top = ballPosition[1] + this.ballProp.velocity_y + 'px';
			
        });
        
		//If there are bocks and game is not paused
        if(this.blocksNumber > 0 && this.gamePaused == false && this.gameOn == true){
            this.animRequest = requestAnimationFrame(() => this.animationStart());
        };
        
        if(this.blocksNumber <= 0){
            this.levelComplete();
        };
		
		this.checkIncrement();

    };



    //Starting game
    gameStart(){
        
        this.infoBox.style.visibility = 'hidden';
		
		//If game is over I reinitialize the game
        if(this.gameEnds){
            this.gameStarted(false);
            this.gamePause(true);
            this.blocksContainer.innerHTML = '';
            this.scoreRecord.innerText = 0;
            this.totalScore = 0;
            this.racket.remove();
            this.balls.forEach((ball) => {
                ball.remove();
            })
           this.gameInit();
		   
        } else if(this.gamePaused){
			
			//If the game is paused i run animation
            this.gamePause(false);
            this.gameStarted(true);
            this.animationStart();
			
			
        } else {
			
			//If the game is not paused I put in pause I stop the animation
            cancelAnimationFrame(this.animRequest);
            this.infoBox.innerHTML = `<h3>Game paused</h3>`;
            this.infoBox.style.visibility = 'visible';
			this.gamePaused = true;
            
        }
    };

    //Level complete
    levelComplete(){
        this.gamePause(false);
        this.gameStarted(false);
        this.gameEnd(true);
        cancelAnimationFrame(this.animRequest);
        this.infoBox.innerHTML = `<h3>Great, level completed!!</h3><h4>Your score: ${this.totalScore}`;
        this.infoBox.style.visibility = 'visible';
    };

    //Game finished
    gameOver(){

        this.gamePause(false);
        this.gameStarted(false);
        this.gameEnd(true);
        cancelAnimationFrame(this.animRequest);
        this.infoBox.innerHTML = `<h3>GAME OVER</h3><h4>Press space bar to start a new match</h4>`;
        this.infoBox.style.visibility = 'visible';

    }

    ballLost(){
		
		this.ballSaved = (this.ballSaved > 0) ? this.ballSaved -1 : 0;
		this.ballBox.innerText = this.ballSaved;

        if(this.ballSaved === 0){
            this.gameOver();
			
        } else {

            this.balls.forEach((ball) => {
                ball.remove();
            })
			
			this.pills.forEach( (pill) => {
				pill.remove();
			})
			this.gamePause(true);
            this.gameEnd(false);
            this.gameStarted(false);
            this.velocityReset();
            cancelAnimationFrame(this.animRequest);
            this.createBall();
        }
       
    }
    
}
