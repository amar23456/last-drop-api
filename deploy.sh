#! /usr/bin/env bash
git add .
git commit -m "pushing up latest"
git push

ssh root@159.69.70.114 -t -p 29022 "git pull && /etc/init.d/nginx restart && pm2 restart 0"