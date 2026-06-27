// =================================================
// URL
// =================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const serieId =
    params.get("id");

// =================================================
// COLORS
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

const hero =
    document.getElementById("hero");

const poster =
    document.getElementById("poster");

const title =
    document.getElementById("title");

const genres =
    document.getElementById("genres");

const overview =
    document.getElementById("overview");

const heroBadges =
    document.getElementById("heroBadges");

const heroMeta =
    document.getElementById("heroMeta");

const chartLink =
    document.getElementById("chartLink");

const quickStats =
    document.getElementById("quickStats");

const progressPercent =
    document.getElementById("progressPercent");

const progressFill =
    document.getElementById("progressFill");

const progressText =
    document.getElementById("progressText");

const lastEpisodeContent =
    document.getElementById("lastEpisodeContent");

const favoriteSeasonContent =
    document.getElementById("favoriteSeasonContent");

const personalAnalysis =
    document.getElementById("personalAnalysis");

const seasonsContainer =
    document.getElementById("seasonsContainer");

// score ring

const averageRing =
    document.getElementById(
        "averageRing"
    );

const averageValue =
    document.getElementById(
        "averageValue"
    );

// tooltip

const tooltip =
    document.getElementById(
        "episodeTooltip"
    );

// modal

const ratingModal =
    document.getElementById(
        "ratingModal"
    );

const ratingButtons =
    document.getElementById(
        "ratingButtons"
    );

const selectedRating =
    document.getElementById(
        "selectedRating"
    );

const closeRating =
    document.getElementById(
        "closeRating"
    );

const toast =
    document.getElementById(
        "toast"
    );

// =================================================
// STATE
// =================================================

let currentEpisodeKey =
    null;

let currentButton =
    null;

const openSeasons =
    new Set();

// =================================================
// HELPERS
// =================================================

function getRatings(){

    return JSON.parse(

        localStorage.getItem(
            "bingeRateRatings"
        )

    ) || {};

}

function saveRatings(data){

    localStorage.setItem(

        "bingeRateRatings",

        JSON.stringify(data)

    );

}

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

