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
            choice1: parseInt(row["What is your first choice?"]) || -1,
            choice2: parseInt(row["What is your second choice?"]) || -1,
            choice3: parseInt(row["What is your third choice?"]) || -1,
            choice4: parseInt(row["What is your fourth choice?"]) || -1,
            choice5: parseInt(row["What is your fifth choice?"]) || -1,
            choice6: parseInt(row["What is your sixth choice?"]) || -1,
            choice7: parseInt(row["What is your seventh choice?"]) || -1,
            choice8: parseInt(row["What is your eighth choice?"]) || -1,
            choice9: parseInt(row["What is your ninth choice?"]) || -1,
            choice10: parseInt(row["What is your tenth choice?"]) || -1,
            draws: 1 + parseInt(row["How many bonus tickets would you like to use?"])
        };
        
        people.push(person);

        for (var choiceNum = 1; choiceNum <= 10; choiceNum++) {
            var numberInQuestion = person[['choice' + choiceNum]];
            if (numberInQuestion > 0 && dragons.includes(numberInQuestion) == false) {
                dragons.push(numberInQuestion);
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
            if (nextMostDragonChoice > 0 && dragons.includes(nextMostDragonChoice)) {
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
        resultsHtml += winner.name + ' => Dragon ' + winner.dragon + '<br/>';
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