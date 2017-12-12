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
                    groupPeopleByTier($.parseJSON(CSV2JSON(loadEvent.target.result)));
                };
                loader.readAsText(file);
                
            })(changeEvent.target.files[i]);
        }
    });
});




var groupPeopleByTier = function(data) {
    var groups = Object.create(null);

    for (var i = 0; i < data.length; i++) {
        var item = data[i];

        if (!groups[item["At which financial tier would you like to participate?"]]) {
            groups[item["At which financial tier would you like to participate?"]] = [];
        }

        groups[item["At which financial tier would you like to participate?"]].push({
            name: item["Please enter your Flight Rising username:"],
            id: item["Please enter your Flight Rising ID number:"],
            tier: item["At which financial tier would you like to participate?"],
            reveal: item["Would you like to be revealed to your match or remain anonymous?"],
            giftCategories: item["Which of the following would you be happy to receive from your Secret Santa?"],
            dragon: item["Would you be happy to receive a dragon or dragons from your Secret Santa?"],
            wishlist: item["What is on your wish list?"]
        });
    }

    var result = [];

    for (var x in groups) {
        var obj = {};
        obj[x] = groups[x];
        result.push(obj);
    }

    randomizeTiers(result);
}

var randomizeTiers = function (data) {
    for (var i = 0; i < data.length; i++) {
        var array = data[i][Object.keys(data[i])[0]];

        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    }

    groupRandomizedPeopleByTen(data);
}

var groupRandomizedPeopleByTen = function (data) {
    for (var tier = 0; tier < data.length; tier++) {
        var array = data[tier][Object.keys(data[tier])[0]];

        data[tier][Object.keys(data[tier])[0]] = chunkify(array, 17);

        var howManyGroups = data[tier][Object.keys(data[tier])[0]].length;
        var lengthOfLastGroupInTier = data[tier][Object.keys(data[tier])[0]][howManyGroups - 1].length;
        if (lengthOfLastGroupInTier < 5) {
            debugger;
            data[tier][Object.keys(data[tier])[0]][howManyGroups - 2] = data[tier][Object.keys(data[tier])[0]][howManyGroups - 2].concat(data[tier][Object.keys(data[tier])[0]][howManyGroups - 1]);
            data[tier][Object.keys(data[tier])[0]].pop();
        }
    }

    displayGeneratedGroups(data);
}

var displayGeneratedGroups = function (data) {
    var tableContent;
    $.each(data, function (i, j) {
        var sortedData;
        var sectionTitle;
        if (j["500k and up"]) {
            sectionTitle = "500k";
            sortedData = j["500k and up"];
        } else if (j["100k and up"]) {
            sectionTitle = "100k";
            sortedData = j["100k and up"];
        } else if (j["50k and up"]) {
            sectionTitle = "50k";
            sortedData = j["50k and up"];
        } else if (j["20k and up"]) {
            sectionTitle = "20k";
            sortedData = j["20k and up"];
        }

        
        for (var i = 0; i < sortedData.length; i++) {
            var currentGroup = sortedData[i];
            tableContent += '<tr class="separatorRow"><td>' + sectionTitle + '</td><td colspan="8">GROUP#' + (i+1) + '</td></tr>';
            for (var j = 0; j < currentGroup.length; j++) {
                var currentPerson = currentGroup[j];
                var nextPerson = currentGroup[j + 1] ? currentGroup[j + 1] : currentGroup[0];
                tableContent += //name id tier reveal giftCategories dragon wishlist
                    '<tr>' +
                    '<td>' + currentPerson.reveal + '</td>' +
                    '<td>' + currentPerson.name + '</td>' +
                    '<td>' + currentPerson.id + '</td>' +
                    '<td>' + nextPerson.name + '</td>' +
                    '<td>' + nextPerson.id + '</td>' +
                    '<td>' + nextPerson.tier + '</td>' +
                    '<td>' + nextPerson.giftCategories + '</td>' +
                    '<td>' + nextPerson.dragon + '</td>' +
                    '<td>' + nextPerson.wishlist + '</td>' +
                    '</tr>';
            }
        }
    });
    var table =
        '<table><tbody>' +
        '<tr><td>ANONYMOUS?</td><td>Santa</td><td>Santa ID#</td><td>Match</td><td>Match ID#</td><td>Tier</td><td>Interested In</td><td>Dragons?</td><td>Wishlist</td></tr>' +
        tableContent +
        '</tbody></table>';

    $('#generatedResultsDiv').html(table);
}
