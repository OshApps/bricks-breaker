
Function.prototype.extends=function(parent,prototype){
    this.prototype=Object.create(parent.prototype);
    this.prototype.constructor=this;

    this.setPrototype(prototype);
    }

Function.prototype.setPrototype=function(prototype){
    for (var key in prototype) 
        {
        this.prototype[key]=prototype[key];
        }
    }

function Rect(x,y,width,height){
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
    }   

function UpdateManager(timeout,updateFunc) {
    this.timeout=timeout;
    this.timePassed=0;
    this.updateFunc=updateFunc;
    }

UpdateManager.prototype=(function(){
    return{
        constructor:UpdateManager,
       
        update:function(timePassed){
            this.timePassed+=timePassed;
            var updates=parseInt(this.timePassed / this.timeout);

            if(updates > 0)
                {
                this.timePassed-=this.timeout*updates;
                this.updateFunc(updates,timePassed);
                }     
            }
        }
    })(); 

function parseArray(item){
    return Array.isArray(item)? item : [item];
    }  

function extend(){
    var target={};

    for (var i = 0; i < arguments.length; i++) 
        {
        for (var key in arguments[i]) 
            {
            target[key]=arguments[i][key];
            }
        }

    return target;    
    } 