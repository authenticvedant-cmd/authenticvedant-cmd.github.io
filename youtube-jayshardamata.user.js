// ==UserScript==
// @name         जय माँ शारदा - YouTube Custom Layout
// @namespace    https://github.com/authenticvedant-cmd
// @version      1.0.0
// @description  Custom distraction-free layout for one YouTube video
// @match        https://www.youtube.com/watch?v=I2mSO1zzsfA
// @match        https://www.youtube.com/watch?v=I2mSO1zzsfA&*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const VIDEO_ID = 'I2mSO1zzsfA';

    if (!location.href.includes(VIDEO_ID)) return;

    const STYLE_ID = 'maa-sharda-custom-style';
    const BUTTON_ID = 'maa-sharda-button';

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;

        style.textContent = `
            /* Hide distractions */

            #masthead-container,
            ytd-masthead,
            #guide,
            #guide-button,
            ytd-mini-guide-renderer,
            #secondary,
            #comments,
            ytd-comments,
            ytd-merch-shelf-renderer,
            ytd-watch-next-secondary-results-renderer,
            ytd-rich-grid-renderer,
            ytd-reel-shelf-renderer,
            ytd-browse,
            ytd-searchbox,
            #related {
                display: none !important;
            }

            /* Full black background */

            html,
            body,
            ytd-app,
            #content,
            #page-manager {
                background: #000 !important;
            }

            /* Main video area */

            #page-manager {
                margin: 0 !important;
                padding: 0 !important;
            }

            #player-container-outer,
            #player-container-inner,
            #player,
            #movie_player {
                width: 100% !important;
                max-width: 1200px !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }

            /* Hide title/details area */

            ytd-watch-metadata,
            #below,
            #below-the-fold {
                display: none !important;
            }

            /* Our button */

            #${BUTTON_ID} {
                display: block;
                width: min(90%, 520px);
                height: 60px;
                margin: 20px auto 30px auto;
                border: 0;
                border-radius: 14px;
                background: #ff0033;
                color: #fff;
                font-family: Arial, sans-serif;
                font-size: 20px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 5px 18px rgba(0,0,0,.45);
                transition: transform .12s, opacity .12s;
                z-index: 999999;
            }

            #${BUTTON_ID}:hover {
                opacity: .92;
            }

            #${BUTTON_ID}:active {
                transform: scale(.97);
            }

            #${BUTTON_ID}.done {
                background: #16823a;
            }

            #${BUTTON_ID}.working {
                background: #555;
            }
        `;

        (document.head || document.documentElement).appendChild(style);
    }

    function isVisible(element) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden'
        );
    }

    function findButton(words) {
        const elements = document.querySelectorAll(
            'button, yt-button-shape button, tp-yt-paper-button, ytd-button-renderer'
        );

        for (const element of elements) {
            if (!isVisible(element)) continue;

            const text = (
                element.getAttribute('aria-label') ||
                element.getAttribute('title') ||
                element.innerText ||
                ''
            ).toLowerCase();

            if (words.some(word => text.includes(word))) {
                return element;
            }
        }

        return null;
    }

    function clickLike() {
        const likeButton = findButton([
            'like this video',
            'like this video along with',
            'like'
        ]);

        if (likeButton) {
            likeButton.click();
            return true;
        }

        return false;
    }

    function clickSubscribe() {
        const subscribeButton = findButton([
            'subscribe'
        ]);

        if (subscribeButton) {
            const text = (
                subscribeButton.getAttribute('aria-label') ||
                subscribeButton.innerText ||
                ''
            ).toLowerCase();

            /*
             * Do not click if already subscribed.
             */
            if (
                text.includes('unsubscribe') ||
                text.includes('subscribed')
            ) {
                return true;
            }

            subscribeButton.click();
            return true;
        }

        return false;
    }

    function clickHype() {
        /*
         * Hype availability varies by account, country,
         * video and YouTube's current interface.
         */

        const hypeButton = findButton([
            'hype this video',
            'hype'
        ]);

        if (hypeButton) {
            hypeButton.click();
            return true;
        }

        return false;
    }

    function performActions(button) {
        button.classList.remove('done');
        button.classList.add('working');
        button.textContent = '🙏🏻 जय माँ शारदा 🙏🏻';

        /*
         * Run from the user's button click.
         * Small delays allow YouTube's dynamic UI to react.
         */

        const like = clickLike();

        setTimeout(() => {
            clickSubscribe();

            setTimeout(() => {
                clickHype();

                setTimeout(() => {
                    button.classList.remove('working');
                    button.classList.add('done');
                    button.textContent = '🙏🏻 जय माँ शारदा 🙏🏻';
                }, 700);

            }, 700);

        }, like ? 500 : 100);
    }

    function createButton() {
        if (document.getElementById(BUTTON_ID)) return;

        const button = document.createElement('button');

        button.id = BUTTON_ID;
        button.type = 'button';
        button.textContent = '🙏🏻 जय माँ शारदा 🙏🏻';

        button.addEventListener('click', function () {
            performActions(button);
        });

        const player = document.querySelector('#player');

        if (player && player.parentElement) {
            player.parentElement.appendChild(button);
            return;
        }

        const moviePlayer = document.querySelector('#movie_player');

        if (moviePlayer && moviePlayer.parentElement) {
            moviePlayer.parentElement.appendChild(button);
            return;
        }

        const app = document.querySelector('ytd-app');

        if (app) {
            app.appendChild(button);
        }
    }

    function customize() {
        if (!location.href.includes(VIDEO_ID)) return;

        addStyle();

        /*
         * YouTube loads most elements dynamically,
         * so keep checking until the video/player exists.
         */

        createButton();
    }

    /*
     * Initial load
     */
    customize();

    /*
     * YouTube is a single-page application.
     * Watch for dynamically loaded content.
     */

    const observer = new MutationObserver(() => {
        customize();
    });

    function startObserver() {
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    if (document.body) {
        startObserver();
    } else {
        document.addEventListener('DOMContentLoaded', startObserver);
    }

    /*
     * Also handle YouTube navigation.
     */

    window.addEventListener('yt-navigate-finish', () => {
        setTimeout(customize, 500);
        setTimeout(customize, 1500);
    });

})();
