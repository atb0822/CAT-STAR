#!/bin/bash

echo "================================================"
echo "  CAT-STAR 2000 v1.3.30"
echo "  Cable Access Television"
echo "  Scheduled Television Announcements & Reports"
echo "================================================"
echo ""
echo "  Copyright (C) 2026 Aaron Boone"
echo "  All Rights Reserved"
echo ""
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Clear npm cache to prevent issues
echo "Clearing npm cache..."
npm cache clean --force 2>/dev/null
echo ""

# Always check and install/update dependencies
echo "Checking dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to install dependencies!"
    echo "Please check your internet connection and try again."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi
echo ""
echo "Dependencies installed/updated successfully!"
echo ""

# Start the server
echo "================================================"
echo "CAT-STAR 2000 v1.3.30 Server Starting..."
echo "Cable Access Television"
echo "Scheduled Television Announcements & Reports"
echo "================================================"
echo ""
echo "Access URLs:"
echo "  Menu:                  http://localhost:3000/menu"
echo "  Admin Panel:           http://localhost:3000/admin"
echo "  Current Live Display:  http://localhost:3000/"
echo "  Events Only:           http://localhost:3000/events-display"
echo "  Weather Display:       http://localhost:3000/weather"
echo "  Announcements Only:    http://localhost:3000/announcements-display"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "================================================"
echo ""

node server.js

# Keep terminal open on error
if [ $? -ne 0 ]; then
    echo ""
    echo "Server stopped with an error!"
    read -p "Press Enter to exit..."
fi
