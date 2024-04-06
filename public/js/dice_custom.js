"use strict";

//dbox.clear();

var dice_string = '';
var dice_values = [];
var dbox = false;

var dice_callback = function(valores,total){
    let dices_arr = dice_string.split('+');
    let dices_msg = [];
    let cont = 0;

    for (let i = 0; i < dices_arr.length; i++){
        let info = dices_arr[i].split('d');

        for (let x = 0; x < parseInt(info[0]); x++){
            dices_msg.push('d'+info[1]+'|'+valores[cont++]);
        }
    }

    dispatchEvent(new CustomEvent("dice_result", {detail: {message: dices_msg.join(',')}} ));
};

function define_dices(dices, values){
    dice_string = dices;
    dice_values = typeof(values) == 'undefined' ? [] : values;
}

function dice_initialize(container) {
    //$t.remove($t.id('loading_text'));

    define_dices('2d6');

    var canvas = $t.id('canvas');
    canvas.style.width = window.innerWidth - 1 + 'px';
    canvas.style.height = window.innerHeight - 1 + 'px';

    $t.dice.use_true_random = false;

    dbox = new $t.dice.dice_box(canvas, { w: 1000, h: 700 });
    dbox.animate_selector = false;

    $t.bind(window, 'resize', function() {
        canvas.style.width = window.innerWidth - 1 + 'px';
        canvas.style.height = window.innerHeight - 1 + 'px';
        dbox.reinit(canvas, { w: 1000, h: 700 });
    });

    function before_roll(vectors, notation, callback) {
        callback(dice_values);
        dispatchEvent(new CustomEvent("dice_roll", {detail: ''} ));
    }

    function notation_getter() {
        return $t.dice.parse_notation(dice_string);
    }

    function after_roll(notation, result) {
        var total = (result.reduce(function(s, a) { return s + a; }) + notation.constant);

        if (typeof(dice_callback) == 'function') dice_callback(result,total);
    }

    dbox.bind_throw(container, notation_getter, before_roll, after_roll);
}