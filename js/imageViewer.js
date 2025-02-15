/**
 * This file contains all image viewer specific functions that make it work like it should. To show
 * an image viewer,
 */

export const imageViewerController = (imageViewer) => {
    // Event that happens when the arrow was pressed
    const OnArrowPress = (event) => {
        if(event.key === "ArrowLeft" || event.key === "ArrowRight") {
            for(let i = 0; i < imageViewer.children.length; i++) {
                if(imageViewer.children[i].classList.contains("selected")) {
                    if(i > 1 /* 1 because first is hint */ && event.key === "ArrowLeft") {
                        SetImageViewHead(imageViewer.children[i - 1]);
                        break;
                    }
                    if(i < imageViewer.children.length - 1 && event.key === "ArrowRight") {
                        SetImageViewHead(imageViewer.children[i + 1]);
                        break;
                    }
                }
            }
        }
    }

    // Sets the "head image" of the ImageView and set the smaller image as selected
    const SetImageViewHead = (replacementImage) => {
        Array.from(imageViewer.getElementsByClassName("sideway-scrollable-container")[0].children)  // unselect all images
            .forEach(c => c.classList.remove("selected"));
        replacementImage.classList.add("selected");                                         // select clicked image
        imageViewer.children[0].src     = replacementImage.src;                             // set source of big image
        imageViewer.children[0].onclick = () => window.open(replacementImage.src, "_blank") // on click of big image, open full quality
    }
    return {
        hide: () => {
            imageViewer.style.display = 'none';
            document.removeEventListener("keydown", OnArrowPress);
        },
        show: (year, folder) => {
            imageViewer.style.display = "flex";
            document.addEventListener("keydown", OnArrowPress);
            fetch("/impressions/get_impressions.php?year=" + year + "&folder=" + folder)
            .then(response => response.text())
            .then((data) => {
                const json = JSON.parse(data);
                let first = null;
                console.log()
                const imagesList = imageViewer.getElementsByClassName("sideway-scrollable-container")[0];
                // Clean previous images
                while(imagesList.children.length > 1) {
                    imagesList.removeChild(imagesList.lastChild);
                }

                // Iterate json and add all impressions
                json.forEach(imageName => {
                    const image = document.createElement("img");
                    image.src = "/impressions/" + year + "/" + folder + "/" + imageName;
                    imagesList.appendChild(image);
                    image.onclick = () => SetImageViewHead(image, imageViewer);
                    if(first === null) { first = image; }
                });
                SetImageViewHead(first)
            });
        }
    }
}
