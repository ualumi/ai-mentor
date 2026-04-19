# ai-mentor

## Запуск:
   ```bash
   cd ai-mentor/frontend
   ```
   ```bash - установка node (если нет)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install nodejs
   ```

   ```bash
   npm install
   npm run build
   cd ../backend
   docker compose build
   docker compose up
   ```
