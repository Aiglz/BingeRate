// =================================================
// DOM
// =================================================

const totalRankedSeries =
    document.getElementById(
        "totalRankedSeries"
    );

const averageScore =
    document.getElementById(
        "averageScore"
    );

const masterpiecesCount =
    document.getElementById(
        "masterpiecesCount"
    );

const perfectEpisodes =
    document.getElementById(
        "perfectEpisodes"
    );

const podiumContainer =
    document.getElementById(
        "podiumContainer"
    );

const topSeries =
    document.getElementById(
        "topSeries"
    );

const topSeasons =
    document.getElementById(
        "topSeasons"
    );

const mountRushmore =
    document.getElementById(
        "mountRushmore"
    );

const masterpieces =
    document.getElementById(
        "masterpieces"
    );

const disappointments =
    document.getElementById(
        "disappointments"
    );

// =================================================
// STORAGE
// =================================================

function getLibrary(){

    return JSON.parse(

        localStorage.getItem(
            "bingeRateLibrary"
        )

    ) || [];

}

function getRatings(){

    return JSON.parse(

        localStorage.getItem(
            "bingeRateRatings"
        )

    ) || {};

}

// =================================================
// HELPERS
// =================================================

function average(values){

    if(!values.length)
        return 0;

    return (

        values.reduce(
            (a,b)=>a+b,
            0
        )

        /

        values.length

    );

}

function posterUrl(path){

    if(!path)
        return "";

    if(
        path.startsWith(
            "http"
        )
    ){
        return path;
    }

    return `https://image.tmdb.org/t/p/w500${path}`;

}

function createEmptyState(
    container,
    text
){

    container.innerHTML =

    `
        <div
            class="
            empty-ranking
            "
        >

            <i
                class="
                fa-solid
                fa-trophy
                "
            ></i>

            <h3>

                Aucun résultat

            </h3>

            <p>

                ${text}

            </p>

        </div>
    `;

}

// =================================================
// DATA
// =================================================

let seriesData = [];

let seasonsData = [];

// =================================================
// BUILD DATA
// =================================================

function buildRankings(){

    const library =
        getLibrary();

    const ratings =
        getRatings();

    seriesData = [];

    seasonsData = [];

    library.forEach(

        show=>{

            const notes = [];

            const seasonsMap = {};

            Object.entries(
                ratings
            )

            .forEach(

                ([key, rating])=>{

                    if(
                        !key.startsWith(
                            `${show.id}-`
                        )
                    ){
                        return;
                    }

                    const value =
                        Number(
                            rating
                        );

                    if(
                        isNaN(
                            value
                        )
                    ){
                        return;
                    }

                    notes.push(
                        value
                    );

                    const match =
                        key.match(
                            /S(\d+)E(\d+)/
                        );

                    if(
                        !match
                    ){
                        return;
                    }

                    const season =
                        Number(
                            match[1]
                        );

                    if(
                        !seasonsMap[
                            season
                        ]
                    ){

                        seasonsMap[
                            season
                        ] = [];

                    }

                    seasonsMap[
                        season
                    ].push(
                        value
                    );

                }

            );

            if(
                !notes.length
            ){
                return;
            }

            seriesData.push({

                id:
                    show.id,

                name:
                    show.name,

                poster:

                    show.poster_path

                    ||

                    show.poster

                    ||

                    "",

                average:
                    average(
                        notes
                    ),

                count:
                    notes.length

            });

            Object.entries(
                seasonsMap
            )

            .forEach(

                (
                    [season, values]
                )=>{

                    seasonsData.push({

                        showId:
                            show.id,

                        showName:
                            show.name,

                        poster:

                            show.poster_path

                            ||

                            show.poster

                            ||

                            "",

                        season,

                        average:
                            average(
                                values
                            ),

                        count:
                            values.length

                    });

                }

            );

        }

    );

    sortRankings();

}

// =================================================
// SORT
// =================================================

