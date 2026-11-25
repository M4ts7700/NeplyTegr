'use strict';

phoneApps.set('browser', body => {
    body.innerHTML = '<form><label for="url">Adresa nebo hledaný výraz</label><div class="address"><input id="url" placeholder="např. neplytegr.cz" autocomplete="off" autocapitalize="none" spellcheck="false" required><button class="action">Otevřít</button></div><p class="hint">Web a výsledky hledání se otevřou v nové kartě.</p></form><h2>V mobilu</h2><button class="bookmark">NeplyTegr · Informace</button><button class="bookmark">NeplyTegr · Detektor lži</button><div class="reader"></div>';
    const input = body.querySelector('input');
    body.querySelector('form').onsubmit = event => {
        event.preventDefault();
        const value = input.value.trim();
        if (!value) return input.focus();
        let url;
        try {
            if (/^https?:\/\//i.test(value)) url = new URL(value);
            else if (/^[\w-]+(?:\.[\w-]+)+(?::\d+)?(?:[/?#]\S*)?$/i.test(value)) url = new URL('https://' + value);
            else if (/^[a-z][a-z\d+.-]*:/i.test(value)) throw new Error();
            else {
                url = new URL('https://duckduckgo.com/');
                url.searchParams.set('q', value);
            }
        } catch {
            notify('Zadej platnou webovou adresu nebo hledaný výraz.');
            return;
        }
        window.open(url.href, '_blank', 'noopener,noreferrer');
    };
    const paths = ['../info.html', '../detektor/index.html'];
    const reader = body.querySelector('.reader');
    body.querySelectorAll('.bookmark').forEach((button, index) => {
        button.onclick = () => {
            const frame = document.createElement('iframe');
            frame.title = button.textContent;
            frame.setAttribute('sandbox','allow-scripts allow-forms');
            frame.src = paths[index];
            const close = document.createElement('button');
            close.className = 'back';
            close.textContent = 'Zavřít stránku';
            close.onclick = () => { reader.replaceChildren(); button.focus(); };
            reader.replaceChildren(close, frame);
            close.focus();
            reader.scrollIntoView({block:'nearest'});
        };
    });
});
