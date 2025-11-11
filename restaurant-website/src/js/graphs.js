// This file handles the generation and display of graphs for daily and monthly sales data.

document.addEventListener('DOMContentLoaded', function() {
    const ctxDaily = document.getElementById('dailySalesChart').getContext('2d');
    const ctxMonthly = document.getElementById('monthlySalesChart').getContext('2d');

    // Sample data for daily sales
    const dailySalesData = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
            label: 'Daily Sales',
            data: [120, 150, 180, 200, 170, 220, 250],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    // Sample data for monthly sales
    const monthlySalesData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [{
            label: 'Monthly Sales',
            data: [3000, 4000, 3500, 5000, 4500, 6000, 7000, 6500, 8000, 7500, 9000, 9500],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
        }]
    };

    // Create daily sales chart
    const dailySalesChart = new Chart(ctxDaily, {
        type: 'bar',
        data: dailySalesData,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Create monthly sales chart
    const monthlySalesChart = new Chart(ctxMonthly, {
        type: 'line',
        data: monthlySalesData,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});