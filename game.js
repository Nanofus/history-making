let eras = [];
for (let i = 0; i < json.eras.length; i++) {
    eras.push(json.eras[i]);
}

// VARIABLES
let requiredChosenKeywords = 3;
let chosenKeywords = 0;
let initialReadTimer = 40;
let initialChooseTimer = 10;
let timer = 0;
let activeInterval = null;
let lastStepChosenKeywords = ["initial"];
let firstKeywordsChosen = false;
let firstStepChosenKeywords = [];
let lastStage = false;
let enteredLastStage = false;
var titleMusic = new Howl({
    src: ['audio/Title_Screen.mp3', 'audio/Title_Screen.ogg'],
    volume: 1
});
var readingMusic = new Howl({
    src: ['audio/Lukeminen.mp3', 'audio/Lukeminen.ogg'],
    volume: 1
});
var year1Music = new Howl({
    src: ['audio/Vuosi_1.mp3', 'audio/Vuosi_1.ogg'],
    volume: 1
});
var year2Music = new Howl({
    src: ['audio/Vuosi_2.mp3', 'audio/Vuosi_2.ogg'],
    volume: 1
});
var year3Music = new Howl({
    src: ['audio/Vuosi_3.mp3', 'audio/Vuosi_3.ogg'],
    volume: 1
});
var tapSound = new Howl({
    src: ['audio/Valinta.mp3', 'audio/Valinta.ogg'],
    volume: 1
});
var lectureSound = new Howl({
    src: ['audio/Yleisohaly.mp3', 'audio/Yleisohaly.ogg'],
    volume: 1
});
var robotLectureSound = new Howl({
    src: ['audio/Robottihaly.mp3', 'audio/Robottihaly.ogg'],
    volume: 1
});


let uniques = (kw) => kw.filter((v, i) => kw.indexOf(v) === i);

let removeElement = (elementId) => {
    // Removes an element from the document
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}

let enableScrollPrompt = () => {
    document.getElementById("next-page-prompt").style.display = "block";
}

let disableScrollPrompt = () => {
    document.getElementById("next-page-prompt").style.display = "none";
}

let startFullPage = () => {
    new fullpage('#fullpage', {
        //options here
        autoScrolling: true,
        scrollHorizontally: true,
        licenseKey: "OPEN-SOURCE-GPLV3-LICENSE",

        onLeave: (origin, destination, direction) => {
            if (origin != null) {
                advanceGame(origin, destination, direction);
            }
        }
    });
    fullpage_api.setAllowScrolling(false, 'up');
    document.getElementById("next-page-prompt").addEventListener("click", () => {
        fullpage_api.moveSectionDown();
        tapSound.play();
    })
    titleMusic.play();
}

// ADVANCE GAME PROCESS
let advanceGame = (origin, destination, direction) => {
    console.log(origin, destination, direction);
    if (document.getElementById("after-reading")) {
        removeElement("after-reading");
    }
    insertContent(destination);
    rebuild();
}

let rebuild = () => {
    fullpage_api.reBuild();
}

