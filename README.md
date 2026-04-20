# ai-mentor

## Запуск:

   - node (если нет)
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install nodejs
   ```
   - сам запуск
   ```bash
   cd ai-mentor/frontend
   npm install
   npm run build
   cd ../backend
   docker compose build
   docker compose up
   ```
