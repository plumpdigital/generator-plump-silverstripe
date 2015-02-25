#!/bin/bash

# TODO: Composer requires Git

echo "Downloading composer"
curl -sS https://getcomposer.org/installer | php

echo "Moving composer to /usr/bin"
mv composer.phar /usr/bin/composer

echo "Composer installed"