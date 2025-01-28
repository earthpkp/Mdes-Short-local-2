# Mdes-Short-local-2
MySQL 

CREATE DATABASE url_shortener;
USE url_shortener;

CREATE TABLE urls (
  id VARCHAR(255) PRIMARY KEY,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  clicks INT DEFAULT 0,
  user_ip VARCHAR(45)
);


npm run api && dev JAAA