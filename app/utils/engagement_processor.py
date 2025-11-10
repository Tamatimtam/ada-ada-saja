"""
Digital Engagement Processor Module
Handles analysis of 'digital_time_spent_per_day' data.
"""
import pandas as pd
import numpy as np
from scipy.stats import gaussian_kde

class EngagementProcessor:
    """Processes and analyzes digital engagement data."""

    def __init__(self, df):
        """
        Initialize EngagementProcessor with a DataFrame.

        Args:
            df (pd.DataFrame): DataFrame containing 'digital_time_spent_per_day'.
        """
        self.df = df

    def get_engagement_distribution(self):
        """
        Calculates histogram and KDE for 'digital_time_spent_per_day'.

        Returns:
            dict: A dictionary containing histogram data, KDE data, and summary statistics.
                  Returns an empty structure if no valid data is available.
        """
        # 1. Clean and validate the data
        time_data = self.df['digital_time_spent_per_day'].dropna()
        if time_data.empty or len(time_data) < 2:
            return self._get_empty_distribution()

        # 2. Calculate summary statistics
        stats = {
            'count': int(time_data.count()),
            'mean': round(float(time_data.mean()), 2),
            'median': round(float(time_data.median()), 2),
            'std_dev': round(float(time_data.std()), 2),
            'min': round(float(time_data.min()), 2),
            'max': round(float(time_data.max()), 2)
        }

        # 3. Calculate histogram data
        # Use numpy's histogram function for robust binning
        counts, bin_edges = np.histogram(time_data, bins='auto', density=False)
        
        histogram_data = {
            'x': bin_edges.tolist(),
            'y': counts.tolist()
        }

        # 4. Calculate KDE data
        try:
            kde = gaussian_kde(time_data)
            # Generate points for the KDE curve
            kde_x = np.linspace(time_data.min(), time_data.max(), 200)
            kde_y = kde(kde_x)
            
            # Scale KDE to match histogram counts instead of density
            # Area under histogram = sum(counts * bin_width)
            bin_width = bin_edges[1] - bin_edges[0]
            kde_y_scaled = kde_y * stats['count'] * bin_width

            kde_data = {
                'x': kde_x.tolist(),
                'y': kde_y_scaled.tolist()
            }
        except (np.linalg.LinAlgError, ValueError):
            # Handle cases where KDE calculation fails (e.g., all values are the same)
            kde_data = {'x': [], 'y': []}

        return {
            'stats': stats,
            'histogram': histogram_data,
            'kde': kde_data
        }

    def _get_empty_distribution(self):
        """Returns a default empty structure for when there's no data."""
        return {
            'stats': {
                'count': 0, 'mean': 0, 'median': 0, 'std_dev': 0, 'min': 0, 'max': 0
            },
            'histogram': {'x': [], 'y': []},
            'kde': {'x': [], 'y': []}
        }