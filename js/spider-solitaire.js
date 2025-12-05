function CardDeck() {
    this.suit = ['s','h','c','d'];
    this.pattern = [];
    this.selectors = [];
    this.newDeck = [];
    this.cards = [];

    var that = this;

    this.getValueFromRadioButton = function(buttons) {
        for(var i = 0; i < buttons.length; i++) {
            this.button = buttons[i];

            if(this.button.checked) {
                this.radioBtnValue = this.button.value;
                return this.radioBtnValue;
            }
        }
        return null;
    }

    //Init Start
    this.init = function() {
        noOfMoves = 0;
        for(var i = 0; i <= 12; i++) {
            this.pattern[i] = i + 101;
        }

        for(i = 0; i < this.radioBtnValue; i++) {
            this.selectors[i] = '';
            for (var j = 12; ;) {
                this.selectors[i] += '.' + this.suit[i] + this.pattern[j];
                if(--j < 0){
                    break;
                }
                this.selectors[i] += ' + ';
            }
        }

        for (i=0; i < this.radioBtnValue; i++) {
            this.pattern.forEach(function(item){
                that.newDeck.push(that.suit[i] + item);
            });
        }
    }

    this.create = function() {
        while (104 / this.newDeck.length > 1)	{
            that.newDeck = that.newDeck.concat(that.newDeck);
        }
        this.cards = that.newDeck;
    }

    this.getCards = function() {
        return this.cards;
    }
}

function CardDealer() {

    var that = this;

    this.shuffle = function(allCardsArr) {
        var i = allCardsArr.length;
        var j, t;
        while(i) {
            j =  Math.floor((i--) * Math.random());
            t = allCardsArr[i];
            allCardsArr[i] = allCardsArr[j];
            allCardsArr[j] = t;
        }
    };

    this.reUpload = function(allCardsArr) {
        var ul = document.createElement('ul');
        for(var i = 0; i < allCardsArr.length; i++) {
            var li = document.createElement('li');
            li.className = 'card closed';
            li.classList.add(allCardsArr[i]);
            li.dataset.card = allCardsArr[i];
            ul.appendChild(li);
        }
        cardDeckEl.innerHTML = ul.innerHTML;
        ul = null;
    }

    this.delivery = function(n, opened, animation) {
        var cols = document.querySelectorAll('.column');
        var c = 0;

        for (var i = 0; i< n; i++) {
            if (opened) {
                cardDeckEl.lastElementChild.classList.add('open');
                cardDeckEl.lastElementChild.classList.remove('closed');
            }

            animation ?
                cols[c].animationAppendChild(cardDeckEl.lastElementChild)
                :	cols[c].appendChild(cardDeckEl.lastElementChild);

            if(++c >= cols.length)
                c = 0;
        }
    }

    this.checkEmpty = function (elems) {
        for (var i = 0; i < elems.length; i++) {
            if(!elems[i].children[0])
                return true;
        }
    }

    this.checkStartDrag = function(target, selectors) {
        var parent = target.parentNode;

        if ( !target.classList.contains('card') ) {
            return
        }
        if ( !target.classList.contains('open') ) {
            return;
        }
        if ( parent.lastElementChild == target ) {
            return true;
        }

        var sibling = target.nextElementSibling;
        var str = '';

        while (sibling) {
            str += ' + .' + sibling.dataset.card;    //contains s112 if the sibling is the queen of spades
            sibling = sibling.nextElementSibling;
        }

        str = '.' + target.dataset.card + str;

        if ( ~selectors.join('').indexOf(str) )
            return true;
    };

    this.showCongratulation = function() {
        document.querySelector('.congratulation').style.display = 'block';
    }

    this.hideCongratulation = function() {
        document.querySelector('.congratulation').style.display = 'none';
    }

    this.hint = function(allCards, allPlaces, selectors) {
        this.hintCount = dealer.hintCount || 0;
        var find = search(this.hintCount) || search(0);
        if (!find) return;

        find[0].classList.add('backlight');

        setTimeout(function() {
            find[1].classList.add('backlight');
        }, 200);

        setTimeout(function() {
            find[0].classList.remove('backlight');
            find[1].classList.remove('backlight');
        }, 1500);

        function search(position) {
            for (var i = position; i < allCards.length; i++) {
                dealer.hintCount = i + 1;
                if (!dealer.checkStartDrag(allCards[i], selectors))
                    continue;
                var card1 = +allCards[i].dataset.card.slice(1);  //returns integer like 105

                for (var j = 0; j < allPlaces.length; j++) {
                    if (allCards[i].parentNode == allPlaces[j].parentNode) continue;
                    var card2 = +allPlaces[j].dataset.card.slice(1);

                    if (card1 + 1 == card2){

                        hintSound = new Sound('music/Spider-solitaire/hint.mp3');
                        hintSound.play();
                        return [allCards[i], allPlaces[j]];

                    }
                }
            }
        }
    };



    this.showMessage = function(text, left, top) {
        if (document.getElementById('message1')) {
            return;
        }
        var el = document.createElement('div');
        el.innerHTML = text;
        el.setAttribute('id', 'message1');
        el.className = 'message';
        el.style.left = left + 'px';
        el.style.top = top + 'px';
        document.body.appendChild(el);
        setTimeout(function() {
            document.body.removeChild(el)
        }, 2500);
    }

    this.showFaq = function(){
        document.getElementById('faq').style.left = '0%';
    }

    this.closeFaq = function(){
        document.getElementById('faq').style.left = '-100%';
    }

    this.closeScoreBoard = function(){
        document.getElementById('scoreBoard').style.display = 'none';
    }


    this.getLimitHeight = function() {
        var lowerEl = document.querySelector('.offside');
        var innerEl = lowerEl.querySelector('.card');
        var innerHeight = 0;
        if (innerEl){
            innerHeight = getComputedStyle(innerEl).height.slice(0, -2);
        }
        return lowerEl.getBoundingClientRect().bottom - innerHeight;
        return false;
    }

    this.setSuitedHeight = function(el, maxHeight) {
        el.dataset.height = '';
        var c = 1;
        while(el.getBoundingClientRect().bottom > maxHeight) {
            el.dataset.height = c;
            if(++c > 5)
                break;
        }
    }

    this.takeAway = function(selectors, dropoutEl, animation) {
        var coinc = [];

        for (var i = 0; i < selectors.length; i++) {
            var elems = document.querySelectorAll('.open' + cardDeck.selectors[i]);
            elems = Array.prototype.slice.call(elems);
            coinc = coinc.concat(elems);
        }

        while (coinc[0]) {
            var p = coinc.pop().parentNode;

            for (var i = 12; i >= 0; i--) {
                animation ?
                    dropoutEl.animationAppendChild(p.lastElementChild) :
                    dropoutEl.appendChild(p.lastElementChild);
                if (p.children[0]) {
                    p.lastElementChild.classList.add('open');
                    p.lastElementChild.classList.remove('closed');
                }
            }
        }
    };
}

