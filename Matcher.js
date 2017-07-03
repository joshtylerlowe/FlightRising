// Source: http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.

function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp((
    // Delimiters.
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
    // Quoted fields.
    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
    // Standard fields.
    "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
        }
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
            new RegExp("\"\"", "g"), "\"");
        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    // Return the parsed data.
    return (arrData);
}

function CSV2JSON(csv) {
    var array = CSVToArray(csv);
    var objArray = [];
    for (var i = 1; i < array.length; i++) {
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var key = array[0][k];
            objArray[i - 1][key] = array[i][k]
        }
    }

    var json = JSON.stringify(objArray);
    var str = json.replace(/},/g, "},\r\n");

    return str;
}

var chunkify = function (array, size) {
    var results = [];
    while (array.length) {
        results.push(array.splice(0, size));
    }
    return results;
};

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

        data[tier][Object.keys(data[tier])[0]] = chunkify(array, 10);

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
