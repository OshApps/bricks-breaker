
var BricksBreaker=(function(){
    var defaultBoardTimeout=1000/60;
    var defaultBackgroundTimeout=1000/24;

    var defaultBallX,defaultBallY,defaultBallRadius,defaultBallSpeed,maxBallSpeed;
    var defaultBallColor="#2cacc9";

    var defaultPaddleX,defaultPaddleY,defaultPaddleWidth,defaultPaddleHeight,defaultPaddleBottomOffset,defaultPaddleSpeed;
    var defaultPaddleColor="#c92c44";
    
    var defaultStartLives=3;
    var defaultScoreForBonusLives=1000;

    var defaultBackgroundSounds=[
        {url:"audio/background001.wav", volume:0.2},
        {url:"audio/background002.wav", volume:0.3},
        {url:"audio/background003.wav", volume:0.3}];

    var defaultGameOverAudioOptions={url:"audio/gameover.wav", volume:0.5 };
    var defaultWinGameScreenAudioOptions={url:"audio/win.wav", volume:0.5};
    var defaultPaddleAudioOptions={url:"audio/paddle.wav", volume:0.1};
    var defaultBrickAudioOptions={url:"audio/brick.wav"};
    var defaultLoseLivesAudioOptions={url:"audio/loselives.wav", volume:0.1};
    var defaultLevelUpAudioOptions={url:"audio/levelup.wav", volume:0.5};

    var emptyFunc=function(){};
    
    var isEffectsActive=true;
    var isMusicActive=true;
    var isStartRound=true;
    var lastTime=undefined;
    var bonusLives=0;
    var boardUpdapter=new UpdateManager(defaultBoardTimeout,onUpdateBoard);
    var gameLevels;
    var actionDraw=drawBoard;
    var actionUpdate=updateGame;

    var paddleAudio=createAudio(defaultPaddleAudioOptions);
    var brickAudio=createAudio(defaultBrickAudioOptions);
    var loseLivesAudio=createAudio(defaultLoseLivesAudioOptions);

    var backgroundColor="#f4f4f4";
    var backgroundImageSrc="images/background.png";

    var backgroundImageWidth=300;
    var backgroundImageHeight=210;
    var backgroundSpeed=0.2;

    var backgroundDrawer={
        sounds:[],
        currSoundIndex:0,

        init:function(options){

            this.isImageLoaded=false;
            this.imageRect=options.rect;
            this.imageWidth=options.imageWidth;
            this.imageHeight=options.imageHeight;

            this.image=new Image();
            this.image.addEventListener('load', this.onLoadImage.bind(this));
            
            this.image.src=options.imageSrc;    

            if(options.sounds)
                {
                var sounds=options.sounds
                var sound;

                for (var i = 0; i < sounds.length; i++) 
                    {
                    sound=createAudio(sounds[i]);  

                    sound.addEventListener("ended", this.onSoundEnded.bind(this));

                    this.sounds.push(sound);  
                    }
                
                if(isMusicActive && this.sounds.length > 0)
                    {
                    this.sounds[this.currSoundIndex].play();   
                    }
                }

            this.updateManager=new UpdateManager(defaultBackgroundTimeout, this.onUpdate.bind(this));
            },

        onLoadImage:function(){
            this.imageRect=this.imageRect || new Rect(0,0,this.image.width,this.image.height);
            this.imageX=this.imageRect.x;
            this.imageY=this.imageRect.y;

            this.imageWidth=this.imageWidth || this.imageRect.width;
            this.imageHeight=this.imageHeight || this.imageRect.height;

            this.isImageLoaded=true;
            },
        
        onSoundEnded:function(){
            this.sounds[this.currSoundIndex].currentTime=0;
            this.currSoundIndex=(this.currSoundIndex+1) % this.sounds.length;
            this.sounds[this.currSoundIndex].play();    
            },
        
        onMusicStateChange:function(){

            if(isMusicActive)
                {
                this.sounds[this.currSoundIndex].play();    
                }else
                    {
                    this.sounds[this.currSoundIndex].pause();  
                    }
            },
        
        onUpdate:function(updates){

            if(!this.isImageLoaded)
                {
                return;
                }
            
            var imageRectRight= this.imageRect.x + this.imageRect.width;
            var imageRectBottom=this.imageRect.y + this.imageRect.height;

            if(this.imageX+backgroundSpeed < 0 || this.imageX + backgroundSpeed + this.imageWidth > imageRectRight)
                {
                backgroundSpeed=-backgroundSpeed;    
                }else
                    {
                    this.imageX+=backgroundSpeed;      
                    }  

            if(this.imageY+backgroundSpeed < 0 || this.imageY + backgroundSpeed  + this.imageHeight > imageRectBottom)
                {
                backgroundSpeed=-backgroundSpeed;    
                }else
                    {
                    this.imageY+=backgroundSpeed;      
                    }    
            },

        update:function(timePassed){
            this.updateManager.update(timePassed);
            },  
               
         draw:function(){
            
            if(this.isImageLoaded)
                {
                ctx.imageSmoothingEnabled = true;

                ctx.drawImage(this.image, this.imageX, this.imageY, this.imageWidth, this.imageHeight, 0, 0, canvas.width, canvas.height);  
                }
            }
        
        };

    var textSpace;

    var textColor="#fff";       

    var playerScore="Your Score: ";
    var playerScoreFont="px Arial";
    var playerScoreY;

    var screenTitleFont="px Arial";

    var screenMsgFont="px Arial";

    var drawPlayerScore=function(){
        var canvasCenterX=(canvas.width/2);
        var text=playerScore + score;

        var textWidth=getTextWidth(text,playerScoreFont);
        var textX=canvasCenterX - (textWidth/2);

        ctx.font = playerScoreFont;
        ctx.fillText(text, textX,playerScoreY);
        };

    var gameOverScreen;
    var gameOverScreenTitle="Game Over";
    var gameOverScreenMsg="Press [Space] to try again";

    var winGameScreen;
    var winGameScreenTitle="You Win!";
    var winGameScreenMsg="Press [Space] to play again";
    
    var gamePausedScreen;
    var gamePausedScreenTitle="Game Paused";
    var gamePausedScreenMsg="Press [Space] for resume";
    var gamePausedScreenBackgroundColor="rgba(0, 0, 0, 0.4)";
    
    var drawGamePausedBackground=function(){
            drawBoard();

            ctx.fillStyle=gamePausedScreenBackgroundColor;
            ctx.fillRect(0,0,canvas.width,canvas.height);
            };

    var levelScreen,levelScreenTextY;  
    var levelScreenText="Level ";
    var levelScreenFont="px Arial";
    var levelScreenTimeout=3000;
    var levelScreenOptions={
        audio:defaultLevelUpAudioOptions,
        onShow:function(){
            setTimeout(this.hide.bind(this),levelScreenTimeout);
            },
        
        onHide: function(){
            startNewRound();
            },
                  
        onDraw:function(){
            var canvasCenterX=(canvas.width/2);
            var text=levelScreenText + (level+1); 

            var textWidth=getTextWidth(text,levelScreenFont);
            var textX=canvasCenterX - (textWidth/2);

            ctx.fillStyle = textColor;
            ctx.font = levelScreenFont;
            ctx.fillText(text, textX,levelScreenTextY);
            }
        };
    

    var panelTextColor="#fff";
    var panelTextFont="px Arial";
    var panelTextY;

    var scoreTitle="Score: ";
    var score=0;
    var scoreX;

    var levelTitle="Level ";
    var level=0;
    var levelX;

    var livesTitle="Lives:";
    var lives=defaultStartLives;
    var livesWidth,livesOffsetRight,livesNumberWidth,livesNumberX,livesTitleX;

    var canvas,ctx,ball,paddle;  

    setPrototypes();
    
    return{

        init:function(options){

            canvas=options.canvas || document.getElementById(options.canvasId);    
            
            gameLevels=options.gameLevels || options.createGameLevels(canvas.width,canvas.height);

            ctx= canvas.getContext("2d");

            setListeners();

            setDefaultVariables();

            backgroundDrawer.init({imageSrc:backgroundImageSrc,imageWidth:backgroundImageWidth,imageHeight:backgroundImageHeight,sounds:defaultBackgroundSounds});

            levelScreen=new Screen(levelScreenOptions);

            gameOverScreen=new WaitingScreen({title:gameOverScreenTitle , msg:gameOverScreenMsg, drawBefore:drawPlayerScore, audio:defaultGameOverAudioOptions});
            winGameScreen=new WaitingScreen({title:winGameScreenTitle , msg:winGameScreenMsg, drawBefore:drawPlayerScore, audio:defaultWinGameScreenAudioOptions});
            gamePausedScreen=new WaitingScreen({title:gamePausedScreenTitle , msg:gamePausedScreenMsg, drawBefore:drawGamePausedBackground});

            paddle=new Paddle(defaultPaddleX,defaultPaddleY);

            ball=new Ball(defaultBallX,defaultBallY);  

            requestAnimationFrame(onAnimationFrame);
            },
        
        setMusic:function(isActive){
            isMusicActive=isActive;
            backgroundDrawer.onMusicStateChange();
            },
        
        setEffects:function(isActive){
            isEffectsActive=isActive;
            }
        }
        
    function setListeners(){
        canvas.addEventListener("click", function(event){

            if(!gamePausedScreen.isVisible)
                {
                isStartRound=false; 
                }
            });
            
        document.addEventListener("mousemove", function(event){
            var mouseX=event.pageX - canvas.offsetLeft;

            if(!gamePausedScreen.isVisible)
                {
                paddle.setCenterX(mouseX);    
                }
            });

        document.addEventListener("keydown", function(event){

            switch(event.keyCode )
                {
                case 38:// up
                    
                    if(isStartRound && level < gameLevels.length-1)
                        {    
                        level++;  
                        resetLevel(level);
                        }
                    break; 

                case 40:// down
                    if(isStartRound && level > 0)
                        {
                        level--;
                        resetLevel(level);   
                        }
                    break; 

                case 39:// right
                    paddle.setRightKeyPressed(true);
                    break; 

                case 37:// left
                    paddle.setLeftKeyPressed(true);
                    break; 

                case 32:// space
                    if(gamePausedScreen.isVisible)
                        {
                        gamePausedScreen.hide();
                        return;
                        }

                    isStartRound=false;
                    
                    if(gameOverScreen.isVisible || winGameScreen.isVisible)
                        {
                        startNewGame();
                        }
                    break; 
                }
            });

        document.addEventListener("keyup", function(event){

            switch(event.keyCode )
                {
                case 39:// right key
                    paddle.setRightKeyPressed(false);
                    break; 

                case 37:// left key
                    paddle.setLeftKeyPressed(false);
                    break; 
                }
            });
        
        document.addEventListener("visibilitychange", function() {
            gamePausedScreen.show();
            lastTime=undefined;
            });
        }

    function setDefaultVariables(){
        var canvasWidth=canvas.width;
        var canvasHeight=canvas.height;
        
        textSpace=0.005*canvasWidth;      

        panelTextFont=(0.034*canvasHeight) + screenMsgFont;
        panelTextY=0.042*canvasHeight;

        scoreX=0.02*canvasWidth;

        var canvasCenterX=(canvasWidth/2);

        livesWidth=0.09*canvasWidth;
        livesOffsetRight=0.02*canvasWidth;
        var livesTitleWidth=getTextWidth(livesTitle, panelTextFont);
        livesTitleX=canvasWidth - livesOffsetRight - livesWidth;
        livesNumberX=livesTitleX + livesTitleWidth + textSpace;
        livesNumberWidth=livesWidth - livesTitleWidth;
        
        var levelTextWidth=getTextWidth(levelTitle+level,panelTextFont);
        levelX=canvasCenterX - (levelTextWidth/2);

        defaultPaddleWidth=0.120*canvasWidth;;
        defaultPaddleHeight=0.028*canvasHeight;
        defaultPaddleBottomOffset=0.057*canvasHeight;
        defaultPaddleSpeed=0.01*canvasWidth;
        defaultPaddleX=canvasCenterX - (defaultPaddleWidth/2);
        defaultPaddleY=canvas.height - defaultPaddleBottomOffset - defaultPaddleHeight;
        
        defaultBallRadius=0.01*((canvasWidth+canvasHeight)/2);
        defaultBallSpeed=0.003*((canvasWidth+canvasHeight)/2);
        defaultBallX=canvasCenterX;
        defaultBallY=defaultPaddleY-defaultBallRadius;
        maxBallSpeed=defaultBallSpeed*2;

        screenTitleFont=(0.1*canvasHeight) + screenTitleFont;
        screenMsgFont=(0.025*canvasHeight) + screenMsgFont;

        playerScoreFont=(0.042*canvasHeight) + playerScoreFont;
        playerScoreY=canvas.height * 0.45;

        levelScreenFont=(0.1*canvasHeight) + levelScreenFont;
        levelScreenTextY=canvas.height/2; 
        }  
    
    function onLoseLive(){
        lives--;

        if(lives === 0)
            {
            onGameOver();
            }else
                {
                playEffecAudio(loseLivesAudio);
                startNewRound();
                }
        }

    function onGameOver(){
        gameOverScreen.show();
        }  
    
    function onPlayerWinLevel(){
        level++;

        if(level < gameLevels.length)
            {
            levelScreen.show();    
            }else
                {
                onPlayerWinGame();
                }
        }
      
    function onPlayerWinGame(){
        winGameScreen.show();
        } 
    
    function onAnimationFrame(timeout){
        var timePassed=(timeout&&lastTime)? timeout-lastTime : 0;
        lastTime=timeout;

        updateBackground(timePassed);
        actionUpdate(timePassed);
        drawGame();
       
        requestAnimationFrame(onAnimationFrame);   
        }
    
    function onUpdateBoard(updates,timePassed){
    
        for (var update = updates; update > 0; update--) 
            {
            updateBoard(timePassed);    
            }
        } 

    function updateGame(timePassed){
        boardUpdapter.update(timePassed);  
        } 
    

    function updateBackground(timePassed){
        backgroundDrawer.update(timePassed);    
        } 

    function updateBoard(timePassed){

        paddle.update();

        if(isStartRound)
            {
            ball.setX(paddle.getCenterX());    
            return;       
            }

        ball.update();

        if(ball.isCollideCanvasBottom())
            {
            onLoseLive();
            return;
            }

        var isCollide=ball.isCollide(paddle);

        if(isCollide)
            {
            playEffecAudio(paddleAudio);
            }

        updateBricks(timePassed);
        } 

    function updateBricks(timePassed){
        var isBrickLeft=false;

        iterateBricks(function(brick){
            if(brick.update)
                    {
                    brick.update(timePassed);      
                    } 

            if(ball.isCollide(brick) ) 
                {
                playEffecAudio(brickAudio);    
                addScore(brick.onCollide());
                }
            
            isBrickLeft=isBrickLeft || !brick.isBreak(); 
            });
        
        if(!isBrickLeft)
            {
            onPlayerWinLevel();    
            }
        }

    function drawGame(){
        ctx.clearRect(0,0,canvas.width,canvas.height);

        drawBackground();

        actionDraw();
        } 
    
    function drawBoard(){
        drawScore();
        drawLevel();
        drawLives();
        drawBricks(); 

        ball.draw();
        paddle.draw();
        }  
      
    function drawBackground(){
        if(backgroundDrawer.isImageLoaded)
            {
            backgroundDrawer.draw();    
            }else
                {
                ctx.fillStyle=backgroundColor;
                ctx.fillRect(0,0,canvas.width,canvas.height);
                }
        } 
    
    function drawScore() {
        ctx.font = panelTextFont;
        ctx.fillStyle = panelTextColor;
        ctx.fillText(scoreTitle+score, scoreX, panelTextY);
        }
    
    function drawLevel() {
        ctx.font = panelTextFont;
        ctx.fillStyle = panelTextColor;
        ctx.fillText(levelTitle + (level+1), levelX,panelTextY);
        }
    
    function drawLives() {
        ctx.font = panelTextFont;
        ctx.fillStyle = panelTextColor;
        ctx.fillText(livesTitle, livesTitleX,panelTextY);
        ctx.fillText(lives, livesNumberX,panelTextY,livesNumberWidth);
        }
    
    function drawBricks() {
        iterateBricks(function(brick){
            brick.draw(ctx);
            });
        }

    function iterateBricks(action) {
        var bricks=gameLevels[level];
        
        for (var i = 0; i < bricks.length; i++) 
            {
            if(!bricks[i].isBreak())
                {
                action(bricks[i]);       
                }      
            }
        }

    function playEffecAudio(audio) {
        if(isEffectsActive && audio)
            {
            audio.currentTime=0;
            audio.play();   
            }
        } 

    function startNewGame(){
        gameOverScreen.hide();
        winGameScreen.hide();

        score=0;
        bonusLives=0
        lives=defaultStartLives;
        level=0;

        startNewRound();

        resetLevels();
        } 
    
    function startNewRound(){
        isStartRound=true;

        paddle.setX(defaultPaddleX);

        ball.reset(defaultBallX,defaultBallY);
        }
    
    function resetLevels(){
        for (var lvl = 0; lvl < gameLevels.length; lvl++) 
            {
            resetLevel(lvl);
            }
        } 

    function resetLevel(lvl){
        for (var brickIndex = 0; brickIndex < gameLevels[lvl].length; brickIndex++) 
            {
            gameLevels[lvl][brickIndex].reset();    
            }   
        }    
    
    function addScore(s){
        score+=s;

        if( parseInt(score / defaultScoreForBonusLives) > bonusLives )
            {
            bonusLives++;
            lives++;    
            }
        }
    
    function createAudio(options){
        var audio=undefined;

        if(options)
            {
            audio=new Audio(options.url);
            audio.volume=options.volume || 1;   
            }
        
        return audio;
        } 
        
    function getTextWidth(text,font){
        ctx.font = font;
        return ctx.measureText(text).width;
        } 
    
    function getBoundCanvasX(x,width){

        if(x < 0)
            {
            x=0;   
            }else if(x + width > canvas.width)
                {
                x=canvas.width - width;  
                }
        
        return x;
        } 
    
    function setPrototypes(){
        setBallPrototype();
        setPaddlePrototype();
        setScreenPrototype();
        setWaitingScreenPrototype();
        }

    function Ball(x,y){
        this.color=defaultBallColor;
        this.radius=defaultBallRadius;
        this.x=x;
        this.y=y;
        this.dx=defaultBallSpeed;
        this.dy=-defaultBallSpeed;
        }   
    
    function setBallPrototype(){
        Ball.prototype=(function(){
            return{
                constructor:Ball,

                reset:function(x,y){
                    this.x=x;
                    this.y=y;
                    this.dx=defaultBallSpeed;
                    this.dy=-defaultBallSpeed;
                    }, 
                
                update:function(){
                    this.x+= this.dx;
                    this.y+= this.dy;

                    if ( ( (this.x + this.dx) > (canvas.width-this.radius) ) || ( (this.x + this.dx) < this.radius) )
                        {
                        this.dx= -this.dx;
                        playEffecAudio(brickAudio); 
                        }
                    
                    if ( (this.y + this.dy) < this.radius ) 
                        {
                        this.dy= -this.dy;
                        playEffecAudio(brickAudio); 
                        }
                    },

                draw:function(){
                    ctx.beginPath();
                    ctx.fillStyle=this.color;
                    ctx.arc(this.x,this.y, this.radius,0,2*Math.PI);

                    ctx.closePath();
                    ctx.fill();
                    }, 
                
                setX:function(x){
                    this.x=x;
                    },
                
                isCollideCanvasBottom:function(){
                    return this.y  > (canvas.height-this.radius);
                    },
                
                isCollide:function(rect){
                    var centerX=rect.x+rect.width/2;
                    var centerY=rect.y+rect.height/2;

                    var distX = Math.abs(this.x - rect.x-rect.width/2);
                    var distY = Math.abs(this.y - rect.y-rect.height/2);

                    if (distX > (rect.width/2 + this.radius)) 
                        {    
                        return false; 
                        }
                    
                    if (distY > (rect.height/2 + this.radius)) 
                        { 
                        return false; 
                        }

                    if (distX <= (rect.width/2)) 
                        { 
                        if(Math.abs(this.y-centerY) > Math.abs(this.dy+this.y-centerY))
                            {
                            this.dy=-this.dy;      
                            }
                        
                        return true;  
                        } 
                
                    if (distY <= (rect.height/2)) 
                        { 
                        if(Math.abs(this.x-centerX) > Math.abs(this.dx+this.x-centerX))
                            {
                            this.dx=-this.dx;    
                            }
                        
                        return true;  
                        }

                    var dx=distX-rect.width/2;
                    var dy=distY-rect.height/2;

                    if((dx*dx+dy*dy<=(this.radius*this.radius)))
                        {
                        var d;

                        if(Math.abs(this.x-centerX) > Math.abs(this.dx+this.x-centerX)) // if is moving to center x
                            {
                            this.dx=this.dx * (-1.1); 
                            d=(this.dx>0)?1:-1;
                            this.dx=Math.min(Math.abs(this.dx),maxBallSpeed) * d;     
                            }
                        
                        if(Math.abs(this.y-centerY) > Math.abs(this.dy+this.y-centerY)) // if is moving to center y
                            {
                            this.dy=this.dy * (-1.1);
                            d=(this.dy>0)?1:-1;
                            this.dy=Math.min(Math.abs(this.dy),maxBallSpeed) * d;      
                            }
                        
                        return true;   
                        }

                    return false;               
                    },
                    
                }
            })();
        } 
    
    function Paddle(x,y){
        Rect.call(this,x,y,defaultPaddleWidth,defaultPaddleHeight);

        this.isRightKeyPressed=false;
        this.isLeftKeyPressed=false;
        }   
    
    function setPaddlePrototype(){
        Paddle.extends(Rect,getPaddlePrototype());
        }

    function getPaddlePrototype(){
        return{
            getCenterX:function(){
                return this.x + (this.width/2);       
                },
            
            setCenterX:function(centerX){
                var newX=centerX - this.width/2;
                this.x= getBoundCanvasX(newX,this.width);       
                },
            
            setX:function(x){
                this.x= getBoundCanvasX(x,this.width);       
                },
            
            update:function(){
                if(this.isLeftKeyPressed || this .isRightKeyPressed)
                    {
                    var speed=(this.isRightKeyPressed)? defaultPaddleSpeed : -defaultPaddleSpeed;

                    this.x=getBoundCanvasX(this.x+speed, this.width);     
                    }
                }, 
                
            draw:function(){
                ctx.fillStyle=defaultPaddleColor;
                ctx.fillRect(this.x,this.y, this.width, this.height);
                },
            
            setRightKeyPressed:function(isRightKeyPressed){
                this.isRightKeyPressed=isRightKeyPressed;
                }, 
            
            setLeftKeyPressed:function(isLeftKeyPressed){
                this.isLeftKeyPressed=isLeftKeyPressed;
                },    
            }  
        }

    function Screen(options){
        this.onShow=options.onShow || this.onShow;
        this.onHide=options.onHide || this.onHide;
        this.onDraw=options.onDraw || this.onDraw;

        this.audio=createAudio(options.audio);

        this.isVisible=false;
        }   
    
    function setScreenPrototype(){
        Screen.prototype=(function(){
            return{
                constructor:Screen,
                show:function(){
                    actionDraw=this.draw.bind(this);
                    actionUpdate=emptyFunc;

                    this.isVisible=true;

                    playEffecAudio(this.audio);

                    if(this.onShow)
                        {
                        this.onShow();   
                        }
                    },
                
                hide:function(){
                    actionDraw=drawBoard;
                    actionUpdate=updateGame;
                    this.isVisible=false;

                    if(this.onShow)
                        {
                        this.onHide();   
                        }
                    }, 
                   
                draw:function(){

                    if(this.onDraw)
                        {
                        this.onDraw();    
                        }
                    },  
                }
            })();
        }

    function WaitingScreen(options){
        Screen.call(this,{audio:options.audio});

        this.title=options.title || "";
        this.msg=options.msg || "";
        this.drawBefore=options.drawBefore;

        var canvasCenterX=(canvas.width/2);

        var titleWidth=getTextWidth(this.title,screenTitleFont);
        this.titleX=canvasCenterX - (titleWidth/2);
        this.titleY=canvas.height * 0.2;

        var msgWidth=getTextWidth(this.msg,screenMsgFont);
        this.msgX=canvasCenterX - (msgWidth/2);
        this.msgY=canvas.height * 0.7;
        }   
    
    function setWaitingScreenPrototype(){
        WaitingScreen.extends(Screen,getWaitingScreenPrototype());     
        }

    function getWaitingScreenPrototype(){
        return{     
            onDraw:function(){
                ctx.fillStyle = textColor;

                if(this.drawBefore)
                    {
                    this.drawBefore();    
                    }
    
                ctx.fillStyle = textColor;

                this.drawTitle();
                this.drawMsg();
                },

            drawTitle:function(){
                ctx.font = screenTitleFont;
                ctx.fillText(this.title, this.titleX,this.titleY);
                },

            drawMsg:function(){
                ctx.font = screenMsgFont;
                ctx.fillText(this.msg, this.msgX,this.msgY);
                },    
            }
            
        }
    })();
