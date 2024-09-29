import getSector from "./dropDownItems.js";

const prevBtn = document.getElementById("previousButton");
const nextBtn = document.getElementById("nextButton");
const tbody = document.querySelector("tbody");
const tableButtons = document.querySelectorAll("tr button")
const table = document.querySelector("table");
const numberOfCompanies = document.querySelector("#total h4:nth-of-type(1) span");
let totalMarketCap = document.querySelector("#total h4:nth-of-type(2) span");
const rankingButtons = document.querySelectorAll("#ranking-bar button");
const dynamicColumnHeader = document.getElementById("dynamicColumnHeader");

let allStocksByPage = {};
let currentPage = 0;
let itemsPerPage = 50;
let totalItems = 500; 

async function fetchPageData(page) {
    
    if (allStocksByPage[page]) {
        updateUi(); 
        return;
    }

    const start = page * itemsPerPage;
    let end = start + itemsPerPage - 1;

    if (end >= totalItems) {
        end = totalItems - 1;
    }

    const requests = [];

    for (let i = start; i <= end; i++) {
        requests.push(fetch(`http://localhost:3000/${i}`).then(response => response.json()));

    }
   
    try {
        const results = await Promise.all(requests);
        
        allStocksByPage[page] = results.map((data, index) => ({
            ...data,
            originalIndex: start + index // Save the original index
        }));
        const sector = new URLSearchParams(window.location.search).get("sector");
        if (sector) {
            allStocksByPage[page] = allStocksByPage[page].filter(stock => stock.Sector === sector);
        }
        
        updateUi();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function updateUi(rankBy = "marketCap", sortedStocks = null) {
    const sector = new URLSearchParams(window.location.search).get("sector");

    let stocksToShow = sortedStocks || allStocksByPage[currentPage] || [];

    if (sector) {
        document.querySelector(".table-container").style.paddingBottom = "20px";
        if(stocksToShow.length === 0){
           table.innerHTML = `<h1>No available stocks for this page on the ${sector} sector</h1>`;
        }
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
    }
    if(window.location.pathname === "/stock-detail.html") return
    
    switch (rankBy) {
        case "marketCap":
            dynamicColumnHeader.textContent = "Market Cap";
            break;
        case "Ebitda":
            dynamicColumnHeader.textContent = "EBITDA";
            break;
        case "Employees":
            dynamicColumnHeader.textContent = "Employees";
            break;
        case "mcEbitda":
            dynamicColumnHeader.textContent = "MC/EBITDA";
            break;
        default:
            dynamicColumnHeader.textContent = "Market Cap";
    }

    numberOfCompanies.textContent = totalItems.toLocaleString();

    const totalMarketCapValue = stocksToShow.reduce((acc, { Marketcap }) => acc + Marketcap, 0);
    totalMarketCap.textContent = numeral(totalMarketCapValue).format('0.0a');

    tbody.innerHTML = "";
    stocksToShow.forEach(({ Currentprice, City, Marketcap, Revenuegrowth, Shortname, Symbol, logoUrl, Ebitda, Fulltimeemployees,originalIndex }, index) => {
        const row = document.createElement("tr");
        const growthValue = Revenuegrowth * 100;
        let dynamicColumnValue;

        switch (rankBy) {
            case "marketCap":
                dynamicColumnValue = `$${numeral(Marketcap).format('0.0a')}`;
                break;
            case "Ebitda":
                dynamicColumnValue = Ebitda ? `$${numeral(Ebitda).format("0.0a")}` : "N/A";
                break;
            case "Employees":
                dynamicColumnValue = Fulltimeemployees ? Fulltimeemployees.toLocaleString() : 'N/A';
                break;
            case "mcEbitda":
                dynamicColumnValue = Ebitda ? numeral(Marketcap / Ebitda).format('0.0') : 'N/A';
                break;
            default:
                dynamicColumnValue = `$${numeral(Marketcap).format('0.0a')}`;
        }

        row.innerHTML = `
            <th scope="row">${(currentPage * itemsPerPage) + index + 1}</th>
            <td>
                <div class="stock-info">
                    <img src="${logoUrl}" alt="${Symbol} logo" class="stock-logo"/>
                    <div class="stock-names">
                     <a class="stock-details" href="stock-detail.html?page=${currentPage}&index=${originalIndex}&symbol=${Symbol}">
                        <div>${Shortname}</div>
                        <div>${Symbol}</div>
                     </a>
                    </div>
                </div>
            </td>
            <td>${dynamicColumnValue}</td>
            <td>$${Currentprice}</td>
            <td class="revenue-growth"><span></span>${Math.abs(growthValue).toFixed(1)}%</td>
            <td>${City}</td>
        `;

        const formatedGrowth = row.querySelector(".revenue-growth");
        const span = row.querySelector("span");

        if (growthValue > 0) {
            formatedGrowth.style.color = "green";
            span.textContent = "▴";
        } else if (growthValue < 0) {
            formatedGrowth.style.color = "red";
            span.textContent = "▾";
        } else {
            formatedGrowth.style.color = "gray";
        }

        tbody.appendChild(row);
    });

    nextBtn.classList.toggle("disableButton", (currentPage + 1) * itemsPerPage >= totalItems);
    prevBtn.classList.toggle("disableButton", currentPage === 0);
}

let currentRankBy = "marketCap"; 
let currentSortColumn = null;
let isAscending = true; 

// Ranking Buttons Event Listener
rankingButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        currentRankBy = e.target.getAttribute("data-rank");
        updateUi(currentRankBy);
    });
});

