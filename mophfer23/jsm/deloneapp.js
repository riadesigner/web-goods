import {Delaunay} from "https://cdn.skypack.dev/d3-delaunay@6";

/*

    TRIANGLE DELONE

    возвращаем json, дополнив его 4-мя точками и треугольниками
    На вход получаем массив точек


*/

var DeloneApp = {
    get:function(json) {
        this.json = json;
        this.add_points();      
        this.add_triangles(); 
        return this.json;
    },

    add_points:function() {
        var w = this.json.images[0].w; 
        var h = this.json.images[0].h; 
        for (var i=0;i<this.json.images.length;i++){
            var points = this.json.images[i].points;
            points.push([0, 0]);
            points.push([0, h]);
            points.push([w, 0]);
            points.push([w, h]);
        };
    },
    add_triangles:function() {
        var arr = [];
        var points = this.json.images[0].points;
        const delaunay = Delaunay.from(points);
        const {triangles} = delaunay;   

        console.log('triangles.length',triangles.length)
        var norm_arr =[]; 
        for (var n=0;n<triangles.length;n+=3){                
            norm_arr.push([triangles[n],triangles[n+1],triangles[n+2]])
        };
        this.json.triangles = norm_arr;

    }  

};


export {DeloneApp}

