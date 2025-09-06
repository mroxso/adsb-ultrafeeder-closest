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

Create a `.env.local` file in the root directory with the following variables:

```
# Home coordinates for distance calculation
NEXT_PUBLIC_HOME_LAT=48.1351  # Replace with your latitude
NEXT_PUBLIC_HOME_LON=11.5820  # Replace with your longitude

# ADSB Ultrafeeder URL (default is localhost:8080 if not set)
NEXT_PUBLIC_ADSB_ULTRAFEEDER_URL=http://localhost:8080/data/aircraft.json
```

Make sure your ADSB ultrafeeder is running and accessible. The app will fetch flight data from your ultrafeeder instance.
