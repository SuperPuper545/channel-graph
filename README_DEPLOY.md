# 📖 Руководство по развертыванию Channel Graph на VPS (24/7)

Это пошаговая инструкция, как за 5 минут перенести проект с локального ПК на любой VPS сервер (Ubuntu 22.04 / 24.04).

---

## 🖥 Шаг 1: Аренда VPS сервера
Подойдет любой провайдер (*Aeza, TimeWeb, Beget, Hetzner, FirstVDS*):
- **ОС:** Ubuntu 22.04 или 24.04 LTS
- **Тариф:** Самый минимальный (1 vCPU, 1 GB RAM, 15–20 GB SSD) — от 150 до 350 ₽/мес.

---

## 🔑 Шаг 2: Подключение к серверу по SSH
Откройте PowerShell (или Windows Terminal / PuTTY) на вашем компьютере:
```bash
ssh root@IP_ВАШЕГО_СЕРВЕРА
```
*(введите пароль от сервера, который прислал хостинг)*

---

## 📂 Шаг 3: Копирование проекта на сервер
Вы можете скопировать папку проекта с ПК на сервер через бесплатную программу **FileZilla** или **WinSCP** в папку `/var/www/channel-graph`.

Либо загрузить проект через Git:
```bash
mkdir -p /var/www/channel-graph
cd /var/www/channel-graph
# скопируйте файлы проекта сюда
```

---

## 🚀 Шаг 4: Запуск в 1 команду
Внутри папки `/var/www/channel-graph` на сервере выполните:
```bash
chmod +x deploy.sh
./deploy.sh
```
Скрипт автоматически:
1. Установит Node.js 20, Nginx, PM2.
2. Скомпилирует фронтенд и бэкенд.
3. Запустит бота в фоновом режиме 24/7 с автоперезапуском при перезагрузках VPS.

---

## 🌐 Шаг 5: Настройка Nginx и бесплатного SSL (HTTPS)
1. Скопируйте конфиг Nginx:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/channel-graph
sudo ln -s /etc/nginx/sites-available/channel-graph /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default # удаляем дефолтный сайт
sudo nginx -t
sudo systemctl restart nginx
```

2. Выпустите бесплатный HTTPS сертификат Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ВАШ_ДОМЕН_ИЛИ_ПОДДОМЕН
```

---

## 🤖 Шаг 6: Обновление ссылки в @BotFather
1. Откройте в Telegram **[@BotFather](https://t.me/BotFather)**.
2. Отправьте `/mybots` -> выберите `@StatVisualBot` -> **Bot Settings** -> **Menu Button** -> **Configure Menu Button**.
3. Вставьте ваш новый постоянный HTTPS-адрес (например, `https://statvisual.ru`).

---

## 🛠 Полезные команды на сервере:
- Проверить статус бота: `pm2 status`
- Смотреть логи в реальном времени: `pm2 logs`
- Перезапустить бота: `pm2 restart channel-graph-backend`
- Обновить код: `./deploy.sh`
