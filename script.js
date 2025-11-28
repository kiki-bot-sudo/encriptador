const mensaje = document.getElementById('mensaje');
const charCount = document.querySelector('.char-count');
const matrizMensaje = document.getElementById('matrizMensaje');
const k11 = document.getElementById('k11');
const k12 = document.getElementById('k12');
const k21 = document.getElementById('k21');
const k22 = document.getElementById('k22');
const btnEncriptar = document.getElementById('encriptar');
const btnDesencriptar = document.getElementById('desencriptar');
const resultado = document.getElementById('resultado');

// Actualizar contador de caracteres
mensaje.addEventListener('input', () => {
    const len = mensaje.value.length;
    charCount.textContent = `${len}/30`;
    mostrarMatrizMensaje();
});

// Mostrar matriz del mensaje
function mostrarMatrizMensaje() {
    const texto = mensaje.value.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (texto.length === 0) {
        matrizMensaje.textContent = 'Escribe un mensaje primero...';
        return;
    }
    
    const valores = texto.split('').map(char => char.charCodeAt(0) - 65);
    
    let matriz = '[';
    for (let i = 0; i < valores.length; i += 2) {
        if (i > 0) matriz += ' ';
        matriz += '[' + valores[i];
        if (i + 1 < valores.length) {
            matriz += ', ' + valores[i + 1];
        } else {
            matriz += ', 23'; // Padding con 'X'
        }
        matriz += ']';
    }
    matriz += ']';
    
    matrizMensaje.textContent = matriz;
}

// Calcular el inverso modular usando el algoritmo extendido de Euclides
function modInverso(a, m) {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) {
            return x;
        }
    }
    return null;
}

// Calcular matriz inversa mod 26
function matrizInversa(key) {
    const det = (key[0][0] * key[1][1] - key[0][1] * key[1][0]) % 26;
    const detMod = ((det % 26) + 26) % 26;
    
    const detInv = modInverso(detMod, 26);
    
    if (detInv === null) {
        return null;
    }
    
    // Matriz adjunta
    const adj = [
        [key[1][1], -key[0][1]],
        [-key[1][0], key[0][0]]
    ];
    
    // Multiplicar por el inverso del determinante
    const inv = [
        [((adj[0][0] * detInv) % 26 + 26) % 26, ((adj[0][1] * detInv) % 26 + 26) % 26],
        [((adj[1][0] * detInv) % 26 + 26) % 26, ((adj[1][1] * detInv) % 26 + 26) % 26]
    ];
    
    return inv;
}

// Función de encriptación
btnEncriptar.addEventListener('click', () => {
    const key = [
        [parseInt(k11.value) || 0, parseInt(k12.value) || 0],
        [parseInt(k21.value) || 0, parseInt(k22.value) || 0]
    ];
    
    if (key[0][0] === 0 && key[0][1] === 0 && key[1][0] === 0 && key[1][1] === 0) {
        resultado.textContent = '❌ Error: Ingresa una matriz clave válida';
        resultado.className = 'resultado-box error';
        return;
    }
    
    const texto = mensaje.value.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (texto.length === 0) {
        resultado.textContent = '❌ Error: Ingresa un mensaje';
        resultado.className = 'resultado-box error';
        return;
    }
    
    const det = (key[0][0] * key[1][1] - key[0][1] * key[1][0]) % 26;
    const detMod = ((det % 26) + 26) % 26;
    
    if (modInverso(detMod, 26) === null) {
        resultado.textContent = `❌ Error: La matriz no es invertible (det mod 26 = ${detMod})`;
        resultado.className = 'resultado-box error';
        return;
    }
    
    let numeros = texto.split('').map(char => char.charCodeAt(0) - 65);
    
    if (numeros.length % 2 !== 0) {
        numeros.push(23); // 'X'
    }
    
    let encriptado = '';
    for (let i = 0; i < numeros.length; i += 2) {
        const v1 = numeros[i];
        const v2 = numeros[i + 1];
        
        const c1 = ((key[0][0] * v1 + key[0][1] * v2) % 26 + 26) % 26;
        const c2 = ((key[1][0] * v1 + key[1][1] * v2) % 26 + 26) % 26;
        
        encriptado += String.fromCharCode(65 + c1);
        encriptado += String.fromCharCode(65 + c2);
    }
    
    resultado.className = 'resultado-box success';
    resultado.textContent = `🔒 ${encriptado}`;
});

// Función de desencriptación
btnDesencriptar.addEventListener('click', () => {
    const key = [
        [parseInt(k11.value) || 0, parseInt(k12.value) || 0],
        [parseInt(k21.value) || 0, parseInt(k22.value) || 0]
    ];
    
    if (key[0][0] === 0 && key[0][1] === 0 && key[1][0] === 0 && key[1][1] === 0) {
        resultado.textContent = '❌ Error: Ingresa una matriz clave válida';
        resultado.className = 'resultado-box error';
        return;
    }
    
    const texto = mensaje.value.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (texto.length === 0) {
        resultado.textContent = '❌ Error: Ingresa un mensaje';
        resultado.className = 'resultado-box error';
        return;
    }
    
    // Calcular matriz inversa
    const keyInv = matrizInversa(key);
    
    if (keyInv === null) {
        resultado.textContent = '❌ Error: La matriz no es invertible';
        resultado.className = 'resultado-box error';
        return;
    }
    
    let numeros = texto.split('').map(char => char.charCodeAt(0) - 65);
    
    if (numeros.length % 2 !== 0) {
        numeros.push(23);
    }
    
    let desencriptado = '';
    for (let i = 0; i < numeros.length; i += 2) {
        const v1 = numeros[i];
        const v2 = numeros[i + 1];
        
        const p1 = ((keyInv[0][0] * v1 + keyInv[0][1] * v2) % 26 + 26) % 26;
        const p2 = ((keyInv[1][0] * v1 + keyInv[1][1] * v2) % 26 + 26) % 26;
        
        desencriptado += String.fromCharCode(65 + p1);
        desencriptado += String.fromCharCode(65 + p2);
    }
    
    resultado.className = 'resultado-box success';
    resultado.textContent = `🔓 ${desencriptado}`;
});
