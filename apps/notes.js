'use strict';

phoneApps.set('notes', body => {
    body.innerHTML = '<label for="note">Moje poznámka</label><textarea id="note" placeholder="Co si chceš zapamatovat?"></textarea><a class="action" download="neplytegr-poznamka.txt">Stáhnout jako .txt</a>';
    const note = body.querySelector('textarea');
    const link = body.querySelector('a');
    note.value = read('note', '');
    let file;
    function updateFile() {
        if (file) URL.revokeObjectURL(file);
        file = URL.createObjectURL(new Blob([note.value], {type:'text/plain;charset=utf-8'}));
        link.href = file;
    }
    note.oninput = () => {
        save('note', note.value);
        updateFile();
    };
    updateFile();
    return () => URL.revokeObjectURL(file);
});
