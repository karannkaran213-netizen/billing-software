// This file manages the generation of various sales reports, including daily, monthly, yearly, profit, loss, and expenses reports.

document.addEventListener('DOMContentLoaded', function() {
    const reportTypeSelect = document.getElementById('report-type');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateReportButton = document.getElementById('generate-report');
    const reportContainer = document.getElementById('report-container');

    generateReportButton.addEventListener('click', function() {
        const reportType = reportTypeSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        generateReport(reportType, startDate, endDate);
    });

    function generateReport(type, startDate, endDate) {
        // Fetch sales data from JSON file
        fetch('../data/sales-data.json')
            .then(response => response.json())
            .then(data => {
                const filteredData = filterData(data, type, startDate, endDate);
                displayReport(filteredData, type);
            })
            .catch(error => console.error('Error fetching sales data:', error));
    }

    function filterData(data, type, startDate, endDate) {
        // Filter data based on report type and date range
        return data.filter(item => {
            const itemDate = new Date(item.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return item.type === type && itemDate >= start && itemDate <= end;
        });
    }

    function displayReport(data, type) {
        reportContainer.innerHTML = ''; // Clear previous report

        if (data.length === 0) {
            reportContainer.innerHTML = '<p>No data available for the selected criteria.</p>';
            return;
        }

        const reportTitle = document.createElement('h2');
        reportTitle.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Report`;
        reportContainer.appendChild(reportTitle);

        const reportTable = document.createElement('table');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Date</th><th>Amount</th>';
        reportTable.appendChild(headerRow);

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${item.date}</td><td>${item.amount}</td>`;
            reportTable.appendChild(row);
        });

        reportContainer.appendChild(reportTable);
    }
});