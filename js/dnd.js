function dragStart(e){
    this.style.opacity = 0.5;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function dragEnd(e) {
    this.style.opacity = 1;
    console.log(e);
    if (e.x < 700) {
        addToList(profile, 'dislikes');
        teller++;
        runProfiles(); 
    }
    else if (e.x > 1200){
        addToList(profile, 'likes');
        teller++;
        runProfiles();
    }
}

document.querySelector('.tinder-profile').addEventListener('dragstart', dragStart, false);
document.querySelector('.tinder-profile').addEventListener('dragend', dragEnd, false);