const DATALIST = {
    channels: "channels.json",
    tvguide: "tvguide.json"
};
const TVGUIDE_DAYS = 7;
const widthChange = 767,
      smallHourWidth = 100,
      bigHourWidth = 300,
      currentHourWidth = 300;
var channelsData, tvguideData, selectedChannels = [];

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

function throttle(callback, delay) {
    var timer = null;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, delay);
    };
}

function onWindowResize(e){
    if(window.innerWidth < widthChange){
        tvguideSwiper.hourWidth = smallHourWidth;
    } else {
        tvguideSwiper.hourWidth = bigHourWidth;
    }
    currentHourWidth = tvguideSwiper.hourWidth;
    tvguideSwiper.init();
}
window.addEventListener("resize", throttle(onWindowResize, 100));

var Swiper = function(wrapper){
    this.wrapper = wrapper;
    this.swiper__drag = this.wrapper.getElementsByClassName("swiper__scrollbar__drag")[0];
    this.swiper__arrows = this.wrapper.getElementsByClassName("swiper__arrow");
    this.timeline = this.wrapper.getElementsByClassName("timeline")[0];
    this.hours = this.wrapper.getElementsByClassName("timeline__hour");
    this.timemarker = this.wrapper.getElementsByClassName("timemarker")[0];
    this.guide = this.wrapper.getElementsByClassName("tvguide__guide")[0];
    this.hourWidth = bigHourWidth;
    this.markerOffset;
}

Swiper.prototype.init = function(){
    this.timeline.setAttribute("style", "width: " + this.hours.length * this.hourWidth + "px");
    this.guide.setAttribute("style", "width: " + this.hours.length * this.hourWidth + "px");
    var dragWidth = 100 / this.hours.length;
    if(dragWidth < 30) dragWidth = 3;
    this.swiper__drag.setAttribute("style", "width: " + dragWidth + "%;")
    this.markerTimeout.apply(this);
}

Swiper.prototype.markerTimeout = function(){
    this.setMarkerPosition(new Date());
    setTimeout(this.markerTimeout.bind(this), 60 * 1000);
}

