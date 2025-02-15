/*
 * This file contains all javascript dependend animations like making an element follow the mouse
 */

// Passed elements follow the mouse
export const followMouse = (elements) => {
    let imageXOffset = -0.5;
    let imageYOffset = -0.5;

    let posXOld = 0;
    let posYOld = 0;

    document.addEventListener("mousemove", e => {
        const deltaX = (e.clientX - posXOld) / 500
        const deltaY = (e.clientY - posYOld) / 500
      
        posXOld = e.clientX;
        posYOld = e.clientY;
        
        imageXOffset = Math.min(0, Math.max(-1, imageXOffset + deltaX));
        imageYOffset = Math.min(0, Math.max(-1, imageYOffset + deltaY));

        elements.forEach(element => {
            element.style.left = imageXOffset + "vw"; 
            element.style.top  = imageYOffset + "vw";
        });
    }, false);
}

// Passed elements follow scroll in an inverse manner
export const followScrollInverse = (elements) => {
    document.addEventListener("scroll", _ => {
        const scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
        elements.forEach(element => {
            element.style.top = -1 * scrollPosition / 2 + "px";
        });
    }, false);
}

// When top (plus offset) reaches bottom of screen, start reducing margin (thus making a fly in animation)
export const flyInFromBottom = (elements) => {
    document.addEventListener("scroll", _ => {
        Array.from(elements).forEach(element => {
            const offsetFromBottom = window.innerHeight - element.getBoundingClientRect().top + parseInt(getComputedStyle(element).marginTop); // represents the offset of the sections start to the screens center
            if(offsetFromBottom > 0) {
                element.style.marginTop = Math.min(16, Math.max(0, 16 - offsetFromBottom / 20)) + "vh"; 
            } else {
                element.style.marginTop = 0; // if the element is out of bounds, set it's margin to 0 (so anchor link jumping works)
            }
            
        });
    }, false);
}

// Allows a veritcally scrollable container to be grabbed by a mouse event and moved
export const mouseDragSideways = (elements) => {
    Array.from(elements).forEach(element => { 
        let canDrag = false;
        let initialMousePositionX;
        let initialScrollPosition;

        element.addEventListener('mousedown', (e) => {
            canDrag               = true;
            element.style.cursor  = 'grabbing';
            initialMousePositionX = e.pageX;
            initialScrollPosition = element.scrollLeft;
        });
    
        element.addEventListener('mouseleave', () => {
            canDrag              = false;
            element.style.cursor = 'grab';
        });
    
        element.addEventListener('mouseup', () => {
            canDrag              = false;
            element.style.cursor = 'grab';
        });
    
        element.addEventListener('mousemove', (e) => {
            if (!canDrag) return;
            e.preventDefault();
            element.scrollLeft = initialScrollPosition - (e.pageX /* mouse position */ - initialMousePositionX);
        });
    });
}
