/*
 * This file contains the site specific builder functions which dynamically loads content from 
 * the server (fetch)
 */

import { flyInFromBottom } from "./animations.js";
import { fetchCSV, getIconWithText, loader, createMapCard } from "./util.js";

const months = [ "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ];

// creates the board from /data/board.csv
export const createBoard = (parent) => {
    const boardLoader = loader(parent);
    fetchCSV("/data/board.csv").then(data => {
        data.forEach(ev => {
            // [0] => Title, [1] => Name, [2] => Phone, [3] => Mail, [4] => Image
            const card = document.createElement("card");
            card.classList.add("card");
            parent.appendChild(card);
            
            // Image
            const image = document.createElement("img");
            image.src = "/images/board/" + ev[4];
            image.alt = "Bild von " + ev[0];
            image.classList.add("circle")
            card.appendChild(image);
            
            // Title
            const title = document.createElement("h2");
            title.innerHTML = ev[0];
            card.appendChild(title);

            // Name
            const name = document.createElement("p");
            name.innerHTML = ev[1];
            card.appendChild(getIconWithText("/images/icons/user.svg", "Person", name));

            // Phone
            if(ev[2] !== "") {
                const phone = document.createElement("p");
                phone.innerHTML = ev[2];
                card.appendChild(getIconWithText("/images/icons/phone.svg", "Telefonnummer", phone));
            }

            // Mail
            if(ev[3] !== "") {
                const mail = document.createElement("p");
                mail.innerHTML = ev[3];
                card.appendChild(getIconWithText("/images/icons/mail.svg", "E-Mail Adresse", mail));
            }
        });
        boardLoader.hide();
    }).catch(error => {
        console.error(error);
        const title = document.createElement("h2");
        title.innerHTML = "Daten konnten nicht geladen werden.";
        parent.appendChild(title);
        boardLoader.hide();
    });
}

// creates the dates on the webpage from /data/dates.csv
export const createDates = (parent) => {
    const datesLoader = loader(parent);
    fetchCSV("/data/dates.csv").then(data => {
        data.forEach(ev => createMapCard(parent, ev[0], ev[1], ev[2], ev[3], ev[4], ev[5], ev[6], ev[7] === "true" ? "/images/icons/eurotrial.png" : undefined));
        flyInFromBottom([...document.getElementsByClassName("map-card")]);
        datesLoader.hide();
    }).catch(error => {
        console.error(error)
        const title = document.createElement("h2");
        title.innerHTML = "Daten konnten nicht geladen werden.";
        parent.appendChild(title);
        datesLoader.hide();
    });
}

// create the shop from /data/shop.csv
export const createShop = (parent) => {
    const shopLoader = loader(parent);
    fetchCSV("/data/shop.csv").then(data => {
        data.forEach(ev => {
            // [0] => Title, [1] => First Line, [2] => Second line, [3] => image link  
            const card = document.createElement("div");
            card.classList.add("card");
            parent.appendChild(card);
            
            const image = document.createElement("img");
            image.classList.add("full");
            image.src = "images/shop/" + ev[2];
            image.alt = ev[0];
            card.appendChild(image);

            const title = document.createElement("h2");
            title.innerHTML = ev[0];
            card.appendChild(title);
            
            const row1 = document.createElement("h4");
            row1.innerHTML = ev[1];
            card.appendChild(row1);
        });
        shopLoader.hide();
    }).catch(error => {
        console.error(error);
        const title = document.createElement("h2");
        title.innerHTML = "Daten konnten nicht geladen werden.";
        parent.appendChild(title);
        shopLoader.hide();
    });
}

// creates the ranking using the server side script "list_rankings.php" which returns all rankings on the server:
export const createRankings = (parent) => {
    // {
    // "2024": ["YY_MM_NAME1", "YY_MM_NAME2" ...] => YY_MM is optional, if not specified no date is converted
    // }
    const rankingsLoader = loader(parent);
    fetch("/documents/rankings/list_rankings.php")
    .then(response => response.text())
    .then((data) => {
        const json = JSON.parse(data);
        Object.keys(json).reverse().forEach(year => {
            const title = document.createElement("h2");
            title.innerHTML = year;
            parent.appendChild(title);

            const rankingContainer = document.createElement("div");
            rankingContainer.classList.add("rankings-container");
            parent.appendChild(rankingContainer);

            json[year].reverse().forEach(ranking => {
                let name = ranking.replace(".pdf", "");
                if(name.includes("_")) {
                    name = name.split("_")[2] + " " + name.split("_")[1] + ". " + months[name.split("_")[0] - 1];
                }
                const link = document.createElement("a");
                link.href = "./documents/rankings/" + year + "/" + ranking;
                link.target = "_blank"
                link.classList.add("button-like");
                link.innerHTML = name;
                rankingContainer.appendChild(link);
            });
        });
        rankingsLoader.hide();
    }).catch(error => {
        console.error(error);
        const title = document.createElement("h2");
        title.innerHTML = "Daten konnten nicht geladen werden.";
        parent.appendChild(title);
        rankingsLoader.hide();
    });
}

// create impressions from returned php script (card with image and location, separated by year) While not loaded shows a loading screen
export const createImpressions = (parent, imageViewer) => {
    const impressionsLoader = loader(parent);
    fetch("./impressions/list_impressions.php")
    .then(response => response.text())
    .then((data) => {
        const json = JSON.parse(data);
        Object.keys(json).reverse().forEach(year => {
            // Spacer containing the year
            const spacer = document.createElement("div");
            spacer.classList.add("spacer");
            parent.appendChild(spacer);

            const spacerText = document.createElement("p");
            spacerText.innerHTML = year;
            spacer.appendChild(spacerText);
            Object.keys(json[year]).reverse().forEach(event => {
                const container = document.createElement("card");
                container.classList.add("card");
                container.classList.add("clickable");
                container.onclick = () => {
                    imageViewer.show(year, event);
                };
                parent.appendChild(container);

                const image = document.createElement("img");
                image.classList.add("full")
                image.src = json[year][event];
                container.appendChild(image);

                const place = document.createElement("h2")
                place.innerHTML = event.split("_").slice(2).join(" ");
                container.appendChild(place);
            });
        });
        impressionsLoader.hide();
    });
}

// create course dates from /data/courseDates.csv
export const createCourseDates = (parent) => {
    const courseDatesLoader = loader(parent);
    fetchCSV("/data/courseDates.csv").then(data => {
        data.forEach(ev => createMapCard(parent, ev[0], ev[1], ev[2], ev[3], ev[4], undefined, ev[6], undefined));
        flyInFromBottom([...document.getElementsByClassName("map-card")]);
        courseDatesLoader.hide();
    }).catch(error => {
        console.error(error)
        const title = document.createElement("h2");
        title.innerHTML = "Daten konnten nicht geladen werden.";
        parent.appendChild(title);
        courseDatesLoader.hide();
    });
}
