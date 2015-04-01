#!/bin/bash

echo "Resetting database data."
mysql -u root ss < /vagrant/test-data/database.sql
