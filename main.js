const DATALIST = {
    channels: "channels.json",
    tvguide: "tvguide.json"
};
var channelsData, tvguideData;

function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

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
        function(){
            if(confirm(that.elem.getElementsByClassName("channellist__channel_input"))){
                that.hide();
                hideTvGuide();
                clearAll();
                formChannels(channelsData);
                formTvGuide(tvguideData);
            }
        },
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
    channelsData = data;
    data = JSON.parse(data);
    var elem = document.getElementsByClassName("tvguide__channels")[0];
    var channellist = document.getElementById("channellistModal");
    var channelsCookie = getCookie("tv_channels");
    if(channelsCookie.length > 0){
        channelsCookie.split(",");
    }
    if(data.channels.length > 0){
        data.channels.forEach(function(channel){
            if((channelsCookie.length == 0 && channel.default) || (channelsCookie.length > 0 && channelsCookie.indexOf(channel.id.toString) >= 0)){
                var channelElem = document.createElement("li");
                channelElem.classList.add("tvguide__channels__channel");
                channelElem.setAttribute("style", "background-position: " + channel.imagePosition[0] + "px " + channel.imagePosition[1] + "px");
                elem.appendChild(channelElem);
            }
        });
        if(channellist !== null){
            channellist = channellist.getElementsByClassName("channellist")[0];
            data.channels.forEach(function(channel){
                var channelElem = document.createElement("div");
                channelElem.classList.add("channellist__channel");

                var channelInput = document.createElement("input");
                channelInput.classList.add("channellist__channel_input");
                channelInput.type = "checkbox";
                channelInput.value = channel.id;
                channelInput.id = "channel" + channel.id;
                if((channelsCookie.length == 0 && channel.default) || (channelsCookie.length > 0 && channelsCookie.indexOf(channel.id.toString) >= 0)){
                    channelInput.setAttribute("checked", "checked");
                }

                var channelLabel = document.createElement("label");
                channelLabel.setAttribute("for", "channel" + channel.id);
                channelLabel.classList.add("needsclick");

                var channelLabelText = document.createTextNode(channel.name);

                channelLabel.appendChild(channelLabelText);
                channelElem.appendChild(channelInput);
                channelElem.appendChild(channelLabel);
                channellist.appendChild(channelElem);
            });
        }
    }
    showTvGuide();
}

function formTvGuide(data){
    tvguideData = data;
    data = JSON.parse(data);
    console.log(data);
    var elem = document.getElementsByClassName("tvguide__guide")[0];
    var filterElem = document.getElementsByClassName("tvguide-filters")[0];

    data.tvtype.forEach(function(type){
        var genre = document.createElement("div");
        genre.classList.add("tvguide-filters__genre");

        var film = document.createElement("input");
        film.type = "checkbox";
        film.value = type.id;
        film.id = "genre" + type.id;

        var label = document.createElement("label");
        label.setAttribute("for", "genre" + type.id);
        label.classList.add("needsclick");

        var labelText = document.createTextNode(type.name);

        label.appendChild(labelText);
        genre.appendChild(film);
        genre.appendChild(label);
        filterElem.appendChild(genre);
    });

    showTvGuide();
}

function clearAll(){
    clearTvGuide();
    clearChannels();
    clearFilters();
}

function clearTvGuide(){
    document.getElementsByClassName("tvguide__guide")[0].innerHTML = "";
}

function clearFilters(){
    document.getElementsByClassName("tvguide-filters")[0].innerHTML = "";
}

function clearChannels(){
    document.getElementsByClassName("tvguide__channels")[0].innerHTML = "";
    document.getElementById("channellistModal").getElementsByClassName("channellist")[0].innerHTML = "";
}

var showCount = 0;
function showTvGuide(){
    showCount++;
    if(showCount >= 2){
        document.getElementsByClassName("spinner")[0].classList.add("hidden");
        document.getElementsByClassName("tvguide-wrapper")[0].classList.remove("hidden");
    }
}

function hideTvGuide(){
    showCount = 0;
    document.getElementsByClassName("spinner")[0].classList.remove("hidden");
    document.getElementsByClassName("tvguide-wrapper")[0].classList.add("hidden");
}

getData(DATALIST.channels, formChannels);
getData(DATALIST.tvguide, formTvGuide);
formTimeLine();

var modalList = [];
var channelList = new Modal(
    document.getElementById("channellistModal"),
    function(checkboxes){
        var checkedChannels = [];
        if(checkboxes.length > 0){
            for(var i = 0; i < checkboxes.length; i++){
                if(checkboxes[i].checked){
                    checkedChannels.push(checkboxes[i].value);
                }
            }
            createCookie("tv_channels", checkedChannels.join(","), 10);
        }
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
        if(i == 0) dateControl.classList.add("datecontrol__day__current");

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
