from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.model_selection import train_test_split, cross_val_score, RandomizedSearchCV, GridSearchCV
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.feature_selection import RFE
from sklearn.model_selection import KFold
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Init flask app
app = Flask(__name__)
CORS(app)

# Load dataset
data = pd.read_csv('cvd_dataset.csv', sep=';', nrows=500)

# Handle missing values (drop rows with missing values)
data.dropna(inplace=True)

# Split into features and target
X = data.drop(["id", "cardio"], axis=1)
y = data['cardio']

# Exploratory Data Analysis (EDA)
print(data.shape)
print(data.info())
print(data.describe())
print(data.head())

# Plot count plots for the categorical columns
categorical_columns = ['gender', 'cholesterol', 'gluc', 'smoke', 'alco', 'active']
fig, axes = plt.subplots(2, 3)
fig.suptitle('Distribution of Categorical Features')
for ax, column in zip(axes.flatten(), categorical_columns):
    sns.countplot(x=column, data=data, palette='Set2', hue=column, ax=ax)
    ax.set_title(f'Distribution of {column.capitalize()}')
    ax.set_xlabel(column.capitalize())
    ax.set_ylabel('Count')
plt.tight_layout(rect=[0, 0, 1, 0.96])
plt.show()

# Plot historgrams for the numerical columns
numerical_columns = ['age', 'height', 'weight', 'ap_hi', 'ap_lo']
fig, axes = plt.subplots(2, 3)
fig.suptitle('Distribution of Numerical Features')

for ax, column in zip(axes.flatten()[:5], numerical_columns):
    sns.histplot(data[column], kde=True, color='skyblue', ax=ax)
    ax.set_title(column.capitalize())
    ax.set_xlabel(column.capitalize())
    ax.set_ylabel('Count')

axes.flatten()[-1].set_visible(False)
plt.tight_layout(rect=[0, 0, 1, 0.96])
plt.show()

# Plot distribution of target variable
sns.countplot(x='cardio', data=data, palette='Set2', hue='cardio', legend=False)
plt.title('Distribution of Target Variable')
plt.xlabel('Cardio')
plt.ylabel('Count')
plt.show()

# Compute the correlation matrix
corr_matrix = X.corr()

# Plot the heatmap
plt.figure()
sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt='.2f', linewidths=0.5)
plt.title('Correlation Heatmap')
plt.show()

# Feature selection using RFE
estimator = RandomForestClassifier()
selector = RFE(estimator, n_features_to_select=10, step=1)
X_selected = selector.fit_transform(X, y)

# Scale the features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_selected)

# Visualizing the clusters in a 2D space (using first two principal components)
pca = PCA(n_components=2)
pca_result = pca.fit_transform(X_scaled)

# Using KMeans clustering
kmeans = KMeans(n_clusters=3, random_state=42)  # Adjust n_clusters based on your data
data['cluster'] = kmeans.fit_predict(X_scaled)

# Plot the clusters
plt.figure()
sns.scatterplot(x=pca_result[:, 0], y=pca_result[:, 1], hue=data['cluster'], palette='Set2')
plt.title('2D PCA of Clusters')
plt.show()

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Define the parameter grids for each model
param_grids = {
    "Decision Tree": {
        'criterion': ['gini', 'entropy'],
        'max_depth': [None, 10, 20, 30, 40, 50, 60, 70],
        'min_samples_split': [2, 5, 10, 15, 20],
        'min_samples_leaf': [1, 2, 4, 6, 8],
    },
    "Random Forest": {
        'n_estimators': [10, 50, 100, 200, 300, 400, 500],
        'criterion': ['gini', 'entropy'],
        'max_depth': [None, 10, 20, 30, 40, 50, 60, 70],
        'min_samples_split': [2, 5, 10, 15, 20],
        'min_samples_leaf': [1, 2, 4, 6, 8],
        'bootstrap': [True, False]
    },
    "Support Vector Machine": {
        'C': [0.1, 1, 10, 100, 1000],
        'gamma': ['scale', 'auto'],
        'kernel': ['linear', 'rbf', 'poly', 'sigmoid'],
        'degree': [2, 3, 4, 5],
        'coef0': [0.0, 0.1, 0.5, 1.0]
    }
}

# Initialize the models
model_constructors = {
    "Decision Tree": DecisionTreeClassifier,
    "Random Forest": RandomForestClassifier,
    "Support Vector Machine": SVC
}

models = {}
grid_tuning_models = {}
randomized_tuning_models = {}

# Fit and train, perform hyperparameter tuning
for name, model in model_constructors.items():
    untuned_instance = model()
    untuned_instance.fit(X_train, y_train)
    models[name] = untuned_instance

    grid_tuning_instance = RandomizedSearchCV(model(), param_grids[name], cv=5, n_iter=10, n_jobs=-1)
    grid_tuning_instance.fit(X_train, y_train)
    grid_tuning_models[name] = grid_tuning_instance

    randomized_tuning_instance = RandomizedSearchCV(model(), param_grids[name], cv=5, n_iter=10, n_jobs=-1)
    randomized_tuning_instance.fit(X_train, y_train)
    randomized_tuning_models[name] = randomized_tuning_instance

# Evaluate the models
results = {}
all_models = {
    "Untuned Decision Tree": models["Decision Tree"],
    "Grid Search Decision Tree": grid_tuning_models["Decision Tree"],
    "Randomized Search Decision Tree": randomized_tuning_models["Decision Tree"],
    "Untuned Random Forest": models["Random Forest"],
    "Grid Search Random Forest": grid_tuning_models["Random Forest"],
    "Randomized Search Random Forest": randomized_tuning_models["Random Forest"],
    "Untuned Support Vector Machine": models["Support Vector Machine"],
    "Grid Search Support Vector Machine": grid_tuning_models["Support Vector Machine"],
    "Randomized Search Support Vector Machine": randomized_tuning_models["Support Vector Machine"]
}

for model_name, model in all_models.items():
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted')
    recall = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    # Perform k-fold cross-validation
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X_scaled, y, cv=kf)

    # Construct classification report
    report = classification_report(y_test, y_pred, output_dict=True)
    print(f"Classification Report for {model_name}")
    print(report)
    
    results[model_name] = {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'cross_val_score': cv_scores.mean(),
    }

print(results)

@app.route('/evaluate', methods=['GET'])
def evaluate():
    return jsonify(results)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    model_name = data.get('model')
    tuning = data.get('tuning')
    input_data = data.get('input')
    
    if model_name not in models:
        return jsonify({'error': 'Model not found'}), 400
    
    if tuning == "Grid Search":
        model = grid_tuning_models[model_name]
    elif tuning == "Randomized Search":
        model = randomized_tuning_models[model_name]
    else:
        model = models[model_name]
    
    input_data_df = pd.DataFrame([input_data], columns=X.columns)
    input_data_selected = selector.transform(input_data_df)
    input_data_scaled = scaler.transform(input_data_selected)
    prediction = model.predict(input_data_scaled)
    
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(debug=True, port=5000, use_reloader=False)