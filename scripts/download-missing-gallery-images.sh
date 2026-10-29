#!/usr/bin/env bash
# Download the 4 gallery images that couldn't be fetched due to Wikimedia rate limiting.
# Run this script when you're not rate-limited:
#   bash scripts/download-missing-gallery-images.sh

DIR="public/gallery"
echo "Downloading missing gallery images..."

curl -sL -o "$DIR/guernica.jpg" \
  "https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Guernica_%28Picasso%29.jpg/500px-Guernica_%28Picasso%29.jpg" && \
  echo "OK guernica.jpg ($(wc -c < "$DIR/guernica.jpg") bytes)" || echo "FAIL guernica.jpg"

sleep 5

curl -sL -o "$DIR/persistence-memory.jpg" \
  "https://upload.wikimedia.org/wikipedia/en/thumb/d/dd/The_Persistence_of_Memory.jpg/500px-The_Persistence_of_Memory.jpg" && \
  echo "OK persistence-memory.jpg ($(wc -c < "$DIR/persistence-memory.jpg") bytes)" || echo "FAIL persistence-memory.jpg"

sleep 5

curl -sL -o "$DIR/shrimp.jpg" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/%E9%BD%90%E7%99%BD%E7%9F%B3-%E8%99%BE.jpg/500px-%E9%BD%90%E7%99%BD%E7%9F%B3-%E8%99%BE.jpg" && \
  echo "OK shrimp.jpg ($(wc -c < "$DIR/shrimp.jpg") bytes)" || echo "FAIL shrimp.jpg"

sleep 5

curl -sL -o "$DIR/mount-emei.jpg" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Chang_Dai-chien%2C_Mount_Lu.jpg/500px-Chang_Dai-chien%2C_Mount_Lu.jpg" && \
  echo "OK mount-emei.jpg ($(wc -c < "$DIR/mount-emei.jpg") bytes)" || echo "FAIL mount-emei.jpg"

echo "Done. Check sizes — files < 5KB are likely error pages, delete and retry later."
