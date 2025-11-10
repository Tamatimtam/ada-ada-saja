import plotly.graph_objects as go


def create_profession_chart(profession_data):
    fig = go.Figure()
    categories = profession_data["categories"]
    colors = profession_data["colors"]

    for standing in ["Surplus", "Break-even", "Deficit"]:
        if standing in profession_data["data"]:
            values = profession_data["data"][standing]
            hover_text = []
            for i, cat in enumerate(categories):
                count = profession_data["total_counts"].get(cat, 0)
                pct = values[i]
                actual_count = int((pct / 100) * count)
                hover_text.append(
                    f"{cat}<br>{standing}: {pct:.1f}% ({actual_count} people)"
                )

            fig.add_trace(
                go.Bar(
                    name=standing,
                    x=categories,
                    y=values,
                    marker=dict(
                        color=colors.get(standing, "#95a5a6"),
                        line=dict(color="rgba(255,255,255,0.5)", width=1),
                    ),
                    hovertext=hover_text,
                    hoverinfo="text",
                    text=[f"{v:.0f}%" if v > 8 else "" for v in values],
                    textposition="inside",
                    textfont=dict(size=9, color="white"),
                )
            )

    fig.update_layout(
        title={
            "text": "<b>👔 Employment vs Financial Standing</b>",
            "x": 0.5,
            "xanchor": "center",
            "font": {"size": 14, "color": "#2c3e50"},
        },
        xaxis={
            "tickfont": {"size": 8, "color": "#34495e"},
            "showgrid": False,
            "tickangle": -45,
        },
        yaxis={
            "title": "<b>%</b>",
            "title_font": {"size": 10, "color": "#34495e"},
            "tickfont": {"size": 8, "color": "#34495e"},
            "gridcolor": "rgba(189, 195, 199, 0.2)",
            "range": [0, 100],
        },
        barmode="stack",
        template="plotly_white",
        height=480,
        autosize=True,
        showlegend=True,
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.35,
            xanchor="center",
            x=0.5,
            font={"size": 9},
        ),
        plot_bgcolor="rgba(250, 250, 250, 1)",
        paper_bgcolor="white",
        margin=dict(l=35, r=15, t=60, b=110),
        hoverlabel=dict(bgcolor="white", font_size=10),
    )

    return fig.to_html(
        include_plotlyjs=False,
        div_id="profession-chart",
        config={"displayModeBar": False, "responsive": True},
    )
