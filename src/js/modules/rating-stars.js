function ratingStars(id, labelText, icon) {
    // --------------------------- Create HTML -------------------------------
    if (document.querySelector(`[rating-id='${id}']`)) {
        const ratingStars = document.querySelector(`[rating-id='${id}']`)

        ratingStars.appendChild(document.createElement('label'))
        ratingStars.firstElementChild.setAttribute('for', `rating-${id}`)
        ratingStars.firstElementChild.innerHTML = labelText

        let ratingVisual = ratingStars.appendChild(document.createElement('div'))
        ratingVisual.classList.add('rating-visual')
        for (let n = 0; n < 5; n++) {
            let star = ratingVisual.appendChild(document.createElement('div'))
            star.setAttribute('data-rating', `${n + 1}`)
            star.classList.add('star-visual')
            star.innerHTML = icon
        }

        let input = ratingStars.appendChild(document.createElement('input'))   
        input.setAttribute('type', 'number')
        input.setAttribute('name', 'rating-input')       
        input.setAttribute('id', `rating-${id}`)
        input.value = '0'
        input.style.display = "none"

        // ---------------------- Logic -----------------------------------------
        const starsVisual = ratingStars.querySelectorAll('.star-visual');

        starsVisual.forEach((star) => {
            star.addEventListener('click', setRating);
            star.addEventListener('mouseover', hoverRating)
            star.addEventListener('mouseout', hoverReset)
        });

        function setRating(event) {
            const selectedStar = event.currentTarget;
            const rating = selectedStar.getAttribute('data-rating');

            starsVisual.forEach((star) => {
                if (star.getAttribute('data-rating') <= rating) {
                    star.classList.add('selected');
                } else {
                    star.classList.remove('selected');
                }
            });
            // console.log(rating);
            input.value = rating
        }

        function hoverRating(event) {
            const hoveredStar = event.currentTarget;
            const rating = hoveredStar.getAttribute('data-rating');

            starsVisual.forEach((star) => {
                if (star.getAttribute('data-rating') <= rating) {
                    star.classList.add('hovered');
                } else {
                    star.classList.remove('hovered');
                }
            });
        }

        function hoverReset(event) {
            const hoveredStar = event.currentTarget;

            starsVisual.forEach((star) => {
                star.classList.remove('hovered');
            });
        }
    } else {
        console.log("Ваш документ не содержит контейнера <div class='ratingStars'></div> !");
    }
}
export default ratingStars