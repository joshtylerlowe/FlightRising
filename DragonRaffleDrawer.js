$(document).ready(function () {
    $("#myfile").on("change", function (changeEvent) {
        for (var i = 0; i < changeEvent.target.files.length; ++i) {
            (function (file) {
                var loader = new FileReader();
                loader.onload = function (loadEvent) {
                    if (loadEvent.target.readyState != 2)
                        return;
                    if (loadEvent.target.error) {
                        alert("Error while reading file " + file.name + ": " + loadEvent.target.error);
                        return;
                    }
                    doTheThing($.parseJSON(CSV2JSON(loadEvent.target.result)));
                };
                loader.readAsText(file);

            })(changeEvent.target.files[i]);
        }
    });
});

var people = [];
var drawList = [];
var dragons = [];
var winners = [];
var bonusTickets = [];

var doTheThing = function (data) {
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var person = {
            name: row["Username"],
            choice1: row["First choice?"],
            choice2: row["Second choice?"],
            choice3: row["Third choice?"],
            choice4: row["Fourth choice?"],
            choice5: row["Fifth choice?"],
            choice6: row["Sixth choice?"],
            choice7: row["Seventh choice?"],
            choice8: row["Eighth choice?"],
            choice9: row["Ninth choice?"],
            choice10: row["Tenth choice?"],
            draws: 1 + parseInt(row["How many bonus tickets would you like to use?"])
        };
        
        people.push(person);

        for (var choiceNum = 1; choiceNum <= 10; choiceNum++) {
            var dragonInQuestion = person[['choice' + choiceNum]];
            if (dragonInQuestion.length > 0 && dragons.includes(dragonInQuestion) == false) {
                dragons.push(dragonInQuestion);
                break;
            }
        }
    }

    for (var i = 0; i < people.length; i++) {
        var person = people[i];
        for (var j = 0; j < person.draws; j++) {
            drawList.push(person.name);
        }
    }

    while (dragons.length > 0) {
        var randomPerson = getRandomPersonFromDrawList();
        var personDetails = people.find(function (person) { return person.name === randomPerson; });
        drawList = drawList.filter(x => x !== personDetails.name);

        for (var choiceNum = 1; choiceNum <= 10; choiceNum++) {
            var nextMostDragonChoice = personDetails[['choice' + choiceNum]];
            if (nextMostDragonChoice.length > 0 && dragons.includes(nextMostDragonChoice)) {
                dragons = dragons.filter(x => x !== nextMostDragonChoice);
                winners.push({ name: personDetails.name, dragon: nextMostDragonChoice });
                break;
            }

            if (choiceNum == 10) {
                bonusTickets.push(personDetails.name);
            }
        }
    }

    var resultsHtml = '<div class="winners">';

    for (var i = 0; i < winners.length; i++) {
        var winner = winners[i];
        resultsHtml += winner.name + ' => ' + winner.dragon + '<br/>';
    }

    resultsHtml += '</div><br/><br/>';

    resultsHtml += '<div class="bonusTickets">';

    for (var i = 0; i < bonusTickets.length; i++) {
        var bonusTicket = bonusTickets[i];
        resultsHtml += '@' + bonusTicket + ' <br/>';
    }

    resultsHtml += '</div>';

    $('#myform').hide();
    $('#generatedResultsDiv').html(resultsHtml);
};

var getRandomPersonFromDrawList = function () {
    return drawList[Math.floor(Math.random() * drawList.length)];
};