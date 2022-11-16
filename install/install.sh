## ansible
sudo apt-add-repository ppa:ansible/ansible
sudo apt update
sudo apt install ansible

## nodejs and npm
sudo apt install nodejs
sudo apt install npm

## rqlite
curl -L https://github.com/rqlite/rqlite/releases/download/v5.3.0/rqlite-v5.3.0-linux-amd64.tar.gz -o rqlite-v5.3.0-linux-amd64.tar.gz
tar xvfz rqlite-v5.3.0-linux-amd64.tar.gz
ln -s rqlite-v5.3.0-linux-amd64 rqlite

## Docker Engine
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

## prometheus
sudo apt install prometheus

## prometheus-node-exporter
sudo apt install prometheus-node-exporter

## megapolos
curl https://gitlab.com/api/v4/projects/40638439/repository/files/%2Eeslintrc%2Ejson/raw?ref=master
cd megapolos/install 

sudo npm config.js
