# app/routes.py

from flask import Blueprint, request, jsonify
import torch
from app.model_utils import predict  # ← make sure this exists

routes = Blueprint('routes', __name__)
print("LOADING ROUTES FROM:", __file__)

@routes.route('/predict', methods=['POST'])
def predict_endpoint():
    data = request.get_json()
    lat = data.get('lat')
    lng = data.get('lng')

    if lat is None or lng is None:
        return jsonify({'error': 'Missing lat/lng'}), 400

    # TEMP: Simulated input
    image_tensor = torch.rand(1, 3, 256, 256)
    tabular_tensor = torch.rand(1, 9)

    try:
        alpha, beta = predict(image_tensor, tabular_tensor)
        return jsonify({'alpha': alpha, 'beta': beta})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
