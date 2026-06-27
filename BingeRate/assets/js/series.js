// =================================================
// DOM
// =================================================

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchBtn =
    document.getElementById(
        "searchBtn"
    );

const resultsSection =
    document.getElementById(
        "resultsSection"
    );

const results =
    document.getElementById(
        "results"
    );

const mySeries =
    document.getElementById(
        "mySeries"
    );

const toast =
    document.getElementById(
        "toast"
    );

// stats

const seriesCount =
    document.getElementById(
        "seriesCount"
    );

const episodesCount =
    document.getElementById(
        "episodesCount"
    );

const globalAverage =
    document.getElementById(
        "globalAverage"
    );

const masterpiecesCount =
    document.getElementById(
        "masterpiecesCount"
    );

const collectionCount =
    document.getElementById(
        "collectionCount"
    );

// collection

const collectionSearch =
    document.getElementById(
        "collectionSearch"
    );

const sortCollection =
    document.getElementById(
        "sortCollection"
    );

// recent

const recentSearches =
    document.getElementById(
        "recentSearches"
    );

const clearRecent =
    document.getElementById(
        "clearRecent"
    );

const discoverBtn =
    document.getElementById(
        "discoverBtn"
    );

const addSeriesCard =
    document.getElementById(
        "addSeriesCard"
    );

const loadMoreTrigger =
    document.getElementById(
        "loadMoreTrigger"
    );

const SERIES_PER_PAGE = 24;

let visibleSeries = 24;

let currentLibrary = [];

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

function saveLibrary(data){

    localStorage.setItem(

        "bingeRateLibrary",

        JSON.stringify(data)

    );

}

function getRatings(){

    return JSON.parse(

        localStorage.getItem(
            "bingeRateRatings"
        )

    ) || {};

}

function getRecentSearches(){

    return JSON.parse(

        localStorage.getItem(
            "bingeRateRecentSearches"
        )

    ) || [];

}

function saveRecentSearches(
    data
){

    localStorage.setItem(

        "bingeRateRecentSearches",

        JSON.stringify(data)

    );

}

// =================================================
// TMDB CACHE
// =================================================

function getSeriesCache(){

    return JSON.parse(

        localStorage.getItem(
            "bingeRateSeriesCache"
        )

    ) || {};

}

function saveSeriesCache(
    cache
){

    localStorage.setItem(

        "bingeRateSeriesCache",

        JSON.stringify(cache)

    );

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

        / values.length

    );

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

        3000

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
// TMDB DETAILS
// =================================================

async function getShowDetails(
    id
){

    const cache =
        getSeriesCache();

    if(cache[id]){

        const oneWeek =

            7 * 24 * 60 * 60 * 1000;

        const age =

            Date.now()

            -

            (
                cache[id].updatedAt
                || 0
            );

        if(
            age < oneWeek
        ){

            return cache[id];

        }

    }

    const response =
        await fetch(

            `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=fr-FR`

        );

    const show =
        await response.json();

    const today = new Date();

    let releasedEpisodes = 0;

    for(const season of show.seasons){

        if(
            season.season_number === 0
        )
            continue;

        try{

            const seasonResponse =

                await fetch(

                    `https://api.themoviedb.org/3/tv/${id}/season/${season.season_number}?api_key=${TMDB_API_KEY}&language=fr-FR`

                );

            const seasonData =
                await seasonResponse.json();

            releasedEpisodes +=

                (seasonData.episodes || [])

                .filter(

                 episode =>

                     episode.air_date &&

                     new Date(
                            episode.air_date
                     ) <= today

                )

                .length;

        }

        catch(error){

            console.error(
                error
            );

        }

    }

    cache[id] = {

        episodes:
            releasedEpisodes,

        seasons:
            show.number_of_seasons,

        tmdb:
            show.vote_average,

        updatedAt:
            Date.now()

    };

    saveSeriesCache(
        cache
    );

    return cache[id];

}

// =================================================
// RECENT SEARCHES
// =================================================

function addRecentSearch(
    query
){

    let searches =
        getRecentSearches();

    searches =
        searches.filter(

            item =>
            item !== query

        );

    searches.unshift(
        query
    );

    searches =
        searches.slice(0,8);

    saveRecentSearches(
        searches
    );

}

