import torch
import torch.nn as nn

class FusionModel(nn.Module):
    def __init__(self):
        super(FusionModel, self).__init__()

        # Image (CNN) branch
        self.image_conv = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),  # [B, 3, 256, 256] -> [B, 64, 256, 256]
            nn.ReLU(),
            nn.MaxPool2d(2),  # -> [B, 64, 128, 128]

            nn.Conv2d(32, 16, kernel_size=3, padding=1),  # -> [B, 32, 128, 128]
            nn.ReLU(),
            nn.MaxPool2d(2),  # -> [B, 32, 16, 16]
            
            nn.Conv2d(16, 8, kernel_size=3, padding=1),  # -> [B, 16, 16, 16]
            nn.ReLU(),
            nn.MaxPool2d(2),  # -> [B, 16, 8, 8]

            nn.Flatten()
        )

        self.image_fc = nn.Sequential(
            nn.Linear(8 * 32 * 32, 64),
            nn.ReLU(),
            nn.Dropout(0.6)
        )

        # Tabular branch
        self.tabular_fc = nn.Sequential(
            nn.Linear(9, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU()
        )

        # Fusion + Output
        self.fusion = nn.Sequential(
            nn.Linear(64 + 32, 128),
            nn.ReLU(),
            nn.Dropout(0.6),
            nn.Linear(128, 2)  # Output: Alpha, Beta
        )

    def forward(self, image_input, tabular_input):
        x_img = self.image_conv(image_input)
        x_img = self.image_fc(x_img)

        x_tab = self.tabular_fc(tabular_input)

        x = torch.cat((x_img, x_tab), dim=1)
        return self.fusion(x)
