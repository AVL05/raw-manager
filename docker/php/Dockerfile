FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev libzip-dev \
    libfreetype6-dev libjpeg62-turbo-dev libwebp-dev \
    libicu-dev zip unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY docker/php/php.ini /usr/local/etc/php/conf.d/raw-manager.ini

WORKDIR /var/www

RUN useradd -G www-data,root -u 1000 -d /home/rawuser rawuser \
    && mkdir -p /home/rawuser/.composer \
    && chown -R rawuser:rawuser /home/rawuser \
    && mkdir -p /var/www/storage/app/public/invoices \
              /var/www/storage/app/public/quotes \
              /var/www/storage/app/public/galleries \
              /var/www/storage/fonts \
              /var/www/storage/logs \
              /var/www/storage/framework/cache \
              /var/www/storage/framework/sessions \
              /var/www/storage/framework/views \
    && chmod -R 775 /var/www/storage

USER rawuser
