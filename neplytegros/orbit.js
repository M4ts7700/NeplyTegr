// Render a ringed planet into a fixed-size wallpaper, once per palette change.
function drawOrbit(theme = 'amber') {
    const canvas = document.getElementById('orbit');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const colors = {
        amber: [243, 163, 76],
        ice: [101, 193, 241],
        rose: [225, 126, 172]
    };
    const [r, g, b] = colors[theme] || colors.amber;
    const ink = (opacity) => 'rgba(' + [r, g, b, opacity].join(',') + ')';
    const {width: w, height: h} = canvas;
    let seed = 807;
    function random() {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    }
    ctx.fillStyle = '#101720';
    ctx.fillRect(0, 0, w, h);
    const halo = ctx.createRadialGradient(365, 395, 0, 365, 395, 355);
    halo.addColorStop(0, ink(.32));
    halo.addColorStop(.55, ink(.08));
    halo.addColorStop(1, ink(0));
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 730; i++) {
        ctx.fillStyle = 'rgba(248,243,224,' + (.12 + random() * .55) + ')';
        const size = random() * 1.55 + .35;
        ctx.fillRect(random() * w, random() * h, size, size);
    }
    ctx.save();
    ctx.translate(311, 416);
    ctx.rotate(-.38);
    function rings(front) {
        for (let i = 0; i < 178; i++) {
            const radius = 169 + i * .64;
            ctx.beginPath();
            ctx.ellipse(0, 0, radius, radius * .22, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
            ctx.strokeStyle = ink(i > 98 && i < 109 ? .055 : .08 + random() * .68);
            ctx.lineWidth = .7;
            ctx.stroke();
        }
    }
    rings(false);
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 133, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = ink(1);
    ctx.fillRect(-135,-135,270,270);
    for (let i = -150; i < 156; i += .9) {
        ctx.beginPath();
        ctx.moveTo(-145, i);
        ctx.bezierCurveTo(-77, i + 29, 60, i + 35 + Math.sin(i / 7) * 3, 147, i + 2);
        ctx.strokeStyle = 'rgba(54,35,30,' + (random() * .28 + .16 * (Math.sin(i / 6) + 1)) + ')';
        ctx.lineWidth = random() * 3 + .65;
        ctx.stroke();
    }
    const shade = ctx.createRadialGradient(-92,-100,10,-88,-95,242);
    shade.addColorStop(0,'rgba(255,246,216,.74)');
    shade.addColorStop(.35,'rgba(255,222,163,.16)');
    shade.addColorStop(.59,'rgba(37,26,32,.33)');
    shade.addColorStop(.78,'rgba(13,20,30,.88)');
    shade.addColorStop(1,'#0c131e');
    ctx.fillStyle = shade;
    ctx.fillRect(-135,-135,270,270);
    ctx.restore();
    rings(true);
    ctx.restore();
}
