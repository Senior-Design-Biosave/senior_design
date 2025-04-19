import torch
from model.model_def import FusionModel

def load_model(model_path=r'C:\Users\boxwa\Senior_GUI\senior_design\model\best_model.pt'):
    model = FusionModel()
    model.load_state_dict(torch.load(model_path, map_location='cpu'))
    model.eval()
    return model

def test_model():
    model = load_model()

    dummy_image = torch.rand(1, 3, 256, 256)      # Simulated RGB input
    dummy_tabular = torch.rand(1, 9)              # Simulated indices

    with torch.no_grad():
        output = model(dummy_image, dummy_tabular)
    
    alpha, beta = output[0].tolist()
    print(f"Test Output — Alpha: {alpha:.4f}, Beta: {beta:.4f}")

_model = None  # Global variable for caching the model

def get_model():
    global _model
    if _model is None:
        _model = load_model()
    return _model

def predict(image_tensor, tabular_tensor):
    """
    Accepts:
        image_tensor: torch.Tensor of shape (1, 3, 256, 256)
        tabular_tensor: torch.Tensor of shape (1, 9)
    Returns:
        (alpha, beta): tuple of predicted values
    """
    model = get_model()
    with torch.no_grad():
        output = model(image_tensor, tabular_tensor)
    alpha, beta = output[0].tolist()
    return alpha, beta