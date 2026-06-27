// =================================================
// CONFIG
// =================================================

const serieId =
    new URLSearchParams(
        window.location.search
    ).get("id");

// =================================================
// NOTE COLORS
// =================================================

const NOTE_COLORS = [

    { max:4, class:"note-purple" },

    { max:5.9, class:"note-orange" },

    { max:6.9, class:"note-dark-orange" },

    { max:7.9, class:"note-yellow" },

    { max:8.9, class:"note-green" },

    { max:9.6, class:"note-dark-green" },

    { max:10, class:"note-blue" }

];

// =================================================
// DOM
// =================================================

// HERO

const hero =
    document.getElementById(
        "hero"
    );

const poster =
    document.getElementById(
        "poster"
    );

const seriesTitle =
    document.getElementById(
        "seriesTitle"
    );

const seriesSubtitle =
    document.getElementById(
        "seriesSubtitle"
    );

const seriesOverview =
    document.getElementById(
        "seriesOverview"
    );

const heroBadges =
    document.getElementById(
        "heroBadges"
    );

const heroMeta =
    document.getElementById(
        "heroMeta"
    );

const heroProgressFill =
    document.getElementById(
        "heroProgressFill"
    );

const heroProgressText =
    document.getElementById(
        "heroProgressText"
    );

const lastRatedInfo =
    document.getElementById(
        "lastRatedInfo"
    );

const collectionRank =
    document.getElementById(
        "collectionRank"
    );

// QUICK CARDS

const globalAverageCard =
    document.getElementById(
        "globalAverageCard"
    );

const bestSeasonCard =
    document.getElementById(
        "bestSeasonCard"
    );

const bestEpisodeCard =
    document.getElementById(
        "bestEpisodeCard"
    );

const ratedEpisodesCard =
    document.getElementById(
        "ratedEpisodesCard"
    );

// SEASONS

const seasonTimeline =
    document.getElementById(
        "seasonTimeline"
    );

// SIDEBAR

const globalScore =
    document.getElementById(
        "globalScore"
    );

const quickStats =
    document.getElementById(
        "quickStats"
    );

const ratingDistribution =
    document.getElementById(
        "ratingDistribution"
    );

const topEpisodes =
    document.getElementById(
        "topEpisodes"
    );

// VERDICT

const finalVerdict =
    document.getElementById(
        "finalVerdict"
    );

const strengths =
    document.getElementById(
        "strengths"
    );

const weaknesses =
    document.getElementById(
        "weaknesses"
    );

const recommendation =
    document.getElementById(
        "recommendation"
    );

// INSIGHTS

const collectionComparison =
    document.getElementById(
        "collectionComparison"
    );

const keywordTags =
    document.getElementById(
        "keywordTags"
    );

const rewatchScore =
    document.getElementById(
        "rewatchScore"
    );

// TOPBAR

const exportBtn =
    document.getElementById(
        "exportBtn"
    );

const shareBtn =
    document.getElementById(
        "shareBtn"
    );

const toast =
    document.getElementById(
        "toast"
    );

// =================================================
// STORAGE
// =================================================

function getRatings(){

    return JSON.parse(

        localStorage.getItem(
            "bingeRateRatings"
        )

    ) || {};

}

function getLibrary(){

    return JSON.parse(

        localStorage.getItem(
            "bingeRateLibrary"
        )

    ) || [];

}

// =================================================
// INIT
// =================================================

loadSeries();

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

        / values.length

    );

}

function getNoteClass(note){

    return (

        NOTE_COLORS.find(
            item =>
            note <= item.max
        )?.class

        ||

        "note-blue"

    );

}

function getYear(date){

    if(!date)
        return "?";

    return date.split("-")[0];

}

function episodeCode(
    episode
){

    return `S${episode.season}E${episode.number}`;

}

function showToast(
    message
){

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

        3000

    );

}

// =================================================
// VERDICTS
// =================================================

function getVerdict(score){

    if(score >= 9.3)
        return "Chef-d'œuvre";

    if(score >= 8.7)
        return "Exceptionnelle";

    if(score >= 8)
        return "Excellente";

    if(score >= 7)
        return "Très bonne";

    if(score >= 6)
        return "Correcte";

    return "Décevante";

}

