let swipeElement = document.querySelector('.tinder-profile')
let hammer = new Hammer(swipeElement);


function swipeRight() {
    console.log('swiped right');
    addToList(profile, 'likes');
    teller++;
    runProfiles(); 
}

function swipeLeft() {
    console.log('swiped left');
    addToList(profile, 'dislikes');
    teller++;
    runProfiles();
}

hammer.on('swiperight', swipeRight)
hammer.on('swipeleft', swipeLeft)


     