function loadRecentSearches(){

    const searches =
        getRecentSearches();

    recentSearches.innerHTML =
        "";

    searches.forEach(

        search => {

            const button =
                document.createElement(
                    "button"
                );

            button.textContent =
                search;

            button.onclick = () => {

                searchInput.value =
                    search;

                searchSeries();

            };

            recentSearches.appendChild(
                button
            );

        }

    );

}

// =================================================
// LOAD STATS
// =================================================

async function loadStats(){

    const library =
        getLibrary();

    const ratings =
        getRatings();

    seriesCount.textContent =
        library.length;

    collectionCount.textContent =

        `${library.length} série${
            library.length > 1
            ? "s"
            : ""
        }`;

    const notes =
        Object.values(
            ratings
        );

    episodesCount.textContent =
        notes.length;

    const globalAvg =

        notes.length

        ?

        average(notes)

        :

        0;

    globalAverage.textContent =

        globalAvg

        ?

        globalAvg.toFixed(1)

        :

        "—";

    let masterpieces = 0;

    for(const show of library){

        const showNotes =

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
            !showNotes.length
        )
            continue;

        if(
            average(showNotes)
            >= 9
        ){

            masterpieces++;

        }

    }

    masterpiecesCount.textContent =
        masterpieces;

}

// =================================================
// LIBRARY ENRICHMENT
// =================================================

async function enrichLibrary(){

    const library =
        getLibrary();

    let updated = false;

    for(const show of library){

        if(
            show.episodes &&
            show.seasons
        )
            continue;

        try{

            const details =
                await getShowDetails(
                    show.id
                );

            show.episodes =
                details.episodes;

            show.seasons =
                details.seasons;

            show.tmdb =
                details.tmdb;

            updated = true;

        }

        catch(error){

            console.error(
                error
            );

        }

    }

    if(updated){

        saveLibrary(
            library
        );

    }

}

// =================================================
// LOAD LIBRARY
// =================================================

async function loadLibrary(){

    await enrichLibrary();

    currentLibrary =
        getLibrary();

    visibleSeries =
        SERIES_PER_PAGE;

    await renderLibrary(
        currentLibrary
    );

    await loadStats();

}

// =================================================
// RENDER LIBRARY
// =================================================

async function renderLibrary(
    library
){

    if(
        library.length === 0
    ){

        mySeries.innerHTML =

        `
            <div class="empty-library">

                <h3>
                    Votre collection est vide
                </h3>

                <p>
                    Ajoutez votre première série.
                </p>

            </div>
        `;

        return;

    }

    const ratings =
        getRatings();

    mySeries.innerHTML = "";

    const visibleLibrary =

        library.slice(
            0,
            visibleSeries
        );

    for(const show of visibleLibrary){

        const showNotes =

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

        const averageScore =

            showNotes.length

            ?

            average(showNotes)

            :

            0;

        // =====================================
        // VRAIE PROGRESSION
        // =====================================

        const progress =

            getProgress(

                showNotes.length,

                show.episodes

            );

        // =====================================
        // BADGES
        // =====================================

        let badge =
            "new";

        let badgeText =
            "À commencer";

        if(progress >= 100){

            badge =
                "completed";

            badgeText =
                "Terminée";

        }

        else if(progress > 0){

            badge =
                "progress";

            badgeText =
                "En cours";

        }

        if(
            averageScore >= 9 &&
            showNotes.length >= 10
        ){

            badge =
                "completed";

            badgeText =
                "Chef-d'œuvre";

        }

        // =====================================
        // SCORE RING
        // =====================================

        const circumference =
            245;

        const offset =

            circumference -

            (
                progress / 100
            ) * circumference;

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "library-card";

        card.innerHTML =

        `
            <div class="library-poster">

                <img
                    src="${show.poster}"
                    alt="${show.name}"
                >

                <div
                    class="
                    library-badge
                    ${badge}
                    "
                >

                    ${badgeText}

                </div>

            </div>

            <div class="library-content">

                <h3>

                    ${show.name}

                </h3>

                <div
                    class="library-meta"
                >

                    <span>

                        ${show.year}

                    </span>

                    <span>

                        ${show.seasons || "?"}
                        saisons

                    </span>

                </div>

                <div
                    class="
                    library-progress
                    "
                >

                    <div
                        class="
                        library-progress-top
                        "
                    >

                        <span>

                            Progression

                        </span>

                        <span>

                            ${progress}%

                        </span>

                    </div>

                    <div
                        class="
                        progress-track
                        "
                    >

                        <div
                            class="
                            progress-value
                            "
                            style="
                            width:${progress}%;
                            "
                        ></div>

                    </div>

                </div>

                <div
                    class="
                    library-footer
                    "
                >

                        <div
                            class="
                            score-ring
                            "
                        >

                            <svg
                                viewBox="0 0 90 90"
                            >

                                <circle
                                    class="bg"
                                    cx="45"
                                    cy="45"
                                    r="39"
                                ></circle>

                                <circle
                                    class="progress"
                                    cx="45"
                                    cy="45"
                                    r="39"
                                    stroke-dasharray="245"
                                    stroke-dashoffset="${offset}"
                                ></circle>

                            </svg>

                            <span>

                                ${progress}

                            </span>

                        </div>

                        <div
                            class="
                            library-score
                            "
                        >

                            ${

                                averageScore

                                ?

                                averageScore.toFixed(1)

                                :

                                "—"

                            }

                        </div>

                </div>

            </div>
        `;

        card.addEventListener(

            "click",

            ()=>{

                window.location.href =

                    `serie.html?id=${show.id}`;

            }

        );

        mySeries.appendChild(
            card
        );

    }

}

