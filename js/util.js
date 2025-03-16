/*
 * This file contains general purpose functions like fetching and parsing a CSV or creating an
 * icon/text container
 */

// Fetches a CSV file and returns a promise that, when fulfilled, contains the dismanteld csv file
// In the end a 2 dimensional array is returned. The first dimension contains the row, the second
// the csv entries.
// VAL1;VAL2;VAL3
// 1111;1112;1113
// 2221;2222;2223
// csv[0][2] returns 1113
export const fetchCSV = async (file) => {
    const response = await fetch(file, { cache: 'no-cache' });
    if (response.status !== 200) {
        throw new Error("Couldn't load data");
    }
    const response_1 = response;
    const data = await response_1.text();
    return data
        .split(/\r\n|\n/)               // Split newlines
        .splice(1)                      // Remove header
        .filter(e => e !== "")          // Remove null lines
        .map(e_1 => e_1.split(";"));    // Split values at semicolons
}

// Creates an icon with text for the passed icon and text
export const getIconWithText = (iconSrc, iconAlt, text) => {
    const icon = document.createElement("img");
    icon.src = iconSrc;
    icon.alt = iconAlt;

    const container = document.createElement("div");
    container.classList.add("icon-with-text");
    container.appendChild(icon)
    container.appendChild(text);
    return container;
}


// Adds a date dependend query to a link to force reloading everytime
export const forceCacheRefresh = (elements) => {
    elements.forEach(e => {
        e.href = e.href + "?" + Date.now();
    });
}

// Adds a little offroad loader that can be shown/hidden
export const loader = (parent) => {
    const div = document.createElement("div");
    div.classList.add("loader");
    div.style.display = "flex";
    const img = document.createElement("img");
    img.src = "/images/icons/wheel.png"
    div.appendChild(img);
    const text = document.createElement("p");
    text.innerHTML = "Lädt...";
    div.appendChild(text);
    parent.appendChild(div);

    return {
        show: () => { div.style.display = "flex";},
        hide: () => { div.style.display = "none"; }
    }
}

export const createMapCard = (parent, title, subtitle, date, latitude, longitude, organizer, cancelled, logo) => {
    const card = document.createElement("div");
    card.classList.add("map-card");
    card.classList.add("clickable");
    if(cancelled === "true") {
        card.classList.add("cancelled");
    }
    // if mouse up has same position as mouse down, open google maps
    let mousePosition = undefined;
    card.onmousedown = (e) => { mousePosition = {x: e.clientX, y: e.clientY}; }
    card.onmouseup = (e) => {
        if(mousePosition && mousePosition.x === e.clientX && mousePosition.y === e.clientY) {
            window.open("https://maps.google.com/maps?hl=de&q=" + latitude + "," + longitude, "_blank");
        }
    }

    parent.appendChild(card);

    /**** Card data container ****/
    const data = document.createElement("div");
    card.appendChild(data);

    // Logo
    if(logo !== undefined) {
        const logoElement = document.createElement("img");
        logoElement.classList.add("event-logo");
        logoElement.src = logo;
        logoElement.alt = "Logo der Veranstaltung";
        data.appendChild(logoElement);
    }
    
    // Title
    const titleElement = document.createElement("h2");
    titleElement.innerHTML = title;
    data.appendChild(titleElement);

    // Subtitle
    const subtitleElement = document.createElement("h4");
    subtitleElement.innerHTML = subtitle;
    data.appendChild(subtitleElement);

    // Date
    const dateElement = document.createElement("p");
    dateElement.innerHTML = date;
    data.appendChild(getIconWithText("/images/icons/calendar.svg", "Datum", dateElement))
    
    // Place
    const placeElement = document.createElement("div");
    const latElement = document.createElement("p");
    latElement.classList.add("mono");
    latElement.innerHTML = latitude + "° N";
    placeElement.appendChild(latElement);

    const lngElement = document.createElement("p");
    lngElement.classList.add("mono");
    lngElement.innerHTML = longitude + "° E";
    placeElement.appendChild(lngElement);

    data.appendChild(getIconWithText("/images/icons/map_pin.svg", "Ortschaft", placeElement))

    // Organizer
    if(organizer !== undefined) {
        const organizerElement = document.createElement("p");
        organizerElement.innerHTML = organizer;
        data.appendChild(getIconWithText("/images/icons/user.svg", "Organisator", organizerElement));
    }
    
    /**** Card map container -> Only if valid values ****/
    if(latitude !== "-" && longitude !== "-") {
        const mapDiv = document.createElement("div");
        mapDiv.classList.add("map");
        card.appendChild(mapDiv);
        const map = L.map(mapDiv, { dragging: !L.Browser.mobile, scrollWheelZoom: L.Browser.mobile }).setView([latitude, longitude], 7);
        L.tileLayer('https://tiles1-bc7b4da77e971c12cb0e069bffcf2771.skobblermaps.com/TileService/tiles/2.0/01021113210/7/{z}/{x}/{y}.png@2x?traffic=false', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        L.marker([latitude, longitude], {icon: L.icon({iconUrl: '/images/icons/marker_pin.svg', iconSize: [40, 40], iconAnchor: [20, 40]})}).addTo(map);

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

        // Touchstart with only one finger => remind user to use multiple
        mapDiv.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                mapDiv.classList.add("use-two-fingers");
            } else {
                mapDiv.classList.remove("use-two-fingers");
            }
        });
        mapDiv.addEventListener('touchend',   _ => { mapDiv.classList.remove("use-two-fingers"); });
        mapDiv.addEventListener('mousedown',  _ => { mapDiv.classList.add("zoomable"); map.scrollWheelZoom.enable(); });
        mapDiv.addEventListener('mouseleave', _ => { mapDiv.classList.remove("zoomable"); map.scrollWheelZoom.disable(); });
    }

    return card;
}
