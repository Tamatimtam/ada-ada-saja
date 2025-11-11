import json


def create_profession_chart(profession_data):
    categories = profession_data["categories"]
    colors = profession_data["colors"]
    data_map = profession_data["data"]
    total_counts = profession_data.get("total_counts", {})

    # Build Highcharts-ready payloads
    categories_js = json.dumps(categories)
    colors_js = json.dumps(
        colors
    )  # {"Surplus":"#..","Break-even":"#..","Deficit":"#.."}
    total_counts_js = json.dumps(total_counts)

    surplus = data_map.get("Surplus", [0] * len(categories))
    breakeven = data_map.get("Break-even", [0] * len(categories))
    deficit = data_map.get("Deficit", [0] * len(categories))

    series_js = json.dumps(
        [
            {"name": "Surplus", "data": surplus},
            {"name": "Break-even", "data": breakeven},
            {"name": "Deficit", "data": deficit},
        ]
    )

    # Return container + inline Highcharts script (layout.html already loads Highcharts)
    return f"""
<div id="profession-chart" style="height: 480px; width: 100%;"></div>
<script>
(function() {{
  const categories = {categories_js};
  const colors = {colors_js};
  const totalCounts = {total_counts_js};
  const series = {series_js}.map(s => {{
    return Object.assign({{}}, s, {{
      color: colors[s.name] || '#95a5a6'
    }});
  }});

  Highcharts.chart('profession-chart', {{
    chart: {{
      type: 'column',
      backgroundColor: 'transparent',
      height: 480,
      spacing: [6, 8, 8, 8]  // top, right, bottom, left
    }},
    title: {{
      text: '<b>Employment vs<br>Financial Standing</b>',
      useHTML: true,
      align: 'center',
      style: {{ fontSize: '14px', color: '#2c3e50', fontFamily: 'Inter, sans-serif', fontWeight: '700' }},
      margin: 6
    }},
    xAxis: {{
      categories: categories,
      labels: {{ style: {{ fontSize: '8px', color: '#34495e' }}, rotation: -45 }},
      lineWidth: 0,
      tickWidth: 0
    }},
    yAxis: {{
      min: 0,
      max: 100,
      title: {{ text: '<b>%</b>', style: {{ fontSize: '10px', color: '#34495e' }} }},
      gridLineColor: 'rgba(189, 195, 199, 0.2)'
    }},
    legend: {{
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      y: 0,
      itemDistance: 16,
      symbolHeight: 10,
      symbolWidth: 10,
      symbolPadding: 6,
      itemStyle: {{ fontSize: '9px' }}
    }},
    plotOptions: {{
      series: {{
        animation: false,
        pointPadding: 0,
        groupPadding: 0.06
      }},
      column: {{
        stacking: 'normal',
        borderWidth: 0,
        dataLabels: {{
          enabled: true,
          inside: true,
          style: {{ color: 'white', fontSize: '9px', textOutline: 'none' }},
          formatter: function() {{
            return this.y > 8 ? Math.round(this.y) + '%' : '';
          }}
        }}
      }}
    }},
    tooltip: {{
      useHTML: true,
      formatter: function () {{
        const count = totalCounts[this.x] || 0;
        const actual = Math.round((this.y / 100) * count);
        return `<b>${{this.x}}</b><br>${{this.series.name}}: ${{this.y.toFixed(1)}}% (${{actual}} people)`;
      }}
    }},
    series: series,
    credits: {{ enabled: false }},
    responsive: {{
      rules: [{{
        condition: {{ maxWidth: 420 }},
        chartOptions: {{
          legend: {{ itemDistance: 8 }},
          xAxis: {{ labels: {{ rotation: -35 }} }},
          plotOptions: {{ column: {{ dataLabels: {{ style: {{ fontSize: '8px' }} }} }} }}
        }}
      }}]
    }}
  }});
}})();
</script>
"""
