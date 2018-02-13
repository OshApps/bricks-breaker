window.onload=function(){

    BricksBreaker.init({canvasId:"canvas",createGameLevels:createGameLevels});

    document.getElementById("effects").addEventListener("change",function(){
        BricksBreaker.setEffects(this.checked);
        });
    
    document.getElementById("music").addEventListener("change",function(){
        BricksBreaker.setMusic(this.checked);
        });

    function createGameLevels(canvasWidth,canvasHeight){
        var brickImage=new Image();
        brickImage.src="images/bricks.png";

        var brickWidth=0.1*canvasWidth;

        var baseOptions={
            canvasWidth:canvasWidth, 
            offsetSide:0.03*canvasWidth,
            offsetTop:0.071*canvasHeight,
            brickHeight:0.042*canvasHeight,
            brickWidth:brickWidth,
            brickScore:[5,10,15,20,25,30,35],
            color:["blue","green","yellow","orange","red"],
            image:[ {image:brickImage,imageWidth:48,imageHeight:48,imageRect:new Rect(0,0,48*5,48*2),scaleImage:true},
                    {image:brickImage,imageWidth:48,imageHeight:48,imageRect:new Rect(0,48*4,48*5,48*2)},
                    {image:brickImage,imageWidth:48,imageHeight:48,imageRect:new Rect(0,48*6,48*5,48*2),isImageAnimation:true,animationTimeout:1000,scaleImage:true},
                    {image:brickImage,imageWidth:48,imageHeight:48,imageRect:new Rect(0,48*8,48*5,48*2),isImageAnimation:true,animationTimeout:50,imageAnimationLayout:3},
                    {imageSrc:"images/brick.png",scaleImage:true}]
            }

        gameMaker.createNewGame();
        
        gameMaker.addNewLevel(baseOptions,{
            brickObjInRow:[{layers:1}],
            bricksRows:[8,7,6,5,4,3,2,1],
            bricksPosition:["center"],
            });

        gameMaker.addNewLevel(baseOptions,{
            colOffset:[0,brickWidth,0,brickWidth,0],
            bricksRows:[[{ layers:2},{ layers:2},{ layers:1},{ layers:1},{ layers:2},{ layers:2}] , [{ layers:2},{ layers:2},{ layers:1},{ layers:1},{ layers:2},{ layers:2}] , [{ layers:2},{ layers:2},{ layers:1},{ layers:1},{ layers:2},{ layers:2}] , [{ layers:2},{ layers:2},{ layers:1},{ layers:1},{ layers:2},{ layers:2}] , [{ layers:2},{ layers:2},{ layers:1},{ layers:1},{ layers:2},{ layers:2}] , [{ layers:2},{ layers:2},{ layers:1},{ layers:1},{ layers:2},{ layers:2}] ],
            bricksPosition:["center"],
            });

        gameMaker.addNewLevel(baseOptions,{
            brickObjInRow:[{ layers:3},{ layers:2},{ layers:2},{ layers:1}],
            bricksRows:[8,7,6,5,4,3,2,1],
            bricksPosition:["right"],
            });

        gameMaker.addNewLevel(baseOptions,{
            colOffset:[0,0,brickWidth,0],
            bricksRows:[[{ layers:2},{ layers:4},{ layers:2},{ layers:2},{ layers:4},{ layers:2}] , [{ layers:2},{ layers:4},{ layers:2},{ layers:2},{ layers:4},{ layers:2}] ,[{ layers:2},{ layers:4},{ layers:2},{ layers:2},{ layers:4},{ layers:2}] ,[{ layers:2},{ layers:4},{ layers:2},{ layers:2},{ layers:4},{ layers:2}] ,[{ layers:2},{ layers:4},{ layers:2},{ layers:2},{ layers:4},{ layers:2}] ,[{ layers:2},{ layers:4},{ layers:2},{ layers:2},{ layers:4},{ layers:2}]  ],
            bricksPosition:["center"],
            });

        gameMaker.addNewLevel(baseOptions,{
            brickObjInRow:[{ layers:5},{ layers:4},{ layers:3},{ layers:3},undefined,{ layers:2},{ layers:2},{ layers:1},{ layers:1}],
            bricksRows:[5,5,5,5,0,9,9,0,8,8],
            bricksPosition:["center"],
            });
        
        gameMaker.addNewLevel(baseOptions,{
            offsetSide:0.01*canvasWidth,
            rowOffset:20,
            brickOffset:0.136*canvasWidth,
            bricksRows:[[{imageIndex:0},{ imageIndex:1},{ imageIndex:0}], [{imageIndex:0},{ imageIndex:1},{ imageIndex:1},{ imageIndex:0}], [{imageIndex:0},{ imageIndex:1},{ imageIndex:0}], [{imageIndex:0},{ imageIndex:1},{ imageIndex:1},{ imageIndex:0}] ],
            bricksPosition:["center","space-between","center","space-between"],
            brickHeight:48,
            brickWidth:0.144*canvasWidth,
            });

        gameMaker.addNewLevel(baseOptions,{
            rowOffset:20,
            bricksRows:[[{imageIndex:3},{ imageIndex:2},{ imageIndex:3}], [{imageIndex:3},{ imageIndex:2},{ imageIndex:3}], [{imageIndex:3},{ imageIndex:2},{ imageIndex:3}], [{imageIndex:3},{ imageIndex:2},{ imageIndex:3}], ],
            bricksPosition:["space-around"],
            brickHeight:48,
            brickWidth:0.144*canvasWidth,
            });  
        
        gameMaker.addNewLevel(baseOptions,{ 
            brickOffset:0.03*canvasWidth,
            brickObjInRow:[{imageIndex:0},{imageIndex:1},{imageIndex:2},{score:1,layers:3},{imageIndex:4},{imageIndex:3}],
            bricksRows:[6,5,4,3,2,1],
            bricksPosition:["center"],
            });
        
        return gameMaker.getGameLevels();
        }
    };