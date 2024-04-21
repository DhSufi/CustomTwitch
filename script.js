 var mainPlayer = new Clappr.Player({
		source: "http://localhost:8877/hls/asdf.m3u8",
		parentId: "#pholder",
		width: 3840,
		height: 1080,
		chromeless: true,
		autoPlay: true,
		disableVideoTagContextMenu: true,
});

const mainContainer = document.getElementById("main-container");
const sideContainer = document.getElementById("side-container");
const playShape = document.getElementById("playShape");

const mainVideo = document.getElementById("pholder").querySelector('video');
const sideVideo = document.getElementById("side-video");
const resizers = document.querySelectorAll('.resizer');

mainVideo.width = 3840;
mainVideo.height = 1080;
mainVideo.autoplay = true;
mainVideo.id = "main-video";
mainVideo.classList.add('main');
mainVideo.classList.add('video');
mainVideo.removeAttribute("data-html5-video");
mainVideo.removeAttribute("preload");

mainContainer.appendChild(mainVideo);
pholder.remove();

var sound = 1;
function mute() {
    if (sound){
        mainPlayer.mute();
        sound = 0;
    }
    else {
        mainPlayer.unmute();
        sound = 1;
    }
    console.log(sound);
}

function customPlayPause() {
    if (mainPlayer.isPlaying()) {
        mainPlayer.pause();
        playShape.style.clipPath = 'polygon(5px 5px, 35px 22.5px, 5px 40px)';

    }
    else {
        mainPlayer.seekPercentage(100);
        mainPlayer.play();
        playShape.style.clipPath = 'polygon(5px 5px, 15px 5px, 15px 45px, 25px 45px, 25px 5px, 35px 5px, 35px 45px, 5px 45px)';
    }
}

var layer = 1;
function changeLayers(){
    sideContainer.style.zIndex = layer;
    layer = 1 + (layer % 2)
    mainContainer.style.zIndex = layer;
}

var streamCopy;
if (window.navigator.userAgent.indexOf("Firefox") != -1) {
    streamCopy = mainVideo.mozCaptureStream();
    sideVideo.muted = false;
} else if (window.navigator.userAgent.indexOf("Chrome") != -1) {
    streamCopy = mainVideo.captureStream()
    sideVideo.muted = true;
} else {
    console.log("MAYBE BROWSER NOT SUPPORTED");
    streamCopy = mainVideo.captureStream()
    sideVideo.muted = true;
}

sideVideo.srcObject = streamCopy;



function posCanvas(element, newPos){
    element.style.left = newPos[0] + "px";
    element.style.top = newPos[1]  + "px";
}



var dx, dy, ofstX, ofstY;
function moveVideo(e) {

    container.style.left = e.pageX - dx - ofstX + "px";
    container.style.top = e.pageY  - dy - ofstY + "px";

}

var sx_pos, destination, correction;
function resizeVideoRatioX(e) {

    var changeX = (e.clientX - sx_pos) / 1920;

    var currentScale = window.getComputedStyle(container);;
    currentScale = currentScale.getPropertyValue('transform');
    currentScale = currentScale.replace("matrix(", "").split(",");
    var currentScaleX = parseFloat(currentScale[0]);
    if (currentScaleX < 0.15){
        currentScaleX = 0.15;
    }

    container.style.transform = `scale(${currentScaleX - (changeX * destination)})`;

    correction = 75 / currentScaleX;
    currentResizer.style.width = `${correction}px`;
    currentResizer.style.height = `${correction}px`;

    sx_pos = e.clientX;
}

