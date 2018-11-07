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

let uniques = (kw) => kw.filter((v, i) => kw.indexOf(v) === i);

let removeElement = (elementId) => {
    // Removes an element from the document
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}

let startFullPage = () => {
    new fullpage('#fullpage', {
        //options here
        autoScrolling: true,
        scrollHorizontally: true,
        licenseKey: "OPEN-SOURCE-GPLV3-LICENSE",

        afterLoad: (origin, destination, direction) => {
            advanceGame(origin, destination, direction);
        }
    });
    fullpage_api.setAllowScrolling(false, 'up');
}

let refreshFullPage = () => {
    //remembering the active section / slide
    var activeSectionIndex = $('.fp-section.active').index();
    var activeSlideIndex = $('.fp-section.active').find('.slide.active').index();

    fullpage_api.destroy('all');

    //setting the active section as before
    $('.section').eq(activeSectionIndex).addClass('active');

    //were we in a slide? Adding the active state again
    if (activeSlideIndex > -1) {
        $('.section.active').find('.slide').eq(activeSlideIndex).addClass('active');
    }

    startFullPage();
}

// ADVANCE GAME PROCESS
let advanceGame = (origin, destination, direction) => {
    console.log(origin, destination, direction);
    insertContent(destination);
    fullpage_api.reBuild();
}

let insertContent = (destination) => {
    let elId = destination.item.id;
    if (elId.includes("source")) {
        let index = parseInt(elId.split("-")[1]);
        console.log(lastStepChosenKeywords);
        let base = document.getElementById(`era-${index}-source`)
        for (let source of eras[index].sources) {
            if (lastStepChosenKeywords.includes(source.keyword)) {
                for (let paragraph of source.text) {
                    base.innerHTML += `    
                        <div class="slide">
                            <p>${paragraph}</p>
                        </div>
                        `
                }
            }
        }
        fullpage_api.setAllowScrolling(false, 'down');
        startReadTimer(index);
    } else if (elId.includes("choice")) {
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
            <h3>Valitse 3 avainsanaa</h3>
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
                    x.style.color = "red";
                    chosenKeywords++;
                    lastStepChosenKeywords.push(x.innerHTML);
                }
            });
        });
        fullpage_api.setAllowScrolling(false, 'down');
        startChoiceTimer(index);
    }
}

let startReadTimer = (index) => {
    timer = initialReadTimer;
    document.getElementById("read-timer").style.display = "block";
    document.getElementById("read-timer").innerHTML = timer;
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
            document.getElementById("read-timer").style.display = "none";
            fullpage_api.setAllowScrolling(true, 'down');
        }
    }, 1000);
}

let startChoiceTimer = (index) => {
    timer = initialChooseTimer;
    document.getElementById("read-timer").style.display = "block";
    document.getElementById("read-timer").innerHTML = timer;
    activeInterval = setInterval(() => {
        timer--;
        document.getElementById("read-timer").innerHTML = timer;
        if (timer == 0) {
            clearInterval(activeInterval);
            document.getElementById("read-timer").style.display = "none";
            document.getElementById("wordcloud").parentElement.children[0].style.display = "none";
            removeElement("wordcloud");
            lastStepChosenKeywords = uniques(lastStepChosenKeywords);
            console.log(lastStepChosenKeywords);
            fullpage_api.setAllowScrolling(true, 'down');
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
        </div>
    `;

    // ERAS
    let index = 0;
    for (let era of eras) {
        if (eras[index + 1] != null) {
            // ERA INTRO PAGE
            base.innerHTML += `
            <div class="section" id="era-${index}-item">
                <h2>VUOSI ${era.year}</h2>
                <img src="" />
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
            <div class="section" id="era-${index}-choices" style="background-image: url('images/${era.lectureImage}'); background-size: cover;">
            </div>
            `

            // NEXT PLAYER PAGE
            if (eras[index + 1].year != 'final') {
                base.innerHTML += `
            <div class="section" id="era-${index}-end">
                <h3>Anna laite seuraavalle pelaajalle</h3>
            </div>
            `
            } else {
                base.innerHTML += `
            <div class="section" id="era-${index}-end">
                <h3>Kaukaisessa tulevaisuudessa avaruusolennot löysivät seuraavanlaisen tekstin:</h3>
            </div>
            `
            }
            index++;
        }
    }
}

drawTemplates();
startFullPage();
