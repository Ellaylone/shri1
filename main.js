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
    var elems = document.getElementsByClassName("tvguide__channels");
    var channellist = document.getElementById("channellistModal");
    if(elems.length > 0 && data.channels.length > 0){
        var channelElems = [];
        data.channels.forEach(function(channel){
            if(channel.default){
                var channelElem = document.createElement("li");
                channelElem.classList.add("tvguide__channels__channel");
                channelElem.setAttribute("style", "background-position: " + channel.imagePosition[0] + "px " + channel.imagePosition[1] + "px");
                channelElems.push(channelElem);
            }
        });
        for(var i = 0; i < elems.length; i++){
            if(channelElems.length > 0){
                channelElems.forEach(function(channel){
                    elems[i].appendChild(channel);
                });
            }
        }
        channelElems = [];
        if(channellist !== null){
            channellist = channellist.getElementsByClassName("channellist")[0];
            data.channels.forEach(function(channel){
                var channelElem = document.createElement("div");
                channelElem.classList.add("channellist__channel");

                var channelInput = document.createElement("input");
                channelInput.type = "checkbox";
                channelInput.value = channel.id;
                channelInput.id = "channel" + channel.id;

                var channelLabel = document.createElement("label");
                channelLabel.setAttribute("for", "channel" + channel.id);
                channelLabel.classList.add("needsclick");

                var channelLabelText = document.createTextNode(channel.name);

                channelLabel.appendChild(channelLabelText);
                channelElem.appendChild(channelInput);
                channelElem.appendChild(channelLabel);
                channelElems.push(channelElem);
            });
            channelElems.forEach(function(channel){
                channellist.appendChild(channel);
            });
        }
    }
    showTvGuide();
}

function formTvGuide(data){
    data = JSON.parse(data);
    console.log(data);
    var elems = document.getElementsByClassName("tvguide__guide");
    if(elems.length > 0){
        elems.forEach(function(elem){

        });
    }
    showTvGuide();
}

var showCount = 0;
function showTvGuide(){
    showCount++;
    if(showCount >= 2){
        document.getElementsByClassName("spinner")[0].classList.add("hidden");
        document.getElementsByClassName("tvguide-wrapper")[0].classList.remove("hidden");
    }
}

getData(DATALIST.channels, formChannels);
getData(DATALIST.tvguide, formTvGuide);
formTimeLine();

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

function formTimeLine(){
    var now = new Date().getTime();
    var day = 1000 * 60 * 60 * 24;
    var timeline = document.getElementsByClassName("timeline")[0];
    var dateControlWrap = document.getElementsByClassName("datecontrol")[0];
    var dayNames = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
    for(var i = -1; i < 6; i++){
        var tempDate = new Date(now + (i * day));
        var guideDay = tempDate.getDate();
        for(var j = 0; j < 24; j++){
            var timeline_hour = document.createElement("li");
            timeline_hour.classList.add("timeline__hour");
            timeline_hour.dataset.day = guideDay;
            timeline_hour.dataset.time = j;

            var timeline_textnode = document.createTextNode(j + ":00");

            timeline_hour.appendChild(timeline_textnode);
            timeline.appendChild(timeline_hour);
        }
        var dateControl = document.createElement("div");
        dateControl.classList.add("datecontrol__day");

        var dateControlDay = document.createElement("span");
        dateControlDay.classList.add("datecontrol__day__day");
        var dateControlDayText = document.createTextNode(dayNames[tempDate.getDay()]);
        dateControlDay.appendChild(dateControlDayText);

        var dateControlNum = document.createElement("span");
        dateControlNum.classList.add("datecontrol__day__number");
        var dateControlNumText = document.createTextNode(guideDay);
        dateControlNum.appendChild(dateControlNumText);

        dateControl.appendChild(dateControlDay);
        dateControl.appendChild(dateControlNum);
        dateControlWrap.appendChild(dateControl);
    }
    showTvGuide();
}