let insertContent = (destination) => {
    document.getElementById("downscrollbutton").style.display = "none";
    document.getElementById("upscrollbutton").style.display = "none";
    let elId = destination.item.id;
    if (Array.from(destination.item.classList).includes("last")) {
        enteredLastStage = true;
    }
    if (elId.includes('item')) {
        let index = parseInt(elId.split("-")[1]);
        if (index == 0) {
            year1Music.play();
        } else if (index == 1) {
            year2Music.play();
        } else if (index == 2) {
            year3Music.play();
        }
    } else if (elId.includes("source")) {
        disableScrollPrompt();
        let index = parseInt(elId.split("-")[1]);
        console.log(lastStepChosenKeywords);
        let base = document.getElementById(`era-${index}-source`);
        let string = `
        <div id="after-reading">
            <br><br><br>
            <h3>Nyt kun tunnet aiheesi perinpohjaisesti, on aika pitää siitä esitelmä.</h3>
            <p>Valitse kolme olennaisinta näkökulmaa. Sinulla on aikaa 10 sekuntia.</p>
        </div>
        <div id="scrollable">`;
        for (let source of eras[index].sources) {
            if (lastStepChosenKeywords.includes(source.keyword)) {
                for (let paragraph of source.text) {
                    string += `<p>${paragraph}</p>`
                }
            }
        }
        string += `</div>`
        base.innerHTML = string;
        let downscroll = document.getElementById(`downscrollbutton`);
        let upscroll = document.getElementById(`upscrollbutton`);
        document.getElementById("after-reading").style.display = "none";
        downscroll.style.display = "block";
        upscroll.style.display = "block";
        downscroll.addEventListener("click", () => {
            document.getElementById("scrollable").scrollTop += 20;
            tapSound.play();
        });
        upscroll.addEventListener("click", () => {
            document.getElementById("scrollable").scrollTop -= 20;
            tapSound.play();
        });
        if (!enteredLastStage) {
            fullpage_api.setAllowScrolling(false);
            startReadTimer(index);
        } else {
            fullpage_api.setAllowScrolling(true, "up");
        }
    } else if (elId.includes("choice")) {
        disableScrollPrompt();
        let index = parseInt(elId.split("-")[1]);
        let base = document.getElementById(`era-${index}-choices`)
        keywords = [];
        console.log(keywords);
        eras[index].sources.forEach(x => {
            if (lastStepChosenKeywords.includes(x.keyword)) {
                x.derivativeKeywords.forEach(y => {
                    keywords.push(y);
                });
            }
        });
        console.log(keywords);
        keywords = uniques(keywords);
        console.log(keywords);
        base.innerHTML = `
            <div id="after-reading">
                <br><br><br>
                <h3>Luentosi on nyt pidetty.</h3>
                <p>Jälkipolvet tulevat tutkimaan kirjoittamaasi historiaa.</p>
            </div>
            <h3>Valitse 3 näkökulmaa</h3>
            <div id="wordcloud"></div>
            `;
        for (let keyword of keywords) {
            base.children[1].innerHTML += `<p class="cloudword">${keyword}</p>`
        }
        lastStepChosenKeywords = [];
        chosenKeywords = 0;
        Array.from(document.getElementsByClassName("cloudword")).forEach(x => {
            x.addEventListener("click", () => {
                if (!lastStepChosenKeywords.includes(x.innerHTML) && chosenKeywords < requiredChosenKeywords) {
                    x.style.color = "#A874C9";
                    chosenKeywords++;
                    lastStepChosenKeywords.push(x.innerHTML);
                    tapSound.play();
                }
            });
        });
        document.getElementById("after-reading").style.display = "none";
        fullpage_api.setAllowScrolling(false);
        startChoiceTimer(index);
    } else if (elId.includes("aliens")) {
        fullpage_api.setAllowScrolling(false, "up");
    } else if (elId.includes("keywordmap")) {
        let base = destination.item;
        base.innerHTML = `<h2>Ensimmäisen pelaajan alkuperäislähteestä poimimat asiat</h2><ul>`
        for (let string of firstStepChosenKeywords) {
            base.innerHTML += `<li>${string}</li>`;
        }
        base.innerHTML += `</ul><h2>Viimeisen pelaajan lähteistään poimimat asiat</h2><ul>`
        for (let string of lastStepChosenKeywords) {
            base.innerHTML += `<li>${string}</li>`;
        }
        base.innerHTML += `</ul>
        <br><br><br><h2>Kiitos pelaamisesta!</h2><p><a href="index.html">Takaisin alkuun</a></p>`
    }
}

let startReadTimer = (index) => {
    timer = initialReadTimer;
    readingMusic.play();
    document.getElementById("read-timer").style.display = "block";
    document.getElementById("read-timer").innerHTML = timer;
    if (enteredLastStage) {
        document.getElementById("scrollable").style.backgroundImage = "url('images/lecture4.png')";
        document.getElementById("scrollable").style.backgroundSize = "cover";
        document.getElementById("scrollable").style.backgroundPositionX = "center";
    }
    activeInterval = setInterval(() => {
        timer--;
        document.getElementById("read-timer").innerHTML = timer;
        if (timer == 0) {
            clearInterval(activeInterval);
            Array.from(document.getElementById(`era-${index}-source`).children).filter(x => {
                if ([...x.classList].includes("slide")) {
                    return true;
                }
                return false;
            }).forEach(x => {
                x.style.display = 'none';
            })
            document.getElementById("after-reading").style.display = "block";
            document.getElementById("downscrollbutton").style.display = "none";
            document.getElementById("upscrollbutton").style.display = "none";
            $("#upscrollbutton").off();
            $("#downscrollbutton").off();
            removeElement("scrollable");
            enableScrollPrompt();
            document.getElementById("read-timer").style.display = "none";
            fullpage_api.setAllowScrolling(true, "down");
        }
    }, 1000);
}