function sortRankings(){

    seriesData.sort(

        (
            a,
            b
        )=>{

            if(
                b.average !==
                a.average
            ){

                return (
                    b.average
                    -
                    a.average
                );

            }

            return (
                b.count
                -
                a.count
            );

        }

    );

    seasonsData.sort(

        (
            a,
            b
        )=>{

            if(
                b.average !==
                a.average
            ){

                return (
                    b.average
                    -
                    a.average
                );

            }

            return (
                b.count
                -
                a.count
            );

        }

    );

}

// =================================================
// STATS
// =================================================

function getGlobalAverage(){

    const ratings =
        getRatings();

    const values =

        Object.values(
            ratings
        )

        .map(
            Number
        )

        .filter(

            value =>

            !isNaN(
                value
            )

        );

    return average(
        values
    );

}

function getPerfectEpisodes(){

    const ratings =
        getRatings();

    return Object.values(
        ratings
    )

    .filter(

        value =>

        Number(
            value
        ) === 10

    )

    .length;

}

function getMasterpieces(){

    return seriesData.filter(

        show =>

        show.average >= 9

        &&

        show.count >= 10

    );

}

// =================================================
// OVERVIEW
// =================================================

function renderOverview(){

    totalRankedSeries.textContent =

        seriesData.length;

    averageScore.textContent =

        getGlobalAverage()
        .toFixed(1);

    masterpiecesCount.textContent =

        getMasterpieces()
        .length;

    perfectEpisodes.textContent =

        getPerfectEpisodes();

}

// =================================================
// PODIUM
// =================================================

function renderPodium(){

    if(
        seriesData.length < 3
    ){

        podiumContainer.innerHTML = "";

        return;

    }

    const first =
        seriesData[0];

    const second =
        seriesData[1];

    const third =
        seriesData[2];

    podiumContainer.innerHTML =

    `
        <div class="podium">

            <div
                class="
                podium-card
                podium-second
                "
            >

                <img

                    class="
                    podium-poster
                    "

                    src="
                    ${posterUrl(
                        second.poster
                    )}
                    "

                    alt="
                    ${second.name}
                    "
                >

                <div
                    class="
                    podium-content
                    "
                >

                    <div
                        class="
                        podium-rank
                        "
                    >

                        2

                    </div>

                    <div
                        class="
                        podium-title
                        "
                    >

                        ${second.name}

                    </div>

                    <div
                        class="
                        podium-score
                        "
                    >

                        ⭐

                        ${second.average
                        .toFixed(1)}

                    </div>

                </div>

            </div>

            <div
                class="
                podium-card
                podium-first
                "
            >

                <img

                    class="
                    podium-poster
                    "

                    src="
                    ${posterUrl(
                        first.poster
                    )}
                    "

                    alt="
                    ${first.name}
                    "
                >

                <div
                    class="
                    podium-content
                    "
                >

                    <div
                        class="
                        podium-rank
                        "
                    >

                        1

                    </div>

                    <div
                        class="
                        podium-title
                        "
                    >

                        ${first.name}

                    </div>

                    <div
                        class="
                        podium-score
                        "
                    >

                        ⭐

                        ${first.average
                        .toFixed(1)}

                    </div>

                </div>

            </div>

            <div
                class="
                podium-card
                podium-third
                "
            >

                <img

                    class="
                    podium-poster
                    "

                    src="
                    ${posterUrl(
                        third.poster
                    )}
                    "

                    alt="
                    ${third.name}
                    "
                >

                <div
                    class="
                    podium-content
                    "
                >

                    <div
                        class="
                        podium-rank
                        "
                    >

                        3

                    </div>

                    <div
                        class="
                        podium-title
                        "
                    >

                        ${third.name}

                    </div>

                    <div
                        class="
                        podium-score
                        "
                    >

                        ⭐

                        ${third.average
                        .toFixed(1)}

                    </div>

                </div>

            </div>

        </div>
    `;

}

// =================================================
// MOUNT RUSHMORE
// =================================================