function resetResizers() {

    var CSMain = window.getComputedStyle(mainContainer);;
    CSMain = CSMain.getPropertyValue('transform');
    CSMain = CSMain.replace("matrix(", "").split(",");
    var correctionMain = 75 / parseFloat(CSMain[0]);

    var CSSide = window.getComputedStyle(sideContainer);;
    CSSide = CSSide.getPropertyValue('transform');
    CSSide = CSSide.replace("matrix(", "").split(",");
    var correctionSide = 75 / parseFloat(CSSide[0]);

    for (const resizer of resizers) {
        resizer.style.opacity = "";

        if (resizer.classList.contains("main")) {
            resizer.style.width = `${correctionMain}px`;
            resizer.style.height = `${correctionMain}px`;
        }

        else if (resizer.classList.contains("side")) {
            resizer.style.width = `${correctionSide}px`;
            resizer.style.height = `${correctionSide}px`;
        }
    }


}

function getOrigin(element){
    var currentOrigin = window.getComputedStyle(element);;
    currentOrigin = currentOrigin.getPropertyValue('transform-origin');
    currentOrigin = currentOrigin.split(' ');
    currentOriginX =  parseFloat(currentOrigin[0]);
    currentOriginY =  parseFloat(currentOrigin[1]);

    return [currentOriginX, currentOriginY];
}


var currentOrigin, container, currentResizer;
document.addEventListener("mousedown", function(e){

    if (e.target.classList.contains("main")) {
        container = mainContainer;
    }
    else if (e.target.classList.contains("side")) {
        container = sideContainer;
    }
    else {
        return;
    }

    if (e.target.classList.contains("resizer")) {

        currentResizer = e.target;
        var newOrigin, newOriginArr;

        if (e.target.classList.contains("TR")){
            newOrigin = "bottom left";
            newOriginArr = [0, 1080];
        }
        else if (e.target.classList.contains("TL")){
            newOrigin = "bottom right";
            newOriginArr = [1920, 1080];
        }
        else if (e.target.classList.contains("BR")){
            newOrigin = "top left";
            newOriginArr = [0, 0];
        }
        else if (e.target.classList.contains("BL")){
            newOrigin = "top right";
            newOriginArr = [1920, 0];
        }

        var currentOrigin = getOrigin(container);

        if (currentOrigin[0] !== newOriginArr[0] || currentOrigin[1] !== newOriginArr[1]) {
            var rect = container.getBoundingClientRect();
            container.style.transformOrigin = newOrigin;

            ofstX = (newOriginArr[0]/1920) * (1920-rect.width);
            ofstY = (newOriginArr[1]/1080) * (1080-rect.height);

            container.style.top = rect.top - ofstY + "px";
            container.style.left = rect.left - ofstX + "px";

        }

        sx_pos = e.clientX;
        destination = -1 * ((-1) ** (newOriginArr[0]/1920));
        e.target.style.opacity = 1;

        document.addEventListener("mousemove", resizeVideoRatioX);

    }
    else if (e.target.classList.contains("video")) {

        var rect = container.getBoundingClientRect();
        dx = e.clientX - rect.x;
        dy = e.clientY - rect.y;

        var currentOrigin = window.getComputedStyle(container);;
        currentOrigin = currentOrigin.getPropertyValue('transform-origin');
        currentOrigin = currentOrigin.split(' ');
        currentOriginX =  parseFloat(currentOrigin[0]);
        currentOriginY =  parseFloat(currentOrigin[1]);

        ofstX = (currentOriginX/1920) * (1920-rect.width);
        ofstY = (currentOriginY/1080) * (1080-rect.height);

        document.addEventListener("mousemove", moveVideo);
    }



});

document.addEventListener("mouseup", function(event){
    document.removeEventListener("mousemove", resizeVideoRatioX);
    document.removeEventListener("mousemove", moveVideo);
    resetResizers();
});

document.addEventListener("DOMContentLoaded", function() {
    if (!mainPlayer.isPlaying()) {
        mainPlayer.play();
    }
    mainPlayer.unmute();
});


mainContainer.style.left = "10px";
mainContainer.style.top = "90px";

sideContainer.style.left = "682px";
sideContainer.style.top = "468px";




