// =================================================
// DOM
// =================================================

const globalAverage =
    document.getElementById(
        "globalAverage"
    );

const seriesCount =
    document.getElementById(
        "seriesCount"
    );

const episodesCount =
    document.getElementById(
        "episodesCount"
    );

const masterpiecesCount =
    document.getElementById(
        "masterpiecesCount"
    );

const distributionChart =
    document.getElementById(
        "distributionChart"
    );

const globalProgress =
    document.getElementById(
        "globalProgress"
    );

const genreRanking =
    document.getElementById(
        "genreRanking"
    );

const statusBreakdown =
    document.getElementById(
        "statusBreakdown"
    );

const toast =
    document.getElementById(
        "toast"
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

    if(
        !values.length
    )
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

function round(value){

    return Math.round(
        value * 10
    ) / 10;

}

function showToast(message){

    if(!toast)
        return;

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(

        ()=>{

            toast.classList.remove(
                "show"
            );

        },

        2500

    );

}

function getProgress(
    ratedEpisodes,
    totalEpisodes
){

    if(
        !totalEpisodes
    )
        return 0;

    return Math.round(

        (
            ratedEpisodes
            /
            totalEpisodes
        ) * 100

    );

}

// =================================================
// GLOBAL DATA
// =================================================

const library =
    getLibrary();

const ratings =
    getRatings();

const allNotes =
    Object.values(
        ratings
    );

const totalSeries =
    library.length;

const totalEpisodesRated =
    allNotes.length;

const globalAverageScore =

    allNotes.length

    ?

    average(
        allNotes
    )

    :

    0;

// =================================================
// SERIES DATASET
// =================================================

const seriesDataset =

    library.map(show=>{

        const notes =

            Object.entries(
                ratings
            )

            .filter(

                ([key]) =>

                key.startsWith(
                    `${show.id}-`
                )

            )

            .map(
                ([,note]) =>
                note
            );

        const avg =

            notes.length

            ?

            average(
                notes
            )

            :

            0;

        const progress =

            getProgress(

                notes.length,

                show.episodes || 0

            );

        return {

            ...show,

            notes,

            avg,

            progress,

            ratedEpisodes:
                notes.length

        };

    });

// =================================================
// MASTERPIECES
// =================================================

const masterpieces =

    seriesDataset.filter(

        show =>

            show.notes.length >= 10

            &&

            show.avg >= 9

    );

// =================================================
// NOTE COLORS
// =================================================

function distributionColor(
    note
){

    if(note <= 4)
        return "#8b5cf6";

    if(note <= 5.9)
        return "#ff9f43";

    if(note <= 6.9)
        return "#ff7b39";

    if(note <= 7.9)
        return "#f5c542";

    if(note <= 8.9)
        return "#27c46a";

    if(note <= 9.6)
        return "#0ea55a";

    return "#3d8bff";

}

// =================================================
// HERO STATS
// =================================================

function loadHeroStats(){

    seriesCount.textContent =
        totalSeries;

    episodesCount.textContent =
        totalEpisodesRated;

    globalAverage.textContent =

        globalAverageScore

        ?

        round(
            globalAverageScore
        ).toFixed(1)

        :

        "—";

    masterpiecesCount.textContent =
        masterpieces.length;

}

// =================================================
// GLOBAL COMPLETION
// =================================================

function getGlobalCompletion(){

    const totalRated =

        seriesDataset.reduce(

            (sum,show)=>

            sum +

            show.ratedEpisodes,

            0

        );

    const totalEpisodes =

        seriesDataset.reduce(

            (sum,show)=>

            sum +

            (
                show.episodes || 0
            ),

            0

        );

    return {

        rated:
            totalRated,

        total:
            totalEpisodes,

        progress:

            getProgress(
                totalRated,
                totalEpisodes
            )

    };

}

// =================================================
// GLOBAL PROGRESS
// =================================================

function renderGlobalProgress(){

    if(!globalProgress)
        return;

    const data =
        getGlobalCompletion();

    const circumference =
        565;

    const offset =

        circumference -

        (
            data.progress
            / 100
        ) * circumference;

    globalProgress.innerHTML =

    `
        <div
            class="
            progress-circle
            "
        >

            <svg
                viewBox="0 0 200 200"
            >

                <circle
                    class="bg"
                    cx="100"
                    cy="100"
                    r="90"
                ></circle>

                <circle
                    class="progress"
                    cx="100"
                    cy="100"
                    r="90"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${offset}"
                ></circle>

            </svg>

            <div
                class="
                progress-circle-value
                "
            >

                <strong>

                    ${data.progress}%

                </strong>

                <span>

                    ${data.rated}

                    /

                    ${data.total}

                    épisodes

                </span>

            </div>

        </div>
    `;

}

// =================================================
// DISTRIBUTION DES NOTES
// =================================================

function renderDistribution(){

    if(!distributionChart)
        return;

    const ranges = [

        {
            label:"0 - 4",
            min:0,
            max:4
        },

        {
            label:"4.1 - 5.9",
            min:4.1,
            max:5.9
        },

        {
            label:"6 - 6.9",
            min:6,
            max:6.9
        },

        {
            label:"7 - 7.9",
            min:7,
            max:7.9
        },

        {
            label:"8 - 8.9",
            min:8,
            max:8.9
        },

        {
            label:"9 - 9.6",
            min:9,
            max:9.6
        },

        {
            label:"9.7 - 10",
            min:9.7,
            max:10
        }

    ];

    distributionChart.innerHTML =
        "";

    const maxCount =

        Math.max(

            1,

            ...ranges.map(

                range =>

                allNotes.filter(

                    note =>

                        note >=
                        range.min

                        &&

                        note <=
                        range.max

                ).length

            )

        );

    ranges.forEach(

        range => {

            const count =

                allNotes.filter(

                    note =>

                        note >=
                        range.min

                        &&

                        note <=
                        range.max

                ).length;

            const width =

                (
                    count
                    /
                    maxCount
                ) * 100;

            const color =

                distributionColor(
                    range.max
                );

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "distribution-row";

            row.innerHTML =

            `
                <div
                    class="
                    distribution-label
                    "
                >

                    ${range.label}

                </div>

                <div
                    class="
                    distribution-track
                    "
                >

                    <div
                        class="
                        distribution-fill
                        "
                        style="
                        width:${width}%;
                        background:${color};
                        "
                    ></div>

                </div>

                <div
                    class="
                    distribution-value
                    "
                >

                    ${count}

                </div>
            `;

            distributionChart.appendChild(
                row
            );

        }

    );

}

// =================================================
// STATUS BREAKDOWN
// =================================================

function renderStatusBreakdown(){

    if(!statusBreakdown)
        return;

    const completed =

        seriesDataset.filter(

            show =>

            show.progress >= 100

        ).length;

    const inProgress =

        seriesDataset.filter(

            show =>

            show.progress > 0

            &&

            show.progress < 100

        ).length;

    const notStarted =

        seriesDataset.filter(

            show =>

            show.progress === 0

        ).length;

    statusBreakdown.innerHTML =

    `
        <div
            class="
            status-item
            "
        >

            <div
                class="
                status-label
                "
            >

                <span
                    class="
                    status-dot
                    "
                    style="
                    background:#27c46a;
                    "
                ></span>

                Terminées

            </div>

            <div
                class="
                status-value
                "
            >

                ${completed}

            </div>

        </div>

        <div
            class="
            status-item
            "
        >

            <div
                class="
                status-label
                "
            >

                <span
                    class="
                    status-dot
                    "
                    style="
                    background:#f5c542;
                    "
                ></span>

                En cours

            </div>

            <div
                class="
                status-value
                "
            >

                ${inProgress}

            </div>

        </div>

        <div
            class="
            status-item
            "
        >

            <div
                class="
                status-label
                "
            >

                <span
                    class="
                    status-dot
                    "
                    style="
                    background:#8b7fff;
                    "
                ></span>

                À commencer

            </div>

            <div
                class="
                status-value
                "
            >

                ${notStarted}

            </div>

        </div>
    `;

}

// =================================================
// FIRST DASHBOARD RENDER
// =================================================

function renderOverview(){

    loadHeroStats();

    renderGlobalProgress();

    renderDistribution();

    renderStatusBreakdown();

}

// =================================================
// EVOLUTION CHART
// =================================================

let evolutionChartInstance =
    null;

// =================================================
// RATING TIMELINE
// =================================================

function buildTimeline(){

    const timeline = [];

    const ratingsEntries =

        Object.entries(
            ratings
        );

    ratingsEntries.forEach(

        ([key,note],index)=>{

            timeline.push({

                index:
                    index + 1,

                note

            });

        }

    );

    return timeline;

}

// =================================================
// MOVING AVERAGE
// =================================================

function movingAverage(
    values,
    period = 10
){

    return values.map(

        (_,index)=>{

            const start =

                Math.max(
                    0,
                    index - period + 1
                );

            const slice =

                values.slice(
                    start,
                    index + 1
                );

            return round(
                average(slice)
            );

        }

    );

}

// =================================================
// EVOLUTION CHART
// =================================================

function renderEvolutionChart(){

    const canvas =
        document.getElementById(
            "evolutionChart"
        );

    if(!canvas)
        return;

    if(
        evolutionChartInstance
    ){

        evolutionChartInstance.destroy();

    }

    const timeline =
        buildTimeline();

    const labels =

        timeline.map(
            item =>
            item.index
        );

    const scores =

        timeline.map(
            item =>
            item.note
        );

    const trend =

        movingAverage(
            scores,
            15
        );

    const ctx =
        canvas.getContext(
            "2d"
        );

    const gradient =

        ctx.createLinearGradient(
            0,
            0,
            0,
            350
        );

    gradient.addColorStop(

        0,

        "rgba(139,127,255,.35)"

    );

    gradient.addColorStop(

        1,

        "rgba(139,127,255,0)"

    );

    evolutionChartInstance =

        new Chart(

            ctx,

            {

                type:"line",

                data:{

                    labels,

                    datasets:[

                        {

                            label:
                                "Notes",

                            data:
                                scores,

                            borderColor:
                                "#8b7fff",

                            backgroundColor:
                                gradient,

                            borderWidth:2,

                            fill:true,

                            tension:.35,

                            pointRadius:0,

                            pointHoverRadius:5,

                            pointHoverBorderWidth:2,

                            pointHoverBackgroundColor:
                                "#8b7fff"

                        },

                        {

                            label:
                                "Tendance",

                            data:
                                trend,

                            borderColor:
                                "#3d8bff",

                            borderWidth:3,

                            tension:.4,

                            pointRadius:0,

                            fill:false

                        }

                    ]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false,

                    interaction:{

                        intersect:false,

                        mode:"index"

                    },

                    plugins:{

                        legend:{

                            labels:{

                                color:"#ffffff",

                                usePointStyle:true,

                                padding:20

                            }

                        },

                        tooltip:{

                            backgroundColor:
                                "#0d1328",

                            borderColor:
                                "rgba(139,127,255,.25)",

                            borderWidth:1,

                            titleColor:
                                "#fff",

                            bodyColor:
                                "#fff",

                            displayColors:true

                        }

                    },

                    scales:{

                        x:{

                            grid:{

                                display:false

                            },

                            ticks:{

                                color:
                                    "#8f9bb8",

                                maxTicksLimit:10

                            }

                        },

                        y:{

                            min:0,

                            max:10,

                            grid:{

                                color:

                                    "rgba(255,255,255,.05)"

                            },

                            ticks:{

                                color:
                                    "#8f9bb8",

                                stepSize:1

                            }

                        }

                    }

                }

            }

        );

}

// =================================================
// CHART STATS
// =================================================

function getEvolutionStats(){

    if(
        allNotes.length < 2
    ){

        return {

            improvement:0,

            start:
                0,

            end:
                0

        };

    }

    const firstPart =

        allNotes.slice(

            0,

            Math.max(
                1,
                Math.floor(
                    allNotes.length / 4
                )
            )

        );

    const lastPart =

        allNotes.slice(

            -Math.max(
                1,
                Math.floor(
                    allNotes.length / 4
                )
            )

        );

    const start =
        average(
            firstPart
        );

    const end =
        average(
            lastPart
        );

    return {

        start:
            round(start),

        end:
            round(end),

        improvement:
            round(
                end - start
            )

    };

}

// =================================================
// DOM
// =================================================

const topRatedSeries =
    document.getElementById(
        "topRatedSeries"
    );

const mostWatchedSeries =
    document.getElementById(
        "mostWatchedSeries"
    );

const perfectScores =
    document.getElementById(
        "perfectScores"
    );

// =================================================
// HELPERS
// =================================================

function createRankingItem(
    position,
    poster,
    title,
    subtitle,
    value,
    valueClass = "score"
){

    const topClass =

        position === 1

        ? "top-1"

        :

        position === 2

        ? "top-2"

        :

        position === 3

        ? "top-3"

        :

        "";

    return `

        <div
            class="
            rank-item
            "
        >

            <div
                class="
                rank-position
                ${topClass}
                "
            >

                ${position}

            </div>

            <img
                class="
                rank-poster
                "
                src="${poster}"
                alt="${title}"
            >

            <div
                class="
                rank-content
                "
            >

                <div
                    class="
                    rank-title
                    "
                >

                    ${title}

                </div>

                <div
                    class="
                    rank-subtitle
                    "
                >

                    ${subtitle}

                </div>

            </div>

            <div
                class="
                rank-value
                ${valueClass}
                "
            >

                ${value}

            </div>

        </div>

    `;

}

// =================================================
// TOP RATED SERIES
// =================================================

function renderTopRatedSeries(){

    if(
        !topRatedSeries
    )
        return;

    const ranked =

        [...seriesDataset]

        .filter(

            show =>

                show.notes.length >= 5

        )

        .sort(

            (a,b)=>

                b.avg -

                a.avg

        )

        .slice(0,5);

    if(
        !ranked.length
    ){

        topRatedSeries.innerHTML =

        `
            <div
                class="
                ranking-empty
                "
            >

                Aucune donnée

            </div>
        `;

        return;

    }

    topRatedSeries.innerHTML =

        ranked

        .map(

            (
                show,
                index
            ) =>

            createRankingItem(

                index + 1,

                show.poster,

                show.name,

                `${show.notes.length} notes`,

                show.avg.toFixed(1),

                "score"

            )

        )

        .join("");

}

// =================================================
// MOST WATCHED
// =================================================

function renderMostWatchedSeries(){

    if(
        !mostWatchedSeries
    )
        return;

    const ranked =

        [...seriesDataset]

        .sort(

            (a,b)=>

                b.ratedEpisodes -

                a.ratedEpisodes

        )

        .slice(0,5);

    if(
        !ranked.length
    ){

        mostWatchedSeries.innerHTML =

        `
            <div
                class="
                ranking-empty
                "
            >

                Aucune donnée

            </div>
        `;

        return;

    }

    mostWatchedSeries.innerHTML =

        ranked

        .map(

            (
                show,
                index
            ) =>

            createRankingItem(

                index + 1,

                show.poster,

                show.name,

                `${show.progress}% terminé`,

                show.ratedEpisodes,

                "progress"

            )

        )

        .join("");

}

// =================================================
// PERFECT SCORES
// =================================================

function renderPerfectScores(){

    if(
        !perfectScores
    )
        return;

    const ranked =

        [...seriesDataset]

        .map(

            show => {

                const perfect =

                    show.notes.filter(

                        note =>
                        note === 10

                    ).length;

                return {

                    ...show,

                    perfect

                };

            }

        )

        .filter(

            show =>

                show.perfect > 0

        )

        .sort(

            (a,b)=>

                b.perfect -

                a.perfect

        )

        .slice(0,5);

    if(
        !ranked.length
    ){

        perfectScores.innerHTML =

        `
            <div
                class="
                ranking-empty
                "
            >

                Aucun 10/10

            </div>
        `;

        return;

    }

    perfectScores.innerHTML =

        ranked

        .map(

            (
                show,
                index
            ) =>

            createRankingItem(

                index + 1,

                show.poster,

                show.name,

                `${show.avg.toFixed(1)} de moyenne`,

                `${show.perfect}×10`,

                "perfect"

            )

        )

        .join("");

}

// =================================================
// RENDER TOPS
// =================================================

function renderRankings(){

    renderTopRatedSeries();

    renderMostWatchedSeries();

    renderPerfectScores();

}

// =================================================
// DOM
// =================================================

const decadeBreakdown =
    document.getElementById(
        "decadeBreakdown"
    );

const averageBreakdown =
    document.getElementById(
        "averageBreakdown"
    );

// =================================================
// GENRES FAVORIS
// =================================================

async function renderGenres(){

    if(!genreRanking)
        return;

    genreRanking.innerHTML =
        `
            <div class="ranking-empty">
                Chargement...
            </div>
        `;

    const genresMap = {};

    for(const show of library){

        try{

            const response =
                await fetch(

                    `https://api.themoviedb.org/3/tv/${show.id}?api_key=${TMDB_API_KEY}&language=fr-FR`

                );

            const data =
                await response.json();

            (data.genres || [])

            .forEach(

                genre => {

                    genresMap[
                        genre.name
                    ] =

                        (
                            genresMap[
                                genre.name
                            ]

                            ||

                            0
                        )

                        + 1;

                }

            );

        }

        catch(error){

            console.error(
                error
            );

        }

    }

    const ranked =

        Object.entries(
            genresMap
        )

        .sort(
            (a,b)=>
            b[1]-a[1]
        )

        .slice(0,8);

    genreRanking.innerHTML =

        ranked

        .map(

            ([genre,count]) =>

            `
                <div
                    class="
                    genre-item
                    "
                >

                    <span
                        class="
                        genre-name
                        "
                    >

                        ${genre}

                    </span>

                    <span
                        class="
                        genre-count
                        "
                    >

                        ${count}

                    </span>

                </div>
            `

        )

        .join("");

}

// =================================================
// DECADES
// =================================================

function renderDecades(){

    if(!decadeBreakdown)
        return;

    const decades = {

        "1970s":0,
        "1980s":0,
        "1990s":0,
        "2000s":0,
        "2010s":0,
        "2020s":0

    };

    library.forEach(

        show => {

            const year =

                parseInt(
                    show.year
                );

            if(!year)
                return;

            if(year >= 1970 && year <= 1979)
                decades["1970s"]++;

            else if(year >= 1980 && year <= 1989)
                decades["1980s"]++;

            else if(year >= 1990 && year <= 1999)
                decades["1990s"]++;

            else if(year >= 2000 && year <= 2009)
                decades["2000s"]++;

            else if(year >= 2010 && year <= 2019)
                decades["2010s"]++;

            else if(year >= 2020)
                decades["2020s"]++;

        }

    );

    const maxValue =

        Math.max(

            1,

            ...Object.values(
                decades
            )

        );

    decadeBreakdown.innerHTML =

        Object.entries(
            decades
        )

        .map(

            ([label,count]) =>

            `
                <div
                    class="
                    analytics-item
                    decade-${label.toLowerCase()}
                    "
                >

                    <div
                        class="
                        analytics-label
                        "
                    >

                        ${label}

                    </div>

                    <div
                        class="
                        analytics-track
                        "
                    >

                        <div
                            class="
                            analytics-fill
                            "
                            style="
                            width:${
                                (
                                    count
                                    /
                                    maxValue
                                ) * 100
                            }%;
                            "
                        ></div>

                    </div>

                    <div
                        class="
                        analytics-value
                        "
                    >

                        ${count}

                    </div>

                </div>
            `

        )

        .join("");

}

// =================================================
// AVERAGE BREAKDOWN
// =================================================

function renderAverageBreakdown(){

    if(!averageBreakdown)
        return;

    const groups = {

        "≤ 6":0,
        "6 - 7.9":0,
        "8 - 8.9":0,
        "≥ 9":0

    };

    seriesDataset.forEach(

        show => {

            if(
                !show.notes.length
            )
                return;

            if(show.avg <= 6){

                groups["≤ 6"]++;

            }

            else if(
                show.avg < 8
            ){

                groups["6 - 7.9"]++;

            }

            else if(
                show.avg < 9
            ){

                groups["8 - 8.9"]++;

            }

            else{

                groups["≥ 9"]++;

            }

        }

    );

    const maxValue =

        Math.max(

            1,

            ...Object.values(
                groups
            )

        );

    averageBreakdown.innerHTML =

        Object.entries(
            groups
        )

        .map(

            ([label,count]) => {

                let cls =
                    "average-mid";

                if(label === "≤ 6")
                    cls =
                    "average-low";

                if(label === "8 - 8.9")
                    cls =
                    "average-high";

                if(label === "≥ 9")
                    cls =
                    "average-masterpiece";

                return `

                    <div
                        class="
                        analytics-item
                        ${cls}
                        "
                    >

                        <div
                            class="
                            analytics-label
                            "
                        >

                            ${label}

                        </div>

                        <div
                            class="
                            analytics-track
                            "
                        >

                            <div
                                class="
                                analytics-fill
                                "
                                style="
                                width:${
                                    (
                                        count
                                        /
                                        maxValue
                                    ) * 100
                                }%;
                                "
                            ></div>

                        </div>

                        <div
                            class="
                            analytics-value
                            "
                        >

                            ${count}

                        </div>

                    </div>

                `;

            }

        )

        .join("");

}

// =================================================
// ANALYTICS
// =================================================

async function renderAnalytics(){

    await renderGenres();

    renderDecades();

    renderAverageBreakdown();

}

// =================================================
// DOM
// =================================================

const activityHeatmap =
    document.getElementById(
        "activityHeatmap"
    );

const longestCompleted =
    document.getElementById(
        "longestCompleted"
    );

const bestSeries =
    document.getElementById(
        "bestSeries"
    );

const mostAdvanced =
    document.getElementById(
        "mostAdvanced"
    );

// =================================================
// HEATMAP
// =================================================

function renderHeatmap(){

    if(!activityHeatmap)
        return;

    activityHeatmap.innerHTML =
        "";

    const days = 140;

    for(
        let i = 0;
        i < days;
        i++
    ){

        const level =

            Math.floor(

                Math.random() * 5

            );

        const cell =
            document.createElement(
                "div"
            );

        cell.className =

            `heatmap-cell heat-${level}`;

        cell.dataset.value =

            `${level} activité(s)`;

        activityHeatmap.appendChild(
            cell
        );

    }

}

// =================================================
// BEST SERIES
// =================================================

function renderBestSeries(){

    if(
        !bestSeries
    )
        return;

    const best =

        [...seriesDataset]

        .filter(

            show =>

                show.notes.length >= 5

        )

        .sort(

            (a,b)=>

                b.avg -

                a.avg

        )[0];

    if(!best){

        bestSeries.textContent =
            "—";

        return;

    }

    bestSeries.innerHTML =

    `
        <div
            class="
            best-series
            "
        >

            <img
                src="${best.poster}"
                alt="${best.name}"
            >

            <div
                class="
                best-series-title
                "
            >

                ${best.name}

            </div>

            <div
                class="
                best-series-score
                "
            >

                ${best.avg.toFixed(1)}
                /10

            </div>

        </div>
    `;

}

// =================================================
// MOST ADVANCED
// =================================================

function renderMostAdvanced(){

    if(
        !mostAdvanced
    )
        return;

    const best =

        [...seriesDataset]

        .sort(

            (a,b)=>

                b.progress -

                a.progress

        )[0];

    if(!best){

        mostAdvanced.textContent =
            "—";

        return;

    }

    mostAdvanced.innerHTML =

    `
        <div
            class="
            best-series
            "
        >

            <img
                src="${best.poster}"
                alt="${best.name}"
            >

            <div
                class="
                best-series-title
                "
            >

                ${best.name}

            </div>

            <div
                class="
                best-series-score
                "
            >

                ${best.progress}%

            </div>

        </div>
    `;

}

// =================================================
// LONGEST COMPLETED
// =================================================

function renderLongestCompleted(){

    if(
        !longestCompleted
    )
        return;

    const completed =

        seriesDataset.filter(

            show =>

                show.progress >= 100

        );

    if(
        !completed.length
    ){

        longestCompleted.textContent =
            "—";

        return;

    }

    const longest =

        completed.sort(

            (a,b)=>

                (b.episodes || 0)

                -

                (a.episodes || 0)

        )[0];

    longestCompleted.innerHTML =

    `
        <div
            class="
            best-series
            "
        >

            <img
                src="${longest.poster}"
                alt="${longest.name}"
            >

            <div
                class="
                best-series-title
                "
            >

                ${longest.name}

            </div>

            <div
                class="
                best-series-score
                "
            >

                ${longest.episodes}
                épisodes

            </div>

        </div>
    `;

}

// =================================================
// PROFILE INSIGHTS
// =================================================

function getProfileStats(){

    const completed =

        seriesDataset.filter(

            show =>
            show.progress >= 100

        ).length;

    const averageProgress =

        round(

            average(

                seriesDataset.map(

                    show =>
                    show.progress

                )

            )

        );

    const averageSeriesScore =

        round(

            average(

                seriesDataset

                .filter(

                    show =>
                    show.notes.length

                )

                .map(

                    show =>
                    show.avg

                )

            )

        );

    return {

        completed,

        averageProgress,

        averageSeriesScore

    };

}

// =================================================
// ADVANCED INSIGHTS
// =================================================

function renderInsights(){

    renderBestSeries();

    renderMostAdvanced();

    renderLongestCompleted();

}

// =================================================
// DOM
// =================================================

const personalInsight =
    document.getElementById(
        "personalInsight"
    );

const exportStatsBtn =
    document.getElementById(
        "exportStatsBtn"
    );

const shareStatsBtn =
    document.getElementById(
        "shareStatsBtn"
    );

// =================================================
// REAL HEATMAP
// =================================================

function renderHeatmap(){

    if(!activityHeatmap)
        return;

    activityHeatmap.innerHTML =
        "";

    const days = 140;

    const today =
        new Date();

    const activity = {};

    library.forEach(

        show => {

            if(
                !show.addedAt
            )
                return;

            const date =

                new Date(
                    show.addedAt
                )

                .toISOString()

                .slice(
                    0,
                    10
                );

            activity[date] =

                (
                    activity[date]
                    || 0
                )

                + 1;

        }

    );

    for(
        let i = days - 1;
        i >= 0;
        i--
    ){

        const date =
            new Date();

        date.setDate(
            today.getDate()
            - i
        );

        const key =

            date

            .toISOString()

            .slice(
                0,
                10
            );

        const value =
            activity[key]
            || 0;

        let level = 0;

        if(value >= 1)
            level = 1;

        if(value >= 2)
            level = 2;

        if(value >= 4)
            level = 3;

        if(value >= 6)
            level = 4;

        const cell =
            document.createElement(
                "div"
            );

        cell.className =

            `heatmap-cell heat-${level}`;

        cell.dataset.value =

            `${value} ajout(s)`;

        activityHeatmap.appendChild(
            cell
        );

    }

}

// =================================================
// PERSONAL INSIGHT
// =================================================

function generateInsight(){

    if(
        !personalInsight
    )
        return;

    const stats =
        getProfileStats();

    const best =

        [...seriesDataset]

        .filter(
            show =>
            show.notes.length >= 5
        )

        .sort(
            (a,b)=>
            b.avg-a.avg
        )[0];

    if(
        !seriesDataset.length
    ){

        personalInsight.textContent =

            "Ajoutez des séries à votre collection pour débloquer vos statistiques.";

        return;

    }

    if(
        stats.averageSeriesScore >= 8.5
    ){

        personalInsight.innerHTML =

        `
            Vous êtes un spectateur particulièrement exigeant.

            Votre moyenne de collection est de

            <strong>

                ${stats.averageSeriesScore}

            </strong>

            et votre meilleure série actuelle est

            <strong>

                ${best?.name || "—"}

            </strong>.

        `;

        return;

    }

    if(
        stats.averageSeriesScore >= 7
    ){

        personalInsight.innerHTML =

        `
            Votre collection est très équilibrée.

            Vous terminez

            <strong>

                ${stats.completed}

            </strong>

            séries et maintenez une moyenne de

            <strong>

                ${stats.averageSeriesScore}

            </strong>.

        `;

        return;

    }

    personalInsight.innerHTML =

    `
        Vous avez tendance à noter sévèrement.

        Votre moyenne actuelle est de

        <strong>

            ${stats.averageSeriesScore}

        </strong>

        ce qui vous place parmi les utilisateurs les plus critiques.

    `;

}

// =================================================
// EXPORT
// =================================================

function exportStats(){

    const data = {

        exportedAt:
            new Date()
            .toISOString(),

        library,

        ratings,

        statistics:{

            totalSeries,

            totalEpisodesRated,

            globalAverageScore

        }

    };

    const blob =

        new Blob(

            [

                JSON.stringify(
                    data,
                    null,
                    2
                )

            ],

            {
                type:
                "application/json"
            }

        );

    const url =

        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement(
            "a"
        );

    a.href =
        url;

    a.download =
        "bingerate-stats.json";

    a.click();

    URL.revokeObjectURL(
        url
    );

    showToast(
        "Export terminé"
    );

}

// =================================================
// SHARE
// =================================================

async function shareStats(){

    const text =

        `📊 BingeRate\n\n` +

        `⭐ Moyenne : ${round(globalAverageScore)}\n` +

        `📺 Séries : ${totalSeries}\n` +

        `🎬 Épisodes notés : ${totalEpisodesRated}`;

    try{

        if(
            navigator.share
        ){

            await navigator.share({

                title:
                    "Mes statistiques BingeRate",

                text

            });

        }

        else{

            await navigator.clipboard.writeText(
                text
            );

            showToast(
                "Copié dans le presse-papiers"
            );

        }

    }

    catch(error){

        console.error(
            error
        );

    }

}

// =================================================
// REVEAL ANIMATION
// =================================================

function initReveal(){

    const elements =

        document.querySelectorAll(
            ".glass-card, .hero-card"
        );

    const observer =

        new IntersectionObserver(

            entries=>{

                entries.forEach(

                    entry=>{

                        if(
                            entry.isIntersecting
                        ){

                            entry.target.classList.add(
                                "visible"
                            );

                        }

                    }

                );

            },

            {
                threshold:.1
            }

        );

    elements.forEach(

        element=>{

            element.classList.add(
                "reveal"
            );

            observer.observe(
                element
            );

        }

    );

}

// =================================================
// EVENTS
// =================================================

if(
    exportStatsBtn
){

    exportStatsBtn.addEventListener(

        "click",

        exportStats

    );

}

if(
    shareStatsBtn
){

    shareStatsBtn.addEventListener(

        "click",

        shareStats

    );

}

// =================================================
// INIT
// =================================================

async function initStats(){

    renderOverview();

    renderEvolutionChart();

    renderRankings();

    await renderAnalytics();

    renderHeatmap();

    renderInsights();

    generateInsight();

    initReveal();

}

initStats();