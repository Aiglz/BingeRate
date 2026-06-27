// ======================================================
// DOM
// ======================================================

// Hero

const addSeriesBtn =
    document.getElementById(
        "addSeriesBtn"
    );

// Search

const resultsSection =
    document.getElementById(
        "resultsSection"
    );

const results =
    document.getElementById(
        "results"
    );

const resultsCount =
    document.getElementById(
        "resultsCount"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchBtn =
    document.getElementById(
        "searchBtn"
    );

// Collection

const mySeries =
    document.getElementById(
        "mySeries"
    );

const collectionSearch =
    document.getElementById(
        "collectionSearch"
    );

const sortButton =
    document.getElementById(
        "sortButton"
    );

const addSeriesCard =
    document.getElementById(
        "addSeriesCard"
    );

const loadMoreTrigger =
    document.getElementById(
        "loadMoreTrigger"
    );

// Dashboard

const seriesCount =
    document.getElementById(
        "seriesCount"
    );

const episodesCount =
    document.getElementById(
        "episodesCount"
    );

const episodesTotal =
    document.getElementById(
        "episodesTotal"
    );

const globalAverage =
    document.getElementById(
        "globalAverage"
    );

const masterpiecesCount =
    document.getElementById(
        "masterpiecesCount"
    );

const dashboardProgress =
    document.getElementById(
        "dashboardProgress"
    );

const dashboardProgressCircle =
    document.getElementById(
        "dashboardProgressCircle"
    );

// Filters

const filterButtons =
    document.querySelectorAll(
        ".filter-chip"
    );

// Recent

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

// Toast

const toast =
    document.getElementById(
        "toast"
    );

// ======================================================
// MODAL
// ======================================================

const addSeriesModal =
    document.getElementById(
        "addSeriesModal"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const modalLoading =
    document.getElementById(
        "modalLoading"
    );

// ======================================================
// CONFIG
// ======================================================

const SERIES_PER_PAGE = 24;

const CACHE_DURATION =
    7 * 24 * 60 * 60 * 1000;

// ======================================================
// STATE
// ======================================================

let library = [];

let ratings = {};

let currentLibrary = [];

let visibleSeries =
    SERIES_PER_PAGE;

let currentFilter =
    "all";

let currentSort =
    "recent";

let currentSearch =
    "";

// ======================================================
// STORAGE
// ======================================================

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
    searches
){

    localStorage.setItem(

        "bingeRateRecentSearches",

        JSON.stringify(searches)

    );

}

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

// ======================================================
// HELPERS
// ======================================================

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

function clamp(
    value,
    min,
    max
){

    return Math.min(

        max,

        Math.max(
            min,
            value
        )

    );

}

function getProgress(

    watched,

    total

){

    if(!total)
        return 0;

    return Math.round(

        (

            watched

            /

            total

        )

        *100

    );

}

function debounce(
    callback,
    delay
){

    let timeout;

    return (...args)=>{

        clearTimeout(
            timeout
        );

        timeout =

            setTimeout(

                ()=>{

                    callback(
                        ...args
                    );

                },

                delay

            );

    };

}

function showToast(message){

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toast.timeout
    );

    toast.timeout =

        setTimeout(

            ()=>{

                toast.classList.remove(
                    "show"
                );

            },

            3000

        );

}

function scrollToSection(
    section
){

    section.scrollIntoView({

        behavior:"smooth",

        block:"start"

    });

}

function createElement(
    tag,
    className
){

    const element =
        document.createElement(
            tag
        );

    if(className){

        element.className =
            className;

    }

    return element;

}

// ======================================================
// GLOBAL DATA
// ======================================================

function refreshStorage(){

    library =
        getLibrary();

    ratings =
        getRatings();

}

// ======================================================
// TMDB
// ======================================================

async function fetchTMDB(url){

    try{

        const response =
            await fetch(url);

        if(!response.ok){

            throw new Error(

                `TMDB ${response.status}`

            );

        }

        return await response.json();

    }

    catch(error){

        console.error(error);

        return null;

    }

}

// ======================================================
// SHOW DETAILS
// ======================================================

