/* Build-only configuration: same utilities, Inter and palette as index.html. */
module.exports = {
    content: [require('node:path').join(__dirname, '../prototipo/*.html')],
    theme: { extend: {
        fontFamily: { inter: ['Inter', 'sans-serif'] },
        colors: { dj: { purple: '#1a1040', indigo: '#4338ca', gold: '#c9a96e' } }
    } }
};
