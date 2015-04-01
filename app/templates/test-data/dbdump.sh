#!/bin/bash

echo "Dumping database data."
mysqldump -u root --extended-insert=FALSE ss > /vagrant/test-data/database.sql
