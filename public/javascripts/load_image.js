$(document).ready(async function() {
    const images = $(".logo");
    for (const image of images) {
        const url = $(image).attr("data-src");
        fetch(url)
        .then( (res) => res.json())
        .then( (data) => {
            const src = data['px64x64'];
            $(image).attr("src", src);
        });
    }
});