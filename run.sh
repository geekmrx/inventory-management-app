#!/bin/sh

set -e

# docker compose down -v # remove db
docker compose down 
# docker compose up --build -d # full rebuild
docker compose up -d