Node.prototype.animationAppendChild = function(child) {

    var startCoords = {
        top: child.getBoundingClientRect().top,
        left: child.getBoundingClientRect().left
    }

    this.appendChild(child);

    var endCoords = {
        top: child.getBoundingClientRect().top,
        left: child.getBoundingClientRect().left
    }

    child.style.display = 'none';

    var ghost = document.createElement('div');
    ghost.className = child.className;
    ghost.classList.add('ghost');
    ghost.style.top = startCoords.top - 150 + 'px';
    ghost.style.left = startCoords.left + 'px';
    document.body.insertBefore(ghost,document.body.children[0]);

    var queue = document.querySelectorAll('.ghost').length -2;
    ghost.style.transitionDelay = queue*100 + 'ms';

    setTimeout(function(){
        ghost.style.top = endCoords.top + 'px';
        ghost.style.left = endCoords.left + 'px';
    },0);

    ghost.addEventListener('transitionend', function(e) {
        if (!e.target.parentNode)
            return;
        child.style.display = '';
        ghost.parentNode.removeChild(ghost);
        ghost = null;
    });

    return child;
};

function TimeCounter() {
    this.minutesLabel = document.getElementById("minutes");
    this.secondsLabel = document.getElementById("seconds");
    this.totalSeconds = 0;
    var that = this;

    this.pad = function(val)
    {
        var valString = val + "";
        if(valString.length < 2)
        {
            return "0" + valString;
        }
        else
        {
            return valString;
        }
    }

    this.setTime = function()
    {
        ++that.totalSeconds;
        that.secondsLabel.innerHTML = that.pad(that.totalSeconds%60);
        that.minutesLabel.innerHTML = that.pad(parseInt(that.totalSeconds/60));
    }
}

