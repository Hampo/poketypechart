const Types = [
  "Bug", "Dark", "Dragon", "Electric", "Fairy", "Fighting", "Fire", "Flying", "Ghost", "Grass", "Ground", "Ice", "Normal", "Poison", "Psychic", "Rock", "Steel", "Water"
]

const fairyIndex = Types.indexOf("Fairy");

const COLORS_MAX = 3;
const COLORS_MIN = -2;

window.addEventListener("load", () => {
  const mainDiv = document.getElementById("main");
  fillBoard(mainDiv);

  mainDiv.addEventListener("click", (ev) => { mark(1)(ev); ev.preventDefault(); });
  mainDiv.addEventListener("contextmenu", (ev) => { mark(-1)(ev); ev.preventDefault(); });
  mainDiv.addEventListener("mouseleave", unHighlight(mainDiv));

  document.getElementById("fairyButton").addEventListener("click", toggleFairy);
  document.getElementById("uploadLogButton").addEventListener("click", uploadLog);
  document.getElementById("outputTxt").value = "";
  document.getElementById("displayCSVButton").addEventListener("click", showConfirmationCSV);
  document.getElementById("hideCSVButton").addEventListener("click", hideConfirmationCSV);
});

function toggleFairy()
{
  if(Types.includes("Fairy")) 
  {
    Types.splice(fairyIndex, 1);
    document.getElementById("fairyButton").value = "add fairy";
  }
  else {
    Types.splice(fairyIndex, 0, "Fairy");
    document.getElementById("fairyButton").value = "remove fairy";
  }
  fillBoard(document.getElementById("main"));
}

function uploadLog()
{
  var randoLogFile = document.getElementById("randoLogFile");
  if (randoLogFile.files.length === 0)
  {
    alert("No file selected.");
  }
  else
  {
    var file = randoLogFile.files[0];
    if (file.type && !(file.type === "application/vnd.ms-excel" || file.type === "text/plain" || file.type === "text/csv"))
    {
      alert("File must be a CSV.");
    }
    else
    {
      var reader = new FileReader();
      reader.addEventListener("load", parseCSV);
      reader.readAsText(file);
    }
  }
}

// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
            ){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );

        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
                );

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}

function parseCSV(ev)
{
  var csv = ev.target.result;
  var csvArray = CSVToArray(csv);
  var main = document.getElementById("main");
  for (var i = 1; i < csvArray.length; i++)
  {
    var row = csvArray[i];
    for (var j = 1; j < row.length; j++)
    {
      console.log(i * Types.length + j);
      var cell = main.children[i * (Types.length + 1) + j];
      while (cell.children.length > 0) cell.removeChild(cell.firstChild);
      var marking;
      switch (csvArray[i][j])
      {
        case "0.5":
          marking = -1;
          break;
        case "0":
          marking = 3;
          break;
        case "1":
          marking = 1;
          break;
        case "2":
          marking = 2;
          break;
      }
      cell.dataset.mark = marking;
      if(marking === 3) {
        cell.append(htmlToElement(`<img src="exedout.png" />`))
      }
    }
  }
}

function highlight(div, idx) {
  return () =>
  {
    const colCount = Types.length + 1;
    const col = idx % colCount;
    const row = Math.floor(idx / colCount);
    [...div.children].forEach((el, jdx) => {
      const colj = jdx % colCount;
      const rowj = Math.floor(jdx / colCount);
      if(colj == col || rowj == row) {
        el.classList.add("highlighted");
      } else {
        el.classList.remove("highlighted");
      }
    })
  }
}

function unHighlight(div) {
  return () =>
  {
    [...div.children].forEach((el) => {
      el.classList.remove("highlighted");
    })
  }
}

function mark(d) {
  return ({ target }) => {
    if (target.classList.contains("type-table-blank")) {
      const marking = Math.min(COLORS_MAX, Math.max(COLORS_MIN, (Number.parseInt(target.dataset.mark) | 0) + d));
      target.dataset.mark = marking;
      while (target.children.length > 0) target.removeChild(target.firstChild);
      if(marking === 3) {
        target.append(htmlToElement(`<img src="exedout.png" />`))
      }
    }
  }
}

function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

function clearBoard(div) {
  while (div.children.length > 0) div.removeChild(div.firstChild);
}

function fillBoard(div) {
  clearBoard(div);
  div.append(htmlToElement(`<div class="top-of-type-table-blank"></div>`));
  div.append(...Types.map(type => htmlToElement(`<div class="type-table-header"><img title="${type}" src="types/Icon_${type}.webp" /></div>`)));
  div.append(...Types.flatMap(type => [
    htmlToElement(`<div class="type-table-header"><img title="${type}" src="types/Icon_${type}.webp"/></div>`),
    ...Types.map(_ => htmlToElement(`<div class="type-table-blank"></div>`))]
  ));
  [...div.children].forEach((el, idx) => {
    el.addEventListener("mouseenter", highlight(div, idx));
  })

  document.body.style.setProperty("--columns", Types.length + 1);
}

function mapMarking(mark) {
  switch(mark) {
    case 1 : return "1";
    case 2 : return "2";
    case 3 : return "0";
    case -1: return "0.5";
    default: return "_";
  }

}

function getTypeChartConfirmationCSV() {
  let csv = "_," + Types.map(x => x.toUpperCase().substring(0,3)).join(",") + "\n";
  Types.forEach( (x, idx) =>
    { csv += x+",";
      csv += [...document.getElementById("main").children].slice((idx+1)*(Types.length+1)+1, (idx+2)*(Types.length+1)).map(x => mapMarking(x.dataset.mark | 0)).join(",") + "\n" }
  )
  return csv;
}

function showConfirmationCSV() {
  const outputTextField = document.getElementById("outputTxt");
  outputTextField.classList.remove("hidden");
  outputTextField.value = getTypeChartConfirmationCSV();
  document.getElementById("hideCSVButton").classList.remove("hidden");
}

function hideConfirmationCSV() {
  const outputTextField = document.getElementById("outputTxt");
  outputTextField.classList.add("hidden");
  outputTextField.value = "";
  document.getElementById("hideCSVButton").classList.add("hidden");
}