function getRecommendation(score){

    if(score >= 9.3)
        return "À voir absolument";

    if(score >= 8.7)
        return "Priorité absolue";

    if(score >= 8)
        return "Fortement recommandée";

    if(score >= 7)
        return "Très recommandée";

    if(score >= 6)
        return "Bonne découverte";

    return "Pour les fans du genre";

}

// =================================================
// COLLECTION RANK
// =================================================

function getCollectionRank(
    currentId,
    currentAverage
){

    const library =
        getLibrary();

    const ratings =
        getRatings();

    const ranking = [];

    library.forEach(

        show => {

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

            if(
                !notes.length
            )
                return;

            ranking.push({

                id:show.id,

                average:
                    average(notes)

            });

        }

    );

    ranking.sort(

        (a,b)=>

        b.average -
        a.average

    );

    const index =

        ranking.findIndex(

            item =>

            String(item.id) ===
            String(currentId)

        );

    return index === -1

        ? null

        : index + 1;

}

// =================================================
// REWATCH SCORE
// =================================================

function calculateRewatchValue(

    globalAverage,

    bestEpisode,

    consistency

){

    let score =

        globalAverage * 6;

    score +=
        bestEpisode * 2;

    score +=
        consistency * 2;

    return Math.min(
        100,
        Math.round(score)
    );

}

// =================================================
// CONSISTENCY
// =================================================

function calculateConsistency(
    seasonsData
){

    if(
        seasonsData.length < 2
    )
        return 10;

    const values =

        seasonsData.map(
            season =>
            season.average
        );

    const max =
        Math.max(...values);

    const min =
        Math.min(...values);

    const diff =
        max - min;

    return Math.max(

        0,

        10 - diff * 3

    );

}

// =================================================
// KEYWORDS
// =================================================

function generateKeywords(

    globalAverage,

    consistency,

    bestEpisode

){

    const tags = [];

    if(globalAverage >= 9)
        tags.push(
            "Chef-d'œuvre"
        );

    if(globalAverage >= 8)
        tags.push(
            "Binge-worthy"
        );

    if(consistency >= 8)
        tags.push(
            "Régulière"
        );

    if(bestEpisode >= 9.5)
        tags.push(
            "Épisodes cultes"
        );

    if(globalAverage >= 8.5)
        tags.push(
            "Rewatchable"
        );

    tags.push(
        "Analyse complète"
    );

    return tags;

}

// =================================================
// SHARE
// =================================================

async function shareSeries(

    title,
    score

){

    const text =

        `${title} • ${score}/10 sur BingeRate`;

    if(
        navigator.share
    ){

        try{

            await navigator.share({

                title,

                text

            });

        }

        catch(error){

            console.error(
                error
            );

        }

    }

    else{

        navigator.clipboard.writeText(
            text
        );

        showToast(
            "Lien copié"
        );

    }

}

// =================================================
// EXPORT
// =================================================