async function getShowDetails(id){

    const cache =
        getSeriesCache();

    if(cache[id]){

        const age =

            Date.now()

            -

            cache[id].updatedAt;

        if(age < CACHE_DURATION){

            return cache[id];

        }

    }

    const show =

        await fetchTMDB(

            `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=fr-FR`

        );

    if(!show){

        return{

            seasons:0,
            episodes:0,
            tmdb:0

        };

    }

    let releasedEpisodes = 0;

    const today =
        new Date();

    for(

        const season

        of

        show.seasons

    ){

        if(

            season.season_number === 0

        )

            continue;

        const seasonData =

            await fetchTMDB(

                `https://api.themoviedb.org/3/tv/${id}/season/${season.season_number}?api_key=${TMDB_API_KEY}&language=fr-FR`

            );

        if(!seasonData)
            continue;

        releasedEpisodes +=

            seasonData.episodes

            .filter(

                episode=>

                    episode.air_date &&

                    new Date(
                        episode.air_date
                    ) <= today

            )

            .length;

    }

    const details={

        seasons:
            show.number_of_seasons,

        episodes:
            releasedEpisodes,

        tmdb:
            show.vote_average,

        updatedAt:
            Date.now()

    };

    cache[id]=details;

    saveSeriesCache(
        cache
    );

    return details;

}

// ======================================================
// LIBRARY ENRICHMENT
// ======================================================

async function enrichLibrary(){

    let updated = false;

    for(

        const show

        of

        library

    ){

        if(

            show.seasons &&
            show.episodes &&
            show.tmdb

        )

            continue;

        const details =

            await getShowDetails(
                show.id
            );

        show.seasons =
            details.seasons;

        show.episodes =
            details.episodes;

        show.tmdb =
            details.tmdb;

        updated = true;

    }

    if(updated){

        saveLibrary(
            library
        );

    }

}

// ======================================================
// PRELOAD
// ======================================================

async function preloadPopularSeries(){

    const firstSeries =

        library.slice(
            0,
            5
        );

    for(

        const show

        of

        firstSeries

    ){

        try{

            await getShowDetails(
                show.id
            );

        }

        catch(error){

            console.error(error);

        }

    }

}

// ======================================================
// SEARCH TMDB
// ======================================================

async function searchTMDB(query){

    const data =

        await fetchTMDB(

            `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`

        );

    if(!data)
        return [];

    return (data.results || [])

        .sort(

            (a,b)=>

                b.popularity

                -

                a.popularity

        );

}

// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard(){

    refreshStorage();

    let totalEpisodes = 0;

    let watchedEpisodes = 0;

    let masterpieces = 0;

    let totalAverage = [];

    const counters={

        all:library.length,

        watching:0,

        completed:0,

        planned:0,

        masterpiece:0

    };

    for(const show of library){

        const notes =

            Object.entries(ratings)

            .filter(

                ([key])=>

                    key.startsWith(
                        `${show.id}-`
                    )

            )

            .map(
                ([,value])=>value
            );

        const ratedEpisodes =
            notes.length;

        const averageScore =
            average(notes);

        totalEpisodes +=

            show.episodes || 0;

        watchedEpisodes +=
            ratedEpisodes;

        if(notes.length){

            totalAverage.push(
                averageScore
            );

        }

        // ===================================
        // STATUS
        // ===================================

        if(ratedEpisodes===0){

            counters.planned++;

        }

        else if(

            ratedEpisodes >=
            (show.episodes || 0)

            &&

            show.episodes

        ){

            counters.completed++;

        }

        else{

            counters.watching++;

        }

        // ===================================
        // MASTERPIECES
        // ===================================

        if(

            notes.length>=10

            &&

            averageScore>=9

        ){

            masterpieces++;

            counters.masterpiece++;

        }

    }

    // ===================================
    // GLOBAL
    // ===================================

    const globalProgress =

        getProgress(

            watchedEpisodes,

            totalEpisodes

        );

    const globalScore =

        totalAverage.length

        ?

        average(
            totalAverage
        )

        :

        0;

    // ===================================
    // DASHBOARD
    // ===================================

    seriesCount.textContent =
        library.length;

    episodesCount.textContent =
        watchedEpisodes;

    episodesTotal.textContent =
        totalEpisodes;

    globalAverage.textContent =

        globalScore

        ?

        globalScore.toFixed(1)

        :

        "—";

    masterpiecesCount.textContent =
        masterpieces;

    dashboardProgress.textContent =

        `${globalProgress}%`;

    // ===================================
    // PROGRESS CIRCLE
    // ===================================

    const circumference = 302;

    dashboardProgressCircle.style.strokeDasharray =
        circumference;

    dashboardProgressCircle.style.strokeDashoffset =

        circumference -

        (

            circumference

            *

            globalProgress

            /

            100

        );

    // ===================================
    // FILTER COUNTERS
    // ===================================

    document.getElementById(
        "countAll"
    ).textContent =
        counters.all;

    document.getElementById(
        "countWatching"
    ).textContent =
        counters.watching;

    document.getElementById(
        "countCompleted"
    ).textContent =
        counters.completed;

    document.getElementById(
        "countPlanned"
    ).textContent =
        counters.planned;

    document.getElementById(
        "countMasterpieces"
    ).textContent =
        counters.masterpiece;

}

