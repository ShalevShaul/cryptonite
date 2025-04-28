/// <reference path="jquery-3.6.0.js" />

let CURRENCIES_URL = "https://api.coingecko.com/api/v3/coins/list";
let CURRENCY_INFO = "https://api.coingecko.com/api/v3/coins"     // + /{id}
let SEARCH_CURRENCY_URL = "https://api.coingecko.com/api/v3/search?query="      // + search box value
let LIVE_REPORTS_URL = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" // + {symbol},{symbol},{symbol}&tsyms=USD

let favorites = [];     // Favorits array to be saved in local storage.
let currenciesArray = [];

function getDataAsync(url) {        // AJAX GET request to URL and returns a Promise.
    return new Promise((resolve, reject) => {
        $.ajax({
            method: "GET",
            url,
            success: data => resolve(data),
            error: e => reject(e)
        })
    })
}

function showLoader() {         // Display a loading circle.
    $("#loader").show();
}

function hideLoader() {         // Hiding the loading circle.
    $("#loader").hide();
}

$(async () => {
    try {       // Make an AJAX request and send the data to displayCurrencies function. 
        $("#aboutSection").hide();
        $("#currenciesSection").hide();
        showLoader();
        const currencies = await getDataAsync(CURRENCIES_URL);
        currenciesArray = currencies.slice(0, 99);
        // currenciesArray = currencies;
        hideLoader();
        loadFavorites();
        displayCurrencies(currenciesArray);
    } catch (error) {
        hideLoader();       // Hiding the loader and display an ERROR message.
        $("#currenciesDiv").html(`
            <div class="error-container">
                <img src="assets/images/Error.png" alt="Error Image">
                <div class="error-message">Can NOT get currencies info</div>
            </div>
            `)
        $("#aboutSection").hide();
        $("#LiveReportsSection").hide();
        $("#currenciesSection").fadeIn();
        console.log("Can NOT get currencies.");
    }

    $("#navForm").on("submit", async (event) => {       // Call displayCurrencies function when searching currencis.
        showLoader();
        event.preventDefault();
        $("#currenciesDiv").html("");
        let searchVal = $("#searchBox").val();
        $("#navForm")[0].reset();
        try {
            const searchCurrencies = await getDataAsync(`${SEARCH_CURRENCY_URL}${searchVal}`);
            console.log(searchCurrencies.coins.length);
            if (searchCurrencies.coins.length === 0) {
                $("#currenciesDiv").html(`
                    <div>
                        <div class="error-container">
                            <img src="assets/images/noResultsFound.png" alt="Error Image">
                            <div class="error-message">No results.</div>
                        </div>
                    </div>`);
            } else {
                displayCurrencies(searchCurrencies.coins);
            }
            hideLoader();
        } catch (error) {
            hideLoader();       // Hiding the loader and display an ERROR message.
            $("#currenciesDiv").html(`
                <div>
                    <h2>ERROR</h2>
                    <div class="errorDiv">Can NOT get currency info.</div>
                </div>`);
            $("#LiveReportsSection").hide();
            $("#aboutSection").hide();
            $("#currenciesSection").fadeIn();
            console.log("Can NOT get search results");
        }
    })

    $("#homeBtn").on("click", () => {       // Displays home div.
        if (currenciesArray.length == 0) {
            console.log("ERROR get home info.");       // Display an ERROR message on the page and in the console.
            $("#currenciesDiv").html(`
                <div class="error-container">
                    <img src="assets/images/Error.png" alt="Error Image">
                    <div class="error-message">Can NOT get currencies info</div>
                </div>
            `);
            $("#aboutSection").hide();
            $("#LiveReportsSection").hide();
            $("#currenciesSection").fadeIn();
        }
        else {
            console.log(currenciesArray);
            displayCurrencies(currenciesArray);
        }
    });

    $("#liveReportsBtn").on("click", () => {        // Displays live reports div.
        $("#aboutSection").hide();
        $("#currenciesSection").hide();
        $("#LiveReportsSection").fadeIn();
        displayLiveCharts();
    })

    $("#aboutBtn").on("click", () => {      // Displays about div.
        $("#aboutSection").html(`
            <div id="aboutDiv" class="aboutDiv">
                <div class="myDetails">
                    <img class="ShalevImg" src="assets/images/Shalev-2.jpg" alt="Shalev's photo">
                    <div class="myProfiles">
                        <a class="facebookProfile" href="https://www.facebook.com/shalevshaul1">
                            <img src="assets/images/icons/facebook_5968764.png" alt="Facebook">
                        </a>
                        <a class="linkedinProfile" href="https://www.linkedin.com/in/shalev-shaul-5843772a3/">
                            <img src="assets/images/icons/linkedin_4782336.png" alt="LinkedIn">
                        </a>
                        <a class="instaProfile" href="https://www.instagram.com/shalev.shaul/">
                            <img src="assets/images/icons/instagram_4138124.png" alt="Instagram">
                        </a>
                        <a class="gitProfile" href="https://github.com/ShalevShaul">
                            <img src="assets/images/icons/git.png" alt="GitHub">
                        </a>
                    </div>
                    <ul>
                        <li>Name: Shalev Shaul</li>
                        <li>Phone: 058-6568674</li>
                        <li>Email: ShalevShaul1@gmail.com</li>
                    </ul>
                </div>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pulvinar eget nibh sit amet dictum. Suspendisse convallis augue nec rhoncus varius. Curabitur pellentesque nisi eu justo dignissim, nec luctus nisl luctus. Ut imperdiet nisl et purus elementum porta. Suspendisse vel augue accumsan, dictum odio vitae, varius dui. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nulla mi ipsum, lobortis in dui lobortis, tincidunt cursus dolor. Duis quis lectus sed turpis luctus dignissim eget eu ipsum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.</p>
            </div>
            `)
        $("#LiveReportsSection").hide();
        $("#currenciesSection").hide();
        $("#aboutSection").fadeIn();
    })

    // Favorits + live reports ====================================

    let chart;
    let dataPoints = {};
    let updateInterval;

    async function displayLiveCharts() {        // displays live charts data for favorite currencies.
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        showLoader();
        try {
            let favorites = JSON.parse(localStorage["favorites"]);
            let symbols = favorites.map(f => f.symbol).join(",");       // Put the favoirts symbols with a comma between them.
            const liveCharts = await getDataAsync(LIVE_REPORTS_URL + symbols + `&tsyms=USD`);
            initializeChart(liveCharts, symbols);
            hideLoader();
            startLiveUpdates(symbols);
        } catch (error) {
            hideLoader();
            console.log("Error Live Charts");       // Display an ERROR message on the page and in the console.
            $("#currenciesDiv").html(`
                <div class="error-container">
                    <img src="assets/images/Error.png" alt="Error Image">
                    <div class="error-message">Can NOT get live info</div>
                </div>
        `);
        }
    }

    function initializeChart(reports, symbols) {    // Initializes the CanvasJS chart with the submitted data
        dataPoints = {};
        let now = new Date();

        let chartConfig = {
            animationEnabled: true,
            title: { text: symbols || "Currencies Charts" },    // graph title
            axisY: { title: "Price in USD" },   // y-asix title
            toolTip: { shared: true },  // tips for data.
            data: []
        };

        if (symbols) {      // Push symbols data to the graph.
            for (let c in reports) {
                dataPoints[c] = [{ x: now, y: reports[c].USD || 0 }];
                chartConfig.data.push({
                    type: "spline",
                    name: c,
                    showInLegend: true,
                    xValueFormatString: "HH:mm:ss",
                    yValueFormatString: "#,##0.# $",
                    dataPoints: dataPoints[c]
                });
            }
        } else {
            chartConfig.subtitles = [{ text: "Add Currencies to favorites to display them here" }];    // displays a message if there are no symbols.
        }

        chart = new CanvasJS.Chart("chartContainer", chartConfig);      // Create a new graph
        chart.render();     // Displays the graph.
        updateChartSize();      // Update graph size.
    }

    function startLiveUpdates(symbols) {    // Receives currencies symbols and Call updateChartData function every two seconds with the live data.
        updateInterval = setInterval(async () => {
            try {
                const liveCharts = await getDataAsync(LIVE_REPORTS_URL + symbols + `&tsyms=USD`);
                updateChartData(liveCharts);
            } catch (error) {
                console.log("ERROR updating live data.");
            }
        }, 2000);
    }

    function updateChartData(reports) {     // Receives the reports and updates the graph.
        let now = new Date();
        for (let c in reports) {
            if (dataPoints[c]) {
                dataPoints[c].push({ x: now, y: reports[c].USD || 0 });

                if (dataPoints[c].length > 30) {    // saves the last 30 points
                    dataPoints[c].shift();
                }
            }
        }
        chart.render();     // Displays the graph.
    }

    function updateChartSize() {        // Setting the width of the graph according to the width of the nav-bar.
        if (chart) {
            chart.set("width", $("nav").width());
            chart.render();
        }
    }
})

