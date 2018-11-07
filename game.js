let eras = [];
const request = async () => {
    const response = await fetch('sources.json');
    const json = await response.json();
    console.log(json);
    return json;
}
request().then((json) => {
    for (let i = 0; i < json.eras.length; i++) {
        eras.push(json.eras[i]);
    }
    drawTemplates();
    startFullPage();
});
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

// VARIABLES
let chosenKeywords = 3;
let lastStepChosenKeywords = ["initial"];

// ADVANCE GAME PROCESS
let advanceGame = (origin, destination, direction) => {
    console.log(origin, destination, direction);
    console.log("advancing");
    console.log("refreshing DOM")
    insertContent(destination);
    console.log("DOM refreshed");
    console.log("rebuilding");
    fullpage_api.reBuild();
    console.log("rebuilt");
}

let insertContent = (destination) => {
    let elId = destination.item.id;
    if (elId.includes("source")) {
        console.log(lastStepChosenKeywords);
        index = 0;
        for (let era of eras) {
            let base = document.getElementById(`era-${index}-source`)
            for (let source of era.sources) {
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
            index++;
        }
    }
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
                <span class="timer"></span>
                <p>INITIAL CONTENT</p>
            </div>
            `

            // ERA CHOICE PAGE
            base.innerHTML += `
            <span class="timer"></span>
            <div class="section" id="era-${index}-choices" style="background-image: url('images/${era.lectureImage}'); background-size: cover;">
                <h2>Valitse ${chosenKeywords} avainsanaa</h2>
                <div class="wordcloud"></div>
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

    console.log("GENERATED");
    if (typeof fullpage_api != "undefined") {
        fullpage_api.reBuild();
    }
}
