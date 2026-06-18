import fs from 'fs';

const cssFile = 'd:/Concentrix/Report-QC-Bot/src/styles.css';
let content = fs.readFileSync(cssFile, 'utf8');

const newStyles = `
/* New Dragon Images Styles */
.dragon-img {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  height: auto;
  pointer-events: none;
  z-index: 0;
  transition: transform 0.1s ease-out;
  mix-blend-mode: screen; /* Blend black background of AI generated images */
}

.dragon-img.left {
  left: -20px;
}

.dragon-img.right {
  right: -20px;
}

@media (max-width: 1200px) {
  .dragon-img {
    width: 250px;
  }
}

@media (max-width: 800px) {
  .dragon-img {
    width: 150px;
    mix-blend-mode: lighten;
    opacity: 0.5;
  }
}
`;

fs.writeFileSync(cssFile, content + newStyles, 'utf8');
console.log('styles.css updated');
