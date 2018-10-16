#!/usr/bin/env bash

BASE_DIR=$(dirname "$0")"/../.."
INSTALLER_DIR=$BASE_DIR"/.."
SRC=$INSTALLER_DIR"/vba-blocks.app"
APP="/Applications/vba-blocks.app"

# Remove existing vba-blocks.app
if [ -d $APP ]; then
  echo "Removing previous version at "$APP
  rm -rf "$APP"
fi

# Copy vba-blocks.app to Applications
echo "Copying "$SRC" to "$APP
cp -rf "$SRC" "$APP"

# Add bin to .profile / .bash_profile
BIN=$APP"/bin"
VBA_BLOCKS="export PATH=\"\$PATH:"$BIN"\""
PROFILE=$HOME"/.profile"
BASH_PROFILE=$HOME"/.bash_profile"

if ! [ -a $PROFILE ] || ! grep -q $BIN $PROFILE; then
  echo "Adding "$VBA_BLOCKS" to "$PROFILE
  echo $VBA_BLOCKS >> "$PROFILE"
fi
if [ -a $BAS_PROFILE ] && ! grep -q $BIN $BASH_PROFILE; then
  echo "Adding "$VBA_BLOCKS" to "$BASH_PROFILE
  echo $VBA_BLOCKS >> "$BASH_PROFILE"
fi

# Create .vba-blocks folder
CACHE=$HOME"/.vba-blocks"
ADDINS_SRC=$APP"/addins/"
ADDINS_LINK=$HOME"/vba-blocks Add-ins"

if ! [ -d $CACHE ]; then
  mkdir "$CACHE"
fi

echo "Linking "$ADDINS_SRC" to "$ADDINS_LINK
ln -sf "$ADDINS_SRC" "$ADDINS_LINK"

open $APP
