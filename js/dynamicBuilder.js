/*
 * This file contains the site specific builder functions which dynamically loads content from 
 * the server (fetch)
 */

import { flyInFromBottom } from "./animations.js";
import { fetchCSV, getIconWithText, loader } from "./util.js";

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
        data.forEach(ev => {
            // [0] => Title, [1] => Subtitle, [2] => Date, [3] => Latitude, [4] => Longitude, [5] => Organizer, [6] => Cancelled, [7] => Logo
            const card = document.createElement("div");
            card.classList.add("map-card");
            card.classList.add("clickable");
            if(ev[6] === "true") {
                card.classList.add("cancelled");
            }
            // if mouse up has same position as mouse down, open google maps
            let mousePosition = undefined;
            card.onmousedown = (e) => { mousePosition = {x: e.clientX, y: e.clientY}; }
            card.onmouseup = (e) => {
                if(mousePosition && mousePosition.x === e.clientX && mousePosition.y === e.clientY) {
                    window.open("https://maps.google.com/maps?hl=de&q=" + ev[3] + "," + ev[4], "_blank");
                }
            }
            
            parent.appendChild(card);

            /**** Card data container ****/
            const data = document.createElement("div");
            card.appendChild(data);

            // Logo
            if(ev[7] === "true") {
                const logo = document.createElement("img");
                logo.classList.add("event-logo");
                logo.src = "/images/icons/eurotrial.png";
                logo.alt = "Logo der Veranstaltung";
                data.appendChild(logo);
            }
            
            // Title
            const title = document.createElement("h2");
            title.innerHTML = ev[0];
            data.appendChild(title);

            // Subtitle
            const subtitle = document.createElement("h4");
            subtitle.innerHTML = ev[1];
            data.appendChild(subtitle);

            // Date
            const date = document.createElement("p");
            date.innerHTML = ev[2];
            data.appendChild(getIconWithText("./images/icons/calendar.svg", "Datum", date))
            
            // Place
            const place = document.createElement("div");
            const lat = document.createElement("p");
            lat.classList.add("mono");
            lat.innerHTML = ev[3] + "° N";
            place.appendChild(lat);

            const lng = document.createElement("p");
            lng.classList.add("mono");
            lng.innerHTML = ev[4] + "° E";
            place.appendChild(lng);

            data.appendChild(getIconWithText("./images/icons/map_pin.svg", "Ortschaft", place))

            // Organizer
            const organizer = document.createElement("p");
            organizer.innerHTML = ev[5];
            data.appendChild(getIconWithText("./images/icons/user.svg", "Organisator", organizer))
            
            /**** Card map container -> Only if valid values ****/
            if(ev[3] !== "-" && ev[4] !== "-") {
                const mapDiv = document.createElement("div");
                mapDiv.classList.add("map");
                // Touchstart with only one finger => remind user to use multiple
                mapDiv.addEventListener('touchstart', (event) => {
                    if (event.touches.length === 1) {
                        mapDiv.classList.add("use-two-fingers");
                    } else {
                        mapDiv.classList.remove("use-two-fingers");
                    }
                });
                mapDiv.addEventListener('touchend', (event) => {
                    mapDiv.classList.remove("use-two-fingers");
                });
                card.appendChild(mapDiv);
                const map = L.map(mapDiv, { dragging: !L.Browser.mobile }).setView([ev[3], ev[4]], 7);
                L.tileLayer('https://tiles1-bc7b4da77e971c12cb0e069bffcf2771.skobblermaps.com/TileService/tiles/2.0/01021113210/7/{z}/{x}/{y}.png@2x?traffic=false', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }).addTo(map);
                L.marker([ev[3], ev[4]], {icon: L.icon({iconUrl: './images/icons/marker_pin.svg', iconSize: [40, 40], iconAnchor: [20, 40]})}).addTo(map);

                // Move marker to center between blurred part and right bounds (bottom bound on mobile)
                let verticalCenter   = mapDiv.getBoundingClientRect().height / 2;
                let horizontalCenter = mapDiv.getBoundingClientRect().width / 2;
                if(window.matchMedia("(max-width: 1000px)").matches) {
                    // MOBILE
                    verticalCenter   = (mapDiv.getBoundingClientRect().height - data.getBoundingClientRect().height) / 2;
                    map.setView(map.containerPointToLatLng([horizontalCenter, verticalCenter]));
                } else {
                    // DESKTOP
                    horizontalCenter = (mapDiv.getBoundingClientRect().width - data.getBoundingClientRect().width) / 2;
                    map.setView(map.containerPointToLatLng([horizontalCenter, verticalCenter]));
                }
            }
        });
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
// {
// "2024": ["YY_MM_NAME1", "YY_MM_NAME2" ...] => YY_MM is optional, if not specified no date is converted
// }
// }
export const createRankings = (parent) => {
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

// create impressions from returned php script (card with image and location, separated by year)
// While not loaded shows a loading screen
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
