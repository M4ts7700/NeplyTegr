'use strict';

phoneApps.set('signal', body => {
    body.innerHTML = '<div class="card"><p>Zachyť signál ve chvíli, kdy bílá čára protne zelené pásmo.</p><div class="game" aria-hidden="true"><i class="target"></i><i class="needle"></i></div><button class="action">Spustit</button></div><p class="hint" role="status"></p>';
    const button = body.querySelector('button');
    const needle = body.querySelector('.needle');
    const target = body.querySelector('.target');
    const status = body.querySelector('.hint');
    let points = 0;
    let best = Number(read('best', 0)) || 0;
    let frame = 0;
    let start;
    let left = 42;
    let position = 0;
    target.style.left = left + '%';
    status.textContent = 'Rekord: ' + best;
    function move(now) {
        const phase = (now - start) / Math.max(530, 1300 - points * 65);
        position = (1 - Math.abs(phase % 2 - 1)) * 99;
        needle.style.left = position + '%';
        frame = requestAnimationFrame(move);
    }
    button.onclick = () => {
        if (!frame) {
            points = 0;
            start = performance.now();
            button.textContent = 'Zachytit';
            status.textContent = 'Skóre: 0';
            move(start);
        } else if (position >= left && position <= left + 22) {
            points++;
            if (points > best) {
                best = points;
                save('best', best);
            }
            left = left < 39 ? 50 + Math.random() * 24 : 5 + Math.random() * 20;
            target.style.left = left + '%';
            status.textContent = 'Zachyceno! Skóre: ' + points + ' · Rekord: ' + best;
        } else {
            cancelAnimationFrame(frame);
            frame = 0;
            status.textContent = 'Signál ztracen. Skóre: ' + points + ' · Rekord: ' + best;
            button.textContent = 'Zkusit znovu';
        }
    };
    return () => cancelAnimationFrame(frame);
});
