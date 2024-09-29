function getSector() {
    const dropDownItems = document.querySelectorAll(".dropdown-item"); 
    dropDownItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const sector = item.getAttribute("data-sector");

            // Redirect to stocks.html with the selected sector and reset to the first page
            window.location.href = `stocks.html?sector=${sector}`;
        });
    });
}


export default getSector;
