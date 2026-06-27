// =================================================
// DOM
// =================================================

const todayContainer =
    document.getElementById(
        "todayContainer"
    );

const weekContainer =
    document.getElementById(
        "weekContainer"
    );

const futureContainer =
    document.getElementById(
        "futureContainer"
    );

const episodeTemplate =
    document.getElementById(
        "episodeTemplate"
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

// =================================================
// CACHE
// =================================================

function getCalendarCache(){

    return JSON.parse(

        localStorage.getItem(
            "bingeRateCalendarCache"
        )

    ) || {};

}

function saveCalendarCache(
    cache
){

    localStorage.setItem(

        "bingeRateCalendarCache",

        JSON.stringify(cache)

    );

}

// =================================================
// GLOBAL
// =================================================

const DAY_MS =
    86400000;

let upcomingEpisodes =
    [];

// =================================================
// HELPERS
// =================================================

function formatDate(
    dateString
){

    return new Date(
        dateString
    )

    .toLocaleDateString(

        "fr-FR",

        {

            weekday:"long",

            day:"numeric",

            month:"long"

        }

    );

}

function getDaysUntil(
    dateString
){

    const now =
        new Date();

    const target =
        new Date(
            dateString
        );

    return Math.floor(

        (
            target - now
        )

        / DAY_MS

    );

}

function capitalize(
    string
){

    return string.charAt(0)
    .toUpperCase()

    +

    string.slice(1);

}

// =================================================
// EMPTY STATE
// =================================================

function createEmptyState(
    container,
    icon,
    title,
    text
){

    container.innerHTML =

    `
        <div class="empty-state">

            <i class="${icon}"></i>

            <h3>

                ${title}

            </h3>

            <p>

                ${text}

            </p>

        </div>
    `;

}

// =================================================
// LOADING
// =================================================

function showLoading(){

    const skeleton =

    `
        <div
            class="
            skeleton-card
            "
        ></div>

        <div
            class="
            skeleton-card
            "
        ></div>

        <div
            class="
            skeleton-card
            "
        ></div>
    `;

    todayContainer.innerHTML =
        skeleton;

    weekContainer.innerHTML =
        skeleton;

    futureContainer.innerHTML =
        skeleton;

}

// =================================================
// TMDB
// =================================================

async function fetchShowData(
    show
){

    const cache =
        getCalendarCache();

    const cachedShow =
        cache[show.id];

    const now =
        Date.now();

    // cache valide 24h

    if(

        cachedShow

        &&

        now
        -
        cachedShow.updatedAt

        <

        DAY_MS

        *

        1

    ){

        return cachedShow.data;

    }

    try{

        const response =
            await fetch(

                `https://api.themoviedb.org/3/tv/${show.id}?api_key=${TMDB_API_KEY}&language=fr-FR`

            );

        const data =
            await response.json();

        cache[show.id] = {

            updatedAt:
                now,

            data

        };

        saveCalendarCache(
            cache
        );

        return data;

    }

    catch(error){

        console.error(

            "Erreur TMDB",

            error

        );

        return null;

    }

}

// =================================================
// LOAD UPCOMING
// =================================================

async function loadUpcomingEpisodes(){

    showLoading();

    upcomingEpisodes = [];

    const library =
        getLibrary();

    if(
        !library.length
    ){

        createEmptyState(

            todayContainer,

            "fa-solid fa-tv",

            "Bibliothèque vide",

            "Ajoutez une série pour utiliser le calendrier."

        );

        weekContainer.innerHTML =
            "";

        futureContainer.innerHTML =
            "";

        return;

    }

    for(

        const show

        of

        library

    ){

        const data =
            await fetchShowData(
                show
            );

        if(
            !data
        )
            continue;

        const nextEpisode =

            data.next_episode_to_air;

        if(
            !nextEpisode
        )
            continue;

        upcomingEpisodes.push({

            id:
                show.id,

            seriesName:

                data.name

                ||

                show.name,

            poster:

                show.poster

                ||

                data.poster_path,

            airDate:

                nextEpisode.air_date,

            episodeTitle:

                nextEpisode.name,

            season:

                nextEpisode.season_number,

            episode:

                nextEpisode.episode_number,

            overview:

                nextEpisode.overview

                ||

                ""

        });

    }

    upcomingEpisodes.sort(

        (
            a,
            b
        ) =>

        new Date(
            a.airDate
        )

        -

        new Date(
            b.airDate
        )

    );

    splitEpisodes();

}

// =================================================
// SPLIT
// =================================================

function splitEpisodes(){

    const today = [];

    const week = [];

    const future = [];

    const now =
        new Date();

    upcomingEpisodes.forEach(
        episode=>{

            const date =
                new Date(
                    episode.airDate
                );

            const diffDays =

                Math.floor(

                    (
                        date - now
                    )

                    /

                    DAY_MS

                );

            if(
                diffDays <= 0
            ){

                today.push(
                    episode
                );

            }

            else if(
                diffDays <= 7
            ){

                week.push(
                    episode
                );

            }

            else{

                future.push(
                    episode
                );

            }

        }
    );

    renderSection(

        todayContainer,

        today,

        "fa-solid fa-fire",

        "Aucun épisode aujourd'hui",

        "Aucune diffusion prévue aujourd'hui."

    );

    renderSection(

        weekContainer,

        week,

        "fa-solid fa-calendar-week",

        "Rien cette semaine",

        "Aucun épisode dans les 7 prochains jours."

    );

    renderSection(

        futureContainer,

        future,

        "fa-solid fa-clock",

        "Aucune sortie future",

        "Aucune date connue pour le moment."

    );

}

// =================================================
// RENDER SECTION
// =================================================

function renderSection(

    container,

    episodes,

    icon,

    title,

    text

){

    container.innerHTML =
        "";

    if(
        !episodes.length
    ){

        createEmptyState(

            container,

            icon,

            title,

            text

        );

        return;

    }

    episodes.forEach(
        episode=>{

            const card =
                createEpisodeCard(
                    episode
                );

            container.appendChild(
                card
            );

        }
    );

}

// =================================================
// CARD
// =================================================

function createEpisodeCard(
    episode
){

    const clone =

        episodeTemplate
        .content
        .cloneNode(true);

    const card =

        clone.querySelector(
            ".episode-card"
        );

    const poster =

        clone.querySelector(
            ".episode-poster"
        );

    const series =

        clone.querySelector(
            ".episode-series"
        );

    const code =

        clone.querySelector(
            ".episode-code"
        );

    const title =

        clone.querySelector(
            ".episode-title"
        );

    const date =

        clone.querySelector(
            ".episode-date"
        );

    // poster

    if(
        episode.poster
    ){

        poster.src =

            episode.poster
            .startsWith("/")

            ?

            `https://image.tmdb.org/t/p/w500${episode.poster}`

            :

            episode.poster;

    }

    // nom

    series.textContent =
        episode.seriesName;

    // code

    code.textContent =

        `S${episode.season}
        E${episode.episode}`;

    // titre

    title.textContent =

        episode.episodeTitle

        ||

        "Épisode à venir";

    // date

    date.innerHTML =

    `
        <i
            class="
            fa-solid
            fa-calendar-days
            "
        ></i>

        ${capitalize(
            formatDate(
                episode.airDate
            )
        )}
    `;

    addStatusBadge(

        card,

        episode

    );

    addCountdown(

        card,

        episode

    );

    return clone;

}

// =================================================
// STATUS BADGE
// =================================================

function addStatusBadge(
    card,
    episode
){

    const diffDays =

        getDaysUntil(
            episode.airDate
        );

    const badge =
        document.createElement(
            "div"
        );

    badge.classList.add(
        "episode-status"
    );

    if(
        diffDays <= 0
    ){

        badge.classList.add(
            "status-today"
        );

        badge.textContent =
            "AUJOURD'HUI";

    }

    else if(
        diffDays <= 7
    ){

        badge.classList.add(
            "status-week"
        );

        badge.textContent =
            "CETTE SEMAINE";

    }

    else{

        badge.classList.add(
            "status-future"
        );

        badge.textContent =
            "À VENIR";

    }

    card.appendChild(
        badge
    );

}

// =================================================
// COUNTDOWN
// =================================================

function addCountdown(
    card,
    episode
){

    const diffDays =

        getDaysUntil(
            episode.airDate
        );

    const content =

        card.querySelector(
            ".episode-content"
        );

    const countdown =
        document.createElement(
            "div"
        );

    countdown.classList.add(
        "countdown"
    );

    let text = "";

    if(
        diffDays <= 0
    ){

        text =
            "Disponible aujourd'hui";

    }

    else if(
        diffDays === 1
    ){

        text =
            "Dans 1 jour";

    }

    else{

        text =
            `Dans ${diffDays} jours`;

    }

    countdown.innerHTML =

    `
        <i
            class="
            fa-solid
            fa-clock
            "
        ></i>

        ${text}
    `;

    content.appendChild(
        countdown
    );

}

// =================================================
// OVERVIEW
// =================================================

function createOverview(){

    const overview =
        document.createElement(
            "section"
        );

    overview.className =
        "calendar-overview";

    const todayCount =

        upcomingEpisodes.filter(
            e=>

            getDaysUntil(
                e.airDate
            )

            <= 0

        ).length;

    const weekCount =

        upcomingEpisodes.filter(
            e=>{

                const days =

                    getDaysUntil(
                        e.airDate
                    );

                return (

                    days > 0

                    &&

                    days <= 7

                );

            }

        ).length;

    const futureCount =

        upcomingEpisodes.filter(
            e=>

            getDaysUntil(
                e.airDate
            )

            > 7

        ).length;

    overview.innerHTML =

    `
        <div
            class="
            overview-card
            "
        >

            <div
                class="
                overview-icon
                green
                "
            >

                <i
                    class="
                    fa-solid
                    fa-fire
                    "
                ></i>

            </div>

            <div
                class="
                overview-content
                "
            >

                <span>
                    Aujourd'hui
                </span>

                <strong>
                    ${todayCount}
                </strong>

            </div>

        </div>

        <div
            class="
            overview-card
            "
        >

            <div
                class="
                overview-icon
                purple
                "
            >

                <i
                    class="
                    fa-solid
                    fa-calendar-week
                    "
                ></i>

            </div>

            <div
                class="
                overview-content
                "
            >

                <span>
                    Cette semaine
                </span>

                <strong>
                    ${weekCount}
                </strong>

            </div>

        </div>

        <div
            class="
            overview-card
            "
        >

            <div
                class="
                overview-icon
                blue
                "
            >

                <i
                    class="
                    fa-solid
                    fa-clock
                    "
                ></i>

            </div>

            <div
                class="
                overview-content
                "
            >

                <span>
                    Plus tard
                </span>

                <strong>
                    ${futureCount}
                </strong>

            </div>

        </div>

        <div
            class="
            overview-card
            "
        >

            <div
                class="
                overview-icon
                orange
                "
            >

                <i
                    class="
                    fa-solid
                    fa-tv
                    "
                ></i>

            </div>

            <div
                class="
                overview-content
                "
            >

                <span>
                    Séries suivies
                </span>

                <strong>
                    ${getLibrary().length}
                </strong>

            </div>

        </div>
    `;

    const header =

        document.querySelector(
            ".calendar-header"
        );

    header.insertAdjacentElement(
        "afterend",
        overview
    );

}

// =================================================
// INIT
// =================================================

async function initCalendar(){

    await loadUpcomingEpisodes();

    createOverview();

}

initCalendar();