let currentLevel = 0;

let number = [];
let init_number = [];
putValue();
let active = 15;
init(active);
let deadline = new Date(Date.parse(new Date()) + 5 * 60 * 1000);

//alert(init_number[0]);
function init(idN) {
    idN = parseInt(idN)
    $('.clickable').removeClass('clickable');
    let click1;
    if (idN !== 3 && idN !== 7 && idN !== 11) {
        click1 = idN + 1;
        click1 = '#id_' + click1;
        $(click1).addClass('clickable');
    }
    let click2;
    if (idN !== 4 && idN !== 8 && idN !== 12) {
        click2 = idN - 1;
        click2 = '#id_' + click2;
        $(click2).addClass('clickable');
    }
    let click3 = idN + 4;
    click3 = '#id_' + click3;
    $(click3).addClass('clickable');
    let click4 = idN - 4;
    click4 = '#id_' + click4;
    $(click4).addClass('clickable');
    //alert(idN);
}

$(".mainBox").delegate(".clickable", "click", function () {
    let idNo = $(this).attr('id');
    idNo = idNo.split("_");
    active = toggle(idNo[1], active, number);
    init(idNo[1]);
    result(number);
});

function buildLevelScreen() {
    $("#levelGrid").html("");

    chapters.levels.forEach((lvl, index) => {
        $("#levelGrid").append(`
            <div class="levelItem" data-level="${index}" 
                 style="background-image:url('${lvl.image}')">
                <div class="levelNumber">${index+1}</div>
            </div>
        `);
    });

    // Click level to start
    $(".levelItem").click(function () {
        let lvl = $(this).data("level");
        startLevel(lvl);
    });
}

// Call once at page load();
function startLevel(levelIndex) {
    currentLevel = levelIndex;

    $("#levelScreen").hide();
    $("#gameScreen").show();

    putValue();
    init(15);

    $("#demoPic")
        .css("background-image", `url(${chapters.levels[currentLevel].image})`)
        .css("background-size", "155px");
}

$('body').keyup(function (e) {
    if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) {

        if (e.keyCode === 37) {

            if (active !== 15 && active !== 11 && active !== 7 && active !== 3) {
                active = active + 1;
                active = toggle(active, active - 1, number);
                init(active);
            }
        }
        if (e.keyCode === 39) {

            if (active !== 12 && active !== 8 && active !== 4 && active !== 0) {
                active = active - 1;
                active = toggle(active, active + 1, number);
                init(active);
            }
        }
        if (e.keyCode === 38) {
            if (active !== 12 && active !== 13 && active !== 14 && active !== 15) {
                active = active + 4;
                active = toggle(active, active - 4, number);
                init(active);
            }
        }
        if (e.keyCode === 40) {
            if (active !== 0 && active !== 1 && active !== 2 && active !== 3) {
                active = active - 4;
                active = toggle(active, active + 4, number);
                init(active);
            }
        }

        result(number);
    }
});


function result(number) {

    let number_init = [15];
    let x = 0, y = 0;
    for (i = 0; i <= 14; i++) {
        number_init[i] = x + "," + y;
        if (i !== 3 && i !== 7 && i !== 11) {
            x = x - 125;
        } else {
            x = 0;
            y = y - 125;
        }
    }
    if (number.length === 16) {
        //number.splice(15, 1);//number.pop();
        number_init[15] = number[15];
    }
    //alert(number);
    let number1 = number.toString();
    let number_init1 = number_init.toString();
    if (number1 === number_init1) {
        alert("🎉 Level Completed!");

        $("#gameScreen").hide();
        $("#levelScreen").show();

        // currentLevel++;
        // if (currentLevel >= chapters.levels.length) {
        //     alert("🏁 You finished all levels!");
        //     currentLevel = 0;
        // }
        //
        // updateLevelSelectUI();
        // putValue();
        // init(15);

        // alert("CONGRATULATIONS! You won. Start a New Game.");
        // alert("🎉 Level Completed!");
        //
        // currentLevel++;
        // if(currentLevel >= chapters.levels.length){
        //     alert("🏁 You finished all levels!");
        //     currentLevel = 0; // restart if needed
        // }
        //
        // putValue();
        // init(15);
        // initializeClock('timeLeft', deadline);

        //location.reload();
        let deadline = new Date(Date.parse(new Date()) + 5 * 60 * 1000);
        initializeClock('timeLeft', deadline);
        putValue();
        let active = 15;
        init(active);
    }

}
function updateLevelSelectUI() {
    $("#levelSelect").val(currentLevel);
}

