function resize(width) {
    if (width > 1000)
        document.body.style.width = "1000px";
    else
        document.body.style.width = width;
}

window.onload = function() {
     resize(window.innerWidth);
}

window.addEventListener('resize', function(event) {
    resize(event.target.innerWidth);
});