Swiper.prototype.setMarkerPosition = function(date){
    for(var i = 0; i < this.hours.length; i++){
        if(this.hours[i].dataset.day == date.getDate() && this.hours[i].dataset.time == date.getHours()){
            this.markerOffset = i * this.hourWidth + (this.hourWidth / 60) * date.getMinutes();
            this.timemarker.setAttribute(
                "style",
                "transform: translate3d(" + this.markerOffset + "px, 0px, 0px)"
            );
            this.timemarker.dataset.offset = this.markerOffset;
            break;
        }
    }
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
                formTimeLine();
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
    var firstCall = false;
    if(data != channelsData){
        channelsData = data;
        firstCall = true;
    }
    data = JSON.parse(data);
    var elem = document.getElementsByClassName("tvguide__channels")[0];
    var channellist = document.getElementById("channellistModal");
    var channelsCookie = getCookie("tv_channels");
    if(channelsCookie.length > 0){
        channelsCookie.split(",");
    }
    if(data.channels.length > 0){
        data.channels.forEach(function(channel){
            if((channelsCookie.length == 0 && channel.default) || (channelsCookie.length > 0 && channelsCookie.indexOf(channel.id.toString()) >= 0)){
                var channelElem = document.createElement("li");
                channelElem.classList.add("tvguide__channels__channel");
                channelElem.setAttribute("style", "background-position: " + channel.imagePosition[0] + "px " + channel.imagePosition[1] + "px");
                channelElem.setAttribute("tooltip", channel.name);
                elem.appendChild(channelElem);
            }
        });
        if(channellist !== null){
            channellist = channellist.getElementsByClassName("channellist")[0];
            selectedChannels = [];
            data.channels.forEach(function(channel){
                var channelElem = document.createElement("div");
                channelElem.classList.add("channellist__channel");

                var channelInput = document.createElement("input");
                channelInput.classList.add("channellist__channel_input");
                channelInput.type = "checkbox";
                channelInput.value = channel.id;
                channelInput.id = "channel" + channel.id;
                if((channelsCookie.length == 0 && channel.default) || (channelsCookie.length > 0 && channelsCookie.indexOf(channel.id.toString()) >= 0)){
                    channelInput.setAttribute("checked", "checked");
                    selectedChannels.push(channel);
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
    if(firstCall){
        getData(DATALIST.tvguide, formTvGuide);
    } else {
        formTvGuide(tvguideData);
    }
    showTvGuide();
}

function formTvGuide(data){
    tvguideData = data;
    data = JSON.parse(data);
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

    var guideChannels = elem.getElementsByClassName("tvguide__guide__channels")[0];

    selectedChannels.forEach(function(channel){
        var chan = document.createElement("ul");
        chan.classList.add("tvguide__guide__channels__channel");

        var tvEvents = generateTvevents();
        for(var i = 0; i < tvEvents.length; i++){
            var chanElem = document.createElement("li");
            chanElem.classList.add("tvevent");
            chanElem.dataset.title = tvEvents[i].title;
            chanElem.setAttribute("tooltip", tvEvents[i].description);
            var tvEventHour = [];
            var tvEventMinutes = [];
            for(var j = 0; j < tvEvents[i].time.length; j++){
                tvEventHour.push((tvEvents[i].day + 1) * 24 + parseInt(tvEvents[i].time[j] / 60));
                tvEventMinutes.push(parseInt(tvEvents[i].time[j] % 60));
            }

            var leftOffset = tvEventHour[0] * currentHourWidth + (currentHourWidth / 60) * tvEventMinutes[0];
            var rightOffset = tvEventHour[1] * currentHourWidth + (currentHourWidth / 60) * tvEventMinutes[1];
            chanElem.style.left = leftOffset + "px";
            chanElem.dataset.right = rightOffset + "px";
            chanElem.dataset.type = tvEvents[i].type;

            var chanElemTitle = document.createElement("span");
            chanElemTitle.classList.add("tvevent__title");
            var timemarker = document.getElementsByClassName("timemarker")[0];
            if(parseInt(timemarker.dataset.offset) > rightOffset){
                chanElemTitle.classList.add("tvevent__title__past");
            } else {
                if(parseInt(timemarker.dataset.offset) > leftOffset){
                    chanElemTitle.classList.add("tvevent__title__now");
                }
            }

            var chanElemTitleText = document.createTextNode(tvEvents[i].title);
            chanElemTitle.appendChild(chanElemTitleText);

            var chanElemTime = document.createElement("span");
            chanElemTime.classList.add("tvevent__time");
            var chanElemTimeText = document.createTextNode(parseInt(tvEvents[i].time[0] / 60) + ":" + pad(tvEventMinutes[0], 2));
            chanElemTime.appendChild(chanElemTimeText);

            chanElem.appendChild(chanElemTitle);
            chanElem.appendChild(chanElemTime);
            chan.appendChild(chanElem);
        }
        guideChannels.appendChild(chan);
    });

    showTvGuide();
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

Array.prototype.random = function(){return this[Math.floor(Math.random() * this.length)];};

var randWords = ["новости", "вести", "врата", "египта", "история", "наука", "шар", "молодость", "теория", "исследования"];

function generateTvevents(){
    var results = [];
    var eventLength = [30, 45, 60, 90];
    var showTime = [6, 23];
    for(var i = -1; i < TVGUIDE_DAYS; i++){
        var startTime = showTime[0] * 60;
        var endTime = startTime + eventLength.random();
        while(startTime < (showTime[1] * 60)){
            startTime = endTime;
            endTime += eventLength.random();
            results.push(generateRandomTvevent(i, [startTime, endTime]));
        }
    }
    return results;
}

function generateRandomTvevent(day, time){
    var result = {
        "title": "",
        "description": "",
        "day": day,
        "time": time,
        "type": [0,1,2].random()
    };
    for(var i = 0; i < Math.floor(Math.random() * (2 - 1 + 1)) + 1; i++){
        result.title += randWords.random() + " ";
    }
    result.title = result.title.capitalizeFirstLetter().trim();
    for(var i = 0; i < Math.floor(Math.random() * (6 - 3 + 1)) + 3; i++){
        result.description += randWords.random() + " ";
    }
    result.description = result.description.capitalizeFirstLetter().trim();
    return result;
}

function clearAll(){
    clearTvGuide();
    clearChannels();
    clearFilters();
}

function clearTvGuide(){
    document.getElementsByClassName("timeline")[0].innerHTML = "";
    document.getElementsByClassName("tvguide__guide__channels")[0].innerHTML = "";
}

function clearFilters(){
    document.getElementsByClassName("tvguide-filters")[0].innerHTML = "";
    document.getElementsByClassName("datecontrol")[0].innerHTML = "";
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
        draggable(
            document.getElementsByClassName("swiper__scrollbar__drag")[0],
            document.getElementsByClassName("tvguide__guide")[0],
            document.getElementsByClassName("tvguide-controls")[0]
        );
    }
}

function hideTvGuide(){
    showCount = 0;
    document.getElementsByClassName("spinner")[0].classList.remove("hidden");
    document.getElementsByClassName("tvguide-wrapper")[0].classList.add("hidden");
}

var tvguideSwiper = new Swiper(document.getElementsByClassName("tvguide-wrapper")[0]);

getData(DATALIST.channels, formChannels);
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
    for(var i = -1; i < (TVGUIDE_DAYS - 1); i++){
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
        dateControlNum.dataset.day = i;
        var dateControlNumText = document.createTextNode(guideDay);
        dateControlNum.appendChild(dateControlNumText);

        dateControl.appendChild(dateControlDay);
        dateControl.appendChild(dateControlNum);
        dateControlWrap.appendChild(dateControl);
    }
    tvguideSwiper.init();
    showTvGuide();
}


function mouseX (e) {
    if (e.pageX) {
        return e.pageX;
    }
    if (e.clientX) {
        return e.clientX + (document.documentElement.scrollLeft ?
                            document.documentElement.scrollLeft :
                            document.body.scrollLeft);
    }
    return null;
}

function mouseY (e) {
    if (e.pageY) {
        return e.pageY;
    }
    if (e.clientY) {
        return e.clientY + (document.documentElement.scrollTop ?
                            document.documentElement.scrollTop :
                            document.body.scrollTop);
    }
    return null;
}

function draggable (clickable, draggable, controls) {
    var drag = false;
    var offsetX = 0;
    var mousemoveTemp = null;
    var arrowPercent = 5;
    var moveTimeout = null;
    var moveDelay = 1000;

    var clickableWrap = clickable.parentNode;
    var draggableWrap = draggable.parentNode;
    var clickableHeadWrap = clickableWrap.parentNode;
    var clickableArrows = clickableHeadWrap.getElementsByClassName("swiper__arrow");
    var startOffsetX = clickableWrap.getBoundingClientRect().left;
    var clickableLimits = [0, clickableWrap.offsetWidth - (clickable.offsetWidth + 2)];
    var draggablePxPercent = (draggable.offsetWidth - draggableWrap.offsetWidth) / 100;
    var clickablePxPercent = (clickableLimits[1]/100);
    var draggableMultiply = draggablePxPercent / clickablePxPercent;
    var controlsNow = controls.getElementsByClassName("tvguide-controls__now")[0];
    var controlDays = controls.getElementsByClassName("datecontrol__day");
    var nowLimits = [];

    function move(x) {
        clickable.dataset.offset = parseInt(clickable.dataset.offset) + x;

        if(clickable.dataset.offset < clickableLimits[0]){
            clickable.dataset.offset = clickableLimits[0];
        } else if(clickable.dataset.offset > clickableLimits[1]){
            clickable.dataset.offset = clickableLimits[1];
        }

        clickable.style.transform = "translate3d(" + clickable.dataset.offset + "px, 0px, 0px)";

        var xTranslate = -1 * clickable.dataset.offset * draggableMultiply;
        draggable.style.transform = "translate3d(" + xTranslate + "px, 0px, 0px)";
        var dayWidth = -1 * 24 * currentHourWidth;
        markChange(Math.floor(xTranslate / dayWidth) - 1);

        if(clickable.dataset.offset < nowLimits[0] || clickable.dataset.offset > nowLimits[1]){
            controlsNow.classList.remove("hidden");
        } else {
            controlsNow.classList.add("hidden");
        }
    }
    function mouseMoveHandler(e) {
        e = e || window.event;

        if(!drag){return true};

        var x = mouseX(e);
        if (x != offsetX) {
            move(x-offsetX);
            offsetX = x;
        }
    }
    function startDrag(e) {
        e = e || window.event;

        offsetX=mouseX(e);
        drag=true;

        if (document.body.onmousemove) {
            mousemoveTemp = document.body.onmousemove;
        }
        document.body.onmousemove = mouseMoveHandler;
    }
    function stopDrag() {
        drag=false;
        clearTimeout(moveTimeout);
        moveDelay = 1000;
        offsetX = clickable.dataset.offset;

        if (mousemoveTemp) {
            document.body.onmousemove = mousemoveTemp;
            mousemoveTemp = null;
        }
    }
    function moveManager(e){
        if(e.button != 0) return false;
        switch (e.target){
        case clickable:
            startDrag(e);
        case clickableWrap:
            move(mouseX(e) - startOffsetX - clickable.dataset.offset - clickable.offsetWidth / 2);
            startDrag(e);
        default:
            for(var i = 0; i < clickableArrows.length; i++){
                //NOTE targets svg / path
                if(e.path.indexOf(clickableArrows[i]) >= 0){
                    var tempX = clickablePxPercent * arrowPercent;
                    if(clickableArrows[i].classList.contains("swiper__arrow__left")){
                        tempX *= -1;
                    }
                    function keepMoving(){
                        move(tempX);
                        if(moveDelay > 50){
                            moveDelay /= 2;
                        }
                        moveTimeout = setTimeout(keepMoving, moveDelay);
                    }
                    keepMoving();
                    break;
                }
            }
        }
    }
    function markChange(day){
        for(var i = 0; i < controlDays.length; i++){
            if(parseInt(controlDays[i].getElementsByClassName("datecontrol__day__number")[0].dataset.day) == day){
                controlDays[i].classList.add("datecontrol__day__current");
            } else {
                controlDays[i].classList.remove("datecontrol__day__current");
            }
        }
    }
    function controlsChange(e){
        if(e.target.classList.contains("datecontrol__day__number")){
            for(var i = 0; i < controlDays.length; i++){
                controlDays[i].classList.remove("datecontrol__day__current");
            }
            e.target.parentNode.classList.add("datecontrol__day__current");
            moveToDay(parseInt(e.target.dataset.day));
        }
    }
    function moveToNow(){
        var now = new Date();
        var day = 0;
        var hour = now.getHours();
        if(now.getHours() <= 1){
            day = -1;
            hour = 23;
        } else {
            hour -= 1;
        }
        moveToDay(day, hour);
        controlsNow.dataset.offset = clickable.dataset.offset;
        nowLimits = [
            parseInt(controlsNow.dataset.offset) - (arrowPercent * clickablePxPercent / 2),
            parseInt(controlsNow.dataset.offset) + (arrowPercent * clickablePxPercent)
        ];
    }
    function moveToDay(day, hour){
        if(typeof hour == "undefined") hour = 7;
        var hourBlocks = (24 * (day + 1) + hour);
        var hourOffset = (hourBlocks * currentHourWidth / draggablePxPercent) * clickablePxPercent;
        move(hourOffset - clickable.dataset.offset);
    }
    clickableHeadWrap.onmousedown = moveManager;
    window.onmouseup = stopDrag;
    controls.onclick = controlsChange;
    controlsNow.onclick = moveToNow;
    moveToNow();
}

var tvguideFilters = document.getElementsByClassName("tvguide-filters")[0];
tvguideFilters.onchange = filterChange;
var filters = tvguideFilters.getElementsByTagName("input");

function filterChange(e){
    if(e.target.type == "checkbox"){
        var checkedFilters = 0;
        for(var i = 0; i < filters.length; i++){
            if(filters.item(i).checked){
                checkedFilters++;
            }
        }
        var tvevents = document.getElementsByClassName("tvevent");
        if(e.target.checked){
            if(checkedFilters <= 1){
                for(var i = 0; i < tvevents.length; i++){
                    if(parseInt(tvevents.item(i).dataset.type) != parseInt(e.target.value)){
                        tvevents.item(i).classList.add("tvevent__unselected");
                    }
                }
            } else {
                for(var i = 0; i < tvevents.length; i++){
                    if(parseInt(tvevents.item(i).dataset.type) == parseInt(e.target.value)){
                        tvevents.item(i).classList.remove("tvevent__unselected");
                    }
                }
            }
        } else {
            if(checkedFilters < 1){
                for(var i = 0; i < tvevents.length; i++){
                    tvevents.item(i).classList.remove("tvevent__unselected");
                }
            } else {
                for(var i = 0; i < tvevents.length; i++){
                    if(parseInt(tvevents.item(i).dataset.type) == parseInt(e.target.value)){
                        tvevents.item(i).classList.add("tvevent__unselected");
                    }
                }
            }
        }
    }
}
