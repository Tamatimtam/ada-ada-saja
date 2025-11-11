import json


def create_diverging_bar_chart(chart_data):
    categories = chart_data["categories"]
    income_pct = chart_data["income_percentages"]
    expense_pct = chart_data["expense_percentages"]
    income_counts = chart_data["income_counts"]
    expense_counts = chart_data["expense_counts"]

    # Prepare Highcharts payloads
    categories_js = json.dumps(categories)
    income_pct_js = json.dumps([round(pct, 1) for pct in income_pct])
    expense_pct_js = json.dumps([round(pct, 1) for pct in expense_pct])
    income_counts_js = json.dumps(income_counts)
    expense_counts_js = json.dumps(expense_counts)

    return f"""
<div id="diverging-bar-chart" style="height: 500px; width: 100%; box-sizing: border-box;"></div>
<script>
(function() {{
  const categories = {categories_js};
  const incomePct = {income_pct_js};
  const expensePct = {expense_pct_js};
  const incomeCounts = {income_counts_js};
  const expenseCounts = {expense_counts_js};

  Highcharts.chart('diverging-bar-chart', {{
    chart: {{
      type: 'bar',
      backgroundColor: 'rgba(255,255,255,0.01)',
      height: 500,
      spacing: [15, 20, 40, 20],
      borderRadius: 8,
      shadow: {{ offsetX: 0, offsetY: 2, opacity: 0.05, width: 3 }}
    }},
    title: {{
      text: '<b>⚖️ Income vs Expense Distribution</b>',
      useHTML: true,
      align: 'center',
      style: {{ fontSize: '18px', color: '#1a202c', fontFamily: 'Inter, -apple-system, sans-serif', fontWeight: '700', letterSpacing: '-0.5px' }},
      margin: 24
    }},
    subtitle: {{
      text: '<span style="font-size:12px; color:#718096; font-weight:500;">Click any bar to highlight category • Click again to deselect</span>',
      useHTML: true,
      align: 'center',
      style: {{ fontFamily: 'Inter, -apple-system, sans-serif' }}
    }},
    xAxis: {{
      categories: categories,
      title: {{ text: '<b>Financial Category (IDR/month)</b>', style: {{ fontSize: '12px', color: '#2d3748', fontWeight: '600', fontFamily: 'Inter, -apple-system, sans-serif' }} }},
      labels: {{ style: {{ fontSize: '11px', color: '#4a5568', fontFamily: 'Inter, -apple-system, sans-serif', fontWeight: '500' }} }},
      lineWidth: 0,
      tickWidth: 0,
      plotLines: []
    }},
    yAxis: {{
      title: {{ text: '<b>Percentage of Population (%)</b>', style: {{ fontSize: '12px', color: '#2d3748', fontWeight: '600', fontFamily: 'Inter, -apple-system, sans-serif' }} }},
      labels: {{ format: '{{value}}%', style: {{ fontSize: '11px', color: '#4a5568', fontFamily: 'Inter, -apple-system, sans-serif' }} }},
      plotLines: [{{ value: 0, width: 2.5, color: '#cbd5e0', zIndex: 1 }}],
      gridLineColor: 'rgba(203, 213, 224, 0.25)',
      gridLineDashStyle: 'solid'
    }},
    legend: {{
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      y: 5,
      itemStyle: {{ fontSize: '12px', color: '#2d3748', fontFamily: 'Inter, -apple-system, sans-serif', fontWeight: '500' }},
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      borderRadius: 6,
      padding: 8,
      symbolPadding: 12,
      itemDistance: 30
    }},
    plotOptions: {{
      series: {{
        animation: {{ duration: 800, easing: 'easeOutQuad' }},
        cursor: 'pointer',
        pointPadding: 0.02,
        groupPadding: 0.15,
        dataLabels: {{
          enabled: true,
          format: '{{y:.1f}}%',
          style: {{ fontSize: '10px', color: 'white', fontWeight: '600', textOutline: 'none', fontFamily: 'Inter, -apple-system, sans-serif' }},
          inside: true,
          align: 'center'
        }},
        events: {{
          click: function(event) {{
            const category = event.point.category;
            const chartInstance = Highcharts.charts.find(c => c && c.renderTo && c.renderTo.id === 'diverging-bar-chart');
            
            if (!window.selectedCategory) window.selectedCategory = null;
            
            if (window.selectedCategory === category) {{
              window.selectedCategory = null;
              chartInstance.series.forEach(s => {{
                s.data.forEach((point, idx) => {{
                  point.update({{ opacity: 0.85 }}, false);
                }});
              }});
              document.dispatchEvent(new CustomEvent('categoryFilterReset', {{ bubbles: true }}));
            }} else {{
              window.selectedCategory = category;
              chartInstance.series.forEach(s => {{
                s.data.forEach((point, idx) => {{
                  const opacity = point.category === category ? 1.0 : 0.3;
                  point.update({{ opacity: opacity }}, false);
                }});
              }});
              document.dispatchEvent(new CustomEvent('categoryFiltered', {{ detail: {{ category: category }}, bubbles: true }}));
            }}
            
            chartInstance.redraw();
          }}
        }}
      }},
      bar: {{
        borderRadius: 5,
        borderWidth: 0,
        stacking: 'normal'
      }}
    }},
    series: [
      {{
        name: 'Expense',
        color: '#e74c3c',
        data: expensePct.map((pct, idx) => ({{
          y: -pct,
          count: expenseCounts[idx],
          category: categories[idx]
        }})),
        tooltip: {{
          pointFormatter: function() {{
            return '<b style="color:#e74c3c">●</b> ' + this.category + '<br/>Expense: <b>' + Math.abs(this.y).toFixed(1) + '%</b><br/>Count: <b>' + this.count + ' people</b>';
          }}
        }}
      }},
      {{
        name: 'Income',
        color: '#4299e1',
        data: incomePct.map((pct, idx) => ({{
          y: pct,
          count: incomeCounts[idx],
          category: categories[idx]
        }})),
        tooltip: {{
          pointFormatter: function() {{
            return '<b style="color:#4299e1">●</b> ' + this.category + '<br/>Income: <b>' + this.y.toFixed(1) + '%</b><br/>Count: <b>' + this.count + ' people</b>';
          }}
        }}
      }}
    ],
    credits: {{ enabled: false }},
    tooltip: {{
      backgroundColor: 'rgba(26, 32, 44, 0.95)',
      borderColor: '#2d3748',
      borderRadius: 6,
      borderWidth: 0,
      padding: 12,
      headerFormat: '',
      footerFormat: '',
      shared: false,
      style: {{ color: 'white', fontFamily: 'Inter, -apple-system, sans-serif', fontSize: '12px' }}
    }},
    responsive: {{
      rules: [{{
        condition: {{ maxWidth: 480 }},
        chartOptions: {{
          xAxis: {{ labels: {{ rotation: -45, style: {{ fontSize: '9px' }} }} }},
          chart: {{ spacing: [15, 20, 40, 15] }},
          legend: {{ y: 0, itemDistance: 15 }},
          title: {{ style: {{ fontSize: '14px' }} }}
        }}
      }}]
    }}
  }});
}})();
</script>
"""
