class Cell{ // a class that represents a living cell
    constructor(location, parent){
        this.location = location;   // the location of the cell in the world
        this.age = 0;   // the age of the cell
        this.parent = parent;
    }

    update(){
        this.age++;
    }

    createChild(range){
        let x = 2 * (Math.random() - 0.5);
        let y = 2 * (Math.random() - 0.5);
        const size = Math.sqrt((x**2) + (y**2)+0.0001);
        const ratio = range/size;
        x *= ratio;
        y *= ratio;

        return new Cell({x:Math.floor(this.location.x + x), y: Math.floor(this.location.y + y)}, this);
    }

    draw(c){
        
        c.beginPath();
        c.moveTo(this.parent.location.x, this.parent.location.y);
        c.lineTo(this.location.x, this.location.y);
        c.strokeStyle = this.getColor();
        ctx.lineWidth = 3;
        ctx.stroke();
        c.arc(this.location.x, this.location.y, this.getSize(), 0, 2 * Math.PI);
        c.fillStyle = this.getColor();
        c.fill();
    }

    getSize(){
        return 2;
    }

    getColor(){
        let color = {r:115, g:77, b:38};
        color.r = Math.floor(color.r + (this.age/4));
        color.g = Math.floor(color.g + (this.age/2));
        color.b = Math.floor(color.b + (this.age/2));
        return "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
    }

    canCreateChild(env){
        return true;
    }

    needsToDie(env){
        return (this.age > 5 && (!this.isImprovement(env)) || this.age > 500);
    }

    waterScore(env){
        return blueScore(pixelValue(env, this.location.x, this.location.y));
    }

    isImprovement(env){
        let parentScore = 0;
        if(this.parent != undefined){
            this.parent.waterScore(env)
        }
        return this.waterScore(env) >= parentScore;
    }



}


function blueScore(color){
    const redSquaredDistance = (color.r) ** 2;  // max value (65025)
    const greenSquaredDistance = (0.5 * color.g) ** 2;  // max value (16129)
    const blueSquareDistance = (255 - color.b) ** 2;    // max value (65025)
    const distance = Math.sqrt(redSquaredDistance + greenSquaredDistance + blueSquareDistance); // max value (382.336239)

    const maxDistance = 382.336239;
    return ((maxDistance - distance) / maxDistance)**3   // the relative distance of the given color from the absolute color blue (between 0[yellow] and 1[blue]).
}

function drawEnv(c, env){
    c.drawImage(env, 0, 0);
}

function iterateSimulation(c, env, noiseSize){
    let maxChildCount = 20;
    //drawEnv(c, env);
    let i =0;
    while(i<tree.length){
        let cell = tree[i];
        cell.update();   // update age of cell
        for(let j =0;j<maxChildCount; j++){
            if(cell.canCreateChild(env)){   // check if possible to create a child
                let child = cell.createChild(noiseSize);
                if(child.waterScore(env) >= tree[i].waterScore(env)){
                    if(tree.length >= maxChildCount){
                        tree[i] = child;
                    }
                    else{
                        tree.push(child);
                    }
                }
                //tree.push(cell.createChild(noiseSize)); // create the child
            }
        }
        
        if(cell.needsToDie(env)){   // check if the cell is old enough/ weak enough to die
            if(tree.length == 1){
                cell.age = 0;
            }
            else{
                tree = tree.splice(i, 1) // delete the cell from the tree if needs to die
                i--;
            }
        }
        i++;
    };
    tree.forEach(cell=>cell.draw(c));
}


function pixelValue(c, x, y){   // get the RGB value of a location on a given canvas
    let pixelData = c.getContext("2d").getImageData(x, y, 1, 1).data;
    return {r:pixelData[0], g:pixelData[1], b:pixelData[2]};
}


function readImageFromInput(input, callback){
    var file = input.files[0];
    var fr = new FileReader();
    fr.onload = ()=>{
        callback(fr.result);
    }
    fr.readAsDataURL(file);    // begin reading
    
}

function start(input){
    background.onload = ()=>{
        
        runSimulation();
    };
    readImageFromInput(input, (result)=>{
        background.src = result;
    });
}

function runSimulation(){
    let startingLoc = randomLocation(0, 0, canvas.width, canvas.height);
    tree = [new Cell(startingLoc, new Cell(startingLoc))];
    envCtx.drawImage(background, 0, 0);
    drawEnv(ctx, environment);
    ctx.globalAlpha = 0.1
    setInterval(()=>iterateSimulation(ctx, environment, noiseRange), 50)
}

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let background = new Image();

let environment = document.getElementById("tmp");
let envCtx = environment.getContext("2d");
let noiseRange = 6;

let tree = [];  // a list of living cells



function randomLocation(minX, minY, maxX, maxY){
    let x = minX + (Math.random() * (maxX - minX));
    let y = minY + (Math.random() * (maxY - minY));
    return {x, y};
}