function DragEvents() {
    this.el = document.getElementById('drag-el');
    this.shiftX = 0;
    this.shiftY = 0;
    var that = this;
    this.parentOld = '';


    //Start Drag
    this.startDrag = function(e) {
        var t = e.target;
        if (!cardDeck || that.el.children[0] || !dealer.checkStartDrag(t, cardDeck.selectors)){
            return;
        }

        that.shiftX = e.pageX - t.getBoundingClientRect().left;
        that.shiftY = e.pageY - t.getBoundingClientRect().top;
        that.el.style.left = e.pageX - that.shiftX + 'px';
        that.el.style.top = e.pageY - that.shiftY + 'px';

        while (t != t.parentNode.lastElementChild) {
            console.log(t.parentNode.lastElementChild);
            that.el.insertBefore(t.parentNode.lastElementChild, that.el.children[0]);
        }

        that.parentOld = t.parentNode;
        that.el.insertBefore(t, that.el.children[0]);
        e.preventDefault();
    }

    //Move Drag
    this.moveDrag = function(e) {
        if ( !that.el.children[0] )
            return;
        console.log('pagex',e.pageX);
        console.log('shiftx',that.shiftX);
        that.el.style.left = e.pageX - that.shiftX + 'px';
        that.el.style.top = e.pageY - that.shiftY + 'px';

        e.preventDefault();
    }

    //End Drag
    this.endDrag = function() {

        if ( !that.el.children[0] )
            return;

        that.parentNew = that.getDroppable(that.el.children[0], that.parentOld);

        while (that.el.children[0]) {
            if (that.parentNew) {
                that.parentNew.appendChild(that.el.children[0]);

            }
            else
                that.parentOld.appendChild(that.el.children[0]);
        }

        if (that.parentNew && that.parentOld.children[0]) {
            that.parentOld.lastElementChild.classList.add('open');
            that.parentOld.lastElementChild.classList.remove('closed');
        }

        if (that.parentNew) {
            dealer.takeAway(cardDeck.selectors, dropout, true);
            dealer.setSuitedHeight(that.parentNew, limitHeight);
            dealer.setSuitedHeight(that.parentOld, limitHeight);
        }

        if (dropout.children.length == 104){
            dealer.showCongratulation();
            clearInterval(timeKeeper);
            UpdateScore();
            bgSound = new Audio('music/Spider-solitaire/bg-music.mp3');
            bgSound.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
            bgSound.play();


        }
    };

    this.getDroppable = function(target, source) {
        if (!target) return;

        var pointX = target.getBoundingClientRect().left + target.offsetWidth/2; //offset width = viewable width inc. padding border scrollbar
        var pointY = target.getBoundingClientRect().top - 3;

        this.container = document.elementFromPoint(pointX, pointY); //returns the top element at the specified coordinates i.e the next hidden card to be opened.
        console.log("container",this.container);

        while (this.container) {
            if (this.container.classList.contains('column'))  //If there is no hidden element
                break;
            this.container = this.container.parentElement;
        }

        if (!this.container || this.container === source)
            return;

        if ( !this.container.children[0] )
            return this.container;

        var cardNum1 = +target.dataset.card.slice(1); //Returns only a number that can be compared --> Represents target
        var cardNum2 = +this.container.lastElementChild.dataset.card.slice(1); // Represents last element of new parent
        if ( cardNum1 + 1 == cardNum2 ) {
            noOfMoves++;
            var moves = document.getElementById("score");
            moves.innerHTML = noOfMoves;
            popSound = new Sound('music/Spider-solitaire/pop.mp3');
            popSound.play();
            return this.container;
        }
        dragSound = new Sound('music/Spider-solitaire/drag.mp3');
        dragSound.play();

    };

}

function Sound(src) {
    this.sound = document.createElement('audio');
    this.sound.src = src;
    this.sound.setAttribute('preload','auto');
    this.sound.setAttribute('controls','none');
    this.sound.style.display = 'none';

    document.body.appendChild(this.sound);

    this.play = function() {
        this.sound.play();
    }

    this.stop = function() {
        this.sound.pause();
    }
}