// =================================================
// POPULAR SEARCHES
// =================================================

document

.querySelectorAll(
    ".popular-searches button"
)

.forEach(

    button => {

        button.addEventListener(

            "click",

            ()=>{

                searchInput.value =
                    button.textContent;

                searchSeries();

            }

        );

    }

);

// =================================================
// DISCOVER
// =================================================

discoverBtn.addEventListener(

    "click",

    ()=>{

        const suggestions = [

            "Breaking Bad",
            "Dark",
            "Lost",
            "Severance",
            "Succession",
            "The Sopranos",
            "Mr. Robot",
            "The Leftovers",
            "Black Mirror",
            "Dexter"

        ];

        searchInput.value =

            suggestions[
                Math.floor(
                    Math.random()
                    *
                    suggestions.length
                )
            ];

        searchSeries();

    }

);

addSeriesCard.addEventListener(

    "click",

    ()=>{

        searchInput.focus();

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    }

);

// =================================================
// SEARCH EVENTS
// =================================================

searchBtn.addEventListener(

    "click",

    searchSeries

);

searchInput.addEventListener(

    "keydown",

    event => {

        if(
            event.key ===
            "Enter"
        ){

            searchSeries();

        }

    }

);

// =================================================
// SEARCH
// =================================================

async function searchSeries(){

    const query =

        searchInput.value
        .trim();

    if(!query)
        return;

    addRecentSearch(
        query
    );

    loadRecentSearches();

    resultsSection.classList.remove(
        "hidden"
    );

    resultsCount.textContent =
        "Recherche...";

    results.innerHTML =

    `
        <div class="empty-library">

            <h3>
                Recherche en cours...
            </h3>

        </div>
    `;

    try{

        const response =
            await fetch(

                `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=fr-FR`

            );

        const data =
            await response.json();

        const sorted =

            (data.results || [])

            .sort(

                (a,b)=>

                b.popularity -
                a.popularity

            );

        displayResults(
            sorted
        );

    }

    catch(error){

        console.error(
            error
        );

        results.innerHTML =

        `
            <div class="empty-library">

                <h3>
                    Une erreur est survenue
                </h3>

            </div>
        `;

    }

}

// =================================================
// RESULTS
// =================================================

