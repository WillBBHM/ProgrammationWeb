# 🚤 VoyageMarin - Setup & Installation Guide

Welcome to the official setup guide for **VoyageMarin**, a modern web application for boat rentals. This README provides step-by-step instructions to install, configure, and launch the application with a fully functional microservices architecture using Docker, Kubernetes, and Istio on Minikube.

## 🌟 Overview
VoyageMarin is a cloud-native web application built with a microservices architecture. It allows users to create accounts, browse available boats, view details, make reservations, and manage bookings. This guide ensures you can deploy the application locally with ease.

## 📋 Prerequisites
Before starting, ensure you have the following tools installed and configured on your machine:
- **Minikube**: To simulate a local Kubernetes cluster.
- **Docker**: For building and managing container images.
- **kubectl**: To interact with the Kubernetes cluster.
- **Istioctl or Helm**: To install and manage the Istio service mesh.
- **Administrator Access**: Required for executing certain commands (e.g., opening network tunnels).

Make sure these tools are fully operational before proceeding with the setup steps.

## 🛠️ Installation Steps
Follow these steps to deploy VoyageMarin on your local environment. Each command is crucial for setting up the application progressively on Minikube.

### 1. Start Minikube
Begin by launching your local Kubernetes cluster with Docker as the driver:

    minikube start --driver=docker

### 2. Apply Kubernetes Configurations
Deploy the necessary components by applying the configuration files in the specified order. This ensures dependencies like the database are set up before the services.

    kubectl apply -f mysql-init-configmap.yaml
    kubectl apply -f mysql-deployment.yaml
    kubectl apply -f mysql-service.yaml
    kubectl apply -f auth.yaml
    kubectl apply -f boat-app-deployment.yaml
    kubectl apply -f boat-app-service.yaml
    kubectl apply -f reservation-deployment-service.yaml
    kubectl apply -f frontend.yaml
    kubectl apply -f boat-gateway.yaml
    kubectl apply -f boat-virtual-service.yaml

**Note**: When re-running `kubectl apply` commands, you may see:
- `created` if the resource is newly created.
- `unchanged` if the resource already exists without changes.
- `configured` if the resource existed and was updated.

### 3. Open Minikube Tunnel
Expose the application to your local network by opening a tunnel:

    minikube tunnel

### 4. Access the Application
Once the tunnel is active, access VoyageMarin via your browser at:
- [http://127.0.0.1](http://127.0.0.1) or [http://127.0.0.1:80](http://127.0.0.1:80)

**Reminder**: On project restart, only steps 1, 3, and 4 are required. Step 2 (applying configurations) is necessary only if resources are deleted, modified, or the cluster is reset.

## 🔍 Verifying Deployment
After deployment, verify that everything is running correctly with these commands:
- **Check Pods**:

    kubectl get pods

  Displays the status of all pods.
- **List Services**:

    kubectl get services

  Shows the services exposed in the cluster.

Ensure all pods are in a `READY` state. If Istio proxy injection is not enabled by default, pods may show `READY 1/1` instead of `READY 2/2`. To enable automatic injection:

    kubectl label namespace default istio-injection=enabled --overwrite
    kubectl delete pod --all
    kubectl get pods

## 🛡️ Istio Service Mesh & Gateway
VoyageMarin uses **Istio** for secure and intelligent communication between services. The **Istio Gateway** acts as the single entry point to the Kubernetes cluster, routing HTTP requests on port 80 to the appropriate microservice based on URL paths (`/boats`, `/reservations`, `/login`).

This setup ensures:
- Secure traffic with mTLS.
- Intelligent routing and load balancing.
- Observability through logs and metrics.

## 🐛 Troubleshooting
If you encounter network accessibility issues (e.g., frontend not connecting externally):
- Ensure Minikube is started with `--driver=docker` to avoid IP conflicts.
- Configure services to listen on `0.0.0.0` for access from any network interface.

## 🚀 Features
Once deployed, VoyageMarin offers:
- **User Authentication**: Create accounts and log in securely.
- **Boat Listings**: Browse and filter available boats.
- **Boat Details**: View detailed information about each boat.
- **Reservations**: Book boats with dynamic pricing based on duration.
- **Booking Management**: Modify or cancel reservations based on availability.

## 💻 Tech Stack
- **Frontend**: React, JavaScript, HTML, CSS, TailwindCSS.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL with persistent volumes.
- **Infrastructure**: Docker, Kubernetes, Istio.

## 📜 Conclusion
With this guide, you should have VoyageMarin up and running locally. This setup demonstrates a scalable, secure, and modern microservices architecture, ideal for learning and development purposes.

For further assistance, feel free to reach out or consult additional Kubernetes and Istio documentation.
