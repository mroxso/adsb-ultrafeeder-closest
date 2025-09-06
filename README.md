# ADSB Ultrafeeder Closest

## Overview

ADSB Ultrafeeder Closest is a web application that displays the closest flight detected by an ADSB ultrafeeder. The site provides real-time flight information and a user-friendly interface for aviation enthusiasts and professionals.

## Features

- Shows the closest flight from ADSB ultrafeeder data
- Modern, responsive UI
- Real-time updates

## Tech Stack

- **Next.js** – React framework for building the web app
- **TailwindCSS** – Utility-first CSS framework for rapid UI development
- **shadcn/ui** – Component library for beautiful, accessible UI elements
- **ADSB Ultrafeeder** – Source for live flight information

## Getting Started

1. **Install dependencies**
	```bash
	npm install
	```
2. **Start the development server**
	```bash
	npm run dev
	```
3. **Access the app**
	Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

The homepage displays the closest flight detected by your configured ADSB ultrafeeder. Styling is provided by TailwindCSS and shadcn/ui for a modern look and feel.

## Configuration

Make sure your ADSB ultrafeeder is running and accessible. The app will fetch flight data from your ultrafeeder instance. Configuration options can be set in the environment or via the app settings (see documentation for details).