function renderMountRushmore(){

    if(
        !seriesData.length
    ){

        createEmptyState(

            mountRushmore,

            "Aucune série classée."

        );

        return;

    }

    mountRushmore.innerHTML = "";

    seriesData

    .slice(
        0,
        4
    )

    .forEach(

        (
            show,
            index
        )=>{

            const card =
                document.createElement(
                    "div"
                );

            card.className =

                `
                rushmore-card
                rushmore-${index + 1}
                `;

            card.innerHTML =

            `
                <img

                    class="
                    rushmore-poster
                    "

                    src="
                    ${posterUrl(
                        show.poster
                    )}
                    "

                    alt="
                    ${show.name}
                    "
                >

                <div
                    class="
                    rushmore-rank
                    "
                >

                    ${index + 1}

                </div>

                <div
                    class="
                    rushmore-content
                    "
                >

                    <h3>

                        ${show.name}

                    </h3>

                    <p>

                        ${show.count}

                        épisodes notés

                    </p>

                    <div
                        class="
                        rushmore-score
                        "
                    >

                        ⭐

                        ${show.average
                        .toFixed(1)}

                    </div>

                </div>
            `;

            mountRushmore.appendChild(
                card
            );

        }

    );

}

// =================================================
// TOP SERIES
// =================================================

function renderTopSeries(){

    if(
        !seriesData.length
    ){

        createEmptyState(

            topSeries,

            "Aucune série notée."

        );

        return;

    }

    topSeries.innerHTML = "";

    seriesData

    .slice(
        0,
        20
    )

    .forEach(

        (
            show,
            index
        )=>{

            const card =
                document.createElement(
                    "a"
                );

            card.href =

                `serie.html?id=${show.id}`;

            card.className =

                `
                rank-card
                rank-${index + 1}
                `;

            card.innerHTML =

            `
                <div
                    class="
                    rank-position
                    "
                >

                    ${index + 1}

                </div>

                <img

                    class="
                    rank-poster
                    "

                    src="
                    ${posterUrl(
                        show.poster
                    )}
                    "

                    alt="
                    ${show.name}
                    "
                >

                <div
                    class="
                    rank-content
                    "
                >

                    <h3>

                        ${show.name}

                    </h3>

                    <p>

                        ${show.count}
                        épisodes notés

                    </p>

                </div>

                <div
                    class="
                    rank-score
                    "
                >

                    <i
                        class="
                        fa-solid
                        fa-star
                        "
                    ></i>

                    ${show.average
                    .toFixed(1)}

                </div>
            `;

            topSeries.appendChild(
                card
            );

        }

    );

}

// =================================================
// TOP SEASONS
// =================================================

function renderTopSeasons(){

    if(
        !seasonsData.length
    ){

        createEmptyState(

            topSeasons,

            "Aucune saison notée."

        );

        return;

    }

    topSeasons.innerHTML = "";

    seasonsData

    .slice(
        0,
        20
    )

    .forEach(

        (
            season,
            index
        )=>{

            const card =
                document.createElement(
                    "a"
                );

            card.href =

                `serie.html?id=${season.showId}`;

            card.className =

                `
                rank-card
                rank-${index + 1}
                `;

            card.innerHTML =

            `
                <div
                    class="
                    rank-position
                    "
                >

                    ${index + 1}

                </div>

                <img

                    class="
                    rank-poster
                    "

                    src="
                    ${posterUrl(
                        season.poster
                    )}
                    "

                    alt="
                    ${season.showName}
                    "
                >

                <div
                    class="
                    rank-content
                    "
                >

                    <h3>

                        ${season.showName}

                    </h3>

                    <p>

                        Saison

                        ${season.season}

                        •

                        ${season.count}

                        épisodes notés

                    </p>

                </div>

                <div
                    class="
                    rank-score
                    "
                >

                    <i
                        class="
                        fa-solid
                        fa-medal
                        "
                    ></i>

                    ${season.average
                    .toFixed(1)}

                </div>
            `;

            topSeasons.appendChild(
                card
            );

        }

    );

}

// =================================================
// MASTERPIECES
// =================================================

