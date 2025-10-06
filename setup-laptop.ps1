<#
Setup script for Windows (PowerShell).
Usage: Open PowerShell as Administrator (recommended) and run:
    ./setup-laptop.ps1

What it does:
- Creates a local virtual environment `.venv` if missing
- Activates the venv for the current PowerShell session
- Upgrades pip and installs packages from requirements.txt
- Copies `.env.example` to `.env` if `.env` is missing
- Opens `.env` in Notepad for you to add secrets
#>

$ErrorActionPreference = 'Stop'

Write-Host "Starting laptop setup..."

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $repoRoot

if (-Not (Test-Path -Path "$repoRoot\.venv")) {
    Write-Host "Creating virtual environment in .venv..."
    python -m venv .venv
} else {
    Write-Host ".venv already exists, skipping creation."
}

Write-Host "Activating virtual environment..."
. "$repoRoot\.venv\Scripts\Activate.ps1"

Write-Host "Upgrading pip..."
python -m pip install --upgrade pip

if (Test-Path -Path "$repoRoot\requirements.txt") {
    Write-Host "Installing requirements from requirements.txt..."
    pip install -r requirements.txt
} else {
    Write-Host "No requirements.txt found; skipping pip install."
}

if (-Not (Test-Path -Path "$repoRoot\.env")) {
    if (Test-Path -Path "$repoRoot\.env.example") {
        Copy-Item -Path ".env.example" -Destination ".env"
        Write-Host "Copied .env.example to .env. Please open .env and fill in your secrets."
        Start-Process notepad.exe ".env"
    } else {
        Write-Host "No .env.example found. Creating an empty .env"
        New-Item -Path ".env" -ItemType File | Out-Null
        Start-Process notepad.exe ".env"
    }
} else {
    Write-Host ".env already exists. Opening .env for editing..."
    Start-Process notepad.exe ".env"
}

Write-Host "Setup complete. To run the agent in this session ensure the venv is activated (use .\.venv\Scripts\Activate.ps1) and then run: python agent.py"
