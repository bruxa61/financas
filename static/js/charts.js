/**
 * VintageFinance - Charts JavaScript Module
 * Handles chart initialization and configuration for financial reports
 */

// Chart.js default configuration for vintage theme
Chart.defaults.font.family = 'Georgia, serif';
Chart.defaults.font.size = 12;
Chart.defaults.color = '#6A7A5A';

/**
 * Vintage color palette for charts
 */
const VintageColors = {
    primary: '#6A7A5A',      // Axolotl
    secondary: '#8DAF98',     // Morning Blue
    tertiary: '#BED2BA',      // Jet Stream
    accent: '#D7CBB2',        // Dark Vanilla
    complement: '#A8C7BA',    // Opal
    
    // Extended palette for multiple data series
    palette: [
        '#6A7A5A', // Axolotl
        '#8DAF98', // Morning Blue
        '#BED2BA', // Jet Stream
        '#D7CBB2', // Dark Vanilla
        '#A8C7BA', // Opal
        '#7A8B6A', // Darker Axolotl
        '#9DBF88', // Lighter Morning Blue
        '#CEE2CA', // Lighter Jet Stream
        '#E2D6C2', // Lighter Dark Vanilla
        '#B8D7CA', // Lighter Opal
    ],
    
    // Income colors (greens)
    income: [
        '#6A7A5A',
        '#8DAF98',
        '#BED2BA',
        '#A8C7BA',
        '#7A8B6A',
        '#9DBF88'
    ],
    
    // Expense colors (warm tones)
    expense: [
        '#BF8A7D',
        '#D7CBB2',
        '#C7B299',
        '#B8A485',
        '#A99571',
        '#9A875D'
    ]
};

/**
 * Default chart options for vintage theme
 */
const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                padding: 20,
                usePointStyle: true,
                font: {
                    family: 'Georgia, serif',
                    size: 12
                },
                color: VintageColors.primary
            }
        },
        tooltip: {
            backgroundColor: 'rgba(245, 243, 239, 0.95)',
            titleColor: VintageColors.primary,
            bodyColor: VintageColors.primary,
            borderColor: VintageColors.tertiary,
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            titleFont: {
                family: 'Georgia, serif',
                size: 14,
                weight: 'bold'
            },
            bodyFont: {
                family: 'Helvetica Neue, Arial, sans-serif',
                size: 12
            }
        }
    },
    animation: {
        duration: 1000,
        easing: 'easeOutCubic'
    }
};

/**
 * Create a line chart for monthly trends
 */
function createMonthlyTrendChart(ctx, data) {
    const chartData = {
        labels: data.map(item => item.month),
        datasets: [
            {
                label: 'Income',
                data: data.map(item => item.income),
                borderColor: VintageColors.primary,
                backgroundColor: hexToRgba(VintageColors.primary, 0.1),
                fill: false,
                tension: 0.4,
                pointBackgroundColor: VintageColors.primary,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            },
            {
                label: 'Expenses',
                data: data.map(item => item.expense),
                borderColor: VintageColors.expense[0],
                backgroundColor: hexToRgba(VintageColors.expense[0], 0.1),
                fill: false,
                tension: 0.4,
                pointBackgroundColor: VintageColors.expense[0],
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            },
            {
                label: 'Net Balance',
                data: data.map(item => item.balance),
                borderColor: VintageColors.secondary,
                backgroundColor: hexToRgba(VintageColors.secondary, 0.1),
                fill: true,
                tension: 0.4,
                pointBackgroundColor: VintageColors.secondary,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }
        ]
    };

    const options = {
        ...defaultChartOptions,
        scales: {
            x: {
                grid: {
                    color: hexToRgba(VintageColors.tertiary, 0.3),
                    borderColor: VintageColors.tertiary
                },
                ticks: {
                    color: VintageColors.primary,
                    font: {
                        family: 'Helvetica Neue, Arial, sans-serif',
                        size: 11
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: hexToRgba(VintageColors.tertiary, 0.3),
                    borderColor: VintageColors.tertiary
                },
                ticks: {
                    color: VintageColors.primary,
                    font: {
                        family: 'Helvetica Neue, Arial, sans-serif',
                        size: 11
                    },
                    callback: function(value) {
                        return '$' + value.toFixed(0);
                    }
                }
            }
        },
        plugins: {
            ...defaultChartOptions.plugins,
            tooltip: {
                ...defaultChartOptions.plugins.tooltip,
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                    }
                }
            }
        }
    };

    return new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: options
    });
}

