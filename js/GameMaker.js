
var gameMaker=(function(){
    var defaultOptions={
        canvasWidth:500,
        offsetSide:0,
        offsetTop:10,
        color:undefined,
        image:[null],
        brickOffset:10,
        rowOffset:10,
        colOffset:[0],
        bricksRows:[5],
        brickObjInRow:[{}],
        bricksPosition:["right"],
        brickHeight:30,
        brickWidth:undefined,
        brickScore:[5]
        }
    
    var getNextBrickX=function(lastX,col){
            return lastX + levelOptions.brickWidth + levelOptions.brickOffset + getColOffset(col);
            };
        
    var positionObjs={
        "left":{
            getBrickStartX:function(){
                return levelOptions.offsetSide;
                },
            
            getNextBrickX:getNextBrickX
            },

        "right":{
            getBrickStartX:function(bricksInRow){
                var totalBricksWidth=getTotalBricksWidth(bricksInRow);

                return levelOptions.canvasWidth - levelOptions.offsetSide -totalBricksWidth;
                },
            
            getNextBrickX:getNextBrickX
            },

        "center":{
            getBrickStartX:function(bricksInRow){
                var totalBricksWidth=getTotalBricksWidth(bricksInRow);

                return (levelOptions.canvasWidth /2) - (totalBricksWidth/2);
                },
            
            getNextBrickX:getNextBrickX
            },
        
        "space-around":{
            brickOffset:undefined,

            getBrickStartX:function(bricksInRow){
                var totalBricksWidth= levelOptions.brickWidth * bricksInRow;

                this.brickOffset=((levelOptions.canvasWidth- (levelOptions.offsetSide * 2) - totalBricksWidth) / bricksInRow) / 2; 

                return levelOptions.offsetSide + this.brickOffset;
                },
            
            getNextBrickX:function(lastX,col,isNewGroup){
                return lastX + levelOptions.brickWidth + this.brickOffset*2;
                }
            },

        "space-between":{
            brickOffset:undefined,

            getBrickStartX:function(bricksInRow){
                var totalBricksWidth= levelOptions.brickWidth * bricksInRow;

                this.brickOffset=(levelOptions.canvasWidth - (levelOptions.offsetSide * 2) - totalBricksWidth) / (bricksInRow-1); 

                return levelOptions.offsetSide;
                },
            
            getNextBrickX:function(lastX,col){
                return lastX + levelOptions.brickWidth + this.brickOffset;
                }
            },
        };

    var gameLevels=[];
    var levelOptions,sumColOffset;  

    return{
        createNewGame:function(){
            gameLevels=[];
            },
        
        addNewLevel:function(){
            var args =Array.from(arguments);
            args.unshift(defaultOptions);

            levelOptions=extend.apply(null,args);

            levelOptions.brickObjInRow=parseArray(levelOptions.brickObjInRow);
            levelOptions.colOffset=parseArray(levelOptions.colOffset);
            levelOptions.bricksPosition=parseArray(levelOptions.bricksPosition);
            levelOptions.color=parseArray(levelOptions.color);
            levelOptions.image=parseArray(levelOptions.image);

            setBricksRows();

            levelOptions.brickWidth = levelOptions.brickWidth || getDefaultBrickWidth();
            
            setSumColOffset();

            gameLevels.push( createBricks() );
            },
        
        getGameLevels:function(){
            return gameLevels;
            },
        }

    function setBricksRows(){ 
        var bricksRows=parseArray(levelOptions.bricksRows);
        
        for (var i = 0; i < bricksRows.length; i++) 
            { 
            bricksRows[i]= Array.isArray(bricksRows[i])? bricksRows[i] : Array(bricksRows[i]);
            }
        
        levelOptions.bricksRows=bricksRows;
        }
        
    function getDefaultBrickWidth(){ 
        var bricksRows=levelOptions.bricksRows;
        var maxBricksInRow=-Infinity;

        for (var i = 0; i < bricksRows.length; i++) 
            { 
            maxBricksInRow=Math.max(maxBricksInRow,bricksRows[i].length);
            }

        return ( ( (levelOptions.canvasWidth - levelOptions.offsetSide*2) / maxBricksInRow) - levelOptions.brickOffset);
        }

    function setSumColOffset(){ 
        sumColOffset=0;

        for (var col = 0; col < levelOptions.colOffset.length; col++) 
            {
            sumColOffset+=getColOffset(col); 
            } 
        }

    function createBricks(){
        var bricksArray=[];

        var brick,brickX,brickY,extendedBrickOptions,brickColors,brickImage,brickOptions,currPositionObj;
        var bricksRows=levelOptions.bricksRows;
        var brickWidth=levelOptions.brickWidth;
        var brickHeight=levelOptions.brickHeight;

        for (var row=0 ; row < bricksRows.length ; row++) 
            {
            currPositionObj=positionObjs[getBricksPosition(row)]; 

            brickX=currPositionObj.getBrickStartX(bricksRows[row].length);
            brickY=levelOptions.offsetTop + (row * (brickHeight+levelOptions.rowOffset) );    
                
            for (var col= 0; col < bricksRows[row].length; col++) {
                brickOptions={
                    x:brickX, 
                    y:brickY, 
                    width:brickWidth, 
                    height:brickHeight,
                    score:levelOptions.brickScore
                    }; 
                
                extendedBrickOptions= extend(getBrickObjInRow(row),bricksRows[row][col]);
 
                bricksArray.push(createBrickObj(brickOptions,extendedBrickOptions));
                
                brickX=currPositionObj.getNextBrickX(brickX,col);     
                }    
            }
        
        return bricksArray;
        }
    
    function createBrickObj(brickOptions,extendedBrickOptions){
        var brickColors=levelOptions.color;
        var brickImage=(brickColors)? undefined: levelOptions.image[0];

        if(extendedBrickOptions)
            {
            if(extendedBrickOptions.imageIndex !== undefined)
                {
                brickImage=levelOptions.image[extendedBrickOptions.imageIndex];
                extendedBrickOptions.imageIndex=undefined;    
                }    

            if(extendedBrickOptions.layers)
                {  
                brickColors= brickColors.slice(0,extendedBrickOptions.layers);  
                extendedBrickOptions.layers=undefined;   
                }     
            }

        brickOptions=extend(brickOptions,brickImage,{color:brickColors},extendedBrickOptions);;

        var brick;

        if(brickImage)
            {
            brick=new BrickSprite(brickOptions);   
            }else
                {
                brick=new BrickColor(brickOptions);
                }  

        return brick;
        } 

    function getTotalBricksWidth(bricksInRow){
        return  ( (levelOptions.brickWidth + levelOptions.brickOffset) * bricksInRow) - levelOptions.brickOffset + sumColOffset;
        } 
        
    function getBricksPosition(index){
        return  levelOptions.bricksPosition[index] ||  levelOptions.bricksPosition[levelOptions.bricksPosition.length-1];
        } 
    
    function getBrickObjInRow(row){
        return  levelOptions.brickObjInRow[row] ||  levelOptions.brickObjInRow[levelOptions.brickObjInRow.length-1];
        } 
    
    function getColOffset(index){
        return  levelOptions.colOffset[index] ||  levelOptions.colOffset[levelOptions.colOffset.length-1];
        } 
    
    })();