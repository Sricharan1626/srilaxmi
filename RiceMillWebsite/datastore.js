document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem("riceMillData")) {
        localStorage.setItem("riceMillData", JSON.stringify([]));
    }

    const dataEntryTab = document.getElementById("dataEntryTab");
    const dataViewerTab = document.getElementById("dataViewerTab");
    const dataEntrySection = document.getElementById("dataEntry");
    const dataViewerSection = document.getElementById("dataViewer");
    const villageSelect = document.getElementById("village");
    const newVillageContainer = document.getElementById("newVillageContainer");
    const newVillageInput = document.getElementById("newVillage");

    dataEntryTab.addEventListener("click", function () {
        dataEntrySection.style.display = "block";
        dataViewerSection.style.display = "none";
        dataEntryTab.classList.add("active-tab");
        dataViewerTab.classList.remove("active-tab");
    });

    dataViewerTab.addEventListener("click", function () {
        dataEntrySection.style.display = "none";
        dataViewerSection.style.display = "block";
        dataEntryTab.classList.remove("active-tab");
        dataViewerTab.classList.add("active-tab");
        displayData();
    });

    dataEntrySection.style.display = "block";
    dataViewerSection.style.display = "none";
    dataEntryTab.classList.add("active-tab");

    villageSelect.addEventListener("change", function () {
        if (villageSelect.value === "other") {
            newVillageContainer.style.display = "block";
        } else {
            newVillageContainer.style.display = "none";
            newVillageInput.value = "";
        }
    });

    document.getElementById("dataForm").addEventListener("submit", function (event) {
        event.preventDefault();

        let village = villageSelect.value;
        if (village === "other") {
            village = newVillageInput.value.trim();
            if (village) {
                const option = document.createElement("option");
                option.value = village.toLowerCase();
                option.textContent = village;
                villageSelect.appendChild(option);
                villageSelect.value = village.toLowerCase();
            }
        }

        const vehicleNumber = document.getElementById("vehicleNumber").value;
        const loadedWeight = parseFloat(document.getElementById("loadedWeight").value);
        const emptyWeight = parseFloat(document.getElementById("emptyWeight").value);
        const bagWeight = parseFloat(document.getElementById("bagWeight").value);
        const date = new Date().toLocaleDateString();

        if (isNaN(bagWeight) || bagWeight <= 0) {
            alert("Please enter a valid weight for each bag.");
            return;
        }

        const totalWeight = loadedWeight - emptyWeight;
        const numOfBags = bagWeight > 0 ? Math.floor(totalWeight / bagWeight) : 0;

        const riceMillData = JSON.parse(localStorage.getItem("riceMillData"));
        riceMillData.push({ village, vehicleNumber, loadedWeight, emptyWeight, totalWeight, numOfBags, date, verified: false });
        localStorage.setItem("riceMillData", JSON.stringify(riceMillData));

        document.getElementById("dataForm").reset();
        villageSelect.value = "buggaram";
        alert("Data saved successfully!");
    });

    function displayData() {
        const riceMillData = JSON.parse(localStorage.getItem("riceMillData"));
        const viewerSection = document.getElementById("dataViewer");
        viewerSection.innerHTML = "";

        const villages = [...new Set(riceMillData.map(entry => entry.village))];
        villages.forEach(village => {
            const villageData = riceMillData
                .map((entry, index) => ({ ...entry, index }))
                .filter(entry => entry.village === village);
            const totalBags = villageData.reduce((sum, entry) => sum + entry.numOfBags, 0);

            if (villageData.length > 0) {
                const villageTitle = document.createElement("h3");
                villageTitle.textContent = `${village.charAt(0).toUpperCase() + village.slice(1)} (Total Bags: ${totalBags})`;
                viewerSection.appendChild(villageTitle);

                const table = document.createElement("table");
                table.innerHTML = `
                    <tr>
                        <th>Date</th>
                        <th>Vehicle Number</th>
                        <th>Loaded Weight</th>
                        <th>Empty Weight</th>
                        <th>Total Weight</th>
                        <th>Number of Bags</th>
                        <th>Verified</th>
                        <th>Actions</th>
                    </tr>
                `;

                villageData.forEach((entry) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${entry.date}</td>
                        <td>${entry.vehicleNumber}</td>
                        <td>${entry.loadedWeight}</td>
                        <td>${entry.emptyWeight}</td>
                        <td>${entry.totalWeight}</td>
                        <td>${entry.numOfBags}</td>
                        <td><button class="verify-button" data-index="${entry.index}">${entry.verified ? "Verified" : "Verify"}</button></td>
                        <td><button class="delete-button" data-index="${entry.index}">Delete</button></td>
                    `;
                    table.appendChild(row);
                });

                viewerSection.appendChild(table);
            }
        });

        document.querySelectorAll(".verify-button").forEach(button => {
            button.addEventListener("click", function () {
                const index = parseInt(this.getAttribute("data-index"));
                const riceMillData = JSON.parse(localStorage.getItem("riceMillData"));
                riceMillData[index].verified = !riceMillData[index].verified;
                localStorage.setItem("riceMillData", JSON.stringify(riceMillData));
                displayData();
            });
        });

        document.querySelectorAll(".delete-button").forEach(button => {
            button.addEventListener("click", function () {
                const index = parseInt(this.getAttribute("data-index"));
                const riceMillData = JSON.parse(localStorage.getItem("riceMillData"));
                riceMillData.splice(index, 1);
                localStorage.setItem("riceMillData", JSON.stringify(riceMillData));
                displayData();
            });
        });
    }
});
