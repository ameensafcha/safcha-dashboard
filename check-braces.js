const fs = require('fs');
const c = fs.readFileSync('components/Sidebar.tsx', 'utf8');
let b = 0, line = 1, col = 1;
for (let i = 0; i < c.length; i++) {
    if (c[i] == '{') {
        b++;
        if (b > 1) console.log('Extra open at line', line, ', balance:', b);
    } else if (c[i] == '}') {
        b--;
    }
    if (c[i] == '\n') {
        line++;
        col = 1;
    } else col++;
}
console.log('Final balance:', b);