function displayResults(
    series
){

    results.innerHTML = "";

    resultsCount.textContent =

        `${series.length} résultat${
            series.length > 1
            ? "s"
            : ""
        }`;

    if(!series.length){

        results.innerHTML =

        `
            <div class="empty-library">

                <h3>
                    Aucun résultat
                </h3>

            </div>
        `;

        return;

    }

    const library =
        getLibrary();

    series.forEach(

        show => {

            const poster =

                show.poster_path

                ?

                `https://image.tmdb.org/t/p/w500${show.poster_path}`

                :

                "https://placehold.co/500x750?text=No+Poster";

            const year =

                show.first_air_date

                ?

                show.first_air_date
                .split("-")[0]

                :

                "—";

            const alreadyExists =

                library.some(

                    item =>

                    item.id === show.id

                );

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "card";

            card.innerHTML =

            `
                <img
                    src="${poster}"
                    alt="${show.name}"
                >

                <div
                    class="card-content"
                >

                    <h3>

                        ${show.name}

                    </h3>

                    <div
                        class="year"
                    >

                        ${year}

                    </div>

                    <div
                        class="
                        result-meta
                        "
                    >

                        <div
                            class="
                            result-score
                            "
                        >

                            ⭐
                            ${

                                show.vote_average

                                ?

                                show.vote_average.toFixed(1)

                                :

                                "—"

                            }

                        </div>

                        <div>

                            TMDB

                        </div>

                    </div>

                    <button
                        class="
                        add-btn
                        "
                    >

                        ${

                            alreadyExists

                            ?

                            "Déjà ajoutée"

                            :

                            "Ajouter à la collection"

                        }

                    </button>

                </div>
            `;

            card.addEventListener(

                "click",

                ()=>{

                    window.location.href =

                        `serie.html?id=${show.id}`;

                }

            );

            if(!alreadyExists){

                card

                .querySelector(
                    ".add-btn"
                )

                .addEventListener(

                    "click",

                    async event => {

                        event.stopPropagation();

                        await addToLibrary(
                            show
                        );

                    }

                );

            }

            results.appendChild(
                card
            );

        }

    );

}

// =================================================
// ADD TO LIBRARY
// =================================================

async function addToLibrary(show){

    const library =
        getLibrary();

    const alreadyExists =

        library.some(

            item =>

            item.id === show.id

        );

    if(alreadyExists){

        showToast(
            "⚠ Série déjà présente"
        );

        return;

    }

    try{

        // =====================================
        // DETAILS TMDB
        // =====================================

        const details =
            await getShowDetails(
                show.id
            );

        library.unshift({

            id:
                show.id,

            name:
                show.name,

            poster:

                show.poster_path

                ?

                `https://image.tmdb.org/t/p/w500${show.poster_path}`

                :

                "https://placehold.co/500x750?text=No+Poster",

            year:

                show.first_air_date

                ?

                show.first_air_date
                .split("-")[0]

                :

                "—",

            episodes:
                details.episodes,

            seasons:
                details.seasons,

            tmdb:
                details.tmdb,

            addedAt:
                Date.now()

        });

        saveLibrary(
            library
        );

        await loadLibrary();

        showToast(
            `✓ ${show.name} ajoutée`
        );

    }

    catch(error){

        console.error(
            error
        );

        showToast(
            "Erreur TMDB"
        );

    }

}

// =================================================
// REMOVE SERIES
// =================================================

function removeFromLibrary(
    id
){

    let library =
        getLibrary();

    library =
        library.filter(

            show =>

            show.id !== id

        );

    saveLibrary(
        library
    );

    loadLibrary();

    showToast(
        "Série supprimée"
    );

}

// =================================================
// CLEAR RECENT
// =================================================

clearRecent.addEventListener(

    "click",

    ()=>{

        localStorage.removeItem(
            "bingeRateRecentSearches"
        );

        loadRecentSearches();

        showToast(
            "Historique effacé"
        );

    }

);

// =================================================
// SEARCH FOCUS
// =================================================

searchInput.addEventListener(

    "focus",

    ()=>{

        searchInput.parentElement
        .style.borderColor =
        "#8b7fff";

    }

);

searchInput.addEventListener(

    "blur",

    ()=>{

        searchInput.parentElement
        .style.borderColor =
        "";

    }

);

// =================================================
// SCROLL RESULTS
// =================================================

function scrollToResults(){

    if(
        resultsSection.classList.contains(
            "hidden"
        )
    )
        return;

    resultsSection.scrollIntoView({

        behavior:"smooth",

        block:"start"

    });

}

// =================================================
// OVERRIDE SEARCH
// =================================================

const originalSearch =
    searchSeries;

searchSeries =
async function(){

    await originalSearch();

    setTimeout(

        ()=>{

            scrollToResults();

        },

        250

    );

};

