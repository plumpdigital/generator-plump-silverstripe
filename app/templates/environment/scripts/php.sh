#!/bin/bash

# TODO: Use PHP5.5 rather than the default, which appears to be 5.3

echo "Installing PHP"
yum install -y php php-common php-pdo php-mysql php-session php-dom php-gd php-fileinfo php-hash php-iconv php-mbstring php-simplexml php-tokenizer php-xml php-tidy

# Change owner of PHP session to match Apache user.
if [ -d /var/lib/php/session ]
then
	chown -R vagrant: /var/lib/php/session
fi

echo "Copying PHP.ini"
cp -f /vagrant/environment/config/php.ini /etc/php.ini

echo "PHP installed, restarting Apache"
/sbin/service httpd restart