// ======================================================
// SERIES HELPERS
// ======================================================

function getSeriesNotes(showId){

    return Object.entries(ratings)

        .filter(

            ([key])=>

                key.startsWith(

                    `${showId}-`

                )

        )

        .map(

            ([,value])=>value

        );

}

function getSeriesAverage(showId){

    return average(

        getSeriesNotes(
            showId
        )

    );

}

function getSeriesProgress(show){

    return getProgress(

        getSeriesNotes(
            show.id
        ).length,

        show.episodes

    );

}

function getSeriesStatus(show){

    const progress =
        getSeriesProgress(show);

    const score =
        getSeriesAverage(show.id);

    if(

        score>=9

        &&

        getSeriesNotes(show.id).length>=10

    ){

        return{

            text:"Chef-d'œuvre",

            class:"masterpiece"

        };

    }

    if(progress===0){

        return{

            text:"À commencer",

            class:"planned"

        };

    }

    if(progress>=100){

        return{

            text:"Terminée",

            class:"completed"

        };

    }

    return{

        text:"En cours",

        class:"watching"

    };

}

// ======================================================
// SERIES CARD
// ======================================================

function createSeriesCard(show){

    const status =
        getSeriesStatus(show);

    const progress =
        getSeriesProgress(show);

    const average =
        getSeriesAverage(show.id);

    const watched =
        getSeriesNotes(show.id).length;

    const card =
        createElement(
            "article",
            "series-card"
        );

    card.innerHTML =

    `
        <div class="series-poster">

            <img
                src="${show.poster}"
                alt="${show.name}"
            >

            <div class="series-overlay"></div>

            <div
                class="series-status ${status.class}"
            >

                ${status.text}

            </div>

            <button
                class="series-menu"
            >

                <i class="fa-solid fa-ellipsis"></i>

            </button>

            <div class="series-rating">

                <i class="fa-solid fa-star"></i>

                ${

                    average

                    ?

                    average.toFixed(1)

                    :

                    "—"

                }

            </div>

        </div>

        <div class="series-content">

            <h3>

                ${show.name}

            </h3>

            <div class="series-info">

                ${show.seasons || "?"} saison${show.seasons > 1 ? "s" : ""}

                •

                ${watched}

                /

                ${show.episodes || "?"}

                épisodes

            </div>

            <div class="series-progress">

                <div
                    class="series-progress-bar"
                >

                    <div

                        class="series-progress-value"

                        style="width:${progress}%"

                    ></div>

                </div>

                <span>

                    ${progress}%

                </span>

            </div>

        </div>
    `;

    // ==========================================
    // OUVRIR LA PAGE
    // ==========================================

    card.addEventListener(

        "click",

        ()=>{

            window.location.href =

                `serie.html?id=${show.id}`;

        }

    );

    // ==========================================
    // MENU
    // ==========================================

    const menuButton =

        card.querySelector(
            ".series-menu"
        );

    menuButton.addEventListener(

        "click",

        event=>{

            event.stopPropagation();

            openSeriesMenu(

                show,

                menuButton

            );

        }

    );

    return card;

}

// ======================================================
// RENDER
// ======================================================

async function renderLibrary(data){

    mySeries.innerHTML = "";

    if(!data.length){

        mySeries.innerHTML=

        `
            <div class="empty-library">

                <h2>

                    Votre collection est vide

                </h2>

                <p>

                    Ajoutez votre première série.

                </p>

            </div>
        `;

        return;

    }

    const visible =

        data.slice(

            0,

            visibleSeries

        );

    visible.forEach(

        show=>{

            mySeries.appendChild(

                createSeriesCard(show)

            );

        }

    );

}

// ======================================================
// MENU CONTEXTUEL
// ======================================================

let openedMenu = null;

