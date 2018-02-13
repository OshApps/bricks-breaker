 function BrickBase(x,y,width,height) {
        Rect.call(this,x,y,width,height);
        }
    
function BrickColor(options){
    this.super(options.x,options.y,options.width,options.height);

    this.colors= parseArray(options.color);
    this.colorIndex=this.colors.length-1;
    this.scores= parseArray(options.score);
    }

function BrickSprite(options) {
    this.super(options.x,options.y,options.width,options.height);

    this.isImageLoaded=false;
    this.isImageAnimation=options.isImageAnimation||false;
    this.scaleImage=options.scaleImage||false;

    this.imageWidth=options.imageWidth;
    this.imageHeight=options.imageHeight;
    this.imageRect=options.imageRect;
    this.layouts=options.imageAnimationLayout;

    this.image= options.image || new Image();
    this.image.addEventListener('load', this.onLoadImage.bind(this));
    
    if(!options.image)
        {
        this.image.src=options.imageSrc;    
        }
    
    this.scores= parseArray(options.score);

    var animationTimeout=options.animationTimeout || 30;

    this.updateManager=new UpdateManager(animationTimeout, this.onUpdate.bind(this));
    }

(function(){

    BrickBase.extends(Rect,getBrickBasePrototype());
    BrickColor.extends(BrickBase,getBrickColorPrototype());
    BrickSprite.extends(BrickBase,getBrickSpritePrototype());

    function getBrickBasePrototype(){
        return{
            super:function(){
                BrickBase.apply(this,arguments);
                },
            
            draw:function(ctx){
                },
            
            update:function(timePassed){
                },
            
            reset:function(){
                },
            
            isBreak:function(){
                return true;
                },
            
            onCollide:function(){
                return 0;
                }
            }
        }

    function getBrickColorPrototype(){
        return{
            reset:function(){
                this.colorIndex=this.colors.length-1;
                }, 
            
            onCollide:function(){
                var score=this.scores[Math.min(this.colorIndex , this.scores.length-1)];
                this.colorIndex--;

                return score;
                }, 
                
            draw:function(ctx){ 
                ctx.fillStyle=this.colors[this.colorIndex];
                ctx.fillRect(this.x,this.y, this.width, this.height);  
                },
            
            isBreak:function(){
                return this.colorIndex < 0;
                }
            }
        }

    function getBrickSpritePrototype(){
        return{
            onLoadImage:function(){
                this.imageRect=this.imageRect||new Rect(0,0,this.image.width,this.image.height);
                this.imageX=this.imageRect.x;
                this.imageY=this.imageRect.y;

                this.imageWidth=this.imageWidth || this.imageRect.width;
                this.imageHeight=this.imageHeight || this.imageRect.height;
                
                if(this.isImageAnimation)
                    {
                    this.layouts=this.layouts || 1;    
                    }else
                        {
                        this.layouts=parseInt(this.imageRect.width/this.imageWidth * this.imageRect.height/this.imageHeight);    
                        } 
                    
                this.currLayout=this.layouts;

                this.isImageLoaded=true;
                },
            
            onCollide:function(){

                if(!this.isImageLoaded)
                    {
                    return 0;
                    }
                
                var score=this.scores[Math.min(this.currLayout-1,this.scores.length-1)];
                
                if(!this.isImageAnimation)
                    {
                    this.imageX+=this.imageWidth; 

                    var imageRectRight= this.imageRect.x + this.imageRect.width;
                    var imageRectBottom=this.imageRect.y + this.imageRect.height;

                    if(this.imageX >= imageRectRight && this.imageY + this.imageHeight < imageRectBottom)
                        {
                        this.imageX=this.imageRect.x;
                        this.imageY+=this.imageHeight;  
                        }
                    } 

                this.currLayout--; 

                return score;
                }, 
            
            onUpdate:function(updates){

                if(!this.isImageLoaded || !this.isImageAnimation)
                    {
                    return;
                    }

                this.imageX+=this.imageWidth * updates; 

                var imageRectRight= this.imageRect.x + this.imageRect.width;
                var imageRectBottom=this.imageRect.y + this.imageRect.height;

                while(this.imageX >= imageRectRight)
                    {
                    updates--;
                    this.imageX=this.imageRect.x + (this.imageWidth * updates);
                    this.imageY=(this.imageY+this.imageHeight < imageRectBottom)? this.imageY+this.imageHeight:this.imageRect.y; 
                    }  
                    
                },

            reset:function(){
                this.currLayout= this.layouts;  

                this.imageX=this.imageRect.x;
                this.imageY=this.imageRect.y;  
                }, 

            update:function(timePassed){
                this.updateManager.update(timePassed);
                },

            draw:function(ctx){
                
                if(this.isImageLoaded)
                    {
                    ctx.imageSmoothingEnabled = true;

                    if(this.scaleImage)
                        {
                        ctx.drawImage(this.image, this.imageX, this.imageY, this.imageWidth, this.imageHeight, this.x, this.y, this.width, this.height); 
                        return;     
                        }

                    var width,height,widthLeft,heightLeft;
                    var canvasRectRight= this.x + this.width;
                    var canvasRectBottom=this.y + this.height;

                    var canvasX=this.x;
                    var canvasY=this.y;

                    while(canvasX < canvasRectRight)
                        {
                        widthLeft= canvasRectRight - canvasX;
                        width=Math.min(this.imageWidth , widthLeft);

                        heightLeft=canvasRectBottom - canvasY;
                        height=Math.min(this.imageHeight, heightLeft );

                        ctx.drawImage(this.image, this.imageX, this.imageY, width, height, canvasX, canvasY, width, height);    
                        
                        canvasX=canvasX + this.imageWidth;

                        if(canvasX >= canvasRectRight && canvasY + this.imageHeight < canvasRectBottom)
                            {
                            canvasX=this.x;
                            canvasY+=this.imageHeight;
                            }
                        }
                    }   
                },
            
            isBreak:function(){
                return this.currLayout <= 0;
                }
            }  
        }

   
    })();


