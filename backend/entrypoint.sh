#!/bin/sh

echo "Waiting for database..."

sleep 5

echo "Running migrations..."

npm run migrate

echo "Starting server..."

npm start
