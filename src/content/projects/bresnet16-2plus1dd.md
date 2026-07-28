---
title: BResNet16-2Plus1DD
role: Author
year: "2025"
image: https://opengraph.githubassets.com/1/AliKHaliliT/BResNet16-2Plus1DD
link: https://github.com/AliKHaliliT/BResNet16-2Plus1DD
tags:
  - Python
  - TensorFlow
  - Deep Learning
  - Neural Architecture
---

A custom 2Plus1D (3D) deep learning architecture inspired by ResNet but designed for efficiency, processing spatial and temporal dimensions with separate consecutive convolutions to keep computational costs low on video tasks such as action recognition. Because standard 18 and 34 layer ResNets cannot be assembled from bottleneck residual layers alone, the closest workable depth is 16, and each stage is reduced to a single bottleneck residual block. The implementation folds in improvements from the Bag of Tricks for Image Classification paper, includes Hardswish and Mish activations, and integrates directly into TensorFlow and Keras pipelines.
