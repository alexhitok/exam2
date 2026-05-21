// DOM Elements
const revenueInput = document.getElementById('revenue');
const avgOrderInput = document.getElementById('avgOrder');
const leadRespInput = document.getElementById('leadResp');
const prosRespInput = document.getElementById('prosResp');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');

const prospectsVal = document.getElementById('prospects-val');
const leadsVal = document.getElementById('leads-val');
const customersVal = document.getElementById('customers-val');

const leadsPct = document.getElementById('leads-pct');
const customersPct = document.getElementById('customers-pct');
const leadsFill = document.getElementById('leads-fill');
const customersFill = document.getElementById('customers-fill');

const leadRespTxt = document.getElementById('leadRespTxt');
const prosRespTxt = document.getElementById('prosRespTxt');

const chartArea = document.getElementById('chart-area');
const chartYAxis = document.getElementById('chart-y-axis');
const chartXAxis = document.getElementById('chart-x-axis');
const tooltip = document.getElementById('tooltip');

function calculate() {
    let revenue = parseFloat(revenueInput.value) || 0;
    let avgOrder = parseFloat(avgOrderInput.value) || 1;
    let leadResp = parseFloat(leadRespInput.value) || 1;
    let prosResp = parseFloat(prosRespInput.value) || 1;

    // Based on logical reverse calculation
    // Customers = Revenue / AvgOrder
    // Leads = Customers / LeadRespRate
    // Prospects = Leads / ProsRespRate
    
    let customers = Math.ceil(revenue / avgOrder);
    let leads = Math.ceil(customers / (leadResp / 100));
    let prospects = Math.ceil(leads / (prosResp / 100));

    // Update Sidebars
    prospectsVal.textContent = prospects;
    leadsVal.textContent = leads;
    customersVal.textContent = customers;

    let leadPctVal = ((leads / prospects) * 100) || 0;
    let custPctVal = ((customers / prospects) * 100) || 0;

    leadsPct.textContent = leadPctVal.toFixed(0) + '%';
    customersPct.textContent = custPctVal.toFixed(0) + '%';
    
    leadsFill.style.width = leadPctVal + '%';
    customersFill.style.width = custPctVal + '%';

    leadRespTxt.textContent = leadResp.toFixed(2) + '%';
    prosRespTxt.textContent = prosResp.toFixed(2) + '%';

    // Update Slider track backgrounds
    leadRespInput.style.setProperty('--val', leadRespInput.value + '%');
    prosRespInput.style.setProperty('--val', prosRespInput.value + '%');

    renderChart(prospects, leads, customers);
}

function renderChart(maxProspects, maxLeads, maxCustomers) {
    chartArea.innerHTML = '';
    chartYAxis.innerHTML = '<div class="chart-y-axis-label">Months</div>';
    chartXAxis.innerHTML = '';

    let start = new Date(startDateInput.value);
    let end = new Date(endDateInput.value);
    
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    if(months < 1 || isNaN(months)) months = 6;
    if(months > 12) months = 12; // Cap visual length

    // Draw Grid Lines (Values: 0, 20, 40, ... up to Max prospect rounded up)
    let gridCount = 6;
    let gridStep = Math.ceil(maxProspects / gridCount);
    if(gridStep === 0) gridStep = 20;

    for(let i=1; i<=gridCount; i++) {
        let leftPct = (i / gridCount) * 100;
        
        let gridLine = document.createElement('div');
        gridLine.className = 'chart-grid-line';
        gridLine.style.left = leftPct + '%';
        chartArea.appendChild(gridLine);
    }
    
    // X Axis Labels
    let xLabel0 = document.createElement('div');
    xLabel0.className = 'chart-x-label';
    xLabel0.style.left = '0%';
    xLabel0.innerText = '0 people';
    chartXAxis.appendChild(xLabel0);

    for(let i=1; i<=gridCount; i++) {
        let leftPct = (i / gridCount) * 100;
        let val = gridStep * i;
        
        let label = document.createElement('div');
        label.className = 'chart-x-label';
        label.style.left = leftPct + '%';
        label.innerText = val + ' people';
        chartXAxis.appendChild(label);
    }

    // Chart Rows
    let chartMaxRenderValue = gridStep * gridCount;

    for(let m=1; m<=months; m++) {
        let ratio = m / months;
        let cPros = Math.round(maxProspects * ratio);
        let cLeads = Math.round(maxLeads * ratio);
        let cCust = Math.round(maxCustomers * ratio);

        let row = document.createElement('div');
        row.className = 'chart-row';

        // Y Label
        let yLabel = document.createElement('span');
        yLabel.innerText = m;
        chartYAxis.appendChild(yLabel);

        let barGroup = document.createElement('div');
        barGroup.className = 'chart-bar-group';
        barGroup.style.width = '100%';
        barGroup.style.zIndex = '10';

        let pBar = document.createElement('div');
        pBar.className = 'chart-bar prospects';
        pBar.style.width = (cPros / chartMaxRenderValue * 100) + '%';
        pBar.style.zIndex = '1';

        let lBar = document.createElement('div');
        lBar.className = 'chart-bar leads';
        lBar.style.width = (cLeads / chartMaxRenderValue * 100) + '%';
        lBar.style.zIndex = '2';

        let cBar = document.createElement('div');
        cBar.className = 'chart-bar customers';
        cBar.style.width = (cCust / chartMaxRenderValue * 100) + '%';
        cBar.style.zIndex = '3';

        barGroup.appendChild(pBar);
        barGroup.appendChild(lBar);
        barGroup.appendChild(cBar);

        // Tooltip logic
        barGroup.addEventListener('mouseenter', (e) => {
            tooltip.style.opacity = '1';
            tooltip.innerHTML = `Month #${m}\nProspects: ${cPros}\nLeads: ${cLeads}\nCustomers: ${cCust}`;
        });
        barGroup.addEventListener('mousemove', (e) => {
            let rect = chartArea.getBoundingClientRect();
            tooltip.style.left = (e.clientX + 10) + 'px';
            tooltip.style.top = (e.clientY + 10) + 'px';
        });
        barGroup.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });

        row.appendChild(barGroup);
        chartArea.appendChild(row);
    }
}

// Event Listeners
[revenueInput, avgOrderInput, leadRespInput, prosRespInput, startDateInput, endDateInput].forEach(input => {
    input.addEventListener('input', calculate);
});

// Init
calculate();