// =================================================
// RANDOM PLACEHOLDER
// =================================================

const randomSuggestions = [

    "Breaking Bad",
    "Dark",
    "Severance",
    "The Sopranos",
    "Succession",
    "Lost",
    "Mr. Robot",
    "The Leftovers",
    "Black Mirror",
    "Dexter",
    "The Office",
    "Better Call Saul"

];

setInterval(

    ()=>{

        if(
            document.activeElement ===
            searchInput
        )
            return;

        const random =

            randomSuggestions[
                Math.floor(
                    Math.random()
                    *
                    randomSuggestions.length
                )
            ];

        searchInput.placeholder =

            `Rechercher : ${random}`;

    },

    5000

);

// =================================================
// OBSERVER
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

// =================================================
// OBSERVE CARDS
// =================================================

function observeCards(){

    document

    .querySelectorAll(

        ".library-card, .card, .stat-card"

    )

    .forEach(

        card => {

            if(
                card.dataset.observed
            )
                return;

            card.dataset.observed =
                "true";

            card.style.opacity =
                "0";

            card.style.transform =
                "translateY(20px)";

            card.style.transition =
                ".45s ease";

            observer.observe(
                card
            );

        }

    );

}

// =================================================
// MUTATION OBSERVER
// =================================================

const mutationObserver =

    new MutationObserver(

        ()=>{

            observeCards();

        }

    );

mutationObserver.observe(

    document.body,

    {
        childList:true,
        subtree:true
    }

);

// =================================================
// BONUS : TOP SERIES
// =================================================

function getTopRatedSeries(){

    const library =
        getLibrary();

    const ratings =
        getRatings();

    return library

    .map(show=>{

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

        return {

            show,

            score:

                notes.length

                ?

                average(notes)

                :

                0

        };

    })

    .sort(
        (a,b)=>
        b.score - a.score
    );

}

// =================================================
// BONUS : MOST ADVANCED
// =================================================

function getMostAdvancedSeries(){

    const library =
        getLibrary();

    const ratings =
        getRatings();

    return library

    .map(show=>{

        const count =

            Object.keys(
                ratings
            )

            .filter(

                key =>

                key.startsWith(
                    `${show.id}-`
                )

            )

            .length;

        return {

            show,

            progress:

                getProgress(
                    count,
                    show.episodes
                )

        };

    })

    .sort(
        (a,b)=>
        b.progress - a.progress
    );

}

// =================================================
// PRELOAD CACHE
// =================================================

async function preloadPopularSeries(){

    const library =
        getLibrary();

    for(

        const show

        of

        library.slice(0,5)

    ){

        try{

            await getShowDetails(
                show.id
            );

        }

        catch(error){

            console.error(
                error
            );

        }

    }

}

if(loadMoreTrigger){

    const infiniteScroll =

        new IntersectionObserver(

            async entries => {

                const entry =
                    entries[0];

                if(
                    !entry.isIntersecting
                )
                    return;

                if(
                    visibleSeries
                    >=
                    currentLibrary.length
                )
                    return;

                visibleSeries +=
                    SERIES_PER_PAGE;

                await renderLibrary(
                    currentLibrary
                );

            },

            {
                rootMargin:"400px"
            }

        );

    infiniteScroll.observe(
        loadMoreTrigger
    );

}

async function updateCollection(){

    const query =

        collectionSearch.value
        .trim()
        .toLowerCase();

    let filtered =
        getLibrary();

    if(query){

        filtered =

            filtered.filter(

                show =>

                    show.name
                    .toLowerCase()
                    .includes(
                        query
                    )

            );

    }

    if(
        sortCollection.value
        ===
        "name"
    ){

        filtered.sort(

            (a,b)=>

                a.name.localeCompare(
                    b.name
                )

        );

    }

    else{

        filtered.sort(

            (a,b)=>

                (b.addedAt || 0)

                -

                (a.addedAt || 0)

        );

    }

    await renderLibrary(
        filtered
    );

}

collectionSearch.addEventListener(
    "input",
    updateCollection
);

sortCollection.addEventListener(
    "change",
    updateCollection
);

// =================================================
// INIT
// =================================================

(async ()=>{

    await loadLibrary();

    loadRecentSearches();

    observeCards();

    preloadPopularSeries();

})();