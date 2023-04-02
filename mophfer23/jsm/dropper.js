import {MorphApp} from "../jsm/morphapp.js";

/*


    DROPPER IMAGES

    (загрузка двух картинок на страницу)

*/

var Dropper = {
    init:function() {                
        this.dr = document.getElementById('m-dropper');        
        this.behavior();
    },
    behavior:function() {        
        console.log('this.dr',this.dr)        
        this.dr.addEventListener('dragover', this.onDragOver.bind(this));        
        this.dr.addEventListener('dragleave', this.onDragLeave.bind(this));
        this.dr.addEventListener('drop', this.onDrop.bind(this));
    },
    onDragOver:function(e){        
        e.dataTransfer.dropEffect = "move";
        e.target.classList.add("active");
        e.stopPropagation();
        e.preventDefault();
    },    
    onDragLeave:function(e) {
        e.target.classList.remove("active");
        e.stopPropagation();
        e.preventDefault();        
    },
    onDrop:function(e) {
        e.target.classList.remove("active");
        e.target.classList.add("full");
        e.stopPropagation();
        e.preventDefault();
        this.setFiles(e.dataTransfer.files);        
        if(this.files.length<2){
            alert("изображений должно быть два")
            return false;            
        }else{
            this.dr.style.display = "none";
            MorphApp.init(this.files);    
        }        
    },
    setFiles:function(files) {
        this.files = files;            
    }
};

export {Dropper}
