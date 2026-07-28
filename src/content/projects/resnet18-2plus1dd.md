---
title: ResNet18-2Plus1DD
role: Author
year: "2025"
image: https://opengraph.githubassets.com/1/AliKHaliliT/ResNet18-2Plus1DD
link: https://github.com/AliKHaliliT/ResNet18-2Plus1DD
tags:
  - Python
  - TensorFlow
  - Deep Learning
  - Neural Architecture
---

A fully serializable 2Plus1D (3D) implementation of ResNet18 that factorizes convolutions into separate spatial and temporal steps, a technique from the paper A Closer Look at Spatiotemporal Convolutions for Action Recognition that suits video tasks such as action recognition. It incorporates improvements from Bag of Tricks for Image Classification, including a three-layer convolutional stem, ResNet-B inspired stride placement, and a ResNet-D inspired average-pooling shortcut, with the temporal dimension downsampled only twice in the stem. Hardswish and Mish activation implementations are included, and the codebase integrates directly into TensorFlow and Keras pipelines.