var ctx = canvas.getContext("2d");
var w = document.body.clientWidth;
var h = document.body.clientHeight;
canvas.width = w;
canvas.height = h;

var nodes = [];

function draw() {
    requestAnimationFrame(draw);

    ctx.font = "72px OpenSans";
    ctx.fillText("You Won!!!",500,300);

    ctx.globalCompositeOperation = "xor";  //defines how new image is drawn in to a existing image
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, w, h);  //left,top,width,height
    ctx.globalCompositeOperation = "lighter";

    var l = nodes.length;
    var node;

    while (l--) {
        node = nodes[l];
        drawNode(node);
        if (node.dead) {
            nodes.splice(l, 1);
        }
    }

    if (nodes.length < 20) {
        l = rand(4, 1) | 0;
        while (l--) {
            nodes.push(
                makeNode(
                    (Math.random() * w) | 0,
                    (Math.random() * h) | 0,
                    100,
                    "hsl(" + (rand(300, 0) | 0) + ", 100%, 50%)",
                    100
                )
            );
        }
    }
}

function drawNode(node) {
    var l = node.children.length,
        point;
    while (l--) {
        point = node.children[l];
        ctx.beginPath();
        ctx.fillStyle = point.color;
        ctx.arc(point.x, point.y, 1, 0, PI2);
        ctx.fill();
        ctx.closePath();
        updatePoint(point);
        if (point.dead) {
            node.children.splice(l, 1);
            if (node.count >100) {
                nodes.push(
                    makeNode(point.x, point.y, node.radius * 10, node.color, (node.count / 10) | 0)
                );
            }
        }
    }
    if (!node.children.length) {
        node.dead = true;
    }
}

function updatePoint(point) {
    var dx = point.x - point.dx;
    var dy = point.y - point.dy;
    var c = Math.sqrt(dx * dx + dy * dy);
    point.dead = c < 1;
    point.x -= dx * point.velocity;
    point.y -= dy * point.velocity;
}

const rad = Math.PI / 180;
const PI2 = Math.PI * 2;
var ttt = 0;

function rand(max, min) {
    min = min || 0;
    return Math.random() * (max - min) + min;
}

function makeNode(x, y, radius, color, partCount) {
    radius = radius || 0;
    partCount = partCount || 0;
    var count = partCount;

    var children = [];
    var kof = 0;
    var r = 0;

    while (partCount--) {
        kof = (100 * Math.random()) | 0;   //bitwise or
        r = (radius * Math.random()) | 0;
        children.push({
            x: x,
            y: y,
            dx: x + r * Math.cos(ttt * kof * rad),
            dy: y + r * Math.sin(ttt * kof * rad),
            color: color,
            velocity: rand(1, 0.06)
        });
        ttt++;
    }

    return {
        radius: radius,
        count: count,
        color: color,
        x: x,
        y: y,
        children: children
    };
}

draw();

var cardDeckEl = document.getElementById('source'); //Source cards
var dropout = document.getElementById('dropout');

dragObj = new DragEvents();
dealer = new CardDealer();
var timeKeeper = 0;
var noOfMoves = 0;
var score = 500;
var limitHeight, cardDeck;


document.getElementById('start-btn').onclick = function() {
    document.querySelector('.home-screen').style.display = 'none';
    document.querySelector('.start-form').style.display = 'block';
    document.querySelector('.control-panel').style.display = 'none';
}

document.forms.startGame.onsubmit = function(e) {
    cardDeck = new CardDeck();
    cardDeck.getValueFromRadioButton(this.radioBtn);
    cardDeck.init();
    cardDeck.create();

    dealer = new CardDealer();
    dealer.shuffle(cardDeck.getCards());
    dealer.reUpload(cardDeck.getCards());
    dealer.delivery(44,false,true);
    dealer.delivery(10,true,true);

    document.querySelector('.control-panel').style.display = 'block';
    document.querySelector('.timer').style.display = 'block';
    document.querySelector('.score').style.display = 'block';
    document.querySelector('.opaque').classList.remove('opaque');

    timer = new TimeCounter();
    timeKeeper = setInterval(timer.setTime, 1000);
    this.style.display = 'none';
    return false;
}

