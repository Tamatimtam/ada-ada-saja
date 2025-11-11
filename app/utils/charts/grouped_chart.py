import json


def create_grouped_bar_chart(chart_data):
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
<div id="grouped-bar-chart" style="height: 600px; width: 100%; box-sizing: border-box;"></div>
<script>
(function() {{
  const categories = {categories_js};
  const incomePct = {income_pct_js};
  const expensePct = {expense_pct_js};
  const incomeCounts = {income_counts_js};
  const expenseCounts = {expense_counts_js};

  Highcharts.chart('grouped-bar-chart', {{
    chart: {{
      type: 'column',
      backgroundColor: 'transparent',
      height: 600,
      spacing: [10, 8, 50, 8]
    }},
    title: {{
      text: '<b>💰 GenZ Income vs Expense Distribution by Category</b>',
      useHTML: true,
      align: 'center',
      style: {{ fontSize: '24px', color: '#2c3e50', fontWeight: '700' }},
      margin: 20
    }},
    xAxis: {{
      categories: categories,
      title: {{ text: '<b>Category (IDR per month)</b>', style: {{ fontSize: '13px', color: '#34495e', fontWeight: '700' }} }},
      labels: {{ style: {{ fontSize: '11px', color: '#34495e' }} }},
      lineWidth: 0,
      tickWidth: 0
    }},
    yAxis: {{
      min: 0,
      title: {{ text: '<b>Percentage of Population (%)</b>', style: {{ fontSize: '13px', color: '#34495e', fontWeight: '700' }} }},
      labels: {{ format: '{{value}}%', style: {{ fontSize: '11px', color: '#34495e' }} }},
      gridLineColor: 'rgba(189, 195, 199, 0.2)'
    }},
    legend: {{
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      y: 0,
      itemStyle: {{ fontSize: '12px', color: '#2c3e50' }},
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: '#bdc3c7',
      borderWidth: 1
    }},
    plotOptions: {{
      series: {{
        animation: false,
        pointPadding: 0.1,
        groupPadding: 0.15,
        dataLabels: {{
          enabled: true,
          format: '{{y:.1f}}%',
          style: {{ fontSize: '10px', color: '#333', fontWeight: '600', textOutline: 'none' }},
          crop: false,
          overflow: 'allow'
        }}
      }}
    }},
    series: [
      {{
        name: 'Income Distribution',
        data: incomePct.map((pct, idx) => ({{
          y: pct,
          customdata: incomeCounts[idx],
          color: '#3498db'
        }})),
        tooltip: {{
          pointFormatter: function() {{
            return '<b>Income: ' + this.category + '</b><br/>Percentage: ' + this.y.toFixed(1) + '%<br/>Count: ' + this.customdata;
          }}
        }}
      }},
      {{
        name: 'Expense Distribution',
        data: expensePct.map((pct, idx) => ({{
          y: pct,
          customdata: expenseCounts[idx],
          color: '#e74c3c'
        }})),
        tooltip: {{
          pointFormatter: function() {{
            return '<b>Expense: ' + this.category + '</b><br/>Percentage: ' + this.y.toFixed(1) + '%<br/>Count: ' + this.customdata;
          }}
        }}
      }}
    ],
    credits: {{ enabled: false }},
    responsive: {{
      rules: [{{
        condition: {{ maxWidth: 480 }},
        chartOptions: {{
          chart: {{ height: 400 }},
          title: {{ style: {{ fontSize: '16px' }} }},
          xAxis: {{ labels: {{ rotation: -45, style: {{ fontSize: '9px' }} }} }}
        }}
      }}]
    }}
  }});
}})();
</script>
"""
