# FoodLoop — учебный лендинг

Файлы:
- index.html — лендинг
- style.css — дизайн
- script.js — UTM, цели Яндекс Метрики, демо-сбор заявок

## Что сделать после загрузки в GitHub

1. Создать счетчик Яндекс Метрики для адреса GitHub Pages.
2. В `script.js` заменить:
   `const YANDEX_COUNTER_ID = 0;`
   на ID счётчика.
3. В Метрике создать JS-цели:
   `cta_b2c`, `cta_b2b`, `view_offers`, `offer_click`,
   `lead_b2c`, `lead_b2b`, `phone_click`, `faq_open`.
4. Для реального сбора заявок указать `FORM_ENDPOINT` — URL Google Apps Script Web App.
5. Все рекламные и органические ссылки размечать UTM.

Пример:
https://barnshpper-sys.github.io/foodloop/?utm_source=vk&utm_medium=organic&utm_campaign=launch_b2c_spb&utm_content=clip_01

Платная реклама в учебном проекте не запускается: сайт подготовлен под будущий запуск, а трафик сейчас можно тестировать через бесплатные VK/Telegram/чаты/QR.
