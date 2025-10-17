# AI Feedback Rubric

This document defines the evaluation criteria used by the AI feedback system to provide constructive feedback on Iris classification submissions.

## Evaluation Criteria

The AI feedback system evaluates submissions based on three main criteria:

### 1. Correctness (40% of feedback focus)

**What it measures**: How well the model performs on the classification task.

**Evaluation points**:
- **Accuracy**: Percentage of correct predictions
- **F1 Score**: Harmonic mean of precision and recall
- **Class Balance**: Performance across all three Iris species
- **Prediction Quality**: Consistency of predictions

**Feedback examples**:
- "Excellent accuracy! Your model shows outstanding performance with 95%+ accuracy."
- "Good accuracy! Your model performs well above average with 85%+ accuracy."
- "Decent accuracy. Consider fine-tuning your approach for better results."
- "Accuracy needs improvement. Review your data preprocessing and model selection."

### 2. Coverage (35% of feedback focus)

**What it measures**: Completeness and thoroughness of the solution.

**Evaluation points**:
- **Data Quality**: Presence of outliers, missing values, data distribution
- **Feature Engineering**: Proper use of sepal and petal measurements
- **Model Selection**: Appropriateness of the chosen approach
- **Data Size**: Adequacy of training data

**Feedback examples**:
- "Data quality is excellent with minimal outliers and good distribution."
- "Data quality is good with some minor outliers that could be addressed."
- "Consider data cleaning to remove outliers and improve quality."
- "Good dataset size for training, providing sufficient data for learning."

### 3. Formatting (25% of feedback focus)

**What it measures**: Quality of data presentation and adherence to requirements.

**Evaluation points**:
- **File Format**: Proper CSV structure
- **Column Names**: Correct naming convention
- **Data Types**: Appropriate numeric values
- **Value Ranges**: Realistic measurements within expected ranges

**Feedback examples**:
- "Perfect CSV formatting with all required columns present."
- "Good data formatting with proper column names and structure."
- "Consider improving data formatting for better compatibility."
- "File format meets requirements with proper CSV structure."

## Scoring Integration

The AI feedback system integrates with the scoring algorithm to provide context-aware feedback:

### Score Ranges and Feedback

**90-100% Score**:
- "Outstanding performance! Your model demonstrates exceptional accuracy and F1 score."
- "Excellent data quality with minimal outliers and optimal feature distribution."
- "Perfect formatting and adherence to requirements."

**80-89% Score**:
- "Strong performance with good accuracy and well-balanced F1 score."
- "Good data quality with minor areas for improvement."
- "Well-formatted data with proper structure."

**70-79% Score**:
- "Decent performance with room for improvement in accuracy and F1 score."
- "Adequate data quality with some outliers that could be addressed."
- "Good formatting with minor improvements needed."

**60-69% Score**:
- "Performance needs improvement. Consider different algorithms or feature engineering."
- "Data quality could be enhanced through better preprocessing."
- "Formatting is acceptable but could be more consistent."

**Below 60% Score**:
- "Significant improvement needed. Review your approach and methodology."
- "Data quality issues that need immediate attention."
- "Formatting problems that may affect model performance."

## Feedback Generation Process

### 1. Data Analysis

The system analyzes:
- **Statistical metrics**: Mean, std, min, max for each feature
- **Outlier detection**: Values beyond 2 standard deviations
- **Data distribution**: Spread and shape of data
- **Missing values**: Completeness of the dataset

### 2. Performance Evaluation

The system evaluates:
- **Accuracy calculation**: Correct predictions / Total predictions
- **F1 score calculation**: Weighted average across all classes
- **Class-specific performance**: Individual class precision and recall
- **Overall score**: 0.7 × Accuracy + 0.3 × F1 Score

### 3. Feedback Synthesis

The system combines:
- **Performance feedback**: Based on score ranges
- **Data quality feedback**: Based on statistical analysis
- **Formatting feedback**: Based on file structure validation
- **Actionable advice**: Specific recommendations for improvement

## Feedback Templates

### High Performance Template
```
Your Iris classification model achieved a score of {score:.4f}. The accuracy of {accuracy:.4f} shows {performance_level} performance. Your F1 score of {f1_score:.4f} indicates {balance_level} balance between precision and recall. {data_quality_feedback} {formatting_feedback} {recommendation}
```

### Medium Performance Template
```
Your model achieved a score of {score:.4f} with {accuracy:.4f} accuracy. The F1 score of {f1_score:.4f} shows {balance_level} performance across classes. {data_quality_feedback} {formatting_feedback} Consider {specific_recommendation} to improve results.
```

### Low Performance Template
```
Your submission scored {score:.4f} with {accuracy:.4f} accuracy. The F1 score of {f1_score:.4f} indicates {balance_level} performance. {data_quality_feedback} {formatting_feedback} Focus on {priority_improvement} to enhance your model's performance.
```

## Quality Assurance

### Feedback Validation

The system ensures:
- **Length limit**: Maximum 150 words
- **Tone consistency**: Professional and constructive
- **Actionable advice**: Specific recommendations
- **Accuracy**: Factual information only

### Continuous Improvement

The system:
- **Tracks feedback quality**: Monitors user satisfaction
- **Updates templates**: Based on common issues
- **Refines criteria**: As new patterns emerge
- **Maintains consistency**: Across all feedback

## Examples

### Example 1: High Performance
```
Your Iris classification model achieved a score of 0.9234. The accuracy of 0.9400 shows outstanding performance. Your F1 score of 0.9100 indicates excellent balance between precision and recall. Data quality is excellent with minimal outliers and optimal feature distribution. Perfect CSV formatting with all required columns present. Consider fine-tuning hyperparameters to achieve even better results.
```

### Example 2: Medium Performance
```
Your model achieved a score of 0.7856 with 0.8000 accuracy. The F1 score of 0.7600 shows good performance across classes. Data quality is good with some minor outliers that could be addressed. Well-formatted data with proper structure. Consider exploring different algorithms or feature engineering to improve results.
```

### Example 3: Low Performance
```
Your submission scored 0.6234 with 0.6500 accuracy. The F1 score of 0.5800 indicates room for improvement in class balance. Data quality could be enhanced through better preprocessing and outlier removal. Formatting is acceptable but could be more consistent. Focus on data cleaning and model selection to enhance your model's performance.
```

## Technical Implementation

### Feedback Generation
- **Template system**: Predefined templates with variable substitution
- **Rule-based logic**: Conditional feedback based on score ranges
- **Natural language**: Human-readable feedback generation
- **Length control**: Automatic truncation to 150 words

### Quality Control
- **Validation rules**: Ensure feedback meets criteria
- **Consistency checks**: Maintain tone and style
- **Error handling**: Graceful fallback for edge cases
- **Logging**: Track all feedback generation for analysis

This rubric ensures that all users receive constructive, actionable feedback that helps them understand their performance and improve their submissions.
