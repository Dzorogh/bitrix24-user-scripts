// ==UserScript==
// @name         Bitrix24 Make Title With Prefix
// @namespace    https://crm.globaldrive.ru/
// @version      1.0.1
// @description  Make and change prefix for tasks from selects. Must be combined with script that make selects for tasks custom fields.
// @author       Dzorogh 
// @match        https://crm.globaldrive.ru/*
// ==/UserScript==

(function() {
    'use strict';

    const waitForElm = (selector) => {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }
    
            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });
    
            // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    const inputsIds = {
        PRIORITY: 'UF_AUTO_367625648403',
        PROJECT: 'UF_AUTO_231937255950',
        TYPE: 'UF_AUTO_692505608773'
    }

    const getParamFromInput = (id) => {
        const selector = document.querySelector(`[name*="${id}"]`);

        console.log('getParamFromInput', selector);

        return selector?.value || '';
    }

    const makeTitle = () => {
        const titleInput = document.querySelector('[data-bx-id="task-edit-title"]');
        
        const currentTitle = titleInput.value;

        const regex = /^[ABCD] - .{0,20}?( - (Feat|Fix|Refactor|Docs|Chore))* - /gmi;

        let realTitle = currentTitle.replace(regex, '').trim();

        const priority = getParamFromInput(inputsIds.PRIORITY);
        const type = getParamFromInput(inputsIds.TYPE);
        const project = getParamFromInput(inputsIds.PROJECT);

        const newTitle = [priority, project, type, realTitle].filter(str => str.length).join(' - ');

        titleInput.value = newTitle;
    }


    makeTitle();

    Promise.all([
        waitForElm(`select[name*='${inputsIds.PROJECT}']`),
        waitForElm(`select[name*='${inputsIds.TYPE}']`),
        waitForElm(`select[name*='${inputsIds.PRIORITY}']`),
    ]).then(elements => {
        console.log('Selects appeared');

        makeTitle();

        elements.forEach(element => element.addEventListener('change', function() {
            console.log('Selects changed', this.value);
            makeTitle();
        }))
    })

    // TODO: Watch changes of inputs

})();
