document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const qrInput = document.getElementById('qr-input');
    const fgColorInput = document.getElementById('color-foreground');
    const bgColorInput = document.getElementById('color-background');
    const fgHexText = document.getElementById('hex-foreground');
    const bgHexText = document.getElementById('hex-background');
    const logoUpload = document.getElementById('logo-upload');
    const bgUpload = document.getElementById('bg-upload');
    const clearLogoBtn = document.getElementById('clear-logo');
    const clearBgBtn = document.getElementById('clear-bg');
    const bgOpacity = document.getElementById('bg-opacity');
    const opacityValText = document.getElementById('opacity-val');
    const targetLogoBtn = document.getElementById('target-logo');
    const targetBgBtn = document.getElementById('target-bg');
    const samplesGrid = document.getElementById('samples-grid');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');
    const shimmerLayer = document.getElementById('shimmer-layer');

    // Create subtle sparkles
    for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.animationDelay = `${Math.random() * 10}s`;
        sparkle.style.animationDuration = `${5 + Math.random() * 10}s`;
        shimmerLayer.appendChild(sparkle);
    }

    // Canvas Constants
    const CANVAS_SIZE = 600;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Offscreen canvas for QRious (Using transparency support)
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = CANVAS_SIZE;
    offscreenCanvas.height = CANVAS_SIZE;

    const qr = new QRious({
        element: offscreenCanvas,
        size: CANVAS_SIZE,
        level: 'H',
        backgroundAlpha: 0 // Native transparency for clean composition
    });

    let logoImg = null;
    let bgImg = null;
    let sampleTarget = 'logo'; // 'logo' or 'bg'

    // Sample Icons
    const samples = [
        { name: '猫', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,8L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,8M12,10.83L16.27,17.78L12,15.89L7.73,17.78L12,10.83M7,2H6V5H3V6H6V9H7V6H10V5H7V2M18,2H17V5H14V6H17V9H18V6H21V5H18V2Z"/></svg>' },
        { name: '犬', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,21V19.75L8.9,18.33L9.3,16L10.59,15.74C11.37,15.58 12,14.9 12,14.11V13H10A2,2 0 0 1 8,11V7H7.13L5.61,8.14C5.23,8.42 4.71,8.41 4.35,8.1L3.13,7.05L5.7,3.61C6,3.22 6.5,3 7,3H12V3C12.55,3 13,3.45 13,4V5H14V4C14,3.45 14.45,3 15,3H17C17.55,3 18,3.45 18,4V7H17V5H15V8H18V9H16V14C16,14.55 15.55,15 15,15H13V15.5C13,16.05 13.45,16.5 14,16.5H15V18.5H14V21H10M7,7A1,1 0 0 0 6,8A1,1 0 0 0 7,9A1,1 0 0 0 8,8A1,1 0 0 0 7,7Z"/></svg>' },
        { name: '星', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>' },
        { name: 'ハート', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/></svg>' },
        { name: '稲妻', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7,2V13H10V22L17,10H13L17,2H7Z"/></svg>' },
        { name: 'コーヒー', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2,21V19H20V21C20,21.55 19.55,22 19,22H3C2.45,22 2,21.55 2,21M20,8V5H18V8H20M20,3A2,2 0 0 1 22,5V8A2,2 0 0 1 20,10H18V13A4,4 0 0 1 14,17H8A4,4 0 0 1 4,13V3H20M6,5V13A2,2 0 0 0 8,15H14A2,2 0 0 0 16,13V5H6Z"/></svg>' },
        { name: 'チェック', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>' },
        { name: '地球', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0 0 14,12H8V10H10A1,1 0 0 0 11,9V7H13A2,2 0 0 0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.07 4,12C4,11.53 4.04,11.08 4.12,10.64L9,15.5V17A2,2 0 0 0 11,19L11,19.93M12,2C6.47,2 2,6.47 2,12A10,10 0 0 0 12,22A10,10 0 0 0 22,12A10,10 0 0 0 12,2Z"/></svg>' },
        { name: '盾', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z"/></svg>' },
        { name: '月', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.1,22C10.3,22 8.6,21.5 7.1,20.5C3.9,18.5 2,15 2,11.2C2,7.4 3.9,3.9 7.1,1.9C7.4,1.7 7.7,1.8 7.9,2.1C8,2.3 8,2.7 7.7,2.9C5.4,4.4 4,7 4,9.8C4,14.2 7.7,17.8 12.1,17.8C13,17.8 14,17.6 14.8,17.3C15.1,17.2 15.5,17.3 15.6,17.6C15.8,17.9 15.7,18.3 15.4,18.5C14.4,19.2 13.3,19.6 12.1,19.6C12,19.6 11.9,19.6 11.8,19.6C12,20.4 12,21.2 12,22H12.1Z"/></svg>' }
    ];

    samples.forEach(s => {
        const item = document.createElement('div');
        item.className = 'sample-item';
        item.innerHTML = s.svg;
        item.addEventListener('click', () => {
            const iconUrl = 'data:image/svg+xml;base64,' + btoa(s.svg);
            const img = new Image();
            img.onload = () => {
                if (sampleTarget === 'logo') logoImg = img;
                else bgImg = img;
                updateQR();
            };
            img.src = iconUrl;
        });
        samplesGrid.appendChild(item);
    });

    targetLogoBtn.addEventListener('click', () => { sampleTarget = 'logo'; targetLogoBtn.classList.add('active'); targetBgBtn.classList.remove('active'); });
    targetBgBtn.addEventListener('click', () => { sampleTarget = 'bg'; targetBgBtn.classList.add('active'); targetLogoBtn.classList.remove('active'); });

    function handleFileSelect(event, callback) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    callback(img);
                    updateQR();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            const label = event.target.nextElementSibling;
            if (label) label.textContent = file.name;
        }
    }

    logoUpload.addEventListener('change', (e) => handleFileSelect(e, (img) => logoImg = img));
    bgUpload.addEventListener('change', (e) => handleFileSelect(e, (img) => bgImg = img));
    clearLogoBtn.addEventListener('click', () => { logoImg = null; logoUpload.value = ''; logoUpload.nextElementSibling.textContent = 'ファイルを選択'; updateQR(); });
    clearBgBtn.addEventListener('click', () => { bgImg = null; bgUpload.value = ''; bgUpload.nextElementSibling.textContent = 'ファイルを選択'; updateQR(); });
    bgOpacity.addEventListener('input', () => { opacityValText.textContent = bgOpacity.value; updateQR(); });

    // Update function (Composition)
    function updateQR() {
        const text = qrInput.value.trim();
        const fg = fgColorInput.value;
        const bg = bgColorInput.value;

        fgHexText.textContent = fg.toUpperCase();
        bgHexText.textContent = bg.toUpperCase();

        // Native Transparency - No more hacking needed
        qr.set({
            value: text || ' ',
            background: 'transparent', // QRious takes 'transparent' but we ensure alpha 0
            foreground: fg
        });

        // Clear main canvas
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        // Ensure sharp QR dots (Disable smoothing)
        ctx.imageSmoothingEnabled = false;

        // 1. Draw Background (Solid Color or Image)
        if (bgImg) {
            ctx.save();
            ctx.globalAlpha = bgOpacity.value / 100;
            const scale = Math.max(CANVAS_SIZE / bgImg.width, CANVAS_SIZE / bgImg.height);
            const x = (CANVAS_SIZE / 2) - (bgImg.width / 2) * scale;
            const y = (CANVAS_SIZE / 2) - (bgImg.height / 2) * scale;
            ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
            ctx.restore();
        } else {
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        }

        // 2. Draw QR Code (Transparently on top)
        ctx.drawImage(offscreenCanvas, 0, 0);

        // 3. Draw Logo (On top of everything)
        if (logoImg) {
            ctx.imageSmoothingEnabled = true; // Re-enable for smooth logo
            const logoSize = CANVAS_SIZE * 0.18; // Reduced from 0.22 to 0.18 for readability
            const lx = (CANVAS_SIZE - logoSize) / 2;
            const ly = (CANVAS_SIZE - logoSize) / 2;
            ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
        }
    }

    // Event Listeners
    qrInput.addEventListener('input', updateQR);
    fgColorInput.addEventListener('input', updateQR);
    bgColorInput.addEventListener('input', updateQR);

    // Download Logic
    downloadBtn.addEventListener('click', () => {
        // Redraw strictly before capturing
        updateQR();

        if (!qrInput.value.trim()) {
            alert('URLかテキストを入力してください。');
            qrInput.focus();
            return;
        }

        try {
            const link = document.createElement('a');
            const now = new Date();
            const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
            
            // Reverting to toDataURL for maximum compatibility on HTTPS production servers
            link.href = canvas.toDataURL('image/png');
            link.download = `qrcode_${timestamp}.png`;
            
            // Ensuring download link is triggered correctly in all browsers
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
            }, 500);
            
            // Quick visual feedback (checkmark only)
            const originalHTML = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<span class="check-icon">✓</span> QRコードを保存';
            setTimeout(() => {
                downloadBtn.innerHTML = originalHTML;
            }, 2500);
        } catch (err) {
            console.error('Download error:', err);
            alert('画像の保存中にエラーが発生しました。外部画像の著作権（CORS）が原因の可能性があります。');
        }
    });

    // Reset Logic - Instant & Complete (White Background Default)
    resetBtn.addEventListener('click', () => {
        if (confirm('すべての設定を初期状態に戻しますか？')) {
            qrInput.value = 'https://example.com';
            fgColorInput.value = '#9f7aea'; 
            bgColorInput.value = '#ffffff';
            
            logoImg = null;
            bgImg = null;
            bgOpacity.value = 50;
            opacityValText.textContent = 50;
            
            logoUpload.value = '';
            bgUpload.value = '';
            
            const logoLabel = logoUpload.nextElementSibling;
            const bgLabel = bgUpload.nextElementSibling;
            if (logoLabel) logoLabel.textContent = 'ファイルを選択';
            if (bgLabel) bgLabel.textContent = 'ファイルを選択';
            
            updateQR();
        }
    });

    // Initial render
    updateQR();
});
