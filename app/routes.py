# app/routes.py

from flask import Blueprint, request, jsonify
from app.gee_utils import get_image_and_indices
import torch
from app.model_utils import predict  # ← make sure this exists

routes = Blueprint('routes', __name__)
print("LOADING ROUTES FROM:", __file__)

@routes.route('/predict', methods=['POST'])
def predict_endpoint():
    data = request.get_json()
    lat = data.get('lat')
    lng = data.get('lng')

    print("📡 /predict HIT with:", lat, lng)

    try:
        image_tensor, tabular_tensor = get_image_and_indices(lat, lng)
        alpha, beta = predict(image_tensor, tabular_tensor)
        return jsonify({'alpha': alpha, 'beta': beta})
    except Exception as e:
        print("❌ Error inside /predict:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    

@routes.route('/ping')
def ping():
    return "pong"
