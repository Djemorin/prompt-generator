# 🎛️ Générateur de Prompts (Offline, avec Ollama)

Application Electron/Node.js pour générer des prompts (texte, image, vidéo...) localement en s’appuyant sur **Ollama**.

---

## ✅ Fonctionnalités

- Éditeur de prompts intelligent connecté à Ollama local.
- Interface HTML/CSS/JS servie par un serveur Node.js Express.
- Stocke l’historique des prompts localement dans `server/prompt-history.json`.
- Portable : le `.exe` peut être déplacé n’importe où sur la machine.
- Entièrement hors-ligne (aucune dépendance réseau).
- Gestion des raccourcis clavier :
  - `F11` : Activer/désactiver le plein écran
  - `Échap` : Sortir du plein écran
  - `Ctrl+Q` : Quitter proprement l’application

---

## 📦 Compilation de l'application (.exe)

### ⚙️ Prérequis (déjà installés normalement)

```bash
npm install
npm install --save-dev electron electron-packager
```

### 🚀 Compiler l’exécutable `.exe` :

```bash
npm run package-win
```

Cela génère un dossier `/dist/GenerateurPrompt-win32-x64/` contenant :

- `GenerateurPrompt.exe` (exécutable)
- Tous les fichiers nécessaires (serveur, historique, frontend)

---

## 🧪 Tester en mode développement

- Lancer le backend seul :
  ```bash
  npm start
  ```
- Lancer l’app dans une fenêtre Electron :
  ```bash
  npm run electron
  ```

---

## 📁 Structure du projet

```
/server
  ├── generate-prompts.js     # Serveur Express local
  └── prompt-history.json     # Fichier historique (modifié dynamiquement)

main.js                       # Fichier de démarrage Electron
public/                       # Interface utilisateur (HTML, CSS, JS)
package.json
```

---

## 🗂️ Dossier à ignorer dans Git

Dans `.gitignore`, ajoute :

```
/dist
```

---

## 🛠️ Pour modifier l'application

1. Modifie le code (fonctions ou interface).
2. Teste avec `npm start` ou `npm run electron`.
3. Quand tu es satisfait :
   ```bash
   npm run package-win
   ```
4. Tu peux alors distribuer ou déplacer le nouveau `.exe`.

---

## 💡 Astuces

- L’application lit/écrit l’historique dans le même dossier, donc évite de placer le `.exe` dans un dossier protégé (`Program Files`).
- Ollama doit être lancé en local avant d’ouvrir l’application.
- L’exécutable reste entièrement offline et portable.

---

## 📌 Auteur

Djé, bien sûr 😉
