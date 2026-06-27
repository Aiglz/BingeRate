/* ================================================= */
/* ELEMENTS */
/* ================================================= */

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const resetBtn = document.getElementById("resetBtn");
const importFile = document.getElementById("importFile");

/* ================================================= */
/* EXPORT */
/* ================================================= */

function exportData(){

    const backup = {};

    for(let i = 0; i < localStorage.length; i++){

        const key = localStorage.key(i);

        try{

            backup[key] = JSON.parse(
                localStorage.getItem(key)
            );

        }

        catch{

            backup[key] = localStorage.getItem(key);

        }

    }

    backup.exportedAt = new Date().toISOString();

    backup.version = "1.0";

    const blob = new Blob(

        [
            JSON.stringify(
                backup,
                null,
                2
            )
        ],

        {
            type:"application/json"
        }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download =

        `bingerate-backup-${
            new Date()
                .toISOString()
                .slice(0,10)
        }.json`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    showToast(
        "✅ Sauvegarde exportée avec succès."
    );

}

/* ================================================= */
/* EVENTS */
/* ================================================= */

if(exportBtn){

    exportBtn.addEventListener(

        "click",

        exportData

    );

}

/* ================================================= */
/* IMPORT */
/* ================================================= */

function importData(){

    importFile.click();

}

if(importBtn){

    importBtn.addEventListener(

        "click",

        importData

    );

}

/* ================================================= */
/* IMPORT FILE */
/* ================================================= */

importFile.addEventListener(

    "change",

    (event)=>{

        const file = event.target.files[0];

        if(!file){

            return;

        }

        const reader = new FileReader();

        reader.onload = ()=>{

            try{

                const backup = JSON.parse(
                    reader.result
                );

                const confirmation = confirm(

                    "Cette sauvegarde remplacera toutes les données actuelles.\n\nContinuer ?"

                );

                if(!confirmation){

                    return;

                }

                localStorage.clear();

                Object.keys(backup).forEach(

                    key=>{

                        if(

                            key === "version" ||

                            key === "exportedAt"

                        ){

                            return;

                        }

                        localStorage.setItem(

                            key,

                            JSON.stringify(
                                backup[key]
                            )

                        );

                    }

                );

                showToast(

                    "✅ Sauvegarde importée avec succès."

                );

                setTimeout(()=>{

                    location.reload();

                },1200);

            }

            catch(error){

                console.error(error);

                alert(

                    "Le fichier sélectionné n'est pas une sauvegarde BingeRate valide."

                );

            }

        };

        reader.readAsText(file);

        importFile.value = "";

    }

);

/* ================================================= */
/* RESET */
/* ================================================= */

function resetData(){

    const confirmation = confirm(

        "⚠️ Cette action supprimera définitivement toutes les données de BingeRate.\n\nCette opération est irréversible.\n\nContinuer ?"

    );

    if(!confirmation){

        return;

    }

    localStorage.clear();

    showToast(

        "🗑️ Toutes les données ont été supprimées."

    );

    setTimeout(()=>{

        location.reload();

    },1200);

}

if(resetBtn){

    resetBtn.addEventListener(

        "click",

        resetData

    );

}

/* ================================================= */
/* TOAST */
/* ================================================= */

function showToast(message){

    let toast = document.getElementById("toast");

    if(!toast){

        toast = document.createElement("div");

        toast.id = "toast";

        document.body.appendChild(toast);

        Object.assign(

            toast.style,

            {

                position:"fixed",

                bottom:"35px",

                right:"35px",

                padding:"18px 24px",

                borderRadius:"18px",

                background:

                    "linear-gradient(135deg,#8b7fff,#6c63ff)",

                color:"#fff",

                fontWeight:"700",

                fontFamily:"Manrope",

                fontSize:"15px",

                zIndex:"99999",

                boxShadow:

                    "0 20px 50px rgba(108,99,255,.45)",

                opacity:"0",

                transform:"translateY(25px)",

                transition:

                    ".35s ease"

            }

        );

    }

    toast.textContent = message;

    toast.style.opacity = "1";

    toast.style.transform = "translateY(0)";

    clearTimeout(

        toast.hideTimeout

    );

    toast.hideTimeout = setTimeout(()=>{

        toast.style.opacity = "0";

        toast.style.transform = "translateY(25px)";

    },2500);

}

/* ================================================= */
/* PAGE LOADED */
/* ================================================= */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        console.log(

            "%cBingeRate Settings",

            "color:#8b7fff;font-size:18px;font-weight:bold;"

        );

        console.log(

            "Settings loaded successfully."

        );

    }

);