// display Currencies function =============================================

function displayCurrencies(currencies) {        // displays currencies on the page.    
    $("#currenciesDiv").html("");
    let idNum = 0;
    for (let currency of currencies.slice(0, 99)) {    // displays only 99 currencies.
        const isChecked = favorites.some(fav => fav.id === currency.id) ? 'checked' : '';   // If the currency is in your favorites, make it checked.
        $("#currenciesDiv").append(`
            <div class="currencyBox col-sm-12 col-md-6 col-lg-4">
                <div class="box">
                    <div class="cardBody" id="cardBody${idNum}">
                        <div class="form-check form-switch">
                            <input class="form-check-input btn-lg" type="checkbox" id="flexSwitch${currency.id}" ${isChecked} onchange="toggleFavorite('${currency.id}', '${currency.symbol}', '${currency.name}')">
                        </div>
                        <h2 class="cardTitle">${currency.symbol}</h2>
                        <p class="cardText">${currency.name}</p>
                        <button id="demoBtn${idNum}" type="button" class="moreInfoBtn" data-bs-toggle="collapse" data-bs-target="#demo${idNum}" onclick="moreInfoDisplay('${currency.id}',${idNum})">More Info</button> 
                    </div>

                    <div id="demo${idNum}" class="collapse"></div>

                </div>
            </div>
        `);
        idNum++;
    }
    $("#aboutSection").hide();
    $("#LiveReportsSection").hide();
    $("#currenciesSection").fadeIn();
}

function toggleFavorite(id, symbol, name) {     // Function to add or remove currencies from favorites.
    const index = favorites.findIndex(fav => fav.id === id);
    if (index === -1) {
        if (favorites.length < 5) {
            favorites.push({ id, symbol, name });   // Add to favorites.
        } else {
            showModal(id, symbol, name);    // call to showModal function if there are 5 favorites.
            return;
        }
    } else {
        favorites.splice(index, 1);     // remove from favorites.
    }
    saveFavorites();        // save to favorites.
    updateFavoritesUI();        // Update displaying favorites.
}

function showModal(newId, newSymbol, newName) {     // show modal function to choose up to 5 favorites.
    const modalBody = $("#modalBody");
    modalBody.html("");
    favorites.forEach(fav => {
        console.log(fav);
        // Add favorits to modal body.
        modalBody.append(`      
            <div class="form-check form-switch">
                <input class="form-check-input btn-lg" type="checkbox" id="modal${fav.id}" checked onchange="updateModalSelection('${fav.id}')">
                <label for="modal${fav.id}">${fav.symbol} - ${fav.name}</label>
            </div>
        `);
    });
    // Add the new selected currency to modal body. 
    modalBody.append(`
        <div class="form-check form-switch">
            <input class="form-check-input btn-lg" type="checkbox" id="modal${newId}" onchange="updateModalSelection('${newId}')">
            <label for="modal${newId}">${newSymbol} - ${newName}</label>
        </div>
    `);
    $("#modalTitle").text("Choose up to 5 favorites");
    // Add save button to save the selected currencies. 
    $(".modal-footer").html(`
        <button type="button" class="btn btn-outline-success" onclick="saveModalSelection('${newId}', '${newSymbol}', '${newName}')">Save</button>
    `);
    $("#myModal").modal('show');    // Displays the modal window.
}

function updateModalSelection(id) {     // function to update the selected currencies from the modal.
    const checkedCount = $("#modalBody input:checked").length;
    if (checkedCount > 5) {
        $(`#modal${id}`).prop('checked', false);    // Preventing more than 5 choices.
    }
    $("#modalBody input").not(":checked").prop('disabled', checkedCount >= 5);      // make last unchecked currency disabled if there are 5 currencies selected.
}

function saveModalSelection(newId, newSymbol, newName) {    // Function to save modal selections
    favorites = [];
    $("#modalBody input:checked").each(function () {
        const id = $(this).attr('id').replace('modal', '');
        const label = $(`label[for="${$(this).attr('id')}"]`).text().split(' - ');
        favorites.push({ id, symbol: label[0], name: label[1] });
    });
    saveFavorites();        // Save the Favorites.
    updateFavoritesUI();        // Update Displaying favorites.
    $("#myModal").modal('hide');        // Hide modal window.
}

function saveFavorites() {      // Saves favorites to local storage.
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadFavorites() {      // Load the favorites from local storage.
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
    }
}

function updateFavoritesUI() {      // Update displaying Favorites.
    $(".form-check-input").each(function () {
        const id = $(this).attr('id').replace('flexSwitch', '');
        $(this).prop('checked', favorites.some(fav => fav.id === id));
    });
}

async function moreInfoDisplay(currencyId, idNum) {     // Displays more currencies info.
    let button = document.getElementById(`demoBtn${idNum}`);
    let cardInfo = $(`#demo${idNum}`);
    let cacheKey = `currency_${currencyId}`;
    let currentTime = new Date().getTime();
    let cachedData = JSON.parse(localStorage.getItem(cacheKey));

    if (cardInfo.hasClass('show')) {
        cardInfo.collapse('hide');
        return;
    }

    cardInfo.collapse('show');

    cardInfo.html('<div class="infoLoader"></div>');        // Displays an loading circle in info card.

    if (cachedData && currentTime - cachedData.timestamp < 120000) {        // Use local cache data if it is current.
        showMoreInfo(cachedData.data.information, idNum);
    } else {
        try {
            const information = await getDataAsync(`${CURRENCY_INFO}/${currencyId}`);       // AJAX request for more currency info.
            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: currentTime,
                data: { information }
            }));

            showMoreInfo(information, idNum);       // Call showMoreInfo function.
        } catch (error) {
            // Display an ERROR message on the page and in the console.
            cardInfo.html(`
                <div class="errorDiv">
                    <h2>ERROR</h2>
                    <div class="error-message">Can NOT get currency info.</div>
                </div>
            `);
            console.log("Can NOT get currency info.");
        }
    }

    // Chnge button text according to the situation.
    if (button.innerText == "More Info") {
        button.innerText = 'Go Back';
    } else {
        button.innerText = 'More Info';
        cardInfo.collapse('hide');
        return;
    }
}

function showMoreInfo(info, id) {       // Displays the more info from the AJAX request on the card collapse.
    let cardInfo = $(`#demo${id}`);
    cardInfo.html(`
        <div class="infoCollapse">
            <div>
                <h4 class="infoTitle">${info.name}</h4>
                <h6>Current Price:</h6>
                <div class="currencyPrice" id="currencyUSD">${info.market_data.current_price.usd}$</div>
                <div class="currencyPrice" id="currencyEUR">${info.market_data.current_price.eur}€</div>
                <div class="currencyPrice" id="currencyILS">${info.market_data.current_price.ils}₪</div>
            </div>
            <div class="ImgInCollapse">
                <img class="currencyImg" src="${info.image.large}" alt="${info.name} img">
            </div>
        </div>
    `);
}
