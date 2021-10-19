#!/usr/bin/env bash

cd chroxy-frontend
npm i
NODE_ENV=production npm run build
cd ..

git add .
git commit -m deploy
git push origin master
git subtree push --prefix chroxy-frontend origin gh-pages