function showToast(message){

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

// =================================================
// SCORE RING
// =================================================

function setRingScore(score){

    const circumference =
        327;

    const percent =
        score * 10;

    const offset =

        circumference -

        (
            percent / 100
        ) * circumference;

    averageRing.style
        .strokeDashoffset =
            offset;

    averageValue.textContent =
        score
        ?
        score.toFixed(1)
        :
        "—";

}

// =================================================
// ANALYSIS
// =================================================

function generateAnalysis(score){

    if(score >= 9.2){

        return `
        Cette série est
        clairement dans vos
        favorites. Les notes
        montrent une qualité
        exceptionnelle et une
        grande régularité.
        `;

    }

    if(score >= 8.5){

        return `
        Une excellente série
        avec beaucoup
        d'épisodes marquants
        et très peu de points
        faibles.
        `;

    }

    if(score >= 7.5){

        return `
        Série solide et
        agréable à suivre,
        même si certaines
        saisons semblent
        moins fortes.
        `;

    }

    return `
    Les notes indiquent
    une réception mitigée.
    Certaines saisons
    semblent vous avoir
    davantage convaincu.
    `;

}

// =================================================
// LOAD
// =================================================

loadSeries();

async function loadSeries(){

    try{

        const response =
            await fetch(

                `https://api.themoviedb.org/3/tv/${serieId}?api_key=${TMDB_API_KEY}&language=fr-FR`

            );

        const show =
            await response.json();

        renderSeries(
            show
        );

    }

    catch(error){

        console.error(
            error
        );

    }

}

// =================================================
// HERO
// =================================================

function renderSeries(show){

    title.textContent =
        show.name;

    overview.textContent =

        show.overview ||

        "Aucun synopsis disponible.";

    genres.textContent =

        show.genres
        .map(
            genre =>
            genre.name
        )
        .join(" • ");

    poster.src =

        `https://image.tmdb.org/t/p/w500${show.poster_path}`;

    hero.style.backgroundImage =

        `url(https://image.tmdb.org/t/p/original${show.backdrop_path})`;

    chartLink.href =

        `chart.html?id=${show.id}`;

    // =================================================
    // BADGES
    // =================================================

    heroBadges.innerHTML =

        show.genres

        .slice(0,5)

        .map(

            genre =>

            `
            <span class="hero-badge">
                ${genre.name}
            </span>
            `

        )

        .join("");

    // =================================================
    // META
    // =================================================

    heroMeta.innerHTML =

    `
        <div class="hero-meta-item">
            <i class="fa-solid fa-calendar"></i>
            ${getYear(show.first_air_date)}
        </div>

        <div class="hero-meta-item">
            <i class="fa-solid fa-film"></i>
            ${show.number_of_seasons} saisons
        </div>

        <div class="hero-meta-item">
            <i class="fa-solid fa-tv"></i>
            ${show.number_of_episodes} épisodes
        </div>

        <div class="hero-meta-item">
            <i class="fa-solid fa-star"></i>
            ${show.vote_average.toFixed(1)}
        </div>
    `;

    // =================================================
    // USER RATINGS
    // =================================================

    const ratings =
        getRatings();

    const serieRatings =

        Object.entries(
            ratings
        )

        .filter(

            ([key]) =>

            key.startsWith(
                `${serieId}-`
            )

        );

    const notes =

        serieRatings.map(

            ([,note]) =>
            note

        );

    const averageScore =

        notes.length

        ?

        average(notes)

        :

        0;

    // =================================================
    // SCORE RING
    // =================================================

    setRingScore(
        averageScore
    );

    // =================================================
    // QUICK STATS
    // =================================================

    quickStats.innerHTML =

    `
        <div>
            <span>Épisodes notés</span>
            <strong>${notes.length}</strong>
        </div>

        <div>
            <span>Total épisodes</span>
            <strong>${show.number_of_episodes}</strong>
        </div>

        <div>
            <span>Saisons</span>
            <strong>${show.number_of_seasons}</strong>
        </div>

        <div>
            <span>Moyenne</span>
            <strong>
                ${
                    notes.length
                    ?
                    averageScore.toFixed(1)
                    :
                    "—"
                }
            </strong>
        </div>
    `;

    // =================================================
    // PROGRESS
    // =================================================

    const releasedEpisodes =

        show.seasons

        .filter(
            season =>
            season.season_number !== 0
        )

        .reduce(

            (total, season)=>{

                return (

                    total +

                    (
                        season.air_date

                        &&

                        new Date(
                            season.air_date
                        )

                        <=

                        new Date()

                        ?

                        season.episode_count

                        :

                        0

                    )

                );

            },

            0

        );

    const percent =

        releasedEpisodes

        ?

        (
            notes.length
            /
            releasedEpisodes
        ) * 100

        :

        0;

    progressPercent.textContent =

        `${Math.round(percent)}%`;

    progressFill.style.width =

        `${percent}%`;

    progressText.textContent =

        `${notes.length} / ${releasedEpisodes} épisodes notés`;

    // =================================================
    // LAST EPISODE
    // =================================================

    const lastKey =

        serieRatings.length

        ?

        serieRatings[
            serieRatings.length - 1
        ][0]

        :

        null;

    if(lastKey){

        const note =
            ratings[lastKey];

        lastEpisodeContent.innerHTML =

        `
            <strong>
                ${lastKey.replace(
                    `${serieId}-`,
                    ""
                )}
            </strong>

            <br>

            ⭐ ${note}
        `;

    }

    else{

        lastEpisodeContent.innerHTML =

            "Aucun épisode noté";

    }

    // =================================================
    // FAVORITE SEASON
    // =================================================

    let bestSeason = null;

    let bestAverage = 0;

    show.seasons.forEach(

        season => {

            if(
                season.season_number === 0
            )
                return;

            const seasonNotes =

                Object.entries(
                    ratings
                )

                .filter(

                    ([key]) =>

                    key.startsWith(
                        `${serieId}-S${season.season_number}E`
                    )

                )

                .map(
                    ([,note]) =>
                    note
                );

            if(
                !seasonNotes.length
            )
                return;

            const avg = average(
                seasonNotes
            );

            if(
                avg > bestAverage
            ){

                bestAverage =
                    avg;

                bestSeason =
                    season;

            }

        }

    );

    favoriteSeasonContent.innerHTML =

        bestSeason

        ?

        `
        <strong>
            ${bestSeason.name}
        </strong>

        <br>

        ⭐ ${bestAverage.toFixed(1)}
        `

        :

        "Pas assez de notes";

    // =================================================
    // ANALYSIS
    // =================================================

    personalAnalysis.innerHTML =

        generateAnalysis(
            averageScore
        );

    // =================================================
    // SEASONS
    // =================================================

    displaySeasons(
        show.seasons
    );

}

// =================================================
// SEASONS
// =================================================

function displaySeasons(seasons){

    seasonsContainer.innerHTML = "";

    const ratings =
        getRatings();

    seasons.forEach(

        season => {

            if(
                season.season_number === 0
            )
                return;

            const seasonNotes =

                Object.entries(
                    ratings
                )

                .filter(

                    ([key]) =>

                    key.startsWith(
                        `${serieId}-S${season.season_number}E`
                    )

                )

                .map(
                    ([,note]) =>
                    note
                );

            const averageSeason =

                seasonNotes.length

                ?

                average(
                    seasonNotes
                )

                :

                0;

            const completed =

                seasonNotes.length >=
                season.episode_count;

            // =========================================
            // SCORE RING SVG
            // =========================================

            const circumference =
                182;

            const offset =

                circumference -

                (
                    averageSeason * 10
                    /
                    100
                )

                * circumference;

            // =========================================
            // HEATMAP
            // =========================================

            const heatmap =

                seasonNotes

                .slice(0,24)

                .map(

                    note =>

                    `
                    <div
                        class="
                        heat-dot
                        ${getNoteClass(note)}
                        "
                    ></div>
                    `

                )

                .join("");

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "season-card";

            card.innerHTML =

            `
                <div class="season-header">

                    <div>

                        <div class="season-title">

                            ${season.name}

                        </div>

                        <div class="season-info">

                            ${season.episode_count}
                            épisodes

                        </div>

                    </div>

                    <div class="season-heatmap">

                        ${heatmap}

                    </div>

                    <div
                        class="
                        season-score-ring
                        "
                    >

                        <svg
                            viewBox="0 0 72 72"
                        >

                            <circle
                                class="bg"
                                cx="36"
                                cy="36"
                                r="29"
                            ></circle>

                            <circle
                                class="progress"
                                cx="36"
                                cy="36"
                                r="29"
                                stroke-dasharray="182"
                                stroke-dashoffset="${offset}"
                            ></circle>

                        </svg>

                        <span>

                            ${

                                averageSeason

                                ?

                                averageSeason.toFixed(1)

                                :

                                "—"

                            }

                        </span>

                    </div>

                    <div
                        class="
                        season-status
                        ${

                            completed

                            ?

                            "complete"

                            :

                            "partial"

                        }
                        "
                    >

                        ${

                            completed

                            ?

                            "Complétée"

                            :

                            `${seasonNotes.length}/${season.episode_count}`

                        }

                    </div>

                    <div
                        class="
                        season-arrow
                        "
                    >

                        <i class="fa-solid fa-chevron-down"></i>

                    </div>

                </div>

                <div
                    class="episodes"
                    id="season-${season.season_number}"
                ></div>
            `;

            card.querySelector(
                ".season-header"
            )

            .addEventListener(

                "click",

                () => {

                    const isOpen =
                        card.classList.toggle(
                            "open"
                        );

                    if(isOpen){

                        openSeasons.add(
                            season.season_number
                        );

                    }

                    else{

                        openSeasons.delete(
                            season.season_number
                        );

                    }

                    toggleSeason(
                        season.season_number
                    );

                }

            );

            if(

                openSeasons.has(
                    season.season_number
                )

            ){

                card.classList.add(
                    "open"
                );

                setTimeout(

                    ()=>{

                        toggleSeason(
                            season.season_number
                        );

                    },

                    0

                );

            }

            seasonsContainer.appendChild(
                card
            );

        }

    );

}

// =================================================
// TOGGLE
// =================================================

async function toggleSeason(
    seasonNumber
){

    const container =

        document.getElementById(
            `season-${seasonNumber}`
        );

    if(
        container.classList.contains(
            "active"
        )
    ){

        container.classList.remove(
            "active"
        );

        return;

    }

    if(
        !container.dataset.loaded
    ){

        await loadEpisodes(
            seasonNumber,
            container
        );

        container.dataset.loaded =
            "true";

    }

    container.classList.add(
        "active"
    );

}

// =================================================
// LOAD EPISODES
// =================================================

async function loadEpisodes(
    seasonNumber,
    container
){

    const response =
        await fetch(

            `https://api.themoviedb.org/3/tv/${serieId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=fr-FR`

        );

    const data =
        await response.json();

    displayEpisodes(
        seasonNumber,
        data.episodes,
        container
    );

}

// =================================================
// EPISODES
// =================================================

function displayEpisodes(
    seasonNumber,
    episodes,
    container
){

    const ratings =
        getRatings();

    episodes.forEach(

        episode => {

            const key =

                `${serieId}-S${seasonNumber}E${episode.episode_number}`;

            const note =
                ratings[key];

            const image =

                episode.still_path

                ?

                `https://image.tmdb.org/t/p/w500${episode.still_path}`

                :

                "https://placehold.co/500x281?text=Episode";

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "episode-card";

            card.innerHTML =

            `
                <img
                    class="episode-image"
                    src="${image}"
                >

                <div class="episode-info">

                    <h3>

                        ${episode.name}

                    </h3>

                    <p>

                        ${

                            episode.overview

                            ||

                            "Aucun résumé disponible."

                        }

                    </p>

                    <div
                        class="episode-meta"
                    >

                        <span
                            class="episode-tag"
                        >

                            S${seasonNumber}

                        </span>

                        <span
                            class="episode-tag"
                        >

                            E${episode.episode_number}

                        </span>

                    </div>

                </div>

                <button
                    class="
                    episode-rating
                    ${

                        note

                        ?

                        getNoteClass(note)

                        :

                        ""

                    }
                    "
                    data-key="${key}"

                    data-title="${episode.name}"

                    data-code="S${seasonNumber}E${episode.episode_number}"

                    data-note="${
                        note || "-"
                    }"

                >

                    ${

                        note

                        ?

                        `${note} ★`

                        :

                        "Noter"

                    }

                </button>
            `;

            container.appendChild(
                card
            );

        }

    );

    attachRatingEvents();
    attachTooltips();

}

// =================================================
// EVENTS
// =================================================

function attachRatingEvents(){

    document

    .querySelectorAll(
        ".episode-rating"
    )

    .forEach(

        button => {

            button.onclick = () => {

                currentEpisodeKey =
                    button.dataset.key;

                currentButton =
                    button;

                openRatingModal();

            };

        }

    );

}

// =================================================
// TOOLTIPS
// =================================================

function attachTooltips(){

    const buttons =

        document.querySelectorAll(
            ".episode-rating"
        );

    buttons.forEach(

        button => {

            button.addEventListener(

                "mouseenter",

                ()=>{

                    tooltip.querySelector(
                        ".tooltip-title"
                    ).textContent =

                        button.dataset.title;

                    tooltip.querySelector(
                        ".tooltip-rating"
                    ).textContent =

                        button.dataset.note === "-"

                        ?

                        "Non noté"

                        :

                        `⭐ ${button.dataset.note}/10`;

                    tooltip.querySelector(
                        ".tooltip-code"
                    ).textContent =

                        button.dataset.code;

                    tooltip.classList.add(
                        "show"
                    );

                }

            );

            button.addEventListener(

                "mousemove",

                event => {

                    tooltip.style.left =

                        `${event.clientX + 20}px`;

                    tooltip.style.top =

                        `${event.clientY - 10}px`;

                }

            );

            button.addEventListener(

                "mouseleave",

                ()=>{

                    tooltip.classList.remove(
                        "show"
                    );

                }

            );

        }

    );

}

// =================================================
// MODAL
// =================================================

function openRatingModal(){

    ratingModal.classList.add(
        "active"
    );

    ratingButtons.innerHTML =
        "";

    selectedRating.textContent =
        "—";

    for(

        let note = 0.5;

        note <= 10;

        note += 0.5

    ){

        const btn =
            document.createElement(
                "button"
            );

        btn.textContent =
            note;

        btn.className =
            getNoteClass(note);

        btn.addEventListener(

            "mouseenter",

            ()=>{

                selectedRating.textContent =

                    `${note}`;

            }

        );

        btn.addEventListener(

            "click",

            ()=>{

                saveEpisodeRating(
                    note
                );

            }

        );

        ratingButtons.appendChild(
            btn
        );

    }

}

// =================================================
// CLOSE MODAL
// =================================================

closeRating.addEventListener(

    "click",

    ()=>{

        ratingModal.classList.remove(
            "active"
        );

    }

);

ratingModal.addEventListener(

    "click",

    event => {

        if(
            event.target ===
            ratingModal
        ){

            ratingModal.classList.remove(
                "active"
            );

        }

    }

);

// =================================================
// SAVE NOTE
// =================================================

function saveEpisodeRating(
    rating
){

    const ratings =
        getRatings();

    ratings[
        currentEpisodeKey
    ] = rating;

    saveRatings(
        ratings
    );

    currentButton.className =

        `episode-rating ${

            getNoteClass(
                rating
            )

        }`;

    currentButton.textContent =

        `${rating} ★`;

    currentButton.dataset.note =
        rating;

    ratingModal.classList.remove(
        "active"
    );

    showToast(
        `Note enregistrée : ${rating}/10`
    );

    // refresh complet
    loadSeries();

}

// =================================================
// ESCAPE KEY
// =================================================

document.addEventListener(

    "keydown",

    event => {

        if(
            event.key === "Escape"
        ){

            ratingModal.classList.remove(
                "active"
            );

            tooltip.classList.remove(
                "show"
            );

        }

    }

);

// =================================================
// SCROLL ANIMATION
// =================================================

const observer =

    new IntersectionObserver(

        entries => {

            entries.forEach(

                entry => {

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
            threshold:0.15
        }

    );

setTimeout(

    ()=>{

        document

        .querySelectorAll(

            ".season-card"

        )

        .forEach(

            card => {

                card.style.opacity =
                    "0";

                card.style.transform =
                    "translateY(20px)";

                card.style.transition =
                    ".4s ease";

                observer.observe(
                    card
                );

            }

        );

    },

    1000

);