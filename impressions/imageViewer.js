/**
 * This file contains all image viewer specific functions that make it work like it should. To show
 * an image viewer,
 */

export const imageViewerController = () => {
    const body = document.getElementsByTagName("body")[0];

    const imageViewer = document.createElement("div");
    imageViewer.classList.add("image-viewer");
    body.appendChild(imageViewer);
    
    const titleImage = document.createElement("img");
    titleImage.alt = "Title Image";
    imageViewer.appendChild(titleImage);

    const imagePreview = document.createElement("div");
    imagePreview.classList.add("image-preview-container");
    imageViewer.appendChild(imagePreview);

    const imagePreviewHint = document.createElement("div");
    imagePreviewHint.classList.add("hint");
    imagePreviewHint.innerHTML = "Mehr Bilder →";
    imagePreview.appendChild(imagePreviewHint);

    // Event that happens when the arrow was pressed
    const OnArrowPress = (event) => {
        if(event.key === "ArrowLeft" || event.key === "ArrowRight") {
            for(let i = 0; i < imagePreview.children.length; i++) {
                if(imagePreview.children[i].classList.contains("selected")) {
                    if(i > 1 /* 1 because first is hint */ && event.key === "ArrowLeft") {
                        setImageViewHead(imagePreview.children[i - 1]);
                        break;
                    }
                    if(i < imagePreview.children.length - 1 && event.key === "ArrowRight") {
                        setImageViewHead(imagePreview.children[i + 1]);
                        break;
                    }
                }
            }
        }
    }

    // Sets the "head image" of the ImageView and set the smaller image as selected
    const setImageViewHead = (replacementImage) => {
        Array.from(imagePreview.children)  // unselect all images
            .forEach(c => c.classList.remove("selected"));
        replacementImage.classList.add("selected");                                         // select clicked image
        titleImage.src     = replacementImage.src;                             // set source of big image
        titleImage.onclick = () => window.open(replacementImage.src, "_blank") // on click of big image, open full quality
    }

    // Finally close button => requires methods to be defined
    const closeButton = document.createElement("button");
    closeButton.onclick = () => {
        imageViewer.style.display = 'none';
        document.removeEventListener("keydown", OnArrowPress);
    }
    closeButton.innerHTML = "X";
    imageViewer.appendChild(closeButton);

    return {
        show: (year, folder) => {
            imageViewer.style.display = "flex";
            document.addEventListener("keydown", OnArrowPress);
            fetch("/impressions/get_impressions.php?year=" + year + "&folder=" + folder)
            .then(response => response.text())
            .then((data) => {
                const json = JSON.parse(data);
                let first = null;
                // Clean previous images
                while(imagePreview.children.length > 1) {
                    imagePreview.removeChild(imagePreview.lastChild);
                }
                // Iterate json and add all impressions
                json.forEach(imageName => {
                    const image = document.createElement("img");
                    image.src = "/impressions/" + year + "/" + folder + "/" + imageName;
                    imagePreview.appendChild(image);
                    image.onclick = () => setImageViewHead(image, imageViewer);
                    if(first === null) { first = image; }
                });
                setImageViewHead(first);
            });
        }
    }
}
