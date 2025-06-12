# BioSave: A Deep Learning System for Biodiversity Assessment using Remote Sensing 🌍

This project implements a **non-intrusive, deep learning-based system** for estimating biodiversity using **multispectral satellite imagery**. The goal is to predict **alpha and beta diversity** (species richness and turnover) using environmental data derived from satellite bands and validate it using camera trap ground-truths.

## Overview

Traditional methods like camera traps and GPS collars are labor-intensive and disruptive. This project, built in collaboration with **WWF** and **KAUST**, uses **Sentinel-2 imagery** and a **2D Convolutional Neural Network (CNN)** to provide large-scale, low-intrusion biodiversity assessments.

## Features

- Predicts **alpha** (species richness) and **beta diversity** (species turnover)
- Uses inputs from **NDVI**, **EVI**, **NDWI**, and RGB/NIR bands
- Supports visualization via a **React.js + Flask** web interface
- Outputs interactive maps, heatmaps, and region-specific stats
- Includes secure login, database integration, and administrative control

## Model Architecture

- Dual-branch **2D CNN**
  - One branch processes tabular spectral features (NDVI, NDWI, lat/lon)
  - One processes RGB image tiles
- Output: continuous values for alpha and beta diversity
- Framework: **PyTorch**
- Trained on data from **GBIF**, camera traps, and Google Earth Engine

## Data Sources

- Satellite: **Sentinel-2**, processed via **Google Earth Engine**
- Ground-truth: camera trap data, species occurrence data from **GBIF**
- Environmental indices: NDVI, EVI, NDWI
- Spatial extraction via **QGIS**

## Visualizations

- Interactive map to explore biodiversity predictions by region
- Pie charts and bar graphs per species/country
- Point-and-click prediction output
- Side-by-side views of predicted vs. actual diversity

## Stack

- **Frontend:** React.js + Leaflet.js
- **Backend:** Flask (Python)
- **Database:** MySQL
- **DL Framework:** PyTorch
- **Remote Sensing Tools:** Google Earth Engine, QGIS

##Results

- **R² score**: 0.974
- **MAE**: 0.1008
- Inference time < 7s
- Outperformed ResNet, VGG, and MobileNet in predictive accuracy

## Future Work

- Add seasonality as a temporal input
- Incorporate high-res or hyperspectral imagery
- Expand to cover more regions with diverse ecosystems

---

*Built by Zunaira Farooq, Maria Boxwala, Linda Jim, and Ann Santosh — advancing conservation through machine learning.*
