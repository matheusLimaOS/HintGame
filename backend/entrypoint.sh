#!/bin/sh

echo "Waiting for database..."

sleep 5

echo "Running migrations..."

php bin/console doctrine:migrations:migrate --no-interaction

echo "Starting Symfony server..."

php -S 0.0.0.0:8000 -t public