let startChoiceTimer = (index) => {
    timer = initialChooseTimer;
    if (index != 2) {
        lectureSound.play();
    } else {
        robotLectureSound.play();
    }
    document.getElementById("read-timer").style.display = "block";
    document.getElementById("read-timer").innerHTML = timer;
    activeInterval = setInterval(() => {
        timer--;
        document.getElementById("read-timer").innerHTML = timer;
        if (timer == 0) {
            clearInterval(activeInterval);
            document.getElementById("read-timer").style.display = "none";
            document.getElementById("after-reading").style.display = "block";
            document.getElementById("wordcloud").parentElement.children[1].style.display = "none";
            removeElement("wordcloud");
            if (!firstKeywordsChosen) {
                firstStepChosenKeywords = uniques(lastStepChosenKeywords);
                firstKeywordsChosen = true;
            }
            enableScrollPrompt();
            lastStepChosenKeywords = uniques(lastStepChosenKeywords);
            console.log(lastStepChosenKeywords);
            fullpage_api.setAllowScrolling(true, "down");
        }
    }, 1000);
}

// TEMPLATING
let drawTemplates = () => {
    let base = document.getElementById("fullpage");

    // MAIN TITLE PAGE
    base.innerHTML = `
        <div class="section" id="title">
            <h1>HISTORY; MAKING</h1>
            <p>Historiankirjoituspeli 2-${eras.length - 1} pelaajalle</p>
            <p>Ensimmäinen pelaaja huitaiskoon sivua alaspäin.</p>
            <p></p>
            <p><a href="credits.html">Tekijät ja lähteet</a><p>
        </div>
    `;

    // ERAS
    let index = 0;
    for (let era of eras) {
        if (!lastStage) {
            let eraFlavorText = "";
            // ERA INTRO PAGE
            if (era.year == "1910") {
                eraFlavorText = "Olet historiantutkija ja tehtäväsi on perehtyä rokokoohon Suomessa."
            } else if (era.year == "2020") {
                eraFlavorText = "Olet historiantutkija ja tehtäväsi on perehtyä siihen, mitä rokokoosta on aikaisemmin kirjoitettu Suomessa."
            } else if (era.year == "7410") {
                eraFlavorText = "Olet historiantutkija ja tehtäväsi on perehtyä siihen, mitä kadonneesta \"suomalaisesta\" sivilisaatiosta tiedämme."
            }
            base.innerHTML += `
            <div class="section" id="era-${index}-item">
                <h2>VUOSI ${era.year}</h2>
                <img src="" />
                <p>${eraFlavorText}</p>
                <p>Sinulla on 40 sekuntia aikaa tutustua aineistoon.</p>
            </div>
            `

            // ERA SOURCE PAGE
            base.innerHTML += `
            <div class="section" id="era-${index}-source">
            </div>
            `

            // ERA CHOICE PAGE
            base.innerHTML += `
            <span class="timer"></span>
            <div class="section" id="era-${index}-choices" style="background-image: url('images/${era.lectureImage}'); background-size: cover; background-position-x: center;">
            </div>
            `

            // NEXT PLAYER PAGE
            if (typeof eras[index + 1] != "undefined" && eras[index + 1].year != 'final') {
                base.innerHTML += `
            <div class="section" id="era-${index}-end">
                <h3>Anna laite seuraavalle pelaajalle</h3>
            </div>
            `
            } else {
                lastStage = true;
                base.innerHTML += `
            <div class="section last" id="era-${index}-aliens">
                <h3>Viimeinen luento pidetty. Onneksi olkoon! Voitte nyt kerääntyä puhelimen äärelle.</h3>
                <p>Tulitteko te tutkineeksi kulttuuria… vai ehkä luoneeksi sitä?</p>
                <p>Teittekö historiankirjoitusta vaiko historiaa?</p>
            </div>
            <div class="section last" style="background-image: url('images/lecture4.png'); background-size: cover; background-position-x: center;">
                <h3>Antropologinen tutkimuksemme tämän planeetan asukkaista on ollut mitä hedelmällisin.</h3>
                <p>Perehdyttyämme heidän tutkielmaansa omasta historiastaan, olemme tehneet heistä kiintoisia havaintoja.</p>
                <p>Krhm...</p>
            </div>
            `
            }
        } else {
            base.innerHTML += `
            <div class="section" id="era-${index}-source">
            </div>
            <div class="section" id="era-${index}-keywordmap">
            </div>
            `
        }
        index++;
    }
}

drawTemplates();
startFullPage();
