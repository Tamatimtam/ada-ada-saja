"""
Loan Processor Module
Handles outstanding loan data analysis and categorization
"""
import pandas as pd
import numpy as np


class LoanProcessor:
    """Processes and analyzes outstanding loan data"""
    
    # Loan category definitions (in IDR)
    LOAN_CATEGORIES = [
        {'name': 'No Loan', 'min': 0, 'max': 0, 'color': '#27ae60'},
        {'name': '<5M', 'min': 0.01, 'max': 5_000_000, 'color': '#3498db'},
        {'name': '5M-10M', 'min': 5_000_001, 'max': 10_000_000, 'color': '#f39c12'},
        {'name': '10M-15M', 'min': 10_000_001, 'max': 15_000_000, 'color': '#e67e22'},
        {'name': '>15M', 'min': 15_000_001, 'max': float('inf'), 'color': '#e74c3c'}
    ]

    # Loan purpose visual mapping - ADDED 'Undefined'
    LOAN_PURPOSE_MAP = {
        'Konsumsi': {'color': '#3498db', 'icon': '🛒'},
        'Pendidikan': {'color': '#9b59b6', 'icon': '🎓'},
        'Usaha': {'color': '#2ecc71', 'icon': '💼'},
        'Gaya': {'color': '#e74c3c', 'icon': '💄'},
        'Lainnya': {'color': '#95a5a6', 'icon': '📊'},
        'Undefined': {'color': '#bdc3c7', 'icon': '❓'}
    }
    
    def __init__(self, df):
        """
        Initialize LoanProcessor with DataFrame
        
        Args:
            df (pd.DataFrame): DataFrame containing outstanding_loan column
        """
        self.df = df
        self.loan_categories = self.LOAN_CATEGORIES
    
    def get_loan_statistics(self):
        """
        Calculate comprehensive loan statistics
        
        Returns:
            dict: Loan statistics including mean, median, distribution
        """
        loan_data = self.df['outstanding_loan'].replace(0, np.nan).dropna()
        
        if len(loan_data) == 0:
            return self._get_empty_stats()
        
        stats = {
            'total_respondents': len(self.df),
            'with_loan': int((self.df['outstanding_loan'] > 0).sum()),
            'without_loan': int((self.df['outstanding_loan'] == 0).sum()),
            'mean': float(loan_data.mean()),
            'median': float(loan_data.median()),
            'max': float(loan_data.max()),
            'min': float(loan_data.min()),
            'std': float(loan_data.std()),
            'total_outstanding': float(loan_data.sum())
        }
        
        # Calculate percentages
        stats['with_loan_pct'] = round((stats['with_loan'] / stats['total_respondents']) * 100, 1) if stats['total_respondents'] > 0 else 0
        stats['without_loan_pct'] = round((stats['without_loan'] / stats['total_respondents']) * 100, 1) if stats['total_respondents'] > 0 else 0
        
        return stats
    
    def get_loan_distribution(self):
        """
        Categorize loans into ranges for visualization
        
        Returns:
            dict: Distribution data with categories, counts, and percentages
        """
        distribution = []
        total = len(self.df)
        
        for category in self.loan_categories:
            count = self._count_loans_in_category(category)
            percentage = round((count / total) * 100, 1) if total > 0 else 0.0
            
            distribution.append({
                'category': category['name'],
                'count': count,
                'percentage': percentage,
                'color': category['color']
            })
        
        return {
            'categories': [d['category'] for d in distribution],
            'counts': [d['count'] for d in distribution],
            'percentages': [d['percentage'] for d in distribution],
            'colors': [d['color'] for d in distribution]
        }
    
    def validate_loan_data(self):
        """
        Validate outstanding_loan data for accuracy and integrity
        
        Returns:
            dict: Validation report with statistics and issues
        """
        report = {
            'total_records': len(self.df),
            'valid_records': 0,
            'invalid_records': 0,
            'issues': [],
            'data_types': {},
            'value_ranges': {},
            'statistics': {}
        }
        
        loan_column = self.df['outstanding_loan']
        report['data_types']['current_dtype'] = str(loan_column.dtype)
        
        # Convert to numeric if needed
        try:
            loan_numeric = pd.to_numeric(loan_column, errors='coerce')
            report['data_types']['conversion_success'] = True
        except Exception as e:
            report['data_types']['conversion_success'] = False
            report['issues'].append(f"Conversion error: {str(e)}")
            return report
        
        # Check for invalid values
        null_count = int(loan_numeric.isnull().sum())
        negative_count = int((loan_numeric < 0).sum())
        excessive_count = int((loan_numeric > 100_000_000).sum())
        
        report['valid_records'] = len(loan_numeric) - null_count - negative_count
        report['invalid_records'] = null_count + negative_count
        
        if null_count > 0:
            report['issues'].append(f"Found {null_count} null/invalid values")
        if negative_count > 0:
            report['issues'].append(f"Found {negative_count} negative values")
        if excessive_count > 0:
            report['issues'].append(f"Found {excessive_count} values > 100M IDR (potential outliers)")
        
        # Value ranges
        valid_loans = loan_numeric[loan_numeric >= 0].dropna()
        if len(valid_loans) > 0:
            report['value_ranges'] = {
                'min': float(valid_loans.min()),
                'max': float(valid_loans.max()),
                'mean': float(valid_loans.mean()),
                'median': float(valid_loans.median()),
                'std': float(valid_loans.std())
            }
        
        # Category distribution
        report['statistics']['by_category'] = {}
        for category in self.loan_categories:
            count = self._count_loans_in_category(category, loan_numeric)
            report['statistics']['by_category'][category['name']] = count
        
        return report
    
    def get_filtered_loan_data_by_income(self, income_category):
        """
        Get comprehensive loan data filtered by income category
        
        Args:
            income_category (str): Income category to filter by (e.g., '<2jt', '2-4jt')
        
        Returns:
            dict: Filtered loan statistics with distribution
        """
        # Filter dataframe
        if income_category and income_category != 'All':
            filtered_df = self.df[self.df['avg_income_category'] == income_category]
        else:
            filtered_df = self.df
        
        if len(filtered_df) == 0:
            return self._get_empty_filtered_stats(income_category)
        
        # CRITICAL FIX: Fill NaN with 0 before processing
        # Ensures NULL values are treated as "No Loan" for consistent counting
        loan_data = filtered_df['outstanding_loan'].fillna(0)
        loan_data_with_loans = loan_data[loan_data > 0]
        
        # Calculate statistics
        stats = {
            'filter_applied': income_category if income_category else 'All',
            'total_respondents': len(filtered_df),
            'with_loan': int((loan_data > 0).sum()),
            'without_loan': int((loan_data == 0).sum()),
            'with_loan_pct': 0.0,
            'without_loan_pct': 0.0,
            'mean': 0.0,
            'median': 0.0,
            'mode': 0.0,
            'max': 0.0,
            'min': 0.0,
            'total_outstanding': 0.0
        }
        
        if len(loan_data_with_loans) > 0:
            stats['mean'] = float(loan_data_with_loans.mean())
            stats['median'] = float(loan_data_with_loans.median())
            stats['max'] = float(loan_data_with_loans.max())
            stats['min'] = float(loan_data_with_loans.min())
            stats['total_outstanding'] = float(loan_data_with_loans.sum())
            
            # Calculate mode
            mode_result = loan_data_with_loans.mode()
            stats['mode'] = float(mode_result.iloc[0]) if len(mode_result) > 0 else 0.0
        
        stats['with_loan_pct'] = round((stats['with_loan'] / stats['total_respondents']) * 100, 1) if stats['total_respondents'] > 0 else 0
        stats['without_loan_pct'] = round((stats['without_loan'] / stats['total_respondents']) * 100, 1) if stats['total_respondents'] > 0 else 0
        
        # Calculate distribution for filtered data
        distribution = []
        for category in self.loan_categories:
            count = self._count_loans_in_category(category, loan_data)
            percentage = round((count / len(filtered_df)) * 100, 1) if len(filtered_df) > 0 else 0.0
            
            distribution.append({
                'category': category['name'],
                'count': count,
                'percentage': percentage,
                'color': category['color']
            })
        
        stats['distribution'] = distribution
        
        return stats

    def get_loan_purpose_distribution(self):
        """
        Calculates the distribution of loan usage purposes, including undefined ones.
        This ensures the total number of borrowers matches the loan distribution chart.

        Returns:
            list: A list of dictionaries with loan purpose distribution data,
                  sorted by count with 'Undefined' placed last.
        """
        # 1. Get all records with an outstanding loan > 0
        borrowers_df = self.df[self.df['outstanding_loan'] > 0].copy()

        if borrowers_df.empty:
            return []

        # 2. Normalize 'loan_usage_purpose' to group all non-defined purposes
        borrowers_df['loan_usage_purpose'] = borrowers_df['loan_usage_purpose'].fillna('Undefined')
        borrowers_df['loan_usage_purpose'] = borrowers_df['loan_usage_purpose'].replace(['Tidak Ada', ''], 'Undefined')

        # 3. Calculate value counts
        purpose_counts = borrowers_df['loan_usage_purpose'].value_counts()
        total_borrowers = len(borrowers_df)

        # 4. Build the distribution list with all required attributes
        distribution = []
        for purpose, count in purpose_counts.items():
            percentage = (count / total_borrowers) * 100 if total_borrowers > 0 else 0
            mapping = self.LOAN_PURPOSE_MAP.get(purpose, self.LOAN_PURPOSE_MAP['Lainnya'])
            
            distribution.append({
                'purpose': purpose,
                'count': int(count),
                'percentage': round(percentage, 1),
                'color': mapping['color'],
                'icon': mapping['icon']
            })
            
        # 5. Sort by count descending, but ensure 'Undefined' is always last
        distribution.sort(key=lambda x: (x['purpose'] == 'Undefined', -x['count']))
        
        return distribution

    def _count_loans_in_category(self, category, loan_data=None):
        """
        Count loans in a specific category (NULL-safe)
        
        Args:
            category (dict): Category definition with min/max values
            loan_data (pd.Series, optional): Loan data to count. Defaults to self.df['outstanding_loan']
        
        Returns:
            int: Count of loans in category
        """
        if loan_data is None:
            loan_data = self.df['outstanding_loan']
        
        # CRITICAL FIX: Fill NaN with 0 to ensure all records are categorized
        # Treats missing loan data as "No Loan" for consistent aggregation
        loan_data = loan_data.fillna(0)
        
        if category['max'] == 0:
            return int((loan_data == 0).sum())
        elif category['max'] == float('inf'):
            return int((loan_data >= category['min']).sum())
        else:
            return int(((loan_data >= category['min']) & (loan_data <= category['max'])).sum())
    
    def _get_empty_stats(self):
        """Return empty statistics structure"""
        return {
            'total_respondents': len(self.df),
            'with_loan': 0,
            'without_loan': len(self.df),
            'mean': 0.0,
            'median': 0.0,
            'max': 0.0,
            'min': 0.0,
            'std': 0.0,
            'total_outstanding': 0.0,
            'with_loan_pct': 0.0,
            'without_loan_pct': 100.0
        }
    
    def _get_empty_filtered_stats(self, category):
        """Return empty filtered statistics structure"""
        return {
            'filter_applied': category,
            'total_respondents': 0,
            'with_loan': 0,
            'without_loan': 0,
            'with_loan_pct': 0.0,
            'without_loan_pct': 0.0,
            'mean': 0.0,
            'median': 0.0,
            'mode': 0.0,
            'max': 0.0,
            'min': 0.0,
            'total_outstanding': 0.0,
            'distribution': []
        }
    
    @staticmethod
    def format_currency(amount):
        """
        Format amount as Indonesian Rupiah
        
        Args:
            amount (float): Amount to format
        
        Returns:
            str: Formatted currency string
        """
        if amount >= 1_000_000_000:
            return f"Rp {amount/1_000_000_000:.1f}B"
        elif amount >= 1_000_000:
            return f"Rp {amount/1_000_000:.1f}M"
        elif amount >= 1_000:
            return f"Rp {amount/1_000:.1f}K"
        else:
            return f"Rp {amount:.0f}"