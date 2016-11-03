cd /var/www/html
# export PORT=80
npm install
forever stop 0
forever start -l forever.log -o out.log -e err.log -a ./bin/www