function closeSeriesMenu(){

    if(!openedMenu)
        return;

    openedMenu.remove();

    openedMenu = null;

}

function openSeriesMenu(

    show,

    button

){

    closeSeriesMenu();

    const menu =
        createElement(

            "div",

            "series-context-menu"

        );

    menu.innerHTML =

    `
        <button
            data-action="open"
        >

            <i class="fa-solid fa-arrow-up-right-from-square"></i>

            Ouvrir

        </button>

        <button
            data-action="remove"
        >

            <i class="fa-solid fa-trash"></i>

            Supprimer

        </button>
    `;

    document.body.appendChild(
        menu
    );

    const rect =

        button.getBoundingClientRect();

    menu.style.left =

        `${rect.left}px`;

    menu.style.top =

        `${rect.bottom+8}px`;

    openedMenu =
        menu;

    menu

    .querySelector(

        "[data-action='open']"

    )

    .onclick=()=>{

        window.location.href=

        `serie.html?id=${show.id}`;

    };

    menu

    .querySelector(

        "[data-action='remove']"

    )

    .onclick=()=>{

        removeFromLibrary(

            show.id

        );

        closeSeriesMenu();

    };

}

document.addEventListener(

    "click",

    closeSeriesMenu

);

// ======================================================
// FILTERS
// ======================================================

filterButtons.forEach(

    button=>{

        button.addEventListener(

            "click",

            ()=>{

                filterButtons.forEach(

                    chip=>

                        chip.classList.remove(
                            "active"
                        )

                );

                button.classList.add(
                    "active"
                );

                currentFilter =

                    button.dataset.filter;

                visibleSeries =
                    SERIES_PER_PAGE;

                updateCollection();

            }

        );

    }

);

// ======================================================
// SEARCH COLLECTION
// ======================================================

collectionSearch.addEventListener(

    "input",

    debounce(

        event=>{

            currentSearch =

                event.target.value

                .trim()

                .toLowerCase();

            visibleSeries =
                SERIES_PER_PAGE;

            updateCollection();

        },

        250

    )

);

// ======================================================
// SORT
// ======================================================

sortButton.addEventListener(

    "click",

    ()=>{

        switch(currentSort){

            case "recent":

                currentSort="name";
                break;

            case "name":

                currentSort="rating";
                break;

            case "rating":

                currentSort="progress";
                break;

            default:

                currentSort="recent";

        }

        updateCollection();

        showToast(

            `Tri : ${

                {

                    recent:"Plus récent",

                    name:"A → Z",

                    rating:"Meilleure note",

                    progress:"Progression"

                }[currentSort]

            }`

        );

    }

);

// ======================================================
// MODAL
// ======================================================

function openModal(){

    addSeriesModal.classList.remove(
        "hidden"
    );

    searchInput.value = "";

    results.innerHTML = "";

    resultsCount.textContent = "0 résultat";

    searchInput.focus();

}

function closeSeriesModal(){

    addSeriesModal.classList.add(
        "hidden"
    );

}

// ======================================================
// FILTER LIBRARY
// ======================================================

function filterLibrary(data){

    let filtered=[...data];

    // ==========================
    // Search
    // ==========================

    if(currentSearch){

        filtered =

            filtered.filter(

                show=>

                    show.name

                    .toLowerCase()

                    .includes(

                        currentSearch

                    )

            );

    }

    // ==========================
    // Status
    // ==========================

    if(currentFilter!=="all"){

        filtered =

            filtered.filter(

                show=>

                    getSeriesStatus(show)

                    .class===currentFilter

            );

    }

    // ==========================
    // Sort
    // ==========================

    switch(currentSort){

        case "name":

            filtered.sort(

                (a,b)=>

                    a.name.localeCompare(

                        b.name

                    )

            );

            break;

        case "rating":

            filtered.sort(

                (a,b)=>

                    getSeriesAverage(b.id)

                    -

                    getSeriesAverage(a.id)

            );

            break;

        case "progress":

            filtered.sort(

                (a,b)=>

                    getSeriesProgress(b)

                    -

                    getSeriesProgress(a)

            );

            break;

        default:

            filtered.sort(

                (a,b)=>

                    (b.addedAt||0)

                    -

                    (a.addedAt||0)

            );

    }

    return filtered;

}

// ======================================================
// UPDATE COLLECTION
// ======================================================

