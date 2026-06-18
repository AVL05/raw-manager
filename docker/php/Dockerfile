FROM php:8.2-fpm

RUN apt-get update && apt-get install -y git curl libpng-dev libonig-dev libxml2-dev libzip-dev libfreetype6-dev libjpeg62-turbo-dev libwebp-dev zip unzip
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl
RUN apt-get clean

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY docker/php/php.ini /usr/local/etc/php/conf.d/raw-manager.ini

WORKDIR /var/www

RUN useradd -G www-data,root -u 1000 -d /home/rawuser rawuser && mkdir -p /home/rawuser/.composer && chown -R rawuser:rawuser /home/rawuser

USER rawuser
