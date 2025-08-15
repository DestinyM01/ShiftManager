# ---------- Build ----------
FROM node:18-alpine AS build
WORKDIR /app

# Instalar deps primero (cache más eficiente)
COPY package*.json ./
RUN npm ci

# Build args para las credenciales de Firebase (no quedan en la capa si evitas imprimirlas)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID

# Crear .env para Vite a partir de los args
# Nota: Vite solo toma variables que comienzan con VITE_
RUN echo "VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}\n\
VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}\n\
VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}\n\
VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}\n\
VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}\n\
VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}\n\
VITE_FIREBASE_MEASUREMENT_ID=${VITE_FIREBASE_MEASUREMENT_ID}" > .env

# Copiar el resto y compilar
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM nginx:alpine
# Nginx conf básica para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copiar el build
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
