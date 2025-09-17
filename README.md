# Phasmophobia Run Tracker

A personal React application for tracking Phasmophobia game runs and analyzing statistics with friends.

## 🎯 Purpose

This is a personal project created to track and analyze Phasmophobia gaming sessions. I enjoy collecting statistics from our games and wanted a simple way to store and visualize our progress over time.

## 🚀 Features

- Track game runs with detailed information
- Manage maps, ghosts, evidence, and cursed possessions
- Player management and statistics
- Local data storage (no external servers)
- Export/import functionality for data backup
- Responsive design for desktop and mobile

## 🛠️ Technology Stack

- **Frontend:** React 18 with functional components and hooks
- **Styling:** Tailwind CSS
- **Storage:** Browser localStorage
- **Deployment:** GitHub Pages

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Levisaxos/phasmophobiarunlogger.react
   cd phasmophobia-run-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🚀 Deployment to GitHub Pages

### Automatic Deployment (Recommended)

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the main branch.

1. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

2. **Update repository URLs:**
   - Replace `yourusername` in `package.json` homepage with your GitHub username
   - Update the repository URL in the Footer component

3. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

### Manual Deployment

If you prefer manual deployment:

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Deploy:**
   ```bash
   npm run deploy
   ```

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Shared components (Navigation, Layout, Footer)
│   ├── modals/          # Modal components
│   ├── manage/          # Management components for game data
│   └── runs/            # Run tracking components
├── services/
│   └── api/             # Data service layer
└── hooks/               # Custom React hooks
```

## 🎮 Usage

1. **First-time setup:** Configure your maps, ghosts, evidence types, and players
2. **Add runs:** Record your game sessions with detailed information
3. **View statistics:** Analyze your gaming patterns and success rates
4. **Export data:** Backup your data as JSON files
5. **Import data:** Restore from backup files

## 📄 Data Storage

- All data is stored locally in your browser's localStorage
- No data is sent to external servers
- Use the export feature to backup your data regularly

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/licenses/MIT) file for details.

## 🚨 Disclaimer

This project is **not affiliated with, endorsed by, or connected to Kinetic Games**, the creator of Phasmophobia. Phasmophobia is a trademark of Kinetic Games. This is an independent fan project created for personal use and statistics tracking.

## 🤝 Contributing

This is a personal project, but if you find bugs or have suggestions, feel free to open an issue on GitHub.

## 📞 Contact

- GitHub: [@Levisaxos](https://github.com/Levisaxos)
- Project: [Phasmophobia Run Tracker](https://github.com/Levisaxos/phasmophobiarunlogger.react)

---

*Made with ❤️ for the Phasmophobia community*