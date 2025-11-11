import json


def create_education_chart(education_data):
    categories = education_data["categories"]
    colors = education_data["colors"]

    # Abbreviate long category labels (preserve original for tooltip/count lookup)
    abbreviated_cats = []
    for cat in categories:
        if len(cat) > 15:
            if "Bachelor" in cat:
                abbreviated_cats.append("Bachelor/D4")
            elif "Diploma I" in cat:
                abbreviated_cats.append("Diploma I-III")
            elif "Senior High" in cat:
                abbreviated_cats.append("High School")
            elif "Junior High" in cat:
                abbreviated_cats.append("Junior High")
            elif "Elementary" in cat:
                abbreviated_cats.append("Elementary")
            elif "Postgraduate" in cat:
                abbreviated_cats.append("Postgrad")
            else:
                abbreviated_cats.append(cat[:15])
        else:
            abbreviated_cats.append(cat)

    data_map = education_data["data"]
    total_counts = education_data.get("total_counts", {})

    # Prepare Highcharts payloads
    orig_js = json.dumps(categories)
    abbrev_js = json.dumps(abbreviated_cats)
    colors_js = json.dumps(colors)
    total_counts_js = json.dumps(total_counts)
    series_js = json.dumps(
        [
            {"name": "Surplus", "data": data_map.get("Surplus", [0] * len(categories))},
            {
                "name": "Break-even",
                "data": data_map.get("Break-even", [0] * len(categories)),
            },
            {"name": "Deficit", "data": data_map.get("Deficit", [0] * len(categories))},
        ]
    )

    # Return container + inline Highcharts script (layout.html already loads Highcharts)
    return f"""
<div id="education-chart" style="height: 480px; width: 100%;"></div>
<script>
(function() {{
  const origCategories = {orig_js};
  const categories = {abbrev_js};
  const colors = {colors_js};
  const totalCounts = {total_counts_js};
  const series = {series_js}.map(s => Object.assign({{}}, s, {{ color: colors[s.name] || '#95a5a6' }}));

  Highcharts.chart('education-chart', {{
    chart: {{
      type: 'column',
      backgroundColor: 'transparent',
      height: 480,
      spacing: [6, 8, 8, 8]  // unified with employment chart
    }},
    title: {{
      text: '<b>🎓 Education vs<br>Financial Standing</b>',  // add line break to match layout
      useHTML: true,
      align: 'center',
      style: {{ fontSize: '14px', color: '#2c3e50', fontFamily: 'Inter, sans-serif', fontWeight: '700' }},  // add fontWeight
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
      itemStyle: {{ fontSize: '9px' }},
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: '#e0e0e0',
      borderWidth: 1
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
        const i = this.point.index;
        const fullCat = origCategories[i] || this.x;
        const count = totalCounts[fullCat] || 0;
        const actual = Math.round((this.y / 100) * count);
        return `<b>${{fullCat}}</b><br>${{this.series.name}}: ${{this.y.toFixed(1)}}% (${{actual}} people)`;
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
