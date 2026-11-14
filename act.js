document.addEventListener('DOMContentLoaded', () => {

    const btn         = document.getElementById('btn');
    const fireLeft    = document.getElementById('fire_left');
    const fireRight   = document.getElementById('fire_right');
    const flash       = document.querySelector('.flash');
    const title       = document.getElementById('title_text');
    const audio       = document.getElementById('audio');
    const sleepMusic  = document.getElementById('sleep_music');
    const activeMusic = document.getElementById('active_music');
    const body        = document.body;

    // colors of the fire (bright yellow -> orange -> red)
    const fireColors = ['#fff3a0', '#ffd23f', '#ff9f1c', '#ff5e1a', '#d62828'];

    // keeps the fire spawning while powers are ON
    let fireTimer = null;

    // play title animation on first load
    title.classList.add('animate');

    // ---- make ONE little pixel flame inside a hand ----
    function spawnEmber(fire) {
        const ember = document.createElement('span');
        ember.className = 'ember';

        const size  = 0.7 + Math.random() * 1.3;           // vh
        const color = fireColors[Math.floor(Math.random() * fireColors.length)];

        ember.style.setProperty('--size',  size + 'vh');
        ember.style.setProperty('--color', color);
        ember.style.setProperty('--dx',    ((Math.random() - 0.5) * 3) + 'vh');
        ember.style.setProperty('--dy',    (-(3 + Math.random() * 5)) + 'vh');
        ember.style.setProperty('--dur',   (0.6 + Math.random() * 0.7) + 's');
        ember.style.left = ((Math.random() - 0.5) * 2) + 'vh';

        fire.appendChild(ember);

        // remove it when the animation ends so the page stays light
        ember.addEventListener('animationend', () => ember.remove());
    }

    // ---- start / stop the fire ----
    function startFire() {
        // big burst when the powers turn on
        for (let i = 0; i < 16; i++) {
            spawnEmber(fireLeft);
            spawnEmber(fireRight);
        }

        // then a steady flame
        fireTimer = setInterval(() => {
            spawnEmber(fireLeft);
            spawnEmber(fireRight);
        }, 70);
    }

    function stopFire() {
        clearInterval(fireTimer);
        fireTimer = null;
    }

    // ---- SNORING (Sleep Mode music) starts as soon as the page runs ----
    // Browsers may block sound until the person touches the page once.
    // So: try to play right now, and if it is blocked, play on the very first
    // click / key press / touch (anywhere on the page).
    let started = false;

    function startSleepMusic() {
        // only start sleep music if we are still in Sleep Mode
        if (started || body.classList.contains('on')) return;

        sleepMusic.play().then(() => {
            started = true;
            removeUnlockListeners();
        }).catch(() => {
            // blocked by the browser - wait for the first interaction
        });
    }

    const unlockEvents = ['pointerdown', 'click', 'keydown', 'touchstart'];

    function removeUnlockListeners() {
        unlockEvents.forEach(evt => document.removeEventListener(evt, startSleepMusic));
    }

    // 1) try immediately when the page loads
    startSleepMusic();

    // 2) if the browser blocked it, try again on the first interaction
    unlockEvents.forEach(evt => document.addEventListener(evt, startSleepMusic));

    btn.addEventListener('click', () => {
        // switch ON / OFF state
        const isOn = body.classList.toggle('on');

        // the sleep music is now controlled by the button, not by the first-click trick
        started = true;
        removeUnlockListeners();

        // ---- Wizard change + title ----
        // (the picture swap + Z's are handled by the CSS with the "on" class)
        if (isOn) {
            // POWERS MODE (fire in hands + floating rocks)
            startFire();
            title.textContent = 'POWERS UNLEASHED';
        } else {
            // SLEEP MODE (fire gone + rocks sink down + wizard rests)
            stopFire();
            title.textContent = 'WIZARD RESTING';
        }

        // ---- Restart flash animation ----
        flash.classList.remove('animate');
        void flash.offsetWidth;          // force reflow so animation can replay
        flash.classList.add('animate');

        // ---- Restart title animation ----
        title.classList.remove('animate');
        void title.offsetWidth;
        title.classList.add('animate');

        // ---- Click sound ----
        audio.currentTime = 0;
        audio.play().catch(() => {});

        // ---- Background music (only ONE plays at a time) ----
        if (isOn) {
            sleepMusic.pause();
            sleepMusic.currentTime = 0;
            activeMusic.play().catch(() => {});
        } else {
            activeMusic.pause();
            activeMusic.currentTime = 0;
            sleepMusic.play().catch(() => {});
        }
    });
});