async function updateCollection(){

    refreshStorage();

    let filtered =

        filterLibrary(

            library

        );

    currentLibrary =
        filtered;

    await renderLibrary(

        filtered

    );

    updateDashboard();

}

// ======================================================
// REMOVE
// ======================================================

function removeFromLibrary(id){

    library =

        library.filter(

            show=>

                show.id!==id

        );

    saveLibrary(

        library

    );

    updateCollection();

    showToast(

        "Série supprimée"

    );

}

// ======================================================
// RECENT SEARCHES
// ======================================================

function addRecentSearch(query){

    let searches = getRecentSearches();

    searches = searches.filter(
        item => item !== query
    );

    searches.unshift(query);

    searches = searches.slice(0,8);

    saveRecentSearches(searches);

}

function loadRecentSearches(){

    recentSearches.innerHTML = "";

    getRecentSearches().forEach(search=>{

        const button = createElement(
            "button"
        );

        button.textContent = search;

        button.onclick = ()=>{

            searchInput.value = search;

            searchSeries();

        };

        recentSearches.appendChild(button);

    });

}

// ======================================================
// SEARCH SERIES
// ======================================================

async function searchSeries(){

    console.log("Recherche lancée");

    const query =

        searchInput.value
        .trim();

    if(!query)
        return;

    addRecentSearch(query);

    loadRecentSearches();

    resultsSection.classList.remove(
        "hidden"
    );

    searchInput.focus();

    results.scrollIntoView({

        behavior:"smooth",

        block:"start"

    });

    results.innerHTML =

    `
        <div class="loading">

            Recherche...

        </div>
    `;

    resultsCount.textContent =
        "Recherche...";

    modalLoading.classList.remove(
        "hidden"
    );

    const series =

        await searchTMDB(
            query
        );

    modalLoading.classList.add(
        "hidden"
    );

    displayResults(
        series
    );

}

// ======================================================
// RESULTS
// ======================================================

function displayResults(series){

    results.innerHTML = "";

    resultsCount.textContent =

        `${series.length} résultat${
            series.length>1
            ?"s":""
        }`;

    if(!series.length){

        results.innerHTML=

        `
            <div class="empty-library">

                <h2>

                    Aucun résultat

                </h2>

            </div>
        `;

        return;

    }

    series.forEach(show=>{

        const alreadyAdded =

            library.some(

                serie=>

                    serie.id===show.id

            );

        const poster =

            show.poster_path

            ?

            `https://image.tmdb.org/t/p/w500${show.poster_path}`

            :

            "https://placehold.co/500x750?text=No+Poster";

        const year =

            show.first_air_date

            ?

            show.first_air_date.split("-")[0]

            :

            "—";

        const card =
            createElement(

                "article",

                "card"

            );

        card.innerHTML=

        `
            <img
                src="${poster}"
                alt="${show.name}"
            >

            <div class="card-content">

                <h3>

                    ${show.name}

                </h3>

                <div class="year">

                    ${year}

                </div>

                <div class="result-meta">

                    <div class="result-score">

                        ⭐

                        ${

                            show.vote_average

                            ?

                            show.vote_average.toFixed(1)

                            :

                            "—"

                        }

                    </div>

                    <span>

                        TMDB

                    </span>

                </div>

                <button class="add-btn">

                    ${

                        alreadyAdded

                        ?

                        "Déjà ajoutée"

                        :

                        "Ajouter"

                    }

                </button>

            </div>
        `;

        card.onclick = ()=>{

            window.location.href =

            `serie.html?id=${show.id}`;

        };

        if(!alreadyAdded){

            card

            .querySelector(".add-btn")

            .onclick = async event=>{

                event.stopPropagation();

                await addToLibrary(show);

            };

        }

        else{

            card

            .querySelector(".add-btn")

            .disabled = true;

        }

        results.appendChild(card);

    });

}

// ======================================================
// ADD TO LIBRARY
// ======================================================

async function addToLibrary(show){

    refreshStorage();

    if(

        library.some(

            serie=>

                serie.id===show.id

        )

    ){

        showToast(

            "Série déjà ajoutée"

        );

        return;

    }

    const details =

        await getShowDetails(
            show.id
        );

    library.unshift({

        id:show.id,

        name:show.name,

        poster:

            show.poster_path

            ?

            `https://image.tmdb.org/t/p/w500${show.poster_path}`

            :

            "https://placehold.co/500x750?text=No+Poster",

        year:

            show.first_air_date

            ?

            show.first_air_date.split("-")[0]

            :

            "—",

        seasons:
            details.seasons,

        episodes:
            details.episodes,

        tmdb:
            details.tmdb,

        addedAt:
            Date.now()

    });

    saveLibrary(
        library
    );

    updateCollection();

    showToast(

        `${show.name} ajoutée`

    );

    closeSeriesModal();

    searchSeries();

}

