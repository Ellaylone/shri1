const DATALIST = {
    channels: "channels.json",
    tvguide: "tvguide.json"
};

function getData(url, callback) {
    var req = new XMLHttpRequest();
    req.overrideMimeType("application/json");
    req.open("GET", url, true);
    req.onreadystatechange = function() {
        if (req.readyState === 4 && req.status == "200") {
            callback(req.responseText);
        }
    }
    req.send(null);
}

var Modal = function(elem, confirm, toggle){
    this.elem = elem;
    this.overlay = document.getElementById("overlay");
    var that = this;
    this.elem.getElementsByClassName("modal__close")[0].addEventListener(
        "click",
        function(){ that.hide(); },
        false
    );
    this.elem.getElementsByClassName("modal__confirm")[0].addEventListener(
        "click",
        function(){ if(confirm()){ that.hide(); } },
        false
    );
    if(typeof toggle !== 'undefined'){
        toggle.addEventListener("click", function(){ that.show(); }, false);
    }
}

Modal.prototype.show = function(){
    this.overlay.classList.remove("hidden");
    this.elem.classList.remove("hidden");
    return this;
}

Modal.prototype.hide = function(){
    this.overlay.classList.add("hidden");
    this.elem.classList.add("hidden");
    return this;
}

function formChannels(data){
    data = JSON.parse(data);
    console.log(data);
    var elems = document.getElementsByClassName("tvguide__channels");
    if(elems.length > 0){
        elems.forEach(function(elem){

        });
    }
}

function formTvGuide(data){
    data = JSON.parse(data);
    console.log(data);
    var elems = document.getElementsByClassName("tvguide__guide");
    if(elems.length > 0){
        elems.forEach(function(elem){

        });
    }
}

getData(DATALIST.channels, formChannels);
getData(DATALIST.tvguide, formTvGuide);

var modalList = [];
var channelList = new Modal(
    document.getElementById("channellistModal"),
    function(){
        //TODO channel confirm
        return true;
    },
    document.getElementById("channelSelect")
);
modalList.push(channelList);
document.getElementById("overlay").addEventListener("click", function(){
    modalList.forEach(function(modal){
        modal.hide();
    });
}, false);