function toggle(ID, active, number) {
    $('#id_' + ID + '').removeClass('box');
    $('.activeBox').addClass('box');
    var pos = number[ID].split(",");
    //$('.activeBox').css("background-image", "url(imgs/cats.jpg)");
    $('.activeBox').css("background-position", pos[0] + "px " + pos[1] + "px");
    $('.activeBox').removeClass('activeBox');
    $('#id_' + ID + '').addClass('activeBox');
    number[active] = number[ID];

    return ID;
}

function putValue() {
//var numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
    function shuffle(o) {
        for (let j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

//var numbers = shuffle(numbers);
    let x = 0;
    let y = 0;

    for (i = 0; i <= 14; i++) {

        //document.getElementById("id_"+i).innerHTML  = numbers[i];
        //$("#id_"+i).css("background-position", x+"px "+y+"px");
        init_number[i] = x + "," + y;

        if (i !== 3 && i !== 7 && i !== 11) {
            x = x - 125;
        } else {
            x = 0;
            y = y - 125;
        }
    }
    number = shuffle(init_number);
    //num_y = shuffle(num_y);

    for (let i = 0; i <= 14; i++) {
        let pos = number[i].split(",");
        //alert("Hi");
        //if(number[i]!="1,1")
        $("#id_" + i)
            .css("background-image", `url(${chapters.levels[currentLevel].image})`)
            .css("background-size", "500px 500px")
            .css("background-position", pos[0] + "px " + pos[1] + "px");

        // $("#id_" + i).css("background-position", pos[0] + "px " + pos[1] + "px");
        // $("#id_" + i)
        //     .css("background-image", `url(${chapters.levels[currentLevel].image})`)
        //     .css("background-position", pos[0] + "px " + pos[1] + "px");
    }
}

/*----------TIME--------*/
function getTimeRemaining(endtime) {
    let t = Date.parse(endtime) - Date.parse(new Date());
    let seconds = Math.floor((t / 1000) % 60);
    let minutes = Math.floor((t / 1000 / 60) % 60);
    return {
        'total': t,
        'minutes': minutes,
        'seconds': seconds
    };
}

function initializeClock(id, endtime) {
    let clock = document.getElementById(id);
    let minutesSpan = clock.querySelector('.minutes');
    let secondsSpan = clock.querySelector('.seconds');

    function updateClock() {
        let t = getTimeRemaining(endtime);
        minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
        secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

        if (t.total <= 0) {
            clearInterval(timeinterval);
            // alert("SORRY!!! You lost the game :( Please try again.");
            var deadline = new Date(Date.parse(new Date()) + 5 * 60 * 1000);
            initializeClock('timeLeft', deadline);
            putValue();
            var active = 15;
            init(active);
        }
    }
    updateClock();
    var timeinterval = setInterval(updateClock, 1000);
}

chapters.levels.forEach((lvl, index) => {
    $("#levelSelect").append(`<option value="${index}">Level ${index + 1}</option>`);
});

$("#levelSelect").change(function () {
    currentLevel = parseInt($(this).val());
    putValue();
    init(15);
});
$("#demoPic")
    .css("background-image", `url(${chapters.levels[currentLevel].image})`)
    .css("background-size", "155px")
    .css("background-position", "center");

// chapters.levels.forEach((lvl, index) => {
//     $("#levelSelect").append(`<option value="${index}">Level ${index+1}</option>`);
// });
//
// $("#levelSelect").change(function(){
//     currentLevel = parseInt($(this).val());
//     putValue();
//     init(15);
// });

initializeClock('timeLeft', deadline);