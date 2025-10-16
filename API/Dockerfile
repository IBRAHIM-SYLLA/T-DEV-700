# --- Étape 1 : Build ---
FROM node:22-slim
# Installe le client MariaDB pour exécuter init.sql et bash pour le script de démarrage
RUN apt-get update && apt-get install -y mariadb-client bash && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN if [ -f /app/init.sql ]; then \
      chown root:root /app/init.sql && \
      chmod 644 /app/init.sql && \
      echo 'Permissions appliquées à /app/init.sql'; \
    else \
      echo 'Aucun init.sql trouvé, passage à la suite'; \
    fi
EXPOSE 5001

# Attente de la DB + import du init.sql + lancement du serveur
CMD bash -c "\
  echo 'Attente de MariaDB sur $DB_HOST:$DB_PORT...';\
  until mariadb -h \"$DB_HOST\" -P \"${DB_PORT:-3306}\" -u \"$DB_USER\" -p\"$DB_PASSWORD\" -e 'SELECT 1' >/dev/null 2>&1; do\
    echo ' Base non disponible, nouvelle tentative dans 2s...';\
    sleep 2;\
  done;\
  echo 'Importation du script init.sql si nécessaire...';\
  if [ -f /app/init.sql ]; then\
    mariadb -h \"$DB_HOST\" -P \"${DB_PORT:-3306}\" -u \"$DB_USER\" -p\"$DB_PASSWORD\" \"$DB_NAME\" < /app/init.sql || echo 'init.sql déjà exécuté ou non applicable';\
  else\
    echo 'Aucun init.sql trouvé, passage à la suite...';\
  fi;\
  echo '✅ Base prête, démarrage du backend...';\
  npm run dev\
"
