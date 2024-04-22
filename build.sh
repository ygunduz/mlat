#! /bin/bash
wails build -clean
cp "./build/bin/MLAT Configuration Tool" ./mlat/opt/mlat/mlat
cp ./build/appicon.png ./mlat/opt/mlat/wails-runtime

dpkg-deb --build mlat