function renderMasterpieces(){

    masterpieces.innerHTML = "";

    const masterpiecesList =
        getMasterpieces();

    if(
        !masterpiecesList.length
    ){

        createEmptyState(

            masterpieces,

            "Aucun chef-d'œuvre détecté."

        );

        return;

    }

    masterpiecesList.forEach(

        show=>{

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "masterpiece-card";

            card.innerHTML =

            `
                <div
                    class="
                    masterpiece-badge
                    "
                >

                    <i
                        class="
                        fa-solid
                        fa-crown
                        "
                    ></i>

                    Chef-d'œuvre

                </div>

                <h3>

                    ${show.name}

                </h3>

                <p>

                    Moyenne de

                    <strong>

                        ${show.average
                        .toFixed(1)}

                    </strong>

                    sur

                    ${show.count}

                    épisodes notés.

                </p>
            `;

            masterpieces.appendChild(
                card
            );

        }

    );

}

// =================================================
// DISAPPOINTMENTS
// =================================================

function renderDisappointments(){

    disappointments.innerHTML = "";

    const worstSeries =

        [...seriesData]

        .sort(

            (
                a,
                b
            )=>

            a.average
            -
            b.average

        )

        .slice(
            0,
            10
        );

    if(
        !worstSeries.length
    ){

        createEmptyState(

            disappointments,

            "Aucune donnée."

        );

        return;

    }

    worstSeries.forEach(

        show=>{

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "disappointment-card";

            card.innerHTML =

            `
                <h3>

                    ${show.name}

                </h3>

                <p>

                    Note moyenne :

                    <strong>

                        ${show.average
                        .toFixed(1)}

                    </strong>

                </p>

                <p>

                    ${show.count}

                    épisodes notés

                </p>
            `;

            disappointments.appendChild(
                card
            );

        }

    );

}

// =================================================
// COUNTERS
// =================================================

function animateCounter(
    element,
    target,
    decimals = 0
){

    let current = 0;

    const duration = 1200;

    const startTime =
        performance.now();

    function update(
        now
    ){

        const progress =

            Math.min(

                (
                    now
                    -
                    startTime
                )
                /
                duration,

                1

            );

        const value =

            current +

            (
                target
                -
                current
            )

            * progress;

        element.textContent =

            decimals

            ?

            value.toFixed(
                decimals
            )

            :

            Math.round(
                value
            );

        if(
            progress < 1
        ){

            requestAnimationFrame(
                update
            );

        }

    }

    requestAnimationFrame(
        update
    );

}

// =================================================
// OVERVIEW ANIMATION
// =================================================

function animateOverview(){

    animateCounter(

        totalRankedSeries,

        Number(
            totalRankedSeries
            .textContent
        )

    );

    animateCounter(

        masterpiecesCount,

        Number(
            masterpiecesCount
            .textContent
        )

    );

    animateCounter(

        perfectEpisodes,

        Number(
            perfectEpisodes
            .textContent
        )

    );

    animateCounter(

        averageScore,

        Number(
            averageScore
            .textContent
        ),

        1

    );

}

// =================================================
// REVEAL EFFECT
// =================================================

function revealElements(){

    const observer =

        new IntersectionObserver(

            entries=>{

                entries.forEach(

                    entry=>{

                        if(
                            entry.isIntersecting
                        ){

                            entry.target.style.opacity =
                                "1";

                            entry.target.style.transform =
                                "translateY(0)";

                        }

                    }

                );

            },

            {
                threshold:.1
            }

        );

    document

    .querySelectorAll(

        ".rank-card,.masterpiece-card,.disappointment-card,.rushmore-card"

    )

    .forEach(

        element=>{

            element.style.opacity =
                "0";

            element.style.transform =
                "translateY(30px)";

            element.style.transition =
                ".5s ease";

            observer.observe(
                element
            );

        }

    );

}

// =================================================
// INIT
// =================================================

function initRankings(){

    buildRankings();

    renderOverview();

    renderPodium();

    renderMountRushmore();

    renderTopSeries();

    renderTopSeasons();

    renderMasterpieces();

    renderDisappointments();

    setTimeout(

        ()=>{

            animateOverview();

            revealElements();

        },

        150

    );

}

// =================================================
// START
// =================================================

initRankings();