/**
 * Create a doughnut chart for category breakdown
 */
function createCategoryDoughnutChart(ctx, labels, values, type = 'income') {
    const colors = type === 'income' ? VintageColors.income : VintageColors.expense;
    
    const chartData = {
        labels: labels,
        datasets: [{
            data: values,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 0,
            hoverBorderWidth: 2,
            hoverBorderColor: '#ffffff'
        }]
    };

    const options = {
        ...defaultChartOptions,
        cutout: '60%',
        plugins: {
            ...defaultChartOptions.plugins,
            legend: {
                display: false // We'll use custom legend
            },
            tooltip: {
                ...defaultChartOptions.plugins.tooltip,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return label + ': $' + value.toFixed(0) + ' (' + percentage + '%)';
                    }
                }
            }
        }
    };

    return new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: options
    });
}

/**
 * Create a bar chart for comparative data
 */
function createBarChart(ctx, labels, datasets) {
    const chartData = {
        labels: labels,
        datasets: datasets.map((dataset, index) => ({
            ...dataset,
            backgroundColor: VintageColors.palette[index % VintageColors.palette.length],
            borderColor: VintageColors.palette[index % VintageColors.palette.length],
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false
        }))
    };

    const options = {
        ...defaultChartOptions,
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: VintageColors.primary,
                    font: {
                        family: 'Helvetica Neue, Arial, sans-serif',
                        size: 11
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: hexToRgba(VintageColors.tertiary, 0.3),
                    borderColor: VintageColors.tertiary
                },
                ticks: {
                    color: VintageColors.primary,
                    font: {
                        family: 'Helvetica Neue, Arial, sans-serif',
                        size: 11
                    },
                    callback: function(value) {
                        return '$' + value.toFixed(0);
                    }
                }
            }
        },
        plugins: {
            ...defaultChartOptions.plugins,
            tooltip: {
                ...defaultChartOptions.plugins.tooltip,
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                    }
                }
            }
        }
    };

    return new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: options
    });
}

/**
 * Create a simple pie chart
 */
function createPieChart(ctx, labels, values, colors = null) {
    const chartColors = colors || VintageColors.palette.slice(0, labels.length);
    
    const chartData = {
        labels: labels,
        datasets: [{
            data: values,
            backgroundColor: chartColors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverBorderWidth: 3
        }]
    };

    const options = {
        ...defaultChartOptions,
        plugins: {
            ...defaultChartOptions.plugins,
            tooltip: {
                ...defaultChartOptions.plugins.tooltip,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return label + ': $' + value.toFixed(0) + ' (' + percentage + '%)';
                    }
                }
            }
        }
    };

    return new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: options
    });
}

/**
 * Utility function to convert hex to rgba
 */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Animate chart on creation
 */
function animateChart(chart) {
    chart.update('active');
}

/**
 * Update chart data dynamically
 */
function updateChartData(chart, newLabels, newData) {
    chart.data.labels = newLabels;
    chart.data.datasets.forEach((dataset, index) => {
        dataset.data = newData[index] || [];
    });
    chart.update();
}

/**
 * Destroy chart safely
 */
function destroyChart(chart) {
    if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
    }
}

/**
 * Resize chart container
 */
function resizeChart(chart) {
    if (chart && typeof chart.resize === 'function') {
        chart.resize();
    }
}

/**
 * Export chart as image
 */
function exportChartAsImage(chart, filename = 'chart.png') {
    const url = chart.toBase64Image();
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
}

/**
 * Initialize responsive chart behavior
 */
function initializeResponsiveCharts() {
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            Chart.helpers.each(Chart.instances, function(instance) {
                instance.resize();
            });
        }, 300);
    });
}

/**
 * Create a gradient background for charts
 */
function createGradient(ctx, color1, color2, direction = 'vertical') {
    const gradient = direction === 'vertical' 
        ? ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
        : ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

/**
 * Format currency for chart tooltips and labels
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

/**
 * Calculate percentage for chart data
 */
function calculatePercentage(value, total) {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
}

// Initialize responsive behavior when the module loads
document.addEventListener('DOMContentLoaded', function() {
    initializeResponsiveCharts();
});

// Export functions for global use
window.VintageCharts = {
    createMonthlyTrendChart,
    createCategoryDoughnutChart,
    createBarChart,
    createPieChart,
    updateChartData,
    destroyChart,
    resizeChart,
    exportChartAsImage,
    animateChart,
    createGradient,
    formatCurrency,
    calculatePercentage,
    colors: VintageColors
};
