#!/bin/bash

# Start backend in the background
uvicorn server.main:app --host 0.0.0.0 --port 8000 &

# Build and serve frontend
cd curvefever-client
npm install
npm run build
npx serve -s build -l 3000
