function init_aul() {
    return new AdUnitLoader(9);
}
document.addEventListener('DOMContentLoaded',function(){
    //console.log('init_aul');
    var aul = init_aul();
    //console.log(aul.contentDirectChildrenSelector)
    aul.loadViewableArea();
    //aul.loadAllSlots();
    var then = new Date();
    //console.log(then);
   window.addEventListener('scroll', function() {
        var now = new Date();
        var diff = Math.abs(now - then);
        if(diff < 500) {
            return;
        }
        then = now;
        aul.loadViewableArea();
    });
    /*window.addEventListener('resize', function() {
        //console.log('height:' + window.innerHeight);
    });*/
});