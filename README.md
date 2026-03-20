# SafeGuard AI — Sistema de Auditoría Laboral Inmutable

Sistema de detección de eventos laborales en tiempo real con evidencia certificada en blockchain.

## Stack
- Edge/IA: Python + YOLOv8 + OpenCV
- Backend: Python + FastAPI + WebSockets
- Frontend: React + Tailwind
- Blockchain: Polygon Amoy Testnet + Web3.py
- DB: SQLite (dev) -> PostgreSQL (prod)

## Quick Start
```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```