cardDeckEl.onclick = function(e) {
    if (this.lastElementChild != e.target)
        return;
    var empty = dealer.checkEmpty(document.querySelectorAll('.column'));
    if (empty) {
        var msg = 'Cannot send cards to empty column';
        dealer.showMessage(msg,e.pageX-320,e.pageY-80);
        return;
    }
    dealer.delivery(10,true,true);
    //	dealer.takeAway(cardDeck.selectors, dropout, true);
    var cols = document.querySelectorAll('.column');
    limitHeight = dealer.getLimitHeight();
    for (var i = 0; i < cols.length; i++) {
        dealer.setSuitedHeight(cols[i], limitHeight);
    }
}

var moves = document.getElementById("score");

//On Restart Game Button Click
document.querySelector('.btn-new').onclick = function(e) {
    if (!cardDeck) return;
    if (dropout.children.length == 104)
        dealer.hideCongratulation();

    dropout.innerHTML = '';
    var cols = document.querySelectorAll('.column');
    for (var i = 0; i < cols.length; i++) {
        cols[i].innerHTML = '';
    }
    dealer.shuffle(cardDeck.getCards());
    dealer.reUpload(cardDeck.getCards());
    dealer.delivery(44,false,true);
    dealer.delivery(10, true,true);

    noOfMoves = 0;
    var moves = document.getElementById("score");
    moves.innerHTML = noOfMoves;

    timer = new TimeCounter();
    clearInterval(timeKeeper);
    timeKeeper = setInterval(timer.setTime, 1000);
};


document.querySelector('.btn-hint').onclick = function(e) {
    var allCards = document.querySelectorAll('.column .card.open');
    var allPlaces = document.querySelectorAll('.column .card.open:last-child');

    if (allCards.length == 0) {
        return;
    }
    else if (allPlaces.length < 10) {
        var text = 'Fill all the columns for hint :)';
        dealer.showMessage(text, e.pageX-80, e.pageY-80);
        return;
    }
    dealer.hint(allCards, allPlaces, cardDeck.selectors);
};


document.addEventListener('touchstart', function(e) {
    if (e.targetTouches[0].target != e.target) return;
    dragObj.startDrag(e);
});

document.addEventListener('mousedown', function(e) {
    if (e.which != 1){
        return;   //e.which = returns numeric keycode for the key pressed or mouse pressed. numeric keycode for mouse pressed = 1
    }
    dragObj.startDrag(e);
});

document.addEventListener('touchmove', dragObj.moveDrag);
document.addEventListener('mousemove', dragObj.moveDrag);

document.addEventListener('touchend', dragObj.endDrag);
document.addEventListener('mouseup', dragObj.endDrag);


highScores = document.querySelector('ol#high-scores');


var scoreBoard = 	document.getElementById('scoreBoard');
document.querySelector('#high-score-btn').onclick = function() {
    scoreBoard.style.display = 'block';
}


function HighScores() {
    if(typeof(Storage)!=="undefined"){
        var scores = false;
        if(localStorage["highScores"]) {
            highScores.style.display = "block";
            highScores.innerHTML = '';
            scores = JSON.parse(localStorage["highScores"]);
            scores = scores.sort(function(a,b){return parseInt(a)-parseInt(b)});

            for(var i = 0; i < 10; i++){
                var s = scores[i];

                var fragment = document.createElement('li');
                fragment.innerHTML = (typeof(s) != "undefined" ? s : "" );
                highScores.appendChild(fragment);
                console.log(highScores);
            }
        }
    }
    else
    {
        highScores.style.display = "none";
    }
}


HighScores();

function UpdateScore() {
    if(typeof(Storage)!=="undefined"){
        var current = parseInt(moves.innerHTML); //moves=score
        var scores = false;
        if(localStorage["highScores"]) {

            scores = JSON.parse(localStorage["highScores"]);
            scores = scores.sort(function(a,b){return parseInt(a)-parseInt(b)});

            for(var i = 0; i < 10; i++){
                var s = parseInt(scores[i]);

                var val = (!isNaN(s) ? s : 0 );
                if(current > val)
                {
                    val = current;
                    scores.splice(i, 0, parseInt(current));
                    break;
                }
            }

            scores.length = 10;
            localStorage["highScores"] = JSON.stringify(scores);

        } else {
            var scores = new Array();
            scores[0] = current;
            localStorage["highScores"] = JSON.stringify(scores);
        }

        HighScores();
    }
}