function exportAnalysis(

    title,
    score,
    episodes

){

    const content =

`
${title}

Note moyenne : ${score}

Episodes notés : ${episodes}

Exporté depuis BingeRate
`;

    const blob =
        new Blob(

            [content],

            {
                type:
                "text/plain"
            }

        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        `${title}.txt`;

    link.click();

    URL.revokeObjectURL(
        url
    );

}

// =================================================
// LOAD SERIES
// =================================================

async function loadSeries(){

    try{

        const response =
            await fetch(

                `https://api.themoviedb.org/3/tv/${serieId}?api_key=${TMDB_API_KEY}&language=fr-FR`

            );

        const show =
            await response.json();

        await renderSeries(
            show
        );

    }

    catch(error){

        console.error(
            error
        );

        showToast(
            "Erreur de chargement"
        );

    }

}

// =================================================
// MAIN
// =================================================

async function renderSeries(show){

    // =============================================
    // HERO
    // =============================================

    hero.style.backgroundImage =

        `url(https://image.tmdb.org/t/p/original${show.backdrop_path})`;

    poster.src =

        `https://image.tmdb.org/t/p/w500${show.poster_path}`;

    poster.alt =
        show.name;

    seriesTitle.textContent =
        show.name;

    seriesOverview.textContent =

        show.overview ||

        "Aucune description disponible.";

    heroBadges.innerHTML =

        show.genres

        .slice(0,6)

        .map(

            genre =>

            `
            <span class="hero-badge">
                ${genre.name}
            </span>
            `

        )

        .join("");

    heroMeta.innerHTML =

    `
        <div class="hero-meta-item">

            📅

            ${getYear(
                show.first_air_date
            )}

        </div>

        <div class="hero-meta-item">

            🎬

            ${show.number_of_seasons}
            saisons

        </div>

        <div class="hero-meta-item">

            📺

            ${show.number_of_episodes}
            épisodes

        </div>

        <div class="hero-meta-item">

            ⭐

            ${show.vote_average.toFixed(1)}

        </div>
    `;

    // =============================================
    // RATINGS
    // =============================================

    const ratings =
        getRatings();

    const seasonsData = [];

    let bestEpisodeData =
        null;

    let worstEpisodeData =
        null;

    // =============================================
    // LOAD SEASONS
    // =============================================

    for(
        const season
        of show.seasons
    ){

        if(
            season.season_number === 0
        )
            continue;

        try{

            const response =
                await fetch(

                    `https://api.themoviedb.org/3/tv/${serieId}/season/${season.season_number}?api_key=${TMDB_API_KEY}&language=fr-FR`

                );

            const seasonData =
                await response.json();

            const episodes = [];

            seasonData.episodes.forEach(

                episode => {

                    const key =

                        `${serieId}-S${season.season_number}E${episode.episode_number}`;

                    const note =
                        ratings[key];

                    if(
                        note === undefined
                    )
                        return;

                    const episodeData = {

                        season:
                            season.season_number,

                        number:
                            episode.episode_number,

                        name:
                            episode.name,

                        note

                    };

                    episodes.push(
                        episodeData
                    );

                    if(

                        !bestEpisodeData ||

                        note >
                        bestEpisodeData.note

                    ){

                        bestEpisodeData =
                            episodeData;

                    }

                    if(

                        !worstEpisodeData ||

                        note <
                        worstEpisodeData.note

                    ){

                        worstEpisodeData =
                            episodeData;

                    }

                }

            );

            if(
                !episodes.length
            )
                continue;

            seasonsData.push({

                number:
                    season.season_number,

                average:
                    average(

                        episodes.map(
                            e => e.note
                        )

                    ),

                episodes

            });

        }

        catch(error){

            console.error(
                error
            );

        }

    }

    // =============================================
    // EMPTY STATE
    // =============================================

    if(
        !seasonsData.length
    ){

        seasonTimeline.innerHTML =

        `
        <div class="season-chart">

            Aucun épisode noté.

        </div>
        `;

        return;

    }

    // =============================================
    // GLOBAL STATS
    // =============================================

    const allEpisodes =

        seasonsData.flatMap(
            season =>
            season.episodes
        );

    const allNotes =

        allEpisodes.map(
            episode =>
            episode.note
        );

    const globalAverage =

        average(
            allNotes
        );

    const rankedSeasons =

        [...seasonsData]

        .sort(
            (a,b)=>
            b.average-a.average
        );

    const bestSeasonData =
        rankedSeasons[0];

    const worstSeasonData =
        rankedSeasons[
            rankedSeasons.length-1
        ];

    // =============================================
    // HERO SUBTITLE
    // =============================================

    seriesSubtitle.textContent =

        `${allEpisodes.length} épisodes notés • ${globalAverage.toFixed(1)} ★`;

    // =============================================
    // HERO PROGRESSION
    // =============================================

    const progress =

        Math.round(

            (
                allEpisodes.length
                /
                show.number_of_episodes
            ) * 100

        );

    heroProgressText.textContent =

        `${allEpisodes.length} épisodes notés sur ${show.number_of_episodes}`;

    heroProgressFill.style.width =

        `${progress}%`;

    // =============================================
    // COLLECTION RANK
    // =============================================

    const rank =

        getCollectionRank(
            serieId,
            globalAverage
        );

    if(rank){

        collectionRank.textContent =
            `#${rank}`;

    }

    // =============================================
    // LAST RATED
    // =============================================

    lastRatedInfo.textContent =

        `Progression : ${progress}%`;

    // =============================================
    // QUICK CARDS PREMIUM
    // =============================================

    globalAverageCard.innerHTML =

    `
    <div class="quick-card-icon purple">

        <i
            class="
            fa-solid
            fa-chart-simple
            "
        ></i>

    </div>

    <div class="quick-card-info">

        <h4>

            Moyenne globale

        </h4>

        <strong>

            ${globalAverage.toFixed(1)}

        </strong>

        <span>

            ${getVerdict(
                globalAverage
            )}

        </span>

    </div>
    `;

    bestSeasonCard.innerHTML =

    `
    <div class="quick-card-icon green">

        <i
            class="
            fa-solid
            fa-trophy
            "
        ></i>

    </div>

    <div class="quick-card-info">

        <h4>

            Meilleure saison

        </h4>

        <strong>

            ${bestSeasonData.average.toFixed(1)}

        </strong>

        <span>

            Saison
            ${bestSeasonData.number}

        </span>

    </div>
    `;

    bestEpisodeCard.innerHTML =

    `
    <div class="quick-card-icon orange">

        <i
            class="
            fa-solid
            fa-arrow-trend-down
            "
        ></i>

    </div>

    <div class="quick-card-info">

        <h4>

            Pire saison

        </h4>

        <strong>

            ${worstSeasonData.average.toFixed(1)}

        </strong>

        <span>

            Saison
            ${worstSeasonData.number}

        </span>

    </div>
    `;

    ratedEpisodesCard.innerHTML =

    `
    <div class="quick-card-icon blue">

        <i
       class="
            fa-solid
            fa-tv
            "
        ></i>

    </div>

    <div class="quick-card-info">

        <h4>

            Épisodes notés

        </h4>

        <strong>

            ${allEpisodes.length}

        </strong>

        <span>

            sur
            ${show.number_of_episodes}

        </span>

    </div>
    `;

    // =============================================
    // SCORE SIDEBAR
    // =============================================

    globalScore.innerHTML =

    `
        <div class="score-value">

            ${globalAverage.toFixed(1)}

        </div>

        <div class="score-label">

            ${getVerdict(
                globalAverage
            )}

        </div>
    `;

    quickStats.innerHTML =

    `
        <div>

            <span>📺 Épisodes</span>

            <strong>
                ${allEpisodes.length}
            </strong>

        </div>

        <div>

            <span>🎬 Saisons</span>

            <strong>
                ${seasonsData.length}
            </strong>

        </div>

        <div>

            <span>🏆 Meilleure saison</span>

            <strong>
                ${bestSeasonData.average.toFixed(1)}
            </strong>

        </div>

        <div>

            <span>⭐ Meilleur épisode</span>

            <strong>
                ${bestEpisodeData.note}
            </strong>

        </div>
    `;

    // =============================================
// DISTRIBUTION
// =============================================

const buckets = [

    {
        label:"0-4",
        class:"note-purple",
        count:
        allNotes.filter(
            note => note <= 4
        ).length
    },

    {
        label:"4-6",
        class:"note-orange",
        count:
        allNotes.filter(
            note =>
            note > 4 &&
            note <= 5.9
        ).length
    },

    {
        label:"6-7",
        class:"note-dark-orange",
        count:
        allNotes.filter(
            note =>
            note > 5.9 &&
            note <= 6.9
        ).length
    },

    {
        label:"7-8",
        class:"note-yellow",
        count:
        allNotes.filter(
            note =>
            note > 6.9 &&
            note <= 7.9
        ).length
    },

    {
        label:"8-9",
        class:"note-green",
        count:
        allNotes.filter(
            note =>
            note > 7.9 &&
            note <= 8.9
        ).length
    },

    {
        label:"9-9,5",
        class:"note-dark-green",
        count:
        allNotes.filter(
            note =>
            note > 8.9 &&
            note <= 9.6
        ).length
    },

    {
        label:"10",
        class:"note-blue",
        count:
        allNotes.filter(
            note =>
            note > 9.6
        ).length
    }

];

ratingDistribution.innerHTML =

    buckets.map(

        bucket => {

            const percent =

                allNotes.length
                ? (bucket.count / allNotes.length) * 100
                : 0;

            return `

            <div class="dist-row">

                <div class="dist-label">

                    ${bucket.label}

                </div>

                <div class="dist-bar">

                    <div
                        class="
                        dist-fill
                        ${bucket.class}
                        "
                        style="
                        width:${percent}%;
                        "
                    ></div>

                </div>

                <div class="dist-value">

                    ${bucket.count}

                </div>

            </div>

            `;

        }

    ).join("");

    // =============================================
    // TOP EPISODES
    // =============================================

    const topThree =

        [...allEpisodes]

        .sort(
            (a,b)=>
            b.note-a.note
        )

        .slice(0,3);

    topEpisodes.innerHTML =

        topThree.map(

            (
                episode,
                index
            ) =>

            `
            <div class="top-item">

                <div class="
                    rank
                    ${
                        index === 0
                        ? "gold"
                        :
                        index === 1
                        ? "silver"
                        :
                        "bronze"
                    }
                ">

                    #${index+1}

                </div>

                <div class="episode-name">

                    <strong>

                        ${episodeCode(
                            episode
                        )}

                    </strong>

                    <span>

                        ${episode.name}

                    </span>

                </div>

                <div class="top-score">

                    ${episode.note}

                </div>

            </div>
            `

        ).join("");

    // =============================================
    // VERDICT FINAL PREMIUM
    // =============================================

    finalVerdict.innerHTML =

    `
        <div class="verdict-score">

            ${globalAverage.toFixed(1)}

        </div>

        <div class="verdict-title">

            ${getVerdict(
                globalAverage
            )}

        </div>

        <div class="verdict-description">

            ${
                globalAverage >= 9

                ?

                "Une série exceptionnelle qui se distingue par sa régularité, ses épisodes marquants et sa qualité globale remarquable."

                :

                globalAverage >= 8

                ?

                "Une excellente série qui maintient un niveau élevé sur la majorité de ses saisons."

                :

                globalAverage >= 7

                ?

                "Une série solide offrant de nombreux moments mémorables malgré quelques irrégularités."

                :

                "Une série correcte qui séduira principalement les amateurs du genre."
            }

        </div>
    `;

    // =============================================
    // FORCES
    // =============================================

    const strengthsList = [];

    if(globalAverage >= 8.5){

        strengthsList.push(
            "Excellente moyenne générale"
        );

    }

    if(bestSeasonData.average >= 9){

        strengthsList.push(
            `Saison ${bestSeasonData.number} exceptionnelle`
        );

    }

    if(

        allNotes.filter(
            note => note >= 8
        ).length

        >

        allNotes.length * 0.65

    ){

        strengthsList.push(
            "Très grande régularité"
        );

    }

    if(bestEpisodeData.note >= 9.5){

        strengthsList.push(
            "Présence d'épisodes cultes"
        );

    }

    if(

        strengthsList.length === 0

    ){

        strengthsList.push(
            "Quelques épisodes réussis"
        );

    }

    strengths.innerHTML =

        strengthsList

        .map(

            item =>

            `<li>${item}</li>`

        )

        .join("");

    // =============================================
    // FAIBLESSES
    // =============================================

    const weaknessesList = [];

    if(

        bestSeasonData.average

        -

        worstSeasonData.average

        >

        1.5

    ){

        weaknessesList.push(
            "Qualité inégale selon les saisons"
        );

    }

    if(

        worstEpisodeData.note <= 6

    ){

        weaknessesList.push(
            "Quelques épisodes plus faibles"
        );

    }

    if(

        globalAverage < 8

    ){

        weaknessesList.push(
            "Moins constante que les références du genre"
        );

    }

    if(

        weaknessesList.length === 0

    ){

        weaknessesList.push(
            "Très peu de défauts notables"
        );

    }

    weaknesses.innerHTML =

        weaknessesList

        .map(

            item =>

            `<li>${item}</li>`

        )

        .join("");

    // =============================================
    // RECOMMANDATION PREMIUM
    // =============================================

    recommendation.innerHTML =

    `
        <div class="recommend-score">

            ${globalAverage.toFixed(1)}/10

        </div>

        <div class="recommend-text">

            ${getRecommendation(
                globalAverage
            )}

        </div>
    `;

        // =============================================
    // COMPARAISON COLLECTION
    // =============================================

    const library =
        getLibrary();

    const libraryScores = [];

    library.forEach(

        item => {

            const notes =

                Object.entries(
                    ratings
                )

                .filter(

                    ([key]) =>

                    key.startsWith(
                        `${item.id}-`
                    )

                )

                .map(
                    ([,note]) =>
                    note
                );

            if(
                !notes.length
            )
                return;

            libraryScores.push(

                average(
                    notes
                )

            );

        }

    );

    const collectionAverage =

        average(
            libraryScores
        );

    const delta =

        globalAverage -
        collectionAverage;

    collectionComparison.innerHTML =

    `
        <div class="collection-row">

            <span class="collection-label">

                Cette série

            </span>

            <strong class="collection-value">

                ${globalAverage.toFixed(1)}

            </strong>

        </div>

        <div class="collection-row">

            <span class="collection-label">

                Votre moyenne

            </span>

            <strong class="collection-value">

                ${collectionAverage.toFixed(1)}

            </strong>

        </div>

        <div class="
            collection-delta
            ${delta >= 0 ? "positive" : "negative"}
        ">

            ${
                delta >= 0
                ? "+"
                : ""
            }

            ${delta.toFixed(1)}

            par rapport à votre collection

        </div>
    `;

    // =============================================
    // REWATCH VALUE
    // =============================================

    const consistency =

        calculateConsistency(
            seasonsData
        );

    const rewatch =

        calculateRewatchValue(

            globalAverage,

            bestEpisodeData.note,

            consistency

        );

    rewatchScore.innerHTML =

    `
        <div class="rewatch-value">

            ${rewatch}%

        </div>

        <div class="rewatch-label">

            Potentiel de revisionnage

        </div>

        <div class="rewatch-bar">

            <div
                class="rewatch-fill"
                style="
                width:${rewatch}%;
                "
            ></div>

        </div>
    `;

    // =============================================
    // KEYWORDS
    // =============================================

    keywordTags.innerHTML =

        generateKeywords(

            globalAverage,

            consistency,

            bestEpisodeData.note

        )

        .map(

            tag =>

            `
            <span>

                ${tag}

            </span>
            `

        )

        .join("");

    // =============================================
    // SEASONS TIMELINE
    // =============================================

    seasonTimeline.innerHTML = "";

    seasonsData

        .sort(
            (a,b)=>
            a.number-b.number
        )

        .forEach(

            season => {

                const isBest =

                    season.number ===
                    bestSeasonData.number;

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "season-chart";

                card.innerHTML =

                `
                <div class="season-header">

                    <div>

                        <h3>

                            Saison
                            ${season.number}

                            ${
                                isBest

                                ?

                                `
                                <span class="season-badge">
                                    FAVORITE
                                </span>
                                `

                                :

                                ""
                            }

                        </h3>

                        <div class="season-meta">

                            ${season.episodes.length}
                            épisodes notés

                        </div>

                    </div>

                    <div
                        class="
                        season-average
                        ${getNoteClass(
                            season.average
                        )}
                        "
                    >

                        ${season.average.toFixed(1)}

                    </div>

                </div>

                <div
                    class="episode-track"
                ></div>
                `;

                const track =

                    card.querySelector(
                        ".episode-track"
                    );

                season.episodes

                    .sort(
                        (a,b)=>
                        a.number-b.number
                    )

                    .forEach(

                        episode => {

                            const item =
                                document.createElement(
                                    "div"
                                );

                            item.className =
                                "episode-box";

                            item.dataset.tooltip =

                                `${episode.name} • ${episode.note}/10`;

                            item.innerHTML =

                            `
                            <div
                                class="
                                episode-note
                                ${getNoteClass(
                                    episode.note
                                )}
                                "
                            >

                                ${episode.note}

                            </div>

                            <div
                                class="
                                episode-id
                                "
                            >

                                E${String(
                                    episode.number
                                ).padStart(
                                    2,
                                    "0"
                                )}

                            </div>
                            `;

                            track.appendChild(
                                item
                            );

                        }

                    );

                seasonTimeline.appendChild(
                    card
                );

            }

        );

    // =============================================
    // EXPORT
    // =============================================

    exportBtn?.addEventListener(

        "click",

        ()=>{

            exportAnalysis(

                show.name,

                globalAverage.toFixed(1),

                allEpisodes.length

            );

            showToast(
                "Analyse exportée"
            );

        }

    );

    // =============================================
    // SHARE
    // =============================================

    shareBtn?.addEventListener(

        "click",

        ()=>{

            shareSeries(

                show.name,

                globalAverage.toFixed(1)

            );

        }

    );

    // =============================================
    // HERO ANIMATION
    // =============================================

    requestAnimationFrame(

        ()=>{

            heroProgressFill.style.transition =

                "width .8s ease";

        }

    );

}