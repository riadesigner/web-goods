import {DeloneApp} from "../jsm/deloneapp.js";

/*

    POINTS EDITOR

    на вход получаем ширину, высоту и два окна
    встраиваем редактор точек в эти окна

*/

var PointsEditor = {
    init:function(w,h,win1,win2) {
        
        

        this.win1 = win1;
        this.win2 = win2;        
        this.ARR_POINTS_1 = [];
        this.ARR_POINTS_2 = [];
        this.isDragging = false
        this.v={
            currX:0,
            currY:0,
            initX:0,
            initY:0,
            mxOffset:0,
            myOffset:0
        };
        this.canvasSize = [w,h];
        
        this.currentPoint = false;
        this.dotsize = 14;
        // this.build_points();
        this.behavior();
    },
    behavior:function(){
        this.win1.addEventListener("mouseup",e=>{           
            !this.isDragging && this.build_new_point(e);
        });
        this.win2.addEventListener("mouseup",e=>{           
            !this.isDragging && this.build_new_point(e);
        });        
        document.addEventListener('mousemove', e=>{this.drag(e);});  
        document.addEventListener('mouseup', e=>{this.drag_end(e);});
        

    },
    get_code:function(images) {
       
       var arr_points_1 = [];
       for(var i in this.ARR_POINTS_1){
            var x = this.ARR_POINTS_1[i].style.left.slice(0, -2);
            var y = this.ARR_POINTS_1[i].style.top.slice(0, -2);
            arr_points_1.push([x,y]);
       };
       var arr_points_2 = [];
       for(var i in this.ARR_POINTS_2){
            var x = this.ARR_POINTS_2[i].style.left.slice(0, -2);
            var y = this.ARR_POINTS_2[i].style.top.slice(0, -2);
            arr_points_2.push([x,y]);
       };      
       
       var w  =this.canvasSize[0];
       var h  =this.canvasSize[1];

       var json = {
        images:[
            {points:arr_points_1.slice(),src:images[0].src,x:0,y:0,w:w,h:h},
            {points:arr_points_2.slice(),src:images[1].src,x:0,y:0,w:w,h:h}
            ],
        triangles:[]
       };

       var code = DeloneApp.get(json);    
       return code;

    },
    build_points:function(){
        for (let i in [1,2]){
            let x = Math.random()*this.canvasSize[0];
            let y = Math.random()*this.canvasSize[1];
            this.add_point(x,y);        
        }
    },
    build_new_point:function(e){
        let x = e.offsetX;
        let y = e.offsetY;
        this.add_point(x,y);
    },
    add_point:function(x,y) {        
        const p = document.createElement('div');
        p.style.left = x+'px';
        p.style.top = y+'px';
        p.classList.add('m-point');
        this.ARR_POINTS_1.push(p);
        this.win1.appendChild(p);
        p.addEventListener("mousedown",e=>{this.drag_start(e);});
        p.addEventListener("mouseenter",e=>{this.mouse_enter(e);});
        p.addEventListener("mouseleave",e=>{this.mouse_leave(e);});
        p.addEventListener('contextmenu', e=> {
            let index = this.ARR_POINTS_1.indexOf(p);
            var p_twin = this.ARR_POINTS_2[index];
            this.ARR_POINTS_1.splice(index,1);
            this.ARR_POINTS_2.splice(index,1);
            p.remove();
            p_twin.remove();
            e.preventDefault();            
            return false;
        }, false);  
        this.add_twin(p);

    },
    add_twin:function(p) {
        const p2 = document.createElement('div');
        p2.style.left = p.style.left;
        p2.style.top = p.style.top;
        p2.classList.add('m-point');
        this.ARR_POINTS_2.push(p2);
        this.win2.appendChild(p2);
        p2.addEventListener("mousedown",e=>{this.drag_start(e);});
        p2.addEventListener("mouseenter",e=>{this.mouse_enter2(e);});
        p2.addEventListener("mouseleave",e=>{this.mouse_leave2(e);});        
        p2.addEventListener('contextmenu', e=> {
            let index = this.ARR_POINTS_2.indexOf(p2);
            var p_twin = this.ARR_POINTS_1[index];
            this.ARR_POINTS_2.splice(index,1);
            this.ARR_POINTS_1.splice(index,1);
            p2.remove();
            p_twin.remove();
            e.preventDefault();            
            return false;
        }, false);           
    },    
    mouse_enter:function(e) {
        let p = e.target;        
        let index = this.ARR_POINTS_1.indexOf(p);
        let p_twin = this.ARR_POINTS_2[index];
        p.classList.add('highlighted');
        p_twin.classList.add('highlighted');        
    },
    mouse_enter2:function(e) {
        let p = e.target;        
        let index = this.ARR_POINTS_2.indexOf(p);
        let p_twin = this.ARR_POINTS_1[index];
        p.classList.add('highlighted');
        p_twin.classList.add('highlighted');        
    },    
    mouse_leave:function(e) {
        let p = e.target;        
        let index = this.ARR_POINTS_1.indexOf(p);
        let p_twin = this.ARR_POINTS_2[index];
        p.classList.remove('highlighted');
        p_twin.classList.remove('highlighted');        
    },    
    mouse_leave2:function(e) {
        let p = e.target;        
        let index = this.ARR_POINTS_2.indexOf(p);
        let p_twin = this.ARR_POINTS_1[index];
        p.classList.remove('highlighted');
        p_twin.classList.remove('highlighted');        
    },        
    drag_end(e) {    
        this.isDragging = false;
    },  
    drag:function(e) {
        let c_s = this.canvasSize;
        if (this.isDragging) {      
            this.v.currX = e.clientX - this.win1.offsetLeft-this.dotsize/2 - this.v.mxOffset;
            this.v.currY = e.clientY - this.win1.offsetTop-this.dotsize/2 - this.v.myOffset;
            this.v.currX = this.v.currX<0?0:this.v.currX;
            this.v.currY = this.v.currY<0?0:this.v.currY;
            this.v.currX = this.v.currX>c_s[0]-1?c_s[0]-1:this.v.currX;
            this.v.currY = this.v.currY>c_s[1]-1?c_s[1]-1:this.v.currY;
          this.currentPoint.style.left = this.v.currX+'px'; 
          this.currentPoint.style.top = this.v.currY+'px';            
      }
    },
    drag_start:function(e) {
        this.isDragging = true;
        this.currentPoint = e.target;
        this.v.currX = this.currentPoint.offsetLeft;
        this.v.currY = this.currentPoint.offsetTop;
        this.v.initX = e.clientX - this.win1.offsetLeft-this.dotsize/2;
        this.v.initY = e.clientY - this.win1.offsetTop-this.dotsize/2;    
        this.v.mxOffset = this.v.initX-this.v.currX;
        this.v.myOffset = this.v.initY-this.v.currY;            
    }
};

export {PointsEditor}

