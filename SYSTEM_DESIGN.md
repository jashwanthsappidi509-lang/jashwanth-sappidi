# AgroVision: System Design & Development Plan

## 1. System Architecture
AgroVision follows a **Full-Stack Decoupled Architecture** with a React frontend and a Node.js/Express backend.

### Data Flow
1. **Frontend (React)**: Captures user inputs (soil data, location) and sends them via REST APIs.
2. **Backend (Express)**: Processes requests, handles authentication (JWT), and interacts with the database.
3. **ML Layer**: Currently implemented as rule-based logic in the backend. In a production environment, this would call a Python microservice (FastAPI) or run a pre-trained model via `onnxruntime` or `tensorflow.js`.
4. **Database (SQLite)**: Stores user profiles, historical predictions, and market data.

## 2. Frontend Component Structure
- `/src/components`: Reusable UI elements (Layout, Sidebar, Cards).
- `/src/pages`: Main view components (Dashboard, Recommendation, etc.).
- `/src/services`: API client using `fetch`.
- `/src/constants`: Mock data and theme configuration.

## 3. Backend API Endpoints
### Auth
- `POST /api/auth/register`: Create new farmer account.
- `POST /api/auth/login`: Authenticate and return JWT.
### Analytics
- `POST /api/recommendations`: Get crop suggestions (Soil Type, Season).
- `POST /api/predictions/yield`: Predict harvest (Rainfall, Temp, Nutrients).
- `POST /api/recommendations/fertilizer`: Suggest fertilizer based on NPK.
### Data
- `GET /api/weather`: Real-time weather and 7-day forecast.
- `GET /api/market/prices`: Crop prices with state-wise filtering.

## 4. Machine Learning Workflow
1. **Data Collection**: Gather datasets (e.g., Kaggle's "Crop Recommendation Dataset").
2. **Preprocessing**: Normalize NPK values, encode categorical data (Soil Type, Season).
3. **Training**: Use Scikit-learn (Random Forest) to train models.
4. **Deployment**: Export model as `.onnx` or `.json` and load in the backend for real-time inference.

## 5. Database Schema (SQLite/PostgreSQL)
### Users
- `id`: Primary Key
- `email`: Unique String
- `password`: Hashed String
- `location`: String
### Predictions
- `id`: Primary Key
- `user_id`: Foreign Key (Users)
- `crop_type`: String
- `predicted_yield`: Float
- `parameters`: JSON String (Input values)

## 6. Deployment Plan
1. **Frontend**: Build using `npm run build` and serve via Express static middleware.
2. **Backend**: Deploy on Cloud Run or Heroku.
3. **Database**: Use a managed PostgreSQL instance for production scalability.
