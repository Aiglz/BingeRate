// =================================================
// DOM
// =================================================

const hero =
    document.querySelector(
        ".hero"
    );

const logo =
    document.querySelector(
        ".logo"
    );

const button =
    document.querySelector(
        ".start-btn"
    );

const glow =
    document.querySelector(
        ".button-glow"
    );

const posters =

    document.querySelectorAll(
        ".poster"
    );

const arcs =

    document.querySelectorAll(
        ".arc"
    );

// =================================================
// HERO REVEAL
// =================================================

window.addEventListener(

    "load",

    ()=>{

        document.body.classList.add(
            "loaded"
        );

        revealPosters();

    }

);

// =================================================
// POSTERS REVEAL
// =================================================

function revealPosters(){

    posters.forEach(

        (poster,index)=>{

            poster.style.opacity =
                "0";

            poster.style.transform +=
                " scale(.8)";

            setTimeout(

                ()=>{

                    poster.style.transition =

                        `
                        opacity .6s ease,
                        transform .6s ease
                        `;

                    poster.style.opacity =
                        "1";

                    poster.style.transform =

                        poster.style.transform
                        .replace(
                            " scale(.8)",
                            ""
                        );

                },

                index * 120

            );

        }

    );

}

// =================================================
// HELPER
// =================================================

function lerp(
    start,
    end,
    factor
){

    return (

        start +
        (end - start)
        * factor

    );

}

// =================================================
// PARALLAX
// =================================================

let mouseX = 0;
let mouseY = 0;

let currentX = 0;
let currentY = 0;

document.addEventListener(

    "mousemove",

    event => {

        mouseX =

            (
                event.clientX
                /
                window.innerWidth
            )

            - .5;

        mouseY =

            (
                event.clientY
                /
                window.innerHeight
            )

            - .5;

    }

);

// =================================================
// ANIMATION LOOP
// =================================================

function animateParallax(){

    currentX = lerp(
        currentX,
        mouseX,
        .06
    );

    currentY = lerp(
        currentY,
        mouseY,
        .06
    );

    // =====================================
    // POSTERS
    // =====================================

    posters.forEach(

        (poster,index)=>{

            const depth =

                (index + 1)
                * 10;

            const moveX =
                currentX * depth;

            const moveY =
                currentY * depth;

            poster.style.translate =

                `${moveX}px ${moveY}px`;

        }

    );

    // =====================================
    // LOGO
    // =====================================

    logo.style.transform =

        `
        translate(
            ${currentX * 15}px,
            ${currentY * 15}px
        )
        `;

    // =====================================
    // ARCS
    // =====================================

    arcs.forEach(

        (arc,index)=>{

            const depth =

                (index + 1)
                * 6;

            arc.style.transform =

                `
                translateX(-50%)
                translate(
                    ${currentX * depth}px,
                    ${currentY * depth}px
                )
                `;

        }

    );

    requestAnimationFrame(
        animateParallax
    );

}

animateParallax();

// =================================================
// GLOW FOLLOW
// =================================================

document.addEventListener(

    "mousemove",

    event => {

        const rect =

            hero.getBoundingClientRect();

        const x =

            event.clientX -
            rect.left;

        const y =

            event.clientY -
            rect.top;

        glow.style.left =
            `${x - 260}px`;

        glow.style.top =
            `${y - 60}px`;

    }

);

// =================================================
// LOGO SHADOW
// =================================================

document.addEventListener(

    "mousemove",

    ()=>{

        const intensity =

            Math.abs(
                currentX
            )

            +

            Math.abs(
                currentY
            );

        logo.style.textShadow =

            `
            0 0
            ${40 + intensity * 50}px

            rgba(
                139,
                127,
                255,
                .35
            )
            `;

    }

);

// =================================================
// MAGNETIC BUTTON
// =================================================

button.addEventListener(

    "mousemove",

    event => {

        const rect =
            button.getBoundingClientRect();

        const x =

            event.clientX -

            rect.left -

            rect.width / 2;

        const y =

            event.clientY -

            rect.top -

            rect.height / 2;

        button.style.transform =

            `
            translate(
                ${x * .08}px,
                ${y * .08}px
            )
            scale(1.03)
            `;

    }

);

button.addEventListener(

    "mouseleave",

    ()=>{

        button.style.transform =

            `
            translate(0,0)
            scale(1)
            `;

    }

);

// =================================================
// AUTO SHINE
// =================================================

function triggerShine(){

    button.classList.add(
        "shine"
    );

    setTimeout(

        ()=>{

            button.classList.remove(
                "shine"
            );

        },

        1200

    );

}

setInterval(

    triggerShine,

    4500

);

// =================================================
// POSTERS IDLE MOTION
// =================================================

let idleTime = 0;

function animateIdle(){

    idleTime += 0.01;

    posters.forEach(

        (poster,index)=>{

            const wave =

                Math.sin(

                    idleTime +

                    index

                ) * 4;

            poster.style.marginTop =

                `${wave}px`;

        }

    );

    requestAnimationFrame(
        animateIdle
    );

}

animateIdle();

// =================================================
// LOGO LETTER EFFECT
// =================================================

function animateLogo(){

    const spans =

        logo.querySelectorAll(
            "span"
        );

    spans.forEach(

        (span,index)=>{

            span.style.opacity =
                "0";

            span.style.transform =
                "translateY(25px)";

            setTimeout(

                ()=>{

                    span.style.transition =

                        `
                        .8s
                        cubic-bezier(
                            .22,
                            1,
                            .36,
                            1
                        )
                        `;

                    span.style.opacity =
                        "1";

                    span.style.transform =
                        "translateY(0)";

                },

                index * 220

            );

        }

    );

}

animateLogo();

// =================================================
// CTA CLICK
// =================================================

button.addEventListener(

    "click",

    ()=>{

        button.classList.add(
            "launching"
        );

    }

);

// =================================================
// PERFORMANCE
// =================================================

window.addEventListener(

    "blur",

    ()=>{

        document.body.classList.add(
            "paused"
        );

    }

);

window.addEventListener(

    "focus",

    ()=>{

        document.body.classList.remove(
            "paused"
        );

    }

);

// =================================================
// PRELOAD NEXT PAGE
// =================================================

const preload =
    document.createElement(
        "link"
    );

preload.rel =
    "prefetch";

preload.href =
    "pages/series.html";

document.head.appendChild(
    preload
);

// =================================================
// FINAL TOUCH
// =================================================

console.log(

    "%cBingeRate",

    `
    color:#8b7fff;
    font-size:24px;
    font-weight:900;
    `
);

console.log(
    "Ready to binge."
);