// Table Buttons Event Listener
tableButtons.forEach(button => {
    button.addEventListener("click", () => {
        const columnIndex = parseInt(button.getAttribute("data-column"));
        sortTable(columnIndex);
    });
});

function sortTable(columnIndex) {
    let sortedStocks = [...allStocksByPage[currentPage]];

    if (currentSortColumn === columnIndex) {
        isAscending = !isAscending;
    } else {
        isAscending = true;
        currentSortColumn = columnIndex;
    }

    sortedStocks.sort((a, b) => {
        let value;
        switch (columnIndex) {
            case 1:
                value = (a.Shortname || '').localeCompare(b.Shortname || '');
                break;
            case 2:
                value = dynamicSorting(a, b, currentRankBy);
                break;
            case 3:
                value = a.Currentprice - b.Currentprice;
                break;
            case 4:
                value = a.Revenuegrowth - b.Revenuegrowth;
                break;
            case 5:
                value = (a.City || '').localeCompare(b.City || '');
                break;
            default:
                value = 0;
        }
        return isAscending ? value : -value;
    });
    updateUi(currentRankBy, sortedStocks); 
    sortTableIndicator(columnIndex); 
}

function dynamicSorting(a, b, rankBy) {
    let value;
    switch (rankBy) {
        case "marketCap":
            value = (a.Marketcap || 0) - (b.Marketcap || 0);
            break;
        case "Ebitda":
            value = (a.Ebitda || 0) - (b.Ebitda || 0);
            break;
        case "Employees":
            value = (a.Fulltimeemployees || 0) - (b.Fulltimeemployees || 0);
            break;
        case "mcEbitda":
            value = (a.Ebitda && b.Ebitda) ? (a.Marketcap / a.Ebitda) - (b.Marketcap / b.Ebitda) : 0;
            break;
        default:
            value = (a.Marketcap || 0) - (b.Marketcap || 0);
    }
    return value;
}

function sortTableIndicator(columnIndex) {
    const indicators = document.querySelectorAll("tr .sorting");
    indicators.forEach((indicator, index) => {
        
        
        const upArrow = indicator.querySelector("span:first-child");
        const downArrow = indicator.querySelector("span:last-child");
        if (index + 1 === columnIndex) {
            if (isAscending) {
                upArrow.style.color = "black";
                downArrow.style.color = "grey";
            } else {
                upArrow.style.color = "grey";
                downArrow.style.color = "black";
            }
        } else {
            upArrow.style.color = "grey";
            downArrow.style.color = "grey";
        }
    });
}


getSector()

function searchStocks(){
    const input = document.getElementById('autocomplete-input');
    const resultsContainer = document.getElementById('autocomplete-results');
    input.addEventListener("keyup", () => {
        const query = input.value.trim().toLowerCase(); 
        resultsContainer.innerHTML = '';

        if (query.length < 1) {
            resultsContainer.style.display = 'none';
            return;
        }
        // Filter the current page data based on the query
        const filteredStocks = allStocksByPage[currentPage].filter(stock => {
            return stock.Shortname.toLowerCase().includes(query) || 
                stock.Symbol.toLowerCase().includes(query);
        });

        if (filteredStocks.length === 0) {
            resultsContainer.style.display = 'none';
            return;
        }

        // Populate the results container
        filteredStocks.forEach(stock => {
            const item = document.createElement("a");
            item.classList.add("list-group-item", "list-group-item-action");
            item.href = `stock-detail.html?page=${currentPage}&index=${stock.originalIndex}&symbol=${stock.Symbol}`;
            item.innerHTML = `
                <div class="stock-info">
                    <img src="${stock.logoUrl}" alt="${stock.Symbol} logo" class="stock-logo-search"/>
                    <div class="stock-names">
                        <div>${stock.Shortname}</div>
                        <div>${stock.Symbol}</div>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(item);
        });
        resultsContainer.style.display = 'block';
    });

    document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
}

searchStocks()

if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", showPrevPage);
    nextBtn.addEventListener("click", showNextPage);
} 

fetchPageData(currentPage);

function showNextPage() {
    if ((currentPage + 1) * itemsPerPage < totalItems) {
        currentPage++;
        fetchPageData(currentPage);
        window.scrollTo({
            top:0,
            behavior:"smooth"
        })
    }
}

function showPrevPage() {
    if (currentPage > 0) {
        currentPage--;
        updateUi();
        window.scrollTo({
            top:0,
            behavior:"smooth"
        })
    }
}

export default searchStocks;