// ======================================================
// EVENTS
// ======================================================

searchBtn.addEventListener(

    "click",

    searchSeries

);

searchInput.addEventListener(

    "keydown",

    event=>{

        if(event.key==="Enter"){

            searchSeries();

        }

    }

);

collectionSearch.addEventListener(

    "keydown",

    event=>{

        if(event.key==="Enter"){

            searchSeries();

        }

    }

);

discoverBtn.addEventListener(

    "click",

    ()=>{

        const suggestions=[

            "Breaking Bad",

            "Dark",

            "Severance",

            "The Sopranos",

            "Mr. Robot",

            "Succession",

            "Lost",

            "Black Mirror"

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

addSeriesBtn.addEventListener(

    "click",

    openModal

);

addSeriesCard.addEventListener(

    "click",

    openModal

);

closeModal.addEventListener(

    "click",

    closeSeriesModal

);

addSeriesModal.addEventListener(

    "click",

    event=>{

        if(event.target===addSeriesModal){

            closeSeriesModal();

        }

    }

);

document.addEventListener(

    "keydown",

    event=>{

        if(

            event.key==="Escape"

            &&

            !addSeriesModal.classList.contains(
                "hidden"
            )

        ){

            closeSeriesModal();

        }

    }

);

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

// ======================================================
// INFINITE SCROLL
// ======================================================

if(loadMoreTrigger){

    const infiniteObserver =

        new IntersectionObserver(

            async entries=>{

                const entry = entries[0];

                if(!entry.isIntersecting)
                    return;

                if(
                    visibleSeries >=
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
                rootMargin:"350px"
            }

        );

    infiniteObserver.observe(
        loadMoreTrigger
    );

}

// ======================================================
// APPEAR ANIMATION
// ======================================================

const appearObserver =

    new IntersectionObserver(

        entries=>{

            entries.forEach(entry=>{

                if(!entry.isIntersecting)
                    return;

                entry.target.classList.add(
                    "visible"
                );

                appearObserver.unobserve(
                    entry.target
                );

            });

        },

        {
            threshold:.15
        }

    );

// ======================================================
// OBSERVE ELEMENTS
// ======================================================

function observeElements(){

    document

    .querySelectorAll(

        ".series-card,"+

        ".card,"+

        ".dashboard-card,"+

        ".cta-card"

    )

    .forEach(element=>{

        if(
            element.dataset.observed
        )
            return;

        element.dataset.observed = true;

        appearObserver.observe(
            element
        );

    });

}

// ======================================================
// MUTATION OBSERVER
// ======================================================

const mutationObserver =

    new MutationObserver(

        ()=>{

            observeElements();

        }

    );

mutationObserver.observe(

    document.body,

    {

        childList:true,

        subtree:true

    }

);

// ======================================================
// RANDOM PLACEHOLDER
// ======================================================

const placeholders=[

    "Breaking Bad",

    "Dark",

    "Severance",

    "The Sopranos",

    "Mr. Robot",

    "Succession",

    "Black Mirror",

    "Lost",

    "Dexter",

    "The Office",

    "Better Call Saul",

    "Sherlock"

];

setInterval(()=>{

    if(
        document.activeElement===collectionSearch
    )
        return;

    const suggestion =

        placeholders[

            Math.floor(

                Math.random()

                *

                placeholders.length

            )

        ];

    collectionSearch.placeholder =

        `Rechercher : ${suggestion}`;

},5000);

// ======================================================
// PRELOAD
// ======================================================

async function preload(){

    refreshStorage();

    await preloadPopularSeries();

}

// ======================================================
// LOAD
// ======================================================

async function loadPage(){

    refreshStorage();

    await enrichLibrary();

    refreshStorage();

    currentLibrary = [...library];

    visibleSeries = SERIES_PER_PAGE;

    updateDashboard();

    await renderLibrary(
        currentLibrary
    );

    observeElements();

}

// ======================================================
// INIT
// ======================================================

async function init(){

    await loadPage();

    loadRecentSearches();

    preload();

}

init();