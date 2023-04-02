import {PointsEditor} from "../jsm/pointseditor.js";

/*

    MORPH APP

    строим UI редактора
    на вход получаем два файла (картинки)
    на выходе два окна для исходных картинок и одно окно для preview

*/
var MorphApp = {
    init:function(files) {
        
        this.all_app = document.getElementById('m-all-app');
        this.all_app.style.display = "block";

        this.btnPreview = document.getElementById('m-btn-preview');
        // this.btnGetCode = document.getElementById('m-btn-get-code');       
        this.btnExportImages = document.getElementById('m-btn-export-images');       
        this.dl_container = document.getElementById('m-download-container');
        
        
        this.files = files;
        this.images = [];
        
        this.PREVIEW_MODE = false;
        this.REPLAY_DIRECTION = -1;

        this.build_scene();   

    },
    behavior:function() {
        
        this.btnPreview.addEventListener("click",this.toggle_preview.bind(this));
        // this.btnGetCode.addEventListener('click',this.get_code.bind(this));
        this.btnExportImages.addEventListener('click',this.export_images.bind(this));
    },
    toggle_preview:function() {
        if(this.PREVIEW_MODE){
            this.PREVIEW_MODE=false;
            this.all_app.classList.remove('preview-mode');
        }else{
            this.PREVIEW_MODE=true;
            this.all_app.classList.add('preview-mode');
            this.preview_canvas_draw();
        }
       this.update_scene();
    },
    get_code:function() {
        var json = PointsEditor.get_code(this.images);          
        
        // [0,0] is Delone way
        // {x:0,y:0} is Morpher way
        // so, we need to convert [0,0] to {x:0,y:0};

        var foo = {
            convert:function(points){
                var arr_points = [];
                for (var i=0;i<points.length;i++){
                    arr_points.push({x:points[i][0],y:points[i][1]})
                }
                return arr_points;
            }
        };

        var points1 = json.images[0].points;
        var points2 = json.images[1].points;
        
        json.images[0].points = foo.convert(points1); 
        json.images[1].points = foo.convert(points2); 
        
        return json;
    },

    replay_preview:function(morpher) {
        console.log('morpher',this.REPLAY_DIRECTION);
        this.REPLAY_DIRECTION*=-1;
        if(this.REPLAY_DIRECTION>0){
          morpher.set([1, 0]);
          morpher.animate([0, 1], 600);      
        }else{
          morpher.set([0, 1]);
          morpher.animate([1, 0], 600);    
        }
    },
    export_images:function() {
        var json = this.get_code();
        var morpher = new Morpher(json);
        var dl = this.dl_container;
        var TOTAL_EXPORT = 10;
        var step = 1/TOTAL_EXPORT;

        if(this.EXPORTING_NOW) return false;

        var all_links = [];

        var foo = {
          extract_images:function(canvas) {            
            this.EXPORTING_NOW = true;
            dl.innerHTML = "";
            foo._extract(canvas,0)
          },
          _extract:function(canvas,counter) {
            if(counter<1){ 
                console.log('counter',counter,1-counter);

              morpher.set([1-counter, counter]);  
              setTimeout(()=>{
                counter+=step;
                foo._link_download(canvas,counter);
                foo._extract(canvas,counter);
              },300);
            }else{
                this.EXPORTING_NOW = false;
            } 
          },
          _link_download:function(canvas,counter){
            var link = document.createElement('a');    
            link.download = 'slide_'+all_links.length+'.png';
            link.href = canvas.toDataURL('image/png')
            dl.appendChild(link);
            all_links.push(link);
            link.click();
          }     
        };      

        var cnv = document.getElementById('m-preview-shadow');
        var ctx = cnv.getContext('2d');
        ctx.clearRect(0, 0, cnv.width, cnv.height);

        morpher.on("draw",(morpher, canvas)=>{
            console.log('morpher draw!')
            ctx.drawImage(canvas,0,0);            
        });        


        morpher.animate([1, 0],100);  
        setTimeout(()=>{
            foo.extract_images(cnv);
        },300);
        

    },
    preview_canvas_draw:function() {

        var preview = this.preview_win;        
        var json = this.get_code();
        var morpher = new Morpher(json);        
        var replay_preview = this.replay_preview.bind(this,morpher);                        
                
        preview.innerHTML = "";

        var cnv = document.createElement('canvas');        
        cnv.id = "m-preview-shadow";
        preview.appendChild(cnv);    
        var ctx = cnv.getContext('2d');        
        cnv.width = this.images[0].width;
        cnv.height = this.images[0].height;                                
        cnv.addEventListener("click",replay_preview);        

        morpher.on("load", (morpher, canvas)=>{
            console.log('morpher load!')
            replay_preview();          
        });

        morpher.on("draw",(morpher, canvas)=>{
            console.log('morpher draw!')
            ctx.drawImage(canvas,0,0);            
        });

/*

load: (morpher, canvas) – all images are loaded and ready to morph
change: (morpher, canvas) – any change in geometry happened
draw: (morpher, canvas) – new frame (image) was drawn
resize: (morpher, canvas) – canvas was resized
animation:start: (moprher)
animation:complete: (moprher)
image:add: (morpher, image)
image:remove: (morpher, image)
point:add: (morpher)
point:remove: (morpher)
triangle:add: (morpher)
triangle:remove: (morpher)

*/

    },
    update_scene:function() {
        if(this.PREVIEW_MODE){
            console.log('this.PREVIEW_MODE',this.PREVIEW_MODE)
        }else{
            console.log('this.PREVIEW_MODE',this.PREVIEW_MODE)
        }
    },
    build_scene:function() {



        var counter=0;

        for(var i=0;i<2;i++){                
            (function(i,_this){                    
                var img = new Image();
                var reader = new FileReader();
                var file  = _this.files[i];                        
                reader.readAsDataURL(file);
                reader.onloadend = function () {
                    let src = this.result;
                    img.src = src;
                    img.alt = file.name;                                                 
                    _this.images[i] = img;
                    counter++;
                    if(counter==2){
                        setTimeout(()=>{
                            _this.build_canvases();
                        },100)                        
                    }
                }                            
            })(i,this);        
        }
      

    },
    get_canvas:function(index) {
       return this.arr_canvas[index];
    },
    build_canvases:function() {


        var main_win = document.getElementById('m-main-win');
        main_win.innerHTML = "";

        var img1 = this.images[0];
        var img2 = this.images[1];
        var w = img1.width;
        var h = img1.height;
        
        var w1 = document.createElement('div');
        var w2 = document.createElement('div');
        var w3 = document.createElement('div');        

        w1.classList.add('m-subwin');
        w2.classList.add('m-subwin');
        w3.classList.add('m-preview');
        w1.id = 'm-subwin-1';
        w2.id = 'm-subwin-2';
        w3.id = 'm-preview-win';
        main_win.appendChild(w1);
        main_win.appendChild(w2);
        main_win.appendChild(w3);

        w1.style.width=w+'px';        
        w1.style.height=h+'px';
        w2.style.width=w+'px';
        w2.style.height=h+'px';        
        w3.style.width=w+'px';        
        w3.style.height=h+'px';                

        this.arr_canvas = [];
        var canvas1 = document.createElement('canvas');
        var canvas2 = document.createElement('canvas');
        
        w1.appendChild(canvas1);
        w2.appendChild(canvas2);
        
        
        this.arr_canvas[0] = canvas1;
        this.arr_canvas[1] = canvas2;        
        this.preview_win = w3;

        canvas1.width=w;
        canvas1.height=h;
        canvas2.width=w;
        canvas2.height=h;


        var ctx1 = canvas1.getContext('2d');     
        var ctx2 = canvas2.getContext('2d');             
        ctx1.drawImage(img1,0,0,img1.width,img1.height);
        ctx2.drawImage(img2,0,0,img2.width,img2.height);        

        var hdl1 = document.createElement('div');
        hdl1.classList.add('m-handler');
        hdl1.id = 'm-hdl-1';
        hdl1.style.width = w+'px';
        hdl1.style.height = h+'px';
        w1.appendChild(hdl1);        

        var hdl2 = document.createElement('div');
        hdl2.classList.add('m-handler');
        hdl2.id = 'm-hdl-2';    
        hdl2.style.width = w+'px';
        hdl2.style.height = h+'px';        
        w2.appendChild(hdl2);            

        this.behavior();        

        PointsEditor.init(w,h,hdl1,hdl2);

    }

};

export {MorphApp}

