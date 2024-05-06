const adjs = [' dedicated', ' deeply passionate', 'n ambitious', ' self-driven']
const selectorAdjs = document.querySelector('.typewriter')
let i = 0
let j = 0

let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n){
    showSlides(slideIndex += n);
}

function currentSlide(n){
    showSlides(slideIndex = n);
}

function showSlides(n){
    let ind;
    let slides = document.getElementsByClassName("projectSlides");
    let dots = document.getElementsByClassName("dot");
    if (n > slides.length) {slideIndex = 1};
    if (n < 1) {slideIndex = slides.length}
    for(ind = 0; ind < slides.length; ind++){
        slides[ind].style.display = "none"
    }
    for(ind = 0; ind < dots.length; ind++){
        dots[ind].className = dots[ind].className.replace(" active", "");
    }

    console.log(slideIndex-1)
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active"
}

// Typing home page
function writer() {
    
    selectorAdjs.innerText = ''
    if(i >= adjs.length){
        i=0;
    }
    j=0;
    wordTransition()
}

function wordTransition() {
    
    if (j < adjs[i].length ){
        selectorAdjs.innerText += adjs[i][j]
        j++;
        setTimeout(wordTransition, 75);
    }else{
        i++;
    }
}

setInterval(writer, 2500)