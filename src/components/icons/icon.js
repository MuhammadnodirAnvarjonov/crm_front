// src/components/icons/icon.js
const iconModules = import.meta.glob('./*.{svg,png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
});

export const icons = Object.fromEntries(
  Object.entries(iconModules).map(([path, module]) => {
    // Fayl nomini to‘liq emas, balki .svg dan oldingi qismi bilan olamiz
    const name = path.split('/').pop().split('.')[0];
    return [name, module];
  })
);
