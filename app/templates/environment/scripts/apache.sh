#!/bin/bash

echo "Installing Apache"
yum install -y httpd

# Symlink Apache www directory to vagrant build
rm -rf /var/www/html
ln -s /vagrant/build /var/www/html

# Copy config
echo "Copying httpd.conf"
cp -f /vagrant/environment/config/httpd.conf /etc/httpd/conf/httpd.conf

echo "Apache installed"