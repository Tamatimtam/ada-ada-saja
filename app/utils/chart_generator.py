"""
Chart Generator Module
Creates visualizations using Plotly
"""

from app.utils.charts.diverging_chart import (
    create_diverging_bar_chart as _create_diverging,
)
from app.utils.charts.profession_chart import (
    create_profession_chart as _create_profession,
)
from app.utils.charts.education_chart import create_education_chart as _create_education
from app.utils.charts.grouped_chart import create_grouped_bar_chart as _create_grouped


class ChartGenerator:
    """Thin wrapper delegating to chart-specific modules"""

    @staticmethod
    def create_diverging_bar_chart(chart_data):
        return _create_diverging(chart_data)
    
    @staticmethod
    def create_profession_chart(profession_data):
        return _create_profession(profession_data)
    
    @staticmethod
    def create_education_chart(education_data):
        return _create_education(education_data)
    
    @staticmethod
    def create_grouped_bar_chart(chart_data):
        return _create